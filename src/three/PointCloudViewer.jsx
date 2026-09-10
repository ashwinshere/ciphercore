import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  Layers,
  Ruler,
  Maximize2,
  Minimize2,
  Box,
  RotateCcw,
  Palette,
  Eye,
  Sliders,
  Scissors,
  Check,
  Compass,
  MapPin,
  Sparkles
} from 'lucide-react';
import { calculatePointDistance, LIDAR_CLASSIFICATIONS } from '../utils/pointCloudParser.js';

function PointCloudMesh({
  dataset,
  colorMode = 'elevation',
  pointSize = 3.5,
  minElevationClip = -Infinity,
  maxElevationClip = Infinity,
  measuringMode = false,
  onPointClick = () => {},
}) {
  const pointsRef = useRef();
  const { raycaster, mouse, camera } = useThree();

  const geometry = useMemo(() => {
    if (!dataset || !dataset.buffers) return null;

    const geom = new THREE.BufferGeometry();
    const { positions, colorsElevation, colorsIntensity, colorsClassification, colorsRGB } = dataset.buffers;

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let activeColors = colorsElevation;
    if (colorMode === 'intensity') activeColors = colorsIntensity;
    else if (colorMode === 'classification') activeColors = colorsClassification;
    else if (colorMode === 'rgb') activeColors = colorsRGB;

    geom.setAttribute('color', new THREE.BufferAttribute(activeColors, 3));
    geom.computeBoundingSphere();
    return geom;
  }, [dataset, colorMode]);

  // Handle Point Clicking for 3D Measurement
  const handlePointerDown = (e) => {
    if (!measuringMode) return;
    e.stopPropagation();
    if (e.point) {
      onPointClick({
        x: Number(e.point.x.toFixed(2)),
        y: Number(e.point.y.toFixed(2)),
        z: Number(e.point.z.toFixed(2)),
      });
    }
  };

  if (!geometry) return null;

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      onPointerDown={handlePointerDown}
    >
      <pointsMaterial
        size={pointSize}
        vertexColors
        sizeAttenuation={true}
        transparent={true}
        opacity={0.92}
      />
    </points>
  );
}

export default function PointCloudViewer({
  dataset,
  height = '560px',
  onSelectProperty = () => {},
}) {
  const [colorMode, setColorMode] = useState('elevation'); // 'elevation', 'intensity', 'classification', 'rgb'
  const [pointSize, setPointSize] = useState(3.0);
  const [measuringMode, setMeasuringMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [cameraPreset, setCameraPreset] = useState('iso'); // 'iso', 'top', 'side'
  const [showBoundingBox, setShowBoundingBox] = useState(true);

  const controlsRef = useRef();

  const bbox = dataset?.boundingBox || {
    widthM: 100,
    depthM: 80,
    heightM: 20,
    minY: 0,
    maxY: 20,
  };

  const handlePointSelect = (pt) => {
    if (measurePoints.length >= 2) {
      setMeasurePoints([pt]);
    } else {
      setMeasurePoints((prev) => [...prev, pt]);
    }
  };

  const measuredDistance = useMemo(() => {
    if (measurePoints.length === 2) {
      return calculatePointDistance(measurePoints[0], measurePoints[1]).toFixed(2);
    }
    return null;
  }, [measurePoints]);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div style={{ height }} className="relative w-full rounded-2xl overflow-hidden border border-cipher-border bg-[#0B1120] shadow-card flex flex-col select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        {/* Color Palette Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl pointer-events-auto text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 flex items-center gap-1">
            <Palette size={12} className="text-cyan-400" /> Style:
          </span>
          {[
            { id: 'elevation', label: 'Elevation Ramp' },
            { id: 'classification', label: 'Classification' },
            { id: 'intensity', label: 'Intensity' },
            { id: 'rgb', label: 'Natural RGB' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setColorMode(mode.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                colorMode === mode.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* 3D Measurement & Tools Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl pointer-events-auto text-xs">
          {/* 3D Ruler Toggle */}
          <button
            onClick={() => {
              setMeasuringMode(!measuringMode);
              setMeasurePoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              measuringMode
                ? 'bg-amber-400 text-slate-950 shadow-md animate-pulse'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Click two points to measure 3D Euclidean distance in meters"
          >
            <Ruler size={13} />
            <span>{measuringMode ? 'Measuring Active' : '3D Distance Ruler'}</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Reset Camera View"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Floating Measurement Result Overlay */}
      {measuringMode && (
        <div className="absolute top-16 left-3 z-10 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-amber-500/50 shadow-2xl text-xs space-y-1.5 max-w-xs text-white">
          <div className="flex items-center justify-between font-bold text-amber-400 text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Ruler size={12} /> Point-to-Point 3D Ruler
            </span>
            {measurePoints.length > 0 && (
              <button
                onClick={() => setMeasurePoints([])}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-300">
            {measurePoints.length === 0 && 'Click Point 1 on any surface in the 3D canvas.'}
            {measurePoints.length === 1 && 'Point 1 selected. Click Point 2 to calculate distance.'}
            {measurePoints.length === 2 && 'Measurement complete.'}
          </p>
          {measuredDistance && (
            <div className="mt-1 pt-1.5 border-t border-slate-700 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">3D Distance:</span>
              <span className="font-mono text-base font-extrabold text-amber-300">{measuredDistance} m</span>
            </div>
          )}
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          camera={{
            fov: 38,
            near: 0.1,
            far: 1000,
            position: [bbox.widthM * 0.9, bbox.heightM * 2.2 + 20, bbox.depthM * 1.1],
          }}
        >
          <color attach="background" args={['#0B1120']} />
          <fog attach="fog" args={['#0B1120', 120, 450]} />

          <ambientLight intensity={0.6} />

          {/* Minimal dark geospatial coordinate grid */}
          <Grid
            position={[0, -0.1, 0]}
            args={[Math.max(bbox.widthM * 2.2, 140), Math.max(bbox.depthM * 2.2, 140)]}
            cellSize={5}
            cellThickness={0.5}
            cellColor="#1E293B"
            sectionSize={20}
            sectionThickness={1.0}
            sectionColor="#334155"
            fadeDistance={180}
            infiniteGrid
          />

          {/* Point Cloud Mesh */}
          <PointCloudMesh
            dataset={dataset}
            colorMode={colorMode}
            pointSize={pointSize}
            measuringMode={measuringMode}
            onPointClick={handlePointSelect}
          />

          {/* Measurement Marker Line */}
          {measurePoints.length === 2 && (
            <group>
              <Line
                points={[
                  [measurePoints[0].x, measurePoints[0].y, measurePoints[0].z],
                  [measurePoints[1].x, measurePoints[1].y, measurePoints[1].z],
                ]}
                color="#FBBF24"
                lineWidth={3}
              />
              <Html
                position={[
                  (measurePoints[0].x + measurePoints[1].x) / 2,
                  (measurePoints[0].y + measurePoints[1].y) / 2 + 1.2,
                  (measurePoints[0].z + measurePoints[1].z) / 2,
                ]}
                center
                distanceFactor={24}
              >
                <div className="bg-amber-400 text-slate-950 font-mono font-extrabold text-xs px-2 py-0.5 rounded shadow-lg border border-amber-300">
                  {measuredDistance} m
                </div>
              </Html>
            </group>
          )}

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.8}
            zoomSpeed={0.8}
            panSpeed={0.8}
            minDistance={8}
            maxDistance={350}
            maxPolarAngle={Math.PI / 2.02}
            target={[0, bbox.heightM * 0.4, 0]}
          />
        </Canvas>
      </div>

      {/* Bottom Status Ribbon */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white">{dataset?.name || 'LiDAR Point Cloud'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="mono text-[11px] text-cyan-300 font-semibold">
            {dataset?.totalPoints?.toLocaleString()} Points
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-400 mono">
            Density: {bbox.densityPtsM2 || 12} pts/m²
          </span>
        </div>

        {/* Point Size Adjuster Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Point Size:</span>
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
          />
          <span className="mono text-[10px] text-slate-300 w-6">{pointSize}px</span>
        </div>
      </div>
    </div>
  );
}
