"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();

    // 🪐 Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // 🧱 Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // 🌌 Create glowing circular texture for stars
    const starTexture = (() => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.4)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      return tex;
    })();

    // ✨ Generate cotton candy colored stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 6000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const radius = 100;
      const depth = 50;
      
      const r = radius + Math.random() * depth;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions.set([x, y, z], i * 3);

      // 🦄 Unicorn cotton candy colors!
      const color = new THREE.Color();
      const colorPalette = [
        { h: 0.95, s: 0.7, l: 0.85 },  // Bright pink
        { h: 0.85, s: 0.6, l: 0.90 },  // Soft rose
        { h: 0.75, s: 0.5, l: 0.85 },  // Lavender purple
        { h: 0.65, s: 0.4, l: 0.88 },  // Periwinkle
        { h: 0.55, s: 0.5, l: 0.90 },  // Sky blue
        { h: 0.15, s: 0.6, l: 0.88 },  // Peachy gold
        { h: 0.0, s: 0.0, l: 0.95 },   // White sparkles
      ];
      const chosen = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      color.setHSL(chosen.h + Math.random() * 0.03, chosen.s, chosen.l);
      colors.set([color.r, color.g, color.b], i * 3);
      
      // Varied star sizes for dreamy effect
      sizes[i] = Math.random() * 2 + 0.5;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      map: starTexture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 🌈 Magical misty fog
    scene.fog = new THREE.FogExp2(0x2a1a3a, 0.0004);

    // 💡 Unicorn rainbow lighting
    const ambient = new THREE.AmbientLight(0xfff5ff, 0.7);
    
    const pinkLight = new THREE.PointLight(0xff69b4, 2.0);
    pinkLight.position.set(60, 40, 50);
    
    const purpleLight = new THREE.PointLight(0xda70d6, 1.8);
    purpleLight.position.set(-60, -40, 40);
    
    const blueLight = new THREE.PointLight(0x87ceeb, 1.5);
    blueLight.position.set(0, 80, -40);
    
    const peachLight = new THREE.PointLight(0xffb3ba, 1.2);
    peachLight.position.set(-40, 20, 60);
    
    scene.add(ambient, pinkLight, purpleLight, blueLight, peachLight);

    // 🦄 Add floating sparkle particles
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 200;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleColors = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions.set([
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150
      ], i * 3);
      
      const sparkleColor = new THREE.Color();
      sparkleColor.setHSL(Math.random(), 0.8, 0.95);
      sparkleColors.set([sparkleColor.r, sparkleColor.g, sparkleColor.b], i * 3);
    }
    
    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
    sparkleGeometry.setAttribute("color", new THREE.BufferAttribute(sparkleColors, 3));
    
    const sparkleMaterial = new THREE.PointsMaterial({
      size: 3,
      map: starTexture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6,
    });
    
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    // 🌀 Dreamy animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      // Gentle rotation
      stars.rotation.x += 0.0002;
      stars.rotation.y += 0.0003;
      
      // Sparkles float and twinkle
      sparkles.rotation.x += 0.0005;
      sparkles.rotation.y -= 0.0008;
      sparkles.rotation.z += 0.0003;
      
      // Floating camera movement
      camera.position.z = 50 + Math.sin(time * 0.03) * 8;
      camera.position.y = Math.sin(time * 0.02) * 3;
      
      // Pulsing lights
      pinkLight.intensity = 2.0 + Math.sin(time * 0.5) * 0.3;
      purpleLight.intensity = 1.8 + Math.sin(time * 0.7) * 0.3;
      blueLight.intensity = 1.5 + Math.sin(time * 0.4) * 0.2;
      
      renderer.render(scene, camera);
    };
    animate();

    // 📱 Resize handler
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10"
      style={{
        background: "radial-gradient(ellipse at top, #ffb3d9 0%, #e6b3ff 20%, #b3d9ff 40%, #ffd9e6 60%, #d9b3ff 80%, #2a1a3a 100%)",
        overflow: "hidden",
      }}
    />
  );
}