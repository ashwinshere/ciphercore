import React, { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useApp } from '../context/AppContext.jsx';

export default function CameraController({ building, focusTarget, focusRequest, resetRequest }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const animTarget = useRef(null);
  const { cameraPreset } = useApp();

  const width = building?.footprintWidthM || 60;
  const depth = building?.footprintDepthM || 20;
  const height = building?.buildingHeightM || 15;

  const defaultTarget = useMemo(() => {
    return new THREE.Vector3(0, height * 0.45, 0);
  }, [height]);

  const defaultPosition = useMemo(() => {
    const span = Math.max(width, depth);
    const dist = span * 1.15;
    return new THREE.Vector3(dist, height * 1.6 + 15, dist);
  }, [width, depth, height]);

  // Handle Preset Camera Angles with smooth architectural perspectives
  useEffect(() => {
    const span = Math.max(width, depth);
    const look = new THREE.Vector3(0, height * 0.45, 0);

    if (cameraPreset === 'top') {
      animTarget.current = {
        pos: new THREE.Vector3(0.001, span * 1.65, 0),
        look: new THREE.Vector3(0, 0, 0)
      };
    } else if (cameraPreset === 'front') {
      animTarget.current = {
        pos: new THREE.Vector3(0, height * 0.75 + 8, span * 1.35),
        look
      };
    } else if (cameraPreset === 'side') {
      animTarget.current = {
        pos: new THREE.Vector3(span * 1.35, height * 0.75 + 8, 0),
        look
      };
    } else if (cameraPreset === 'iso') {
      animTarget.current = {
        pos: defaultPosition.clone(),
        look: defaultTarget.clone()
      };
    }
  }, [cameraPreset, width, depth, height, defaultPosition, defaultTarget]);

  // Initial camera placement
  useEffect(() => {
    camera.position.copy(defaultPosition);
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultTarget);
      controlsRef.current.update();
    }
  }, [camera, defaultPosition, defaultTarget]);

  // Reset request handler
  useEffect(() => {
    if (resetRequest === undefined || resetRequest === 0) return;
    animTarget.current = { pos: defaultPosition.clone(), look: defaultTarget.clone() };
  }, [resetRequest, defaultPosition, defaultTarget]);

  // Comfortable, contextual framing on unit selection (smooth & never over-zoomed)
  useEffect(() => {
    if (!focusTarget) return;
    const look = new THREE.Vector3(focusTarget.x, focusTarget.y, focusTarget.z);
    const dir = new THREE.Vector3(1, 0.55, 1).normalize();
    // Balanced framing distance so user retains full spatial context
    const framingDistance = Math.max(38, Math.min(55, Math.max(width, depth) * 0.65));
    const pos = look.clone().add(dir.multiplyScalar(framingDistance));
    animTarget.current = { pos, look };
  }, [focusRequest, focusTarget, width, depth]);

  // Smooth lerp frame loop
  useFrame(() => {
    if (!controlsRef.current) return;
    if (animTarget.current) {
      camera.position.lerp(animTarget.current.pos, 0.055);
      controlsRef.current.target.lerp(animTarget.current.look, 0.055);
      if (
        camera.position.distanceTo(animTarget.current.pos) < 0.1 &&
        controlsRef.current.target.distanceTo(animTarget.current.look) < 0.1
      ) {
        animTarget.current = null;
      }
    }
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.65}
      zoomSpeed={0.7}
      panSpeed={0.75}
      minDistance={16}
      maxDistance={220}
      minPolarAngle={Math.PI / 16}
      maxPolarAngle={Math.PI / 2.08}
      target={defaultTarget}
    />
  );
}
