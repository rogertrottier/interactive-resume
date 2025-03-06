import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

// work in progress not meant to be viewed

function SwirlingShaderParticles({ count = 1000 }) {
  const { camera } = useThree();
  const dummy = new THREE.Object3D();

  // Create a seed attribute for each instance.
  const seeds = useMemo(() => {
    const array = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      array[i] = Math.random();
    }
    return array;
  }, [count]);

  // Create an InstancedMesh with a low-poly sphere.
  const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 8, 8), []);
  
  // Custom ShaderMaterial that computes swirling motion and applies simple lighting.
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLightDir: { value: new THREE.Vector3(1, 1, 1).normalize() },
      uCameraPos: { value: camera.position },
    },
    vertexShader: `
      uniform float uTime;
      attribute float seed;
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        // Compute a swirling offset based on time and seed.
        float angle = uTime * 0.5 + seed * 6.2831;
        float radius = 5.0;
        vec3 offset = vec3(cos(angle), sin(angle), 0.0) * radius;
        // Add offset to instance position.
        vec3 pos = position + offset;
        vPos = pos;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        // Simple Lambert shading.
        float brightness = max(dot(normalize(vNormal), normalize(uLightDir)), 0.0);
        // Color changes based on the x-position.
        float wave = sin(vPos.x * 0.5) * 0.5 + 0.5;
        vec3 baseColor = vec3(wave, 0.5, 1.0 - wave);
        gl_FragColor = vec4(baseColor * brightness, 1.0);
      }
    `,
    // Optionally, enable transparency if you want glowing particles.
    transparent: false,
  }), [camera.position]);

  // Create the InstancedMesh.
  const instancedMeshRef = useRef();
  useMemo(() => {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Add the seed attribute.
    instancedMesh.geometry.setAttribute('seed', new THREE.InstancedBufferAttribute(seeds, 1));
    // Set initial transforms (randomly distributed in space).
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        -5
      );
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMeshRef.current = instancedMesh;
  }, [geometry, material, seeds, count]);

  // Animate the shader time.
  useFrame((state, delta) => {
    material.uniforms.uTime.value += delta;
    // (Optional) If you want to update camera position uniform:
    material.uniforms.uCameraPos.value.copy(camera.position);
  });

  return <primitive object={instancedMeshRef.current} />;
}

export default function ThreeSceneShaderParticles() {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
      {/* A low ambient light so the shader-based lighting stands out. */}
      <ambientLight intensity={0.2} />
      <SwirlingShaderParticles count={1000} />
    </Canvas>
  );
}
