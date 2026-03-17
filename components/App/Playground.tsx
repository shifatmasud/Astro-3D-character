import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, useMotionValue, MotionValue, useTransform } from 'framer-motion';
import { 
  Sky, 
  Cloud, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera, 
  OrbitControls,
  Detailed,
  Box,
  Sphere,
  Cylinder,
  Instance,
  Instances,
  Float,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';
import { Character } from './Character';
import { GameControls } from './Controls';
import gsap from 'gsap';

// --- CONSTANTS ---
const WORLD_SIZE = 400;
const GRASS_COUNT = 2000;
const TREE_COUNT = 30;
const CLOUD_COUNT = 10;

// --- COMPONENTS ---

// --- HELPERS ---
const createLeafTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  // Draw a simple leaf shape
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.quadraticCurveTo(100, 40, 64, 118);
  ctx.quadraticCurveTo(28, 40, 64, 10);
  ctx.fill();
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

const leafTexture = createLeafTexture();

/**
 * 🌿 Procedural Grass using InstancedMesh (Anime Style - Fluffy & Optimized)
 */
const Grass = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const GRASS_COUNT_DENSE = 35000; // Ultra high density for "fluffy" look
  const CULL_DISTANCE = 35; 
  const CULL_DISTANCE_SQ = CULL_DISTANCE * CULL_DISTANCE;

  // Optimized geometry: A simple triangle-based "blade" or cross
  const grassGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.4, 0.7);
    geo.translate(0, 0.35, 0); // Offset so bottom is at 0
    return geo;
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(GRASS_COUNT_DENSE * 4); // x, y, z, rot
    for (let i = 0; i < GRASS_COUNT_DENSE; i++) {
      const stride = i * 4;
      pos[stride] = (Math.random() - 0.5) * WORLD_SIZE;
      pos[stride + 1] = 0;
      pos[stride + 2] = (Math.random() - 0.5) * WORLD_SIZE;
      pos[stride + 3] = Math.random() * Math.PI;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = state.camera.position;
    
    for (let i = 0; i < GRASS_COUNT_DENSE; i++) {
      const stride = i * 4;
      const px = positions[stride];
      const pz = positions[stride + 2];
      
      const dx = px - playerPos.x;
      const dz = pz - playerPos.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < CULL_DISTANCE_SQ) {
        dummy.position.set(px, 0, pz);
        // Fluffy wind: multi-layered sine waves
        const noise = Math.sin(time * 1.2 + px * 0.3) * Math.cos(time * 0.7 + pz * 0.3);
        dummy.rotation.set(noise * 0.2, positions[stride + 3] + noise * 0.1, noise * 0.1);
        
        // Smooth scale fade at edges
        const scaleFactor = Math.min(1, (CULL_DISTANCE_SQ - distSq) / (CULL_DISTANCE_SQ * 0.15));
        dummy.scale.set(1.4 * scaleFactor, (1.0 + Math.random() * 0.5) * scaleFactor, 1.4 * scaleFactor);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[grassGeo, undefined, GRASS_COUNT_DENSE]} 
      castShadow={false} 
      receiveShadow={true}
      frustumCulled={true}
    >
      <meshStandardMaterial 
        color="#bbf7d0" // Lighter, fluffier green
        map={leafTexture} 
        alphaTest={0.7} 
        side={THREE.DoubleSide}
        transparent={false}
        roughness={0.8}
        metalness={0.1}
      />
    </instancedMesh>
  );
};

/**
 * 🌲 Procedural Tree with LOD (Anime Style)
 */
const Tree = ({ position }: { position: [number, number, number] }) => {
  return (
    <Detailed distances={[0, 80, 200]} position={position}>
      {/* High Detail */}
      <group>
        <Cylinder args={[0.2, 0.4, 3, 8]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color="#5d4037" />
        </Cylinder>
        {/* Leaf Layers */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 2.5 + i * 0.8, 0]} rotation={[0, (i * Math.PI) / 3, 0]}>
            <coneGeometry args={[1.5 - i * 0.3, 2, 8]} />
            <meshStandardMaterial 
              color={i === 0 ? "#2e7d32" : i === 1 ? "#388e3c" : "#43a047"} 
              map={leafTexture}
              alphaTest={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      {/* Medium Detail */}
      <group>
        <Cylinder args={[0.2, 0.4, 3, 4]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color="#5d4037" />
        </Cylinder>
        <Box args={[2, 3, 2]} position={[0, 3, 0]}>
          <meshStandardMaterial color="#2e7d32" />
        </Box>
      </group>
      {/* Low Detail */}
      <Box args={[1, 4, 1]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#1b5e20" />
      </Box>
    </Detailed>
  );
};

const Forest = () => {
  const trees = useMemo(() => {
    return Array.from({ length: TREE_COUNT }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * WORLD_SIZE,
        0,
        (Math.random() - 0.5) * WORLD_SIZE
      ] as [number, number, number]
    }));
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <Tree key={i} position={t.position} />
      ))}
    </group>
  );
};

/**
 * 🌊 Water Plane
 */
const Water = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
      <meshStandardMaterial 
        color="#3b82f6" 
        transparent 
        opacity={0.6} 
        roughness={0.1} 
        metalness={0.5} 
      />
    </mesh>
  );
};

/**
 * ☁️ Procedural Clouds
 */
const Clouds = () => {
  return (
    <group>
      {Array.from({ length: CLOUD_COUNT }).map((_, i) => (
        <Cloud
          key={i}
          opacity={0.5}
          speed={0.4}
          segments={20}
          position={[
            (Math.random() - 0.5) * WORLD_SIZE,
            20 + Math.random() * 10,
            (Math.random() - 0.5) * WORLD_SIZE
          ]}
        />
      ))}
    </group>
  );
};

/**
 * 🏟️ Main Playground Component
 */
export const Playground = React.memo(() => {
  // Motion Values for high-frequency updates without re-renders
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvJump = useMotionValue(0);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#000', 
      position: 'fixed', 
      top: 0, 
      left: 0,
      zIndex: 0,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      pointerEvents: 'auto'
    }}>
      <Canvas 
        shadows 
        dpr={1} 
        gl={{ 
          antialias: false, 
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
      >
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        
        {/* Environment & Lighting */}
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <fogExp2 attach="fog" args={['#87ceeb', 0.01]} />
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[512, 512]} 
        />

        {/* World Elements */}
        <group>
          <Water />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
            <meshStandardMaterial color="#3f6212" />
          </mesh>
          <Grass />
          <Forest />
          <Clouds />
        </group>

        {/* Character */}
        <Character mvX={mvX} mvY={mvY} mvJump={mvJump} />

        {/* 3D Controls */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          rotateSpeed={0.5}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Canvas>

      {/* Game UI & Input Logic */}
      <GameControls mvX={mvX} mvY={mvY} mvJump={mvJump} />
    </div>
  );
});
