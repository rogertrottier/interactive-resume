// GpuParticleSimulation.tsx
import React, { useMemo, useRef, useEffect } from "react";
import { useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { GPUComputationRenderer } from "three-stdlib"; 
// If using three/examples, you might do: import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";

extend({ GPUComputationRenderer });

const WIDTH = 128; 
const HEIGHT = 128; 
// So total = 128 * 128 = 16,384 particles. 
// You can go bigger if performance allows (256x256 => 65k, etc.)

/**
 * We define the "compute" shaders. 
 * One for velocity, one for position.
 * Each fragment corresponds to 1 pixel => 1 particle's data.
 * RGBA channels store x, y, z, w (or some custom data).
 */

// We'll do a minimal wave + pointer repulsion in the velocity shader:
const velocityShader = `
uniform float uTime;
uniform float uDelta;
uniform vec3 uPointer;
// wave params
uniform float amplitude;
uniform float frequency;
uniform float xRange;
uniform float xOffset;
uniform float waveZ;
uniform float springFactor;
uniform float damping;
uniform float threshold;
uniform float forceMultiplier;

// The position/velocity textures
// read from last frame
sampler2D tPosition;
sampler2D tVelocity;

void main() {
  // The UV coordinate for this particle in the texture
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  // current velocity
  vec4 velData = texture2D(tVelocity, uv);
  vec3 velocity = velData.xyz;

  // position from last frame
  vec3 position = texture2D(tPosition, uv).xyz;

  // We'll interpret x in [-xRange/2 .. +xRange/2], so let's guess param from uv.x
  // but let's do a simpler approach: each pixel row is a param
  float param = uv.x; // or some function of uv
  float offset = uv.y * 6.283185; // random offset = 2*PI * y ?

  // wave base X
  float baseX = xOffset + xRange * param;
  float waveTime = 0.6 * uTime;
  // wave Y
  float waveY = amplitude * sin(frequency * (baseX + waveTime) + offset);
  vec3 waveTarget = vec3(baseX, waveY, waveZ);

  // spring force
  vec3 toTarget = waveTarget - position;
  vec3 springForce = toTarget * springFactor;

  // pointer repulsion
  // line approach is advanced, so let's do "distance from pointer" for simplicity
  float dist = distance(position, uPointer);
  vec3 repulsion = vec3(0.0);
  if (dist < threshold) {
    float strength = forceMultiplier * pow(1.0 - dist / threshold, 2.0);
    repulsion = normalize(position - uPointer) * strength;
  }

  // combine
  vec3 acceleration = springForce + repulsion;
  // v += a * dt
  velocity += acceleration * uDelta;
  // damping
  velocity *= damping;

  // output the new velocity
  gl_FragColor = vec4(velocity, 1.0);
}
`;

// The position shader simply pos += velocity * dt
const positionShader = `
uniform float uDelta;
sampler2D tPosition;
sampler2D tVelocity;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(tPosition, uv).xyz;
  vec3 vel = texture2D(tVelocity, uv).xyz;

  // pos += vel * dt
  pos += vel * uDelta;

  gl_FragColor = vec4(pos, 1.0);
}
`;

export function useGpuParticles() {
  const { gl } = useThree();
  const gpuComputeRef = useRef<GPUComputationRenderer>();
  const positionVarRef = useRef<THREE.IUniform<any>>();
  const velocityVarRef = useRef<THREE.IUniform<any>>();

  // 1) create the GPUComputationRenderer
  useEffect(() => {
    const gpuCompute = new GPUComputationRenderer(WIDTH, HEIGHT, gl);
    gpuComputeRef.current = gpuCompute;

    // Must use float textures
    const dtPosition = gpuCompute.createTexture();
    const dtVelocity = gpuCompute.createTexture();

    // initialize them
    fillInitialPosition(dtPosition);
    fillInitialVelocity(dtVelocity);

    // Create 2 simulation variables
    const velocityVar = gpuCompute.addVariable("tVelocity", velocityShader, dtVelocity);
    const positionVar = gpuCompute.addVariable("tPosition", positionShader, dtPosition);

    // We must define dependencies among them
    gpuCompute.setVariableDependencies(velocityVar, [velocityVar, positionVar]);
    gpuCompute.setVariableDependencies(positionVar, [velocityVar, positionVar]);

    // uniforms for velocity shader
    velocityVar.material.uniforms = {
      uTime: { value: 0 },
      uDelta: { value: 0 },
      uPointer: { value: new THREE.Vector3(0,0,0) },
      amplitude: { value: 3.0 },
      frequency: { value: 2.0 },
      xRange: { value: 14.0 },
      xOffset: { value: -7.0 },
      waveZ: { value: -5.0 },
      springFactor: { value: 2.0 },
      damping: { value: 0.95 },
      threshold: { value: 7.0 },
      forceMultiplier: { value: 100.0 }
    };

    // uniforms for position shader
    positionVar.material.uniforms = {
      uDelta: { value: 0 },
      tPosition: { value: null },
      tVelocity: { value: null }
    };

    // Check for errors
    const error = gpuCompute.init();
    if (error !== null) {
      console.error("GPUComputeRenderer init error:", error);
    }

    // Store references
    velocityVarRef.current = velocityVar.material.uniforms;
    positionVarRef.current = positionVar.material.uniforms;

  }, [gl]);

  // 2) Each frame, call gpuCompute.compute() to update the textures
  // We'll expose a small API for updating uniforms
  const updateSimulation = (delta: number, time: number, pointer: THREE.Vector3) => {
    const gpuCompute = gpuComputeRef.current;
    if (!gpuCompute) return;

    // update uniform values
    const velUniforms = velocityVarRef.current;
    const posUniforms = positionVarRef.current;
    if (!velUniforms || !posUniforms) return;

    velUniforms.uDelta.value = delta;
    velUniforms.uTime.value = time;
    velUniforms.uPointer.value.copy(pointer);

    posUniforms.uDelta.value = delta;

    gpuCompute.compute();
  };

  // 3) get the resulting (position) texture for rendering
  const getCurrentPositionTexture = () => {
    const gpuCompute = gpuComputeRef.current;
    if (!gpuCompute) return null;
    return gpuCompute.getCurrentRenderTarget("tPosition")?.texture || null;
  };

  return {
    updateSimulation,
    getCurrentPositionTexture,
  };
}

/** 
 * Helper to fill the initial position texture so we can spawn near wave.
 * 
 * tPosition = RGBA float => xyz in rgb, w=1
 */
function fillInitialPosition(texture: THREE.DataTexture) {
  const data = texture.image.data;
  for (let i = 0; i < data.length; i += 4) {
    // param = i / (4 * totalPix) ? Let's do random for demonstration
    // We'll just place them near wave
    let x = -7 + (Math.random() * 14.0);
    let offset = Math.random() * 2.0 * Math.PI;
    let waveY = 3.0 * Math.sin(2.0 * (x + 0.0) + offset);
    let z = -5.0;
    data[i + 0] = x;
    data[i + 1] = waveY;
    data[i + 2] = z;
    data[i + 3] = 1; // unused
  }
}

/** 
 * Helper to fill initial velocity to 0
 */
function fillInitialVelocity(texture: THREE.DataTexture) {
  const data = texture.image.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 0] = 0; // vx
    data[i + 1] = 0; // vy
    data[i + 2] = 0; // vz
    data[i + 3] = 1; 
  }
}
