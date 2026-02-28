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
import gsap from 'gsap';

// --- CONSTANTS ---
const WORLD_SIZE = 400;
const GRASS_COUNT = 2000;
const TREE_COUNT = 30;
const CLOUD_COUNT = 10;

// --- COMPONENTS ---

/**
 * 🌿 Procedural Grass using InstancedMesh
 */
const Grass = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < GRASS_COUNT; i++) {
      pos.push([
        (Math.random() - 0.5) * WORLD_SIZE,
        0,
        (Math.random() - 0.5) * WORLD_SIZE
      ]);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      // Simple wind animation
      dummy.rotation.x = Math.sin(time + p[0] * 0.5) * 0.1;
      dummy.rotation.z = Math.cos(time + p[2] * 0.5) * 0.1;
      dummy.scale.set(0.5, 0.5 + Math.random() * 0.5, 0.5);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, GRASS_COUNT]}>
      <coneGeometry args={[0.05, 0.5, 3]} />
      <meshStandardMaterial color="#4ade80" />
    </instancedMesh>
  );
};

/**
 * 🌲 Procedural Tree with LOD
 */
const Tree = ({ position }: { position: [number, number, number] }) => {
  return (
    <Detailed distances={[0, 50, 150]} position={position}>
      {/* High Detail */}
      <group>
        <Cylinder args={[0.2, 0.3, 2, 6]} position={[0, 1, 0]}>
          <meshStandardMaterial color="#78350f" />
        </Cylinder>
        <Sphere args={[1, 8, 8]} position={[0, 2.5, 0]}>
          <meshStandardMaterial color="#166534" />
        </Sphere>
      </group>
      {/* Medium Detail */}
      <group>
        <Cylinder args={[0.2, 0.3, 2, 4]} position={[0, 1, 0]}>
          <meshStandardMaterial color="#78350f" />
        </Cylinder>
        <Box args={[1.5, 1.5, 1.5]} position={[0, 2.5, 0]}>
          <meshStandardMaterial color="#166534" />
        </Box>
      </group>
      {/* Low Detail (Billboard style or simple box) */}
      <Box args={[1, 3, 1]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#166534" />
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
 * 🕹️ COD Mobile Inspired Controls
 */
const Controls = ({ 
  mvX, 
  mvY, 
  mvJump 
}: { 
  mvX: MotionValue<number>; 
  mvY: MotionValue<number>; 
  mvJump: MotionValue<number>;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w') mvY.set(1);
      if (e.key === 's') mvY.set(-1);
      if (e.key === 'a') mvX.set(-1);
      if (e.key === 'd') mvX.set(1);
      if (e.key === ' ') mvJump.set(1);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's'].includes(e.key)) mvY.set(0);
      if (['a', 'd'].includes(e.key)) mvX.set(0);
      if (e.key === ' ') mvJump.set(0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mvX, mvY, mvJump]);

  return (
    <OrbitControls 
      enableDamping 
      dampingFactor={0.05} 
      rotateSpeed={0.5}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2.1}
    />
  );
};

/**
 * 🏟️ Main Playground Component
 */
export const Playground = React.memo(() => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickActive = useRef(false);
  
  // Motion Values for high-frequency updates without re-renders
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvJump = useMotionValue(0);

  // Derived motion values for the joystick knob UI
  const knobX = useTransform(mvX, [-1, 1], [-40, 40]);
  const knobY = useTransform(mvY, [-1, 1], [40, -40]);

  const handleJoystickTouch = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const dx = (clientX - centerX) / (rect.width / 2);
    const dy = -(clientY - centerY) / (rect.height / 2);
    
    // Clamp to -1, 1
    const x = Math.max(-1, Math.min(1, dx));
    const y = Math.max(-1, Math.min(1, dy));
    
    mvX.set(x);
    mvY.set(y);
  }, [mvX, mvY]);

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

        {/* Controls */}
        <Controls mvX={mvX} mvY={mvY} mvJump={mvJump} />
        
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Canvas>

      {/* Virtual Joystick UI (Simplified) */}
      <div 
        ref={joystickRef}
        draggable={false}
        onMouseDown={() => { joystickActive.current = true; }}
        onMouseMove={(e) => joystickActive.current && handleJoystickTouch(e)}
        onMouseUp={() => { joystickActive.current = false; mvX.set(0); mvY.set(0); }}
        onMouseLeave={() => { joystickActive.current = false; mvX.set(0); mvY.set(0); }}
        onTouchStart={(e) => { joystickActive.current = true; handleJoystickTouch(e); }}
        onTouchMove={(e) => joystickActive.current && handleJoystickTouch(e)}
        onTouchEnd={() => { joystickActive.current = false; mvX.set(0); mvY.set(0); }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          zIndex: 20,
          touchAction: 'none',
          cursor: 'pointer'
        }}
      >
        <motion.div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          x: knobX,
          y: knobY
        }} />
      </div>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10
      }}>
        <button 
          draggable={false}
          onMouseDown={() => mvJump.set(1)}
          onMouseUp={() => mvJump.set(0)}
          onTouchStart={() => mvJump.set(1)}
          onTouchEnd={() => mvJump.set(0)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
        >
          JUMP
        </button>
      </div>
    </div>
  );
});
