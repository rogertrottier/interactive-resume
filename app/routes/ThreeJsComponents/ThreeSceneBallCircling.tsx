import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

// --- Swirling Meshes Component ---
function SwirlingMeshes({ count = 1000 }) {
  const meshRefs = useRef<THREE.Mesh[]>([]);
  // Initialize the ref array.
  if (meshRefs.current.length !== count) {
    meshRefs.current = Array(count)
      .fill(null)
      .map((_, i) => meshRefs.current[i] || null);
  }

  // The target position (mouse position) in world space.
  const target = useRef(new THREE.Vector3(0, 0, -5));

  // Update target on mouse move.
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1]
      // const x = (event.clientX / window.innerWidth) * 2 - 1;
      // const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const x = (event.clientX / window.innerWidth) * 2;
      const y = (event.clientY / window.innerHeight) * 2;
      const scale = 1; // Adjust scale to change movement range.
      // Keep z at -5 to remain behind the model.
      target.current.set(x * scale, y * scale, 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate meshes with a trailing effect, subtle swirl, and spin.
  useFrame(() => {
    const damping = 0.1; // Adjusts the smoothness.
    // First mesh moves toward the target.
    if (meshRefs.current[0]) {
      meshRefs.current[0].position.lerp(target.current, damping);
    }
    // Subsequent meshes follow the previous one.
    for (let i = 1; i < count; i++) {
      if (meshRefs.current[i] && meshRefs.current[i - 1]) {
        meshRefs.current[i].position.lerp(meshRefs.current[i - 1].position, damping);
      }
    }
    // Get the current time.
    const time = performance.now() / 1000;
    // Compute pointer distance from the center.
    const pointerDistance = target.current.length();
    // Compute spinSpeed based on pointer distance.
    const spinSpeed = 0.05 * pointerDistance;
    // Compute a dynamic swirling offset: as the mouse moves further,
    // the swirling amplitude increases.
    const baseOffset = 1;
    const dynamicOffset = baseOffset + 0.2 * pointerDistance; // Adjust multiplier as needed
  
    meshRefs.current.forEach((mesh, index) => {
      if (mesh) {
        // Update position with a dynamic circular offset.
        mesh.position.x += Math.cos(time + index) * dynamicOffset;
        mesh.position.y += Math.sin(time + index) * dynamicOffset;
        // Apply spin: increase rotation based on the computed spinSpeed.
        mesh.rotation.x += spinSpeed;
        mesh.rotation.y += spinSpeed;
      }
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        // Distribute meshes in a circle with radius 2
        const angle = (index / count) * Math.PI * Math.random() * 5;
        const radius = 10; // Adjust radius as needed
        return (
          <mesh
            key={index}
            ref={(el) => (meshRefs.current[index] = el)}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, -5]}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={`hsl(${(index * 360) / count}, 100%, 50%)`} />
          </mesh>
        );
      })}
    </>
  );
}

export function ThreeSceneBallCircling() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [20, 20, 10], fov: 50 }}
        className="w-screen h-screen"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={2} />
        <Suspense fallback={null}>
          <SwirlingMeshes />
        </Suspense>
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
}