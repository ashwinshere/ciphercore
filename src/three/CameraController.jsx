import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DEFAULT_TARGET = new THREE.Vector3(24, 8, 0);
const DEFAULT_POSITION = new THREE.Vector3(55, 34, 55);

export default function CameraController({ focusTarget, focusRequest, resetRequest }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const animTarget = useRef(null); // { pos: Vector3, look: Vector3 }

  // Set initial camera position once.
  useEffect(() => {
    camera.position.copy(DEFAULT_POSITION);
  }, [camera]);

  useEffect(() => {
    if (resetRequest === undefined) return;
    animTarget.current = { pos: DEFAULT_POSITION.clone(), look: DEFAULT_TARGET.clone() };
  }, [resetRequest]);

  useEffect(() => {
    if (!focusTarget) return;
    const look = new THREE.Vector3(focusTarget.x, focusTarget.y, focusTarget.z);
    const dir = new THREE.Vector3(1, 0.65, 1).normalize();
    const pos = look.clone().add(dir.multiplyScalar(16));
    animTarget.current = { pos, look };
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
      minDistance={8}
      maxDistance={140}
      maxPolarAngle={Math.PI / 2.05}
      target={DEFAULT_TARGET}
    />
  );
}

export { DEFAULT_TARGET, DEFAULT_POSITION };
