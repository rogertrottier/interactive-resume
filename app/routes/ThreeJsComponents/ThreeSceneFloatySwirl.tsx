import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Suspense, useState, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useIsMobile } from "../useIsMobile"; // adjust the path as needed

function ParticleSwirl({ count = 1000 }: { count?: number }) {
  const { camera } = useThree();
  const isMobile = isMobile();

  // Generate initial positions, random factors, etc.
  const { positions, randomFactors, initialPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);
    const randomFactors = new Float32Array(count);
    const radius = 10; // initial distribution radius for our galaxy
    for (let i = 0; i < count; i++) {
      // Distribute roughly in a circular pattern with some randomness.
      const angle = (i / count) * Math.PI * 2 * (0.5 + Math.random());
      const r = radius * (0.8 + 0.4 * Math.random());
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

  // Create BufferGeometry for particles.
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [positions]);

  // Create a velocity array for particles.
  const velocities = useRef(new Float32Array(count * 3)); // initially all zeros

  // Use a ref to hold the pointer's world position.
  const target = useRef(new THREE.Vector3(0, 0, 0));
  
  // Always initialize target to center.
  useEffect(() => {
    const centerNDC = new THREE.Vector3(0, 0, 0.8);
    centerNDC.unproject(camera);
    target.current.copy(centerNDC);

    // Always add pointermove listener so touch interactivity works.
    const handlePointerMove = (event: PointerEvent) => {
      if (document.hidden) return;
      // Update the target regardless of pointer type.
      const ndc = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.8
      );
      ndc.unproject(camera);
      target.current.copy(ndc);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [camera]);

  // On visibility change, reset the target to center.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const centerNDC = new THREE.Vector3(0, 0, 0.8);
        centerNDC.unproject(camera);
        target.current.copy(centerNDC);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [camera]);

  // Animate the particles.
  useFrame((state, delta) => {
    if (document.hidden) return;

    const posAttr = geometry.attributes.position;
    const positions = posAttr.array as Float32Array;
    const time = performance.now() / 1000;
    const pointerDistance = target.current.length();
    const baseOffset = 1;
    const dynamicOffset = baseOffset + 0.3 * pointerDistance;

    // Prepare the interaction line from camera to pointer.
    const camPos = camera.position;
    const pointerPos = target.current;
    const lineDir = new THREE.Vector3().subVectors(pointerPos, camPos).normalize();
    const threshold = 7.0;
    const forceMultiplier = 100;

    // Spring parameters.
    const springFactor = 2.0;
    const damping = 0.90;

    for (let i = 0; i < count; i++) {
      const ix = initialPositions[i * 3];
      const iy = initialPositions[i * 3 + 1];
      const iz = initialPositions[i * 3 + 2];
      const rand = randomFactors[i];
      const offset = dynamicOffset * (0.5 + rand);
      const phase = time + i * (1 + rand);
      const swirlingTarget = new THREE.Vector3(
        ix + Math.cos(phase) * offset,
        iy + Math.sin(phase) * offset,
        iz
      );

      const currentPos = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );

      const springForce = swirlingTarget.clone().sub(currentPos).multiplyScalar(springFactor);

      const AP = currentPos.clone().sub(camPos);
      const proj = AP.dot(lineDir);
      const closestPoint = camPos.clone().add(lineDir.clone().multiplyScalar(proj));
      const distance = currentPos.distanceTo(closestPoint);
      let repulsion = new THREE.Vector3();
      if (distance < threshold) {
        const strength = forceMultiplier * Math.pow(1 - distance / threshold, 2);
        repulsion = currentPos.clone().sub(closestPoint).normalize().multiplyScalar(strength);
      }

      const acceleration = springForce.add(repulsion);
      const v = new THREE.Vector3(
        velocities.current[i * 3],
        velocities.current[i * 3 + 1],
        velocities.current[i * 3 + 2]
      );
      v.add(acceleration.multiplyScalar(delta));
      v.multiplyScalar(damping);
      velocities.current[i * 3] = v.x;
      velocities.current[i * 3 + 1] = v.y;
      velocities.current[i * 3 + 2] = v.z;
    }

    // Inter-particle repulsion to prevent overlap.
    const forceArray = new Float32Array(count);
    const minDist = 0.000001;
    // for (let i = 0; i < count; i++) {
    //   for (let j = i + 1; j < count; j++) {
    //     const dx = positions[j * 3] - positions[i * 3];
    //     const dy = positions[j * 3 + 1] - positions[i * 3 + 1];
    //     const dz = positions[j * 3 + 2] - positions[i * 3 + 2];
    //     const distSq = dx * dx + dy * dy + dz * dz;
    //     if (distSq < minDist * minDist && distSq > 0) {
    //       const dist = Math.sqrt(distSq);
    //       let repForce = (minDist - dist) / dist;
    //       repForce = repForce * repForce;
    //       const fx = dx * repForce;
    //       const fy = dy * repForce;
    //       const fz = dz * repForce;
    //       forceArray[i * 3]     -= fx;
    //       forceArray[i * 3 + 1] -= fy;
    //       forceArray[i * 3 + 2] -= fz;
    //       forceArray[j * 3]     += fx;
    //       forceArray[j * 3 + 1] += fy;
    //       forceArray[j * 3 + 2] += fz;
    //     }
    //   }
    // }
    const repulsionFactor = 0.01;
    // for (let i = 0; i < count; i++) {
    //   const v = new THREE.Vector3(
    //     velocities.current[i * 3],
    //     velocities.current[i * 3 + 1],
    //     velocities.current[i * 3 + 2]
    //   );
    //   const f = new THREE.Vector3(
    //     forceArray[i * 3],
    //     forceArray[i * 3 + 1],
    //     forceArray[i * 3 + 2]
    //   );
    //   v.add(f.multiplyScalar(repulsionFactor * delta));
    //   velocities.current[i * 3] = v.x;
    //   velocities.current[i * 3 + 1] = v.y;
    //   velocities.current[i * 3 + 2] = v.z;
    // }

    for (let i = 0; i < count; i++) {
      const currentPos = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      const v = new THREE.Vector3(
        velocities.current[i * 3],
        velocities.current[i * 3 + 1],
        velocities.current[i * 3 + 2]);
      // const v = new THREE.Vector3(
      //   velocities.current[i * 3],
      //   velocities.current[i * 3 + 1],
      //   velocities.current[i * 3 + 2]
      // );
      currentPos.add(v.clone().multiplyScalar(delta));
      positions[i * 3] = currentPos.x;
      positions[i * 3 + 1] = currentPos.y;
      positions[i * 3 + 2] = currentPos.z;
    }
    posAttr.needsUpdate = true;
  });

  // Load the dot texture from the public folder.
  const dotTexture = useLoader(THREE.TextureLoader, "/Dot.png");

  return (
    <points geometry={geometry}>
      <pointsMaterial
        attach="material"
        map={dotTexture}
        transparent={true}
        depthWrite={false}
        size={isMobile ? 0.2 : 0.1}
        sizeAttenuation
      />
    </points>
  );
}

export function ThreeSceneFloatySwirl() {
  // Track scroll position in state
  const [scrollY, setScrollY] = useState(0);

  // On mount, attach a scroll handler
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // We’ll store an initial camera Y so we can offset from it
  const initialCameraY = useRef(-25);

  // The floaty effect: we store the camera’s *current* y in a ref, 
  // and gently lerp to the *target* position each frame
  const cameraYRef = useRef(initialCameraY.current);

  // A small child component that sets up camera parallax
  function ParallaxCamera() {
    useFrame(({ camera }, delta) => {
      // Opposite direction: use minus sign
      const parallaxFactor = 0.07; // how “far” to move relative to scroll
      const targetY = initialCameraY.current - scrollY * parallaxFactor;

      // “Floaty” interpolation factor – bigger is snappier, smaller is slower:
      const floatiness = 0.05;

      // Lerp toward targetY
      cameraYRef.current += (targetY - cameraYRef.current) * floatiness;

      // Update the actual camera
      camera.position.y = cameraYRef.current;
      camera.updateProjectionMatrix();
    });
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <Canvas
        camera={{
          position: [15, initialCameraY.current, 10],
          fov: 50,
        }}
        className="w-screen h-screen"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={2} />

        {/* This helper shifts the camera with a floaty parallax */}
        <ParallaxCamera />

        <Suspense fallback={null}>
          <ParticleSwirl count={3000} />
        </Suspense>
      </Canvas>
    </div>
  );
}