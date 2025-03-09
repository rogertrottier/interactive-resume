// GpuParticlePoints.tsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WIDTH = 128;
const HEIGHT = 128;

// Minimal vertex shader that reads from a "positionTexture"
const particleVertexShader = `
uniform sampler2D uPositionTexture;
uniform float uTime;

attribute vec2 uv2; // a fallback attribute for passing in the GPU index?

void main() {
  // The UV for this particle's "pixel" in the position texture:
  // We can base it on gl_VertexID or a custom attribute. 
  // Because we are in R3F, we might store it in 'uv2' or something.
  vec2 texUV = uv2;

  // look up the position
  vec3 pos = texture2D(uPositionTexture, texUV).xyz;

  // standard gl_Position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Minimal fragment just colors them white
const particleFragmentShader = `
void main() {
  gl_FragColor = vec4(1.0);
}
`;

interface GpuParticlePointsProps {
  positionTexture: THREE.Texture | null;
}

export function GpuParticlePoints({ positionTexture }: GpuParticlePointsProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // update uniform
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  // create a geometry that has exactly WIDTH*HEIGHT vertices, each with a unique uv2
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // We do a single draw call with W*H points. Each vertex = 1 particle
  // We'll create an array of size W*H, each containing a uv => (x / W, y / H)
  const geo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(WIDTH * HEIGHT * 3); // 0, we won't use them
    const uv2s = new Float32Array(WIDTH * HEIGHT * 2);

    let index = 0;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const i = y * WIDTH + x;
        positions[i * 3 + 0] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        uv2s[i * 2 + 0] = x / WIDTH;
        uv2s[i * 2 + 1] = y / HEIGHT;
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("uv2", new THREE.BufferAttribute(uv2s, 2));
    return g;
  }, []);

  return (
    <points ref={geometryRef} geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={{
          uPositionTexture: { value: positionTexture },
          uTime: { value: 0 },
        }}
        transparent={true}
        depthWrite={false}
      />
    </points>
  );
}
