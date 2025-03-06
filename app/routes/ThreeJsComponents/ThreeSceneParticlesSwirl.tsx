import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function ParticleSwirl({ count = 10 }) {
  const { camera } = useThree();

  // Generate initial positions, random factors, etc.
  const { positions, randomFactors, initialPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);
    const randomFactors = new Float32Array(count);
    const radius = 10; // initial distribution radius for our galaxy
    for (let i = 0; i < count; i++) {
      // We'll distribute them roughly in a circular pattern.
      const angle = (i / count) * Math.PI * 2 * (0.5 + Math.random());
      const r = radius * (0.8 + 0.4 * Math.random()); // vary the radius a bit
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = -5; // fixed depth
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
      randomFactors[i] = Math.random();
    }
    return { positions, randomFactors, initialPositions };
  }, [count]);

  // Create BufferGeometry with our particles.
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [positions]);

  // Use a ref to hold the pointer's world position.
  const target = useRef(new THREE.Vector3(0, 0, 0));
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates (NDC)
      const ndc = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.8 // Choose a z value (0 near, 1 far); 0.5 is mid-depth
      );
      // Unproject the NDC to world space using the camera.
      ndc.unproject(camera);
      target.current.copy(ndc);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [camera]);

  // Animate the particles.
  useFrame(() => {
    const positions = geometry.attributes.position.array as Float32Array;
    const time = performance.now() / 5000;
    // Use the pointer distance from the center to affect swirling amplitude.
    const pointerDistance = target.current.length();
    const baseOffset = 1;
    const dynamicOffset = baseOffset + 0.3 * pointerDistance;

    // Compute the interaction line from camera to pointer.
    const camPos = camera.position;
    const pointerPos = target.current;
    const lineDir = new THREE.Vector3().subVectors(pointerPos, camPos).normalize();
    // Define a threshold for repulsion.
    const threshold = 10.0;
    // Force multiplier: the closer to the line, the stronger the repulsion.
    const forceMultiplier = 2.5;

    for (let i = 0; i < count; i++) {
      // Get the original (initial) position for swirling.
      const ix = initialPositions[i * 3];
      const iy = initialPositions[i * 3 ];
      const iz = initialPositions[i * 3 + 2];
      const rand = randomFactors[i];
      const offset = dynamicOffset * (0.5 + rand);
      const phase = time + i * (1 + rand);
      // Compute the base swirling position.
      const baseX = ix + Math.cos(phase) * offset;
      const baseY = iy + Math.sin(phase) * offset;
      const baseZ = iz; // keep z fixed

      // Create a vector for the particle's current target position.
      const particlePos = new THREE.Vector3(baseX, baseY, baseZ);

      // Compute the distance from the particle to the interaction line.
      const AP = new THREE.Vector3().subVectors(particlePos, camPos);
      const proj = AP.dot(lineDir);
      const closestPoint = new THREE.Vector3().copy(camPos).add(lineDir.clone().multiplyScalar(proj));
      const distance = particlePos.distanceTo(closestPoint);

      // If the particle is within the threshold, apply a repulsion force.
      if (distance < threshold) {
        const strength = forceMultiplier * (1 - distance / threshold);
        const repulsion = new THREE.Vector3().subVectors(particlePos, closestPoint).normalize().multiplyScalar(strength);
        particlePos.add(repulsion);
      }

      // Write the computed position back to the buffer.
      positions[i * 3] = particlePos.x;
      positions[i * 3 + 1] = particlePos.y;
      positions[i * 3 + 2] = particlePos.z;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial attach="material" color={0xffffff} size={0.1} sizeAttenuation />
    </points>
  );
}

export function ThreeSceneParticlesSwirl() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [20, 20, 10], fov: 50 }} className="w-screen h-screen">
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={2} />
        <Suspense fallback={null}>
          <ParticleSwirl count={1000} />
        </Suspense>
      </Canvas>
    </div>
  );
}
