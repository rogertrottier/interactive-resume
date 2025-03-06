import React, { useRef, useEffect } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Create your custom shader material with an extra uniform for mouse velocity.
const MyShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(),
    u_mouse: new THREE.Vector2(),
    u_mouseVel: new THREE.Vector2(),
  },
  // Vertex shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment shader with an "ink distortion" effect.
  `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform float u_time;

  // Noise functions and fbm, unchanged.
  float random(in vec2 _st) {
      return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(in vec2 _st) {
      vec2 i = floor(_st);
      vec2 f = fract(_st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
  }

  #define NUM_OCTAVES 5
  float fbm(in vec2 _st) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5),
                      -sin(0.5), cos(0.5));
      for (int i = 0; i < NUM_OCTAVES; ++i) {
          v += a * noise(_st);
          _st = rot * _st * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  void main() {
      // --- Grid Setup for Pixelation ---
      // Each cell is 3×3 pixels: the top‑left 1×1 shows the effect,
      // and the remaining 2 pixels (horizontally and vertically) form a gap.
      float cellSize = 3.0;
      vec2 cellIndex = floor(gl_FragCoord.xy / cellSize);
      vec2 cellLocal = mod(gl_FragCoord.xy, cellSize);
      
      // Only render the effect if we are in the top-left 1×1 area.
      if(cellLocal.x >= 1.0 || cellLocal.y >= 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
      }
      
      // --- Compute UV for the Effect ---
      // Compute the grid resolution (in cells) based on the screen resolution.
      vec2 gridRes = u_resolution / cellSize;
      // Compute the normalized coordinate of this cell's center.
      vec2 uv = (cellIndex + 0.5) / gridRes;
      
      // Scale up the UV as in your original effect.
      uv = uv * 3.0;
      
      // --- Compute the Effect Pattern ---
      vec3 color = vec3(0.0);
      vec2 q;
      q.x = fbm(uv + 0.00 * u_time);
      q.y = fbm(uv + vec2(1.0));
      
      vec2 r;
      r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
      r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);
      
      float f = fbm(uv + r);
      f = fbm(vec2(sin(f * 10.0 + (u_time / 2.0)), cos(f * 10.0 + (u_time / 2.0))));
      
      color = mix(vec3(0.009, 0.124, 0.667),
                  vec3(0.666667, 0.666667, 0.498039),
                  clamp((f * f) * 4.0, 0.0, 1.0));
      color = mix(color,
                  vec3(0, 0, 0.164706),
                  clamp(length(q), 0.0, 1.0));
      color = mix(color,
                  vec3(0.666667, 1, 1),
                  clamp(length(r.x), 0.0, 1.0));
      
      gl_FragColor = vec4((f * f * f + 0.6 * f * f + 0.5 * f) * color, 1.0);
  }
  `
);

extend({ MyShaderMaterial });

// Component that renders the shader plane inside the Canvas.
function ShaderPlane({ mouse, mouseVel }) {
  const materialRef = useRef();

  useFrame(({ clock, size }) => {
    if (materialRef.current) {
      // Update time and resolution.
      materialRef.current.u_time = clock.getElapsedTime();
      materialRef.current.u_resolution.set(size.width, size.height);
      // Update both mouse position and decaying mouse velocity.
      materialRef.current.u_mouse.copy(mouse.current);
      materialRef.current.u_mouseVel.copy(mouseVel.current);
    }
    // Decay the mouse velocity so it lingers and then fades.
    mouseVel.current.multiplyScalar(0.95);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <myShaderMaterial ref={materialRef} />
    </mesh>
  );
}

// Main scene component that sets up global mouse listeners.
export function ThreeSceneShaderCloudy() {
  // Refs for current mouse position, previous position, and velocity.
  const mouse = useRef(new THREE.Vector2(0, 0));
  const prevMouse = useRef(new THREE.Vector2(0, 0));
  const mouseVel = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (event) => {
      const newMouse = new THREE.Vector2(
        event.clientX / window.innerWidth,
        1.0 - event.clientY / window.innerHeight // Flip Y if needed.
      );
      // Compute instantaneous velocity (difference between new and previous positions).
      const velocity = newMouse.clone().sub(prevMouse.current);
      // Update the mouse and velocity refs.
      mouse.current.copy(newMouse);
      // Instead of replacing the velocity completely, you could also add to it if desired.
      mouseVel.current.copy(velocity);
      prevMouse.current.copy(newMouse);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 opacity-25">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
      >
        <ShaderPlane mouse={mouse} mouseVel={mouseVel} />
      </Canvas>
    </div>
  );
}
