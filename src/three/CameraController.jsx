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
    return new THREE.Vector3(0, height / 2.5, 0);
  }, [height]);

  const defaultPosition = useMemo(() => {
    const radius = Math.hypot(width, depth, height);
    return new THREE.Vector3(radius * 0.9, height * 1.4, radius * 0.9);
  }, [width, depth, height]);

  // Handle Preset Camera Angles
  useEffect(() => {
    const radius = Math.hypot(width, depth, height);
    const look = new THREE.Vector3(0, height / 2, 0);

    if (cameraPreset === 'top') {
      animTarget.current = {
        pos: new THREE.Vector3(0, radius * 1.5, 0.001),
        look: new THREE.Vector3(0, 0, 0)
      };
    } else if (cameraPreset === 'front') {
      animTarget.current = {
        pos: new THREE.Vector3(0, height * 0.8, radius * 1.25),
        look
      };
    } else if (cameraPreset === 'side') {
      animTarget.current = {
        pos: new THREE.Vector3(radius * 1.25, height * 0.8, 0),
        look
      };
    } else if (cameraPreset === 'iso') {
      animTarget.current = {
        pos: defaultPosition.clone(),
        look: defaultTarget.clone()
      };
    }
  }, [cameraPreset, width, depth, height, defaultPosition, defaultTarget]);

  useEffect(() => {
    camera.position.copy(defaultPosition);
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultTarget);
      controlsRef.current.update();
    }
  }, [camera, defaultPosition, defaultTarget]);

  useEffect(() => {
    if (resetRequest === undefined || resetRequest === 0) return;
    animTarget.current = { pos: defaultPosition.clone(), look: defaultTarget.clone() };
  }, [resetRequest, defaultPosition, defaultTarget]);

  useEffect(() => {
    if (!focusTarget) return;
    const look = new THREE.Vector3(focusTarget.x, focusTarget.y, focusTarget.z);
    const dir = new THREE.Vector3(1, 0.65, 1).normalize();
    const pos = look.clone().add(dir.multiplyScalar(22));
    animTarget.current = { pos, look };
  }, [focusRequest, focusTarget]);

  useFrame(() => {
    if (!controlsRef.current) return;
    if (animTarget.current) {
      camera.position.lerp(animTarget.current.pos, 0.08);
      controlsRef.current.target.lerp(animTarget.current.look, 0.08);
      if (camera.position.distanceTo(animTarget.current.pos) < 0.05) {
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
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={350}
      maxPolarAngle={Math.PI / 2.01}
      target={defaultTarget}
    />
  );
}
