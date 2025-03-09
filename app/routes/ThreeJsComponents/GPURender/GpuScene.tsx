// GpuScene.tsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGpuParticles } from "./GpuParticleSimulation";
import { GpuParticlePoints } from "./GpuParticlePoints";

export function GpuWaveScene() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <SceneInner />
      </Canvas>
    </div>
  );
}

function SceneInner() {
  const { gl, camera } = useThree();
  const { updateSimulation, getCurrentPositionTexture } = useGpuParticles();

  // We'll store the pointer in a ref. 
  // Minimal approach: track pointer with pointermove:
  const pointer3D = useRef(new THREE.Vector3(0, 0, -5));

  // We can do an effect to track pointer in NDC, then unproject:
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const ndc = new THREE.Vector3(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0.8
      );
      ndc.unproject(camera);
      pointer3D.current.copy(ndc);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [camera]);

  // On each frame, update the GPU simulation
  useFrame((state, delta) => {
    updateSimulation(delta, state.clock.elapsedTime, pointer3D.current);
  });

  // get the position texture
  const posTex = getCurrentPositionTexture();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={2} />

      {posTex && <GpuParticlePoints positionTexture={posTex} />}
    </>
  );
}
