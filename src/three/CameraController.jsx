import React, { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export default function CameraController({ building, focusTarget, focusRequest, resetRequest }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const animTarget = useRef(null);

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

  useEffect(() => {
    camera.position.copy(defaultPosition);
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultTarget);
      controlsRef.current.update();
    }
  }, [camera, defaultPosition, defaultTarget]);

  useEffect(() => {
    if (resetRequest === undefined) return;
    animTarget.current = { pos: defaultPosition.clone(), look: defaultTarget.clone() };
  }, [resetRequest, defaultPosition, defaultTarget]);

  // Automatic camera zooming on room selection is disabled to prevent unwanted over-zooming.
  // The user maintains full manual control over zoom, pan, and rotation via OrbitControls.
  useEffect(() => {
    // Only reset camera position when resetRequest is triggered
  }, [focusRequest]); // eslint-disable-line react-hooks/exhaustive-deps

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
      minDistance={10}
      maxDistance={250}
      maxPolarAngle={Math.PI / 2.02}
      target={defaultTarget}
    />
  );
}
