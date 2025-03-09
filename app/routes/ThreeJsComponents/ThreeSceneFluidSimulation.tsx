import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// -----------------------------------------------------------
// Shader sources – adapted from the original fluid simulation
// -----------------------------------------------------------

// A simple vertex shader for full-screen quads.
const baseVertexShader = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Advection: advects a quantity (velocity or dye) along the velocity field.
const advectionFragmentShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main(){
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`;

// Divergence: calculates the divergence of the velocity field.
const divergenceFragmentShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform vec2 texelSize;
  void main(){
    float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
    float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

// Pressure solve (Jacobi iterations).
const pressureFragmentShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform vec2 texelSize;
  void main(){
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + T + B - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

// Gradient subtract: removes the pressure gradient from the velocity field.
const gradientSubtractFragmentShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform vec2 texelSize;
  void main(){
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

// Splat: adds an impulse (both velocity and dye) into the simulation.
const splatFragmentShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform vec2 point;
  uniform float radius;
  uniform vec3 color;
  uniform float aspectRatio;
  void main(){
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    float splat = exp(-dot(p, p) / radius);
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat * color, 1.0);
  }
`;

// Display: simply shows the dye texture.
const displayFragmentShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main(){
    vec3 color = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(color, 1.0);
  }
`;

// -----------------------------------------------------------
// Simulation parameters (tweak as desired)
const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const DENSITY_DISSIPATION = 1.0;
const VELOCITY_DISSIPATION = 0.2;
const PRESSURE_ITERATIONS = 20;
const SPLAT_RADIUS = 0.25;
const SPLAT_FORCE = 6000;

// -----------------------------------------------------------
// Helper functions to create render targets
const createRenderTarget = (width: number, height: number, options = {}) =>
  new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    ...options,
  });

const createDoubleRenderTarget = (width: number, height: number) => ({
  width,
  height,
  read: createRenderTarget(width, height),
  write: createRenderTarget(width, height),
  swap() {
    const temp = this.read;
    this.read = this.write;
    this.write = temp;
  }
});

// -----------------------------------------------------------
// The ThreeSceneFluidSimulation component
// -----------------------------------------------------------
export function ThreeSceneFluidSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return; // Guard clause

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const aspectRatio = width / height;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Create an orthographic camera for full-screen passes
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Create a scene containing a full-screen quad.
    const simScene = new THREE.Scene();
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    // We'll reuse this mesh for all passes by swapping its material.
    const quadMesh = new THREE.Mesh(quadGeometry, new THREE.MeshBasicMaterial());
    simScene.add(quadMesh);

    // Create simulation render targets.
    const simWidth = SIM_RESOLUTION;
    const simHeight = SIM_RESOLUTION;
    const dyeWidth = DYE_RESOLUTION;
    const dyeHeight = DYE_RESOLUTION;

    // Double buffers for velocity and dye.
    const velocity = createDoubleRenderTarget(simWidth, simHeight);
    const dye = createDoubleRenderTarget(dyeWidth, dyeHeight);
    // Single render targets for divergence and pressure.
    const divergence = createRenderTarget(simWidth, simHeight);
    const pressure = createDoubleRenderTarget(simWidth, simHeight);

    // -----------------------------------------------------------
    // Create shader materials for each simulation pass.
    // -----------------------------------------------------------
    const advectionMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: advectionFragmentShader,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        texelSize: { value: new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight) },
        dt: { value: 0.016 },
        dissipation: { value: VELOCITY_DISSIPATION },
      }
    });

    const advectionDyeMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: advectionFragmentShader,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        texelSize: { value: new THREE.Vector2(1.0 / dyeWidth, 1.0 / dyeHeight) },
        dt: { value: 0.016 },
        dissipation: { value: DENSITY_DISSIPATION },
      }
    });

    const divergenceMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: divergenceFragmentShader,
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight) },
      }
    });

    const pressureMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: pressureFragmentShader,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight) },
      }
    });

    const gradientSubtractMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: gradientSubtractFragmentShader,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        texelSize: { value: new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight) },
      }
    });

    const splatMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: splatFragmentShader,
      uniforms: {
        uTarget: { value: null },
        point: { value: new THREE.Vector2(0.5, 0.5) },
        radius: { value: SPLAT_RADIUS },
        color: { value: new THREE.Vector3(1, 0, 0) },
        aspectRatio: { value: aspectRatio },
      }
    });

    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: displayFragmentShader,
      uniforms: {
        uTexture: { value: null },
      }
    });

    // -----------------------------------------------------------
    // Utility: render a pass with a given material to a target render target.
    const renderPass = (material, target) => {
      quadMesh.material = material;
      renderer.setRenderTarget(target);
      renderer.render(simScene, camera);
      renderer.setRenderTarget(null);
    };

    // -----------------------------------------------------------
    // Simulation update loop.
    let lastTime = performance.now();
    const updateSimulation = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      // 1. Advect velocity field.
      advectionMaterial.uniforms.uVelocity.value = velocity.read.texture;
      advectionMaterial.uniforms.uSource.value = velocity.read.texture;
      advectionMaterial.uniforms.dt.value = dt;
      renderPass(advectionMaterial, velocity.write);
      velocity.swap();

      // 2. Advect dye field.
      advectionDyeMaterial.uniforms.uVelocity.value = velocity.read.texture;
      advectionDyeMaterial.uniforms.uSource.value = dye.read.texture;
      advectionDyeMaterial.uniforms.dt.value = dt;
      renderPass(advectionDyeMaterial, dye.write);
      dye.swap();

      // 3. Compute divergence of the velocity field.
      divergenceMaterial.uniforms.uVelocity.value = velocity.read.texture;
      renderPass(divergenceMaterial, divergence);

      // 4. Pressure solve (iterative Jacobi iterations).
      // Clear pressure target (could be done by a clear pass if needed).
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        pressureMaterial.uniforms.uPressure.value = pressure.read.texture;
        pressureMaterial.uniforms.uDivergence.value = divergence.texture;
        renderPass(pressureMaterial, pressure.write);
        pressure.swap();
      }

      // 5. Subtract pressure gradient from velocity.
      gradientSubtractMaterial.uniforms.uPressure.value = pressure.read.texture;
      gradientSubtractMaterial.uniforms.uVelocity.value = velocity.read.texture;
      renderPass(gradientSubtractMaterial, velocity.write);
      velocity.swap();
    };

    // -----------------------------------------------------------
    // Splat function: adds a disturbance (both in velocity and dye).
    const splat = (x, y) => {
      // Splat velocity.
      splatMaterial.uniforms.uTarget.value = velocity.read.texture;
      splatMaterial.uniforms.point.value.set(x, y);
      splatMaterial.uniforms.color.value.set(
        (Math.random() - 0.5) * SPLAT_FORCE,
        (Math.random() - 0.5) * SPLAT_FORCE,
        0
      );
      renderPass(splatMaterial, velocity.write);
      velocity.swap();

      // Splat dye.
      splatMaterial.uniforms.uTarget.value = dye.read.texture;
      splatMaterial.uniforms.color.value.set(Math.random(), Math.random(), Math.random());
      renderPass(splatMaterial, dye.write);
      dye.swap();
    };

    // -----------------------------------------------------------
    // Listen for mouse movement (no click required)
    const handleMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      splat(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // -----------------------------------------------------------
    // Main animation loop.
    const animate = () => {
      updateSimulation();
      // Render the dye texture to screen.
      displayMaterial.uniforms.uTexture.value = dye.read.texture;
      renderPass(displayMaterial, null);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount.
    return () => {
      <div className="fixed inset-0 pointer-events-none">
        cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener('mousemove', handleMouseMove);
        mount.removeChild(renderer.domElement);
        renderer.dispose();
      </div>
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', background: '#000' }} />;
};
