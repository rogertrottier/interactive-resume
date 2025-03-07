import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo } from 'react';

function FadeOverlay() {
  const { gl, scene, camera } = useThree();

  // Create a scene and a camera for the overlay.
  const overlayScene = useMemo(() => {
    const s = new THREE.Scene();
    return s;
  }, []);

  // Create an orthographic camera for the overlay.
  const overlayCamera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return cam;
  }, []);

  // Create a full-screen quad with a transparent black material.
  const fadeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.05, // Adjust for a stronger or weaker fade
      depthWrite: false,
    });
  }, []);

  const quad = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    return new THREE.Mesh(geometry, fadeMaterial);
  }, [fadeMaterial]);

  // Add the quad to the overlay scene.
  useMemo(() => {
    overlayScene.add(quad);
  }, [overlayScene, quad]);

  // In the render loop, render the overlay scene on top of the main scene.
  useFrame(() => {
    // Instead of clearing the color buffer completely, render the fade overlay.
    // This will slowly darken the previous frame.
    gl.render(overlayScene, overlayCamera);
  }, 100); // The second parameter sets this to run after your main scene has rendered.

  return null;
}

export default FadeOverlay;
