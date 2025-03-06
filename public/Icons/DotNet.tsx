import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function ThreeIcon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate only when hovered.
  useFrame((state, delta) => {
    if (hovered && meshRef.current) {
      meshRef.current.rotation.y += delta * 2; // Adjust speed as desired.
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      // Optional: click handler if needed.
      onClick={() => console.log("Icon clicked!")}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'orange' : 'royalblue'} />
    </mesh>
  );
}

export default function IconCanvasDotNet() {
  return (
    <Canvas style={{ width: '100px', height: '100px' }} camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 0, 5]} intensity={1} />
      <ThreeIcon />
    </Canvas>
  );
}