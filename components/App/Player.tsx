/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { MotionValue } from 'framer-motion';
import { Box, Capsule, Cylinder, RoundedBox, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { sound } from './soundEffects';

export interface PlayerProps {
  mvX: MotionValue<number>;
  mvY: MotionValue<number>;
  mvJump: MotionValue<number>;
  onColorChange?: (color: string) => void;
  bodyColor?: string;
  visorColor?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  currentWeapon?: 'slap' | 'knife' | 'handgun';
  attackTrigger?: number;
  weaponWheelOpen?: boolean;
}

// --- HELPER PHALANX COMPONENT (Fat Chubby Cartoon Bones) ---
const ChubbyPhalanx = ({ 
  length, 
  radius, 
  color, 
  rotation = [0, 0, 0] 
}: { 
  length: number; 
  radius: number; 
  color: string; 
  rotation?: [number, number, number];
}) => (
  <group rotation={rotation}>
    {/* Smooth joint knuckle */}
    <mesh>
      <sphereGeometry args={[radius * 1.1, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
    </mesh>
    {/* Chubby bone segment */}
    <mesh position={[0, length / 2, 0]}>
      <cylinderGeometry args={[radius * 0.95, radius, length, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
    {/* Round finger tip */}
    <mesh position={[0, length, 0]}>
      <sphereGeometry args={[radius * 0.95, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
    </mesh>
  </group>
);

// --- HAND SUB-COMPONENT WITH SKELETON ROTATION CALCULATIONS ---
interface FloatingHandProps {
  isLeft: boolean;
  color: string;
  scale?: number;
  position?: [number, number, number];
  gripType: 'open' | 'fist' | 'pistol' | 'knife';
  children?: React.ReactNode;
}

const FloatingHand = ({ 
  isLeft, 
  color, 
  scale = 1, 
  position = [0, 0, 0],
  gripType,
  children
}: FloatingHandProps) => {
  const handRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);

  // References for base and tip bone groups to construct a fully natural double-joint skeleton
  const thumbBaseRef = useRef<THREE.Group>(null);
  const indexBaseRef = useRef<THREE.Group>(null);
  const middleBaseRef = useRef<THREE.Group>(null);
  const ringBaseRef = useRef<THREE.Group>(null);
  const pinkyBaseRef = useRef<THREE.Group>(null);

  const thumbTipRef = useRef<THREE.Group>(null);
  const indexTipRef = useRef<THREE.Group>(null);
  const middleTipRef = useRef<THREE.Group>(null);
  const ringTipRef = useRef<THREE.Group>(null);
  const pinkyTipRef = useRef<THREE.Group>(null);

  const sideSign = isLeft ? 1 : -1;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (handRef.current) {
      // Gentle weightless natural drift
      handRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.03;
      handRef.current.rotation.y = Math.sin(t * 0.8) * 0.03 * sideSign;
      handRef.current.rotation.x = Math.cos(t * 1.1) * 0.02;
    }

    if (wristRef.current) {
      const pulse = 1.0 + Math.sin(t * 2.5) * 0.003;
      wristRef.current.scale.set(pulse, pulse, pulse);

      // Organic dynamic wrist bone rotation depending on weapon coordinates which breaks robotic alignment
      let targetWristX = 0;
      let targetWristY = 0;
      let targetWristZ = 0;

      if (gripType === 'pistol') {
        // High-level shooter wrist angle: slight forward lock & inward roll
        targetWristX = -0.16;
        targetWristY = 0.12 * sideSign;
        targetWristZ = -0.06 * sideSign;
      } else if (gripType === 'knife') {
        // Aggressive slasher wrist angle: canted slightly outward for maximum leverage
        targetWristX = 0.18;
        targetWristY = -0.08 * sideSign;
        targetWristZ = 0.12 * sideSign;
      } else if (gripType === 'fist') {
        // Guarded combat knuckles: slight inward rotation
        targetWristX = 0.08;
        targetWristY = 0.14 * sideSign;
        targetWristZ = -0.08 * sideSign;
      }

      wristRef.current.rotation.x = THREE.MathUtils.lerp(wristRef.current.rotation.x, targetWristX, 0.12);
      wristRef.current.rotation.y = THREE.MathUtils.lerp(wristRef.current.rotation.y, targetWristY, 0.12);
      wristRef.current.rotation.z = THREE.MathUtils.lerp(wristRef.current.rotation.z, targetWristZ, 0.12);
    }

    // Organic cascading glove ripples (Piano finger wave)
    const waveSpeed = 2.6;
    const indexBreathe  = Math.sin(t * waveSpeed + 0.0) * 0.06 + 0.08;
    const middleBreathe = Math.sin(t * waveSpeed + 0.3) * 0.06 + 0.10;
    const ringBreathe   = Math.sin(t * waveSpeed + 0.6) * 0.06 + 0.09;
    const pinkyBreathe  = Math.sin(t * waveSpeed + 0.9) * 0.06 + 0.07;

    // Default resting values (Bottom-left/Top-right style cupped hand shapes)
    let targetThumbY = (0.16 + Math.sin(t * 1.5) * 0.02) * sideSign;
    let targetThumbZ = (-Math.PI / 4.6 - indexBreathe * 0.25) * sideSign;
    let targetIndexX = indexBreathe;
    let targetMiddleX = middleBreathe;
    let targetRingX = ringBreathe;
    let targetPinkyX = pinkyBreathe;

    // Double-joint secondary curling ratios for natural hand outlines
    let targetThumbTipX = 0.12 + Math.sin(t * 1.5) * 0.02;
    let targetIndexTipX = indexBreathe * 1.2;
    let targetMiddleTipX = middleBreathe * 1.25;
    let targetRingTipX = ringBreathe * 1.2;
    let targetPinkyTipX = pinkyBreathe * 1.15;

    if (gripType === 'fist') {
      // Tight clenched fist (Top-left image): base + tips wrap 90+ degrees with high-frequency adrenaline muscle flex/tremor
      const tremor = 1.0 + Math.sin(t * 16) * 0.012;
      targetThumbY = 0.22 * sideSign * tremor;
      targetThumbZ = -1.28 * sideSign;
      targetIndexX = 1.48 * tremor;
      targetMiddleX = 1.54 * tremor;
      targetRingX = 1.48 * tremor;
      targetPinkyX = 1.42 * tremor;

      targetThumbTipX = 0.88 * tremor;
      targetIndexTipX = 1.54 * tremor;
      targetMiddleTipX = 1.58 * tremor;
      targetRingTipX = 1.54 * tremor;
      targetPinkyTipX = 1.48 * tremor;
    } else if (gripType === 'pistol') {
      // Dynamic recoil trigger finger (Index rests, middle-ring-pinky wrap firmly like bottom-right image)
      const wiggle = Math.sin(t * 2) * 0.015;
      targetThumbY = 0.05 * sideSign;
      targetThumbZ = -1.02 * sideSign;
      targetIndexX = 0.22 + wiggle; // Index extended on trigger guard
      targetMiddleX = 1.44 + wiggle;
      targetRingX = 1.42 + wiggle;
      targetPinkyX = 1.36 + wiggle;

      targetThumbTipX = 0.15;
      targetIndexTipX = 0.32 + wiggle;
      targetMiddleTipX = 1.25 + wiggle;
      targetRingTipX = 1.22 + wiggle;
      targetPinkyTipX = 1.18 + wiggle;
    } else if (gripType === 'knife') {
      // Confident grip wrapping firm handle coordinates (Bottom-right grasping claw)
      const flex = 1.0 + Math.sin(t * 18) * 0.008;
      targetThumbY = 0.26 * sideSign * flex;
      targetThumbZ = -1.18 * sideSign;
      targetIndexX = 1.42 * flex;
      targetMiddleX = 1.42 * flex;
      targetRingX = 1.40 * flex;
      targetPinkyX = 1.38 * flex;

      targetThumbTipX = 0.72 * flex;
      targetIndexTipX = 1.25 * flex;
      targetMiddleTipX = 1.25 * flex;
      targetRingTipX = 1.22 * flex;
      targetPinkyTipX = 1.20 * flex;
    }

    // Apply base and tip rotations with smooth interpolation
    const lerpSpeed = 0.22;
    if (thumbBaseRef.current) {
      thumbBaseRef.current.rotation.y = THREE.MathUtils.lerp(thumbBaseRef.current.rotation.y, targetThumbY, lerpSpeed);
      thumbBaseRef.current.rotation.z = THREE.MathUtils.lerp(thumbBaseRef.current.rotation.z, targetThumbZ, lerpSpeed);
    }
    if (thumbTipRef.current) {
      thumbTipRef.current.rotation.x = THREE.MathUtils.lerp(thumbTipRef.current.rotation.x, targetThumbTipX, lerpSpeed);
    }

    if (indexBaseRef.current) {
      indexBaseRef.current.rotation.x = THREE.MathUtils.lerp(indexBaseRef.current.rotation.x, targetIndexX, lerpSpeed);
    }
    if (indexTipRef.current) {
      indexTipRef.current.rotation.x = THREE.MathUtils.lerp(indexTipRef.current.rotation.x, targetIndexTipX, lerpSpeed);
    }

    if (middleBaseRef.current) {
      middleBaseRef.current.rotation.x = THREE.MathUtils.lerp(middleBaseRef.current.rotation.x, targetMiddleX, lerpSpeed);
    }
    if (middleTipRef.current) {
      middleTipRef.current.rotation.x = THREE.MathUtils.lerp(middleTipRef.current.rotation.x, targetMiddleTipX, lerpSpeed);
    }

    if (ringBaseRef.current) {
      ringBaseRef.current.rotation.x = THREE.MathUtils.lerp(ringBaseRef.current.rotation.x, targetRingX, lerpSpeed);
    }
    if (ringTipRef.current) {
      ringTipRef.current.rotation.x = THREE.MathUtils.lerp(ringTipRef.current.rotation.x, targetRingTipX, lerpSpeed);
    }

    if (pinkyBaseRef.current) {
      pinkyBaseRef.current.rotation.x = THREE.MathUtils.lerp(pinkyBaseRef.current.rotation.x, targetPinkyX, lerpSpeed);
    }
    if (pinkyTipRef.current) {
      pinkyTipRef.current.rotation.x = THREE.MathUtils.lerp(pinkyTipRef.current.rotation.x, targetPinkyTipX, lerpSpeed);
    }
  });

  return (
    <group ref={handRef} position={position} scale={scale}>
      <group ref={wristRef}>
        {/* Palm as a cute thick globular bubble */}
        <RoundedBox args={[0.16, 0.16, 0.08]} radius={0.045} smoothness={5} position={[0, 0.04, 0]}>
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
        </RoundedBox>

        {/* Nested attached weapons */}
        {children}

        {/* 1. Thumb */}
        <group 
          ref={thumbBaseRef} 
          position={[isLeft ? 0.075 : -0.075, 0.015, 0.005]} 
          rotation={[0.1, 0.1 * sideSign, -Math.PI / 4 * sideSign]}
        >
          <ChubbyPhalanx length={0.045} radius={0.025} color={color} />
          <group ref={thumbTipRef} position={[0, 0.045, 0]} rotation={[0, 0, -0.1 * sideSign]}>
            <ChubbyPhalanx length={0.035} radius={0.023} color={color} />
          </group>
        </group>

        {/* 2. Index */}
        <group 
          ref={indexBaseRef} 
          position={[isLeft ? 0.055 : -0.055, 0.095, 0.0]} 
          rotation={[0, 0, 0.12 * sideSign]}
        >
          <ChubbyPhalanx length={0.045} radius={0.023} color={color} />
          <group ref={indexTipRef} position={[0, 0.045, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.035} radius={0.021} color={color} />
          </group>
        </group>

        {/* 3. Middle */}
        <group 
          ref={middleBaseRef} 
          position={[isLeft ? 0.018 : -0.018, 0.105, 0.0]} 
          rotation={[0, 0, 0]}
        >
          <ChubbyPhalanx length={0.055} radius={0.024} color={color} />
          <group ref={middleTipRef} position={[0, 0.055, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.04} radius={0.022} color={color} />
          </group>
        </group>

        {/* 4. Ring */}
        <group 
          ref={ringBaseRef} 
          position={[isLeft ? -0.018 : 0.018, 0.10, 0.0]} 
          rotation={[0, 0, -0.08 * sideSign]}
        >
          <ChubbyPhalanx length={0.05} radius={0.023} color={color} />
          <group ref={ringTipRef} position={[0, 0.05, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.038} radius={0.021} color={color} />
          </group>
        </group>

        {/* 5. Pinky */}
        <group 
          ref={pinkyBaseRef} 
          position={[isLeft ? -0.055 : 0.055, 0.08, 0.0]} 
          rotation={[0, 0, -0.2 * sideSign]}
        >
          <ChubbyPhalanx length={0.042} radius={0.021} color={color} />
          <group ref={pinkyTipRef} position={[0, 0.042, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.032} radius={0.019} color={color} />
          </group>
        </group>
      </group>
    </group>
  );
};

// --- PROCEDURAL WEAPON ATTACHMENTS ---
const KnifeAttachment = ({ isLeft, active }: { isLeft: boolean; active: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const transitionVal = useRef(0);

  useFrame((state, delta) => {
    const target = active ? 1 : 0;
    transitionVal.current = THREE.MathUtils.lerp(transitionVal.current, target, 1 - Math.exp(-15 * delta));
    
    if (groupRef.current) {
      // Scale-in to eliminate snaps on grab
      groupRef.current.scale.setScalar(transitionVal.current);
      
      // Animate position: slide up from palm core bottom (Y = -0.06) up to slotting knuckle position (Y = 0.045)
      groupRef.current.position.y = THREE.MathUtils.lerp(-0.06, 0.045, transitionVal.current);
      groupRef.current.position.z = THREE.MathUtils.lerp(-0.02, 0.015, transitionVal.current);
      
      // Animate rotation: twist slightly on draw/grabbing
      groupRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 4, 0.12, transitionVal.current);
    }
  });

  return (
    <group ref={groupRef} rotation={[0.12, 0, isLeft ? -0.12 : 0.12]}>
      {/* Wood grip handle */}
      <Cylinder args={[0.022, 0.022, 0.15, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#653b1b" roughness={0.7} />
      </Cylinder>
      {/* Crossguard */}
      <Box args={[0.065, 0.015, 0.03]} position={[0, 0.075, 0]}>
        <meshStandardMaterial color="#718096" roughness={0.15} metalness={0.9} />
      </Box>
      {/* Blade */}
      <group position={[0, 0.18, 0]}>
        <Box args={[0.045, 0.19, 0.012]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#cbd5e0" roughness={0.05} metalness={0.98} />
        </Box>
        <Box args={[0.025, 0.08, 0.008]} position={[-0.01, 0.095, 0]} rotation={[0, 0, -Math.PI / 10]}>
          <meshStandardMaterial color="#edf2f7" roughness={0.05} metalness={0.98} />
        </Box>
      </group>
    </group>
  );
};

const HandgunAttachment = ({ 
  isLeft, 
  active,
  flashActive, 
  tracerActive 
}: { 
  isLeft: boolean; 
  active: boolean;
  flashActive: boolean; 
  tracerActive: boolean; 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const transitionVal = useRef(0);

  useFrame((state, delta) => {
    const target = active ? 1 : 0;
    transitionVal.current = THREE.MathUtils.lerp(transitionVal.current, target, 1 - Math.exp(-15 * delta));
    
    if (groupRef.current) {
      // Scale-in to eliminate snaps on grab
      groupRef.current.scale.setScalar(transitionVal.current);
      
      // Animate position: slide up from palm bottom Y = -0.05 to sliding slot Y = 0.045, and Z = 0.025
      groupRef.current.position.y = THREE.MathUtils.lerp(-0.05, 0.045, transitionVal.current);
      groupRef.current.position.z = THREE.MathUtils.lerp(-0.01, 0.025, transitionVal.current);
      
      // Animate rotation: slight dynamic forward cocking angle
      groupRef.current.rotation.x = THREE.MathUtils.lerp(-0.3, isLeft ? -0.05 : 0.05, transitionVal.current);
    }
  });

  return (
    <group ref={groupRef} rotation={[isLeft ? -0.05 : 0.05, 0, 0]}>
      {/* Handle grip */}
      <Box args={[0.032, 0.09, 0.052]} position={[0, -0.012, -0.018]} rotation={[-Math.PI / 8, 0, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </Box>

      {/* Trigger guard frame loop (Reference 1 high-fidelity addition to lock fingers) */}
      <Box args={[0.012, 0.008, 0.045]} position={[0, -0.01, 0.015]}>
        <meshStandardMaterial color="#0b0f19" roughness={0.6} />
      </Box>
      <Box args={[0.012, 0.032, 0.008]} position={[0, 0.005, 0.035]}>
        <meshStandardMaterial color="#0b0f19" roughness={0.6} />
      </Box>

      {/* Trigger (Glock steel loop details inside) */}
      <Box args={[0.008, 0.02, 0.012]} position={[0, 0.005, 0.015]} rotation={[Math.PI / 10, 0, 0]}>
        <meshStandardMaterial color="#cbd5e0" roughness={0.15} metalness={0.9} />
      </Box>

      {/* Slide */}
      <Box args={[0.042, 0.045, 0.18]} position={[0, 0.035, 0.015]}>
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
      </Box>
      {/* Barrel cylinder */}
      <Cylinder args={[0.012, 0.012, 0.03, 8]} position={[0, 0.035, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.9} />
      </Cylinder>
      {/* Laser sight guides */}
      <mesh position={[0, 0.015, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 1.6]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.65} />
      </mesh>

      {/* Gun muzzle fire sparks */}
      {flashActive && (
        <mesh position={[0, 0.035, 0.18]} rotation={[0, 0, Math.random() * Math.PI]}>
          <planeGeometry args={[0.45, 0.45]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
        </mesh>
      )}

      {/* Gun Bullet tracers */}
      {tracerActive && (
        <mesh position={[0, 0.03, 10]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 20]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

// --- STANDALONE PLAYER INTEGRATION ---
const lerpAngle = (a: number, b: number, t: number) => {
  const delta = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  return a + delta * t;
};

const angleDelta = (a: number, b: number) => {
  return ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
};

export const Player = React.memo(({ 
  mvX,
  mvY,
  mvJump,
  bodyColor = "#ef4444",
  visorColor = "#7dd3fc",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  currentWeapon = 'slap',
  attackTrigger = 0,
  weaponWheelOpen = false
}: PlayerProps) => {
  const characterRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const backpackRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);
  
  // Pivot refs for arms (left and right)
  const leftHandPivotRef = useRef<THREE.Group>(null);
  const rightHandPivotRef = useRef<THREE.Group>(null);
  
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const isJumping = useRef(false);
  const lastJump = useRef(false);
  const pos = useRef({ x: 0, y: 0, z: 0 });
  const velocity = useRef({ x: 0, y: 0, z: 0 });

  // Alternate between firing/slashing hands
  const punchLeft = useRef(true);

  // States for visual effects feedback
  const [leftFlashActive, setLeftFlashActive] = useState(false);
  const [rightFlashActive, setRightFlashActive] = useState(false);
  const [leftTracerActive, setLeftTracerActive] = useState(false);
  const [rightTracerActive, setRightTracerActive] = useState(false);
  const [leftSlashActive, setLeftSlashActive] = useState(false);
  const [rightSlashActive, setRightSlashActive] = useState(false);
  const [isClenched, setIsClenched] = useState<'none' | 'left' | 'right'>('none');

  const cameraShakeVel = useRef(0);

  // Elastic animation spring trackers for smooth weight & landing dynamics (Initialized to relaxed standing neutral pose to prevent startup snap)
  const handLeftPosActual = useRef(new THREE.Vector3(-0.46, 0.85, 0.05));
  const handRightPosActual = useRef(new THREE.Vector3(0.46, 0.85, 0.05));
  const handLeftRotActual = useRef(new THREE.Vector3(0, -1.2 + Math.PI, Math.PI - 0.25));
  const handRightRotActual = useRef(new THREE.Vector3(0, 1.2 - Math.PI, -Math.PI + 0.25));

  // Breathing & walk-sway momentum
  const cumulativeTime = useRef(0);
  const breathFreq = 2.4;
  const smoothSwingZ = useRef(0);
  const smoothSwingY = useRef(0);

  // Jump impact landing physics
  const jumpImpactLag = useRef(0);
  const lastYPos = useRef(0);

  // useGSAP orchestration for attacks, recoils, slashes and gun actions
  useGSAP(() => {
    if (attackTrigger === 0) return;

    if (currentWeapon === 'slap') {
      sound.playSlap();
      const slapLeft = punchLeft.current;
      const targetPivotRef = slapLeft ? leftHandPivotRef.current : rightHandPivotRef.current;

      if (slapLeft) {
        setLeftSlashActive(true); // Re-use the dynamic sweep trace for motion feedback
        setTimeout(() => setLeftSlashActive(false), 160);
      } else {
        setRightSlashActive(true);
        setTimeout(() => setRightSlashActive(false), 160);
      }

      if (targetPivotRef) {
        setIsClenched(slapLeft ? 'left' : 'right');
        gsap.killTweensOf(targetPivotRef.position);
        gsap.killTweensOf(targetPivotRef.rotation);
        
        const sideSign = slapLeft ? -1 : 1;
        // Wide outward horizontal wind-up, aggressive slap swing-across, and smooth return
        gsap.timeline()
          .to(targetPivotRef.position, {
            x: 0.65 * sideSign,
            y: 0.95,
            z: -0.15,
            duration: 0.08,
            ease: 'power2.out'
          })
          .to(targetPivotRef.rotation, {
            x: -0.1,
            y: -0.6 * sideSign,
            z: 0.45 * sideSign,
            duration: 0.08
          }, '<')
          .to(targetPivotRef.position, {
            x: -0.42 * sideSign, // Swings clean across torso
            y: 0.85,
            z: 0.88,            // Explodes forward
            duration: 0.09,
            ease: 'power3.inOut'
          })
          .to(targetPivotRef.rotation, {
            x: 0.25,
            y: 1.45 * sideSign, // Flat open palm hitting vector
            z: -0.9 * sideSign,
            duration: 0.09
          }, '<')
          .to(targetPivotRef.position, {
            x: slapLeft ? -0.46 : 0.46,
            y: 0.85,
            z: 0.05,
            duration: 0.16,
            ease: 'power2.out',
            onComplete: () => {
              setIsClenched('none');
            }
          })
          .to(targetPivotRef.rotation, {
            x: 0,
            y: slapLeft ? -1.2 + Math.PI : 1.2 - Math.PI,
            z: slapLeft ? (Math.PI - 0.25) : (-Math.PI + 0.25),
            duration: 0.16
          }, '<');
      }
      punchLeft.current = !punchLeft.current;
    } else if (currentWeapon === 'knife') {
      sound.playSlash();
      const slashLeft = punchLeft.current;
      const targetPivotRef = slashLeft ? leftHandPivotRef.current : rightHandPivotRef.current;

      if (slashLeft) {
        setLeftSlashActive(true);
        setTimeout(() => setLeftSlashActive(false), 160);
      } else {
        setRightSlashActive(true);
        setTimeout(() => setRightSlashActive(false), 160);
      }

      if (targetPivotRef) {
        gsap.killTweensOf(targetPivotRef.position);
        gsap.killTweensOf(targetPivotRef.rotation);

        const sideSign = slashLeft ? -1 : 1;
        gsap.timeline()
          .to(targetPivotRef.position, {
            x: 0.15 * sideSign,
            y: 0.95,
            z: 0.8,
            duration: 0.07,
            ease: 'power3.out'
          })
          .to(targetPivotRef.rotation, {
            x: 0.3,
            y: -Math.PI / 2.5 * sideSign,
            z: -0.2 * sideSign,
            duration: 0.07
          }, '<')
          .to(targetPivotRef.position, {
            x: 0.5 * sideSign,
            y: 0.8,
            z: 0.4,
            duration: 0.16,
            ease: 'power2.inOut'
          })
          .to(targetPivotRef.rotation, {
            x: 0.2,
            y: 0,
            z: -Math.PI / 6 * sideSign,
            duration: 0.16
          }, '<');
      }
      punchLeft.current = !punchLeft.current;
    } else if (currentWeapon === 'handgun') {
      sound.playShoot();
      cameraShakeVel.current = 0.55;

      const shootLeft = punchLeft.current;
      const targetPivotRef = shootLeft ? leftHandPivotRef.current : rightHandPivotRef.current;

      if (shootLeft) {
        setLeftFlashActive(true);
        setLeftTracerActive(true);
        setTimeout(() => setLeftFlashActive(false), 55);
        setTimeout(() => setLeftTracerActive(false), 90);
      } else {
        setRightFlashActive(true);
        setRightTracerActive(true);
        setTimeout(() => setRightFlashActive(false), 55);
        setTimeout(() => setRightTracerActive(false), 90);
      }

      if (targetPivotRef) {
        gsap.killTweensOf(targetPivotRef.position);
        gsap.killTweensOf(targetPivotRef.rotation);

        const sideSign = shootLeft ? -1 : 1;
        gsap.timeline()
          .to(targetPivotRef.position, {
            x: 0.42 * sideSign,
            y: 1.05,
            z: 0.12,
            duration: 0.04,
            ease: 'circ.out'
          })
          .to(targetPivotRef.rotation, {
            x: -Math.PI / 4,
            duration: 0.04
          }, '<')
          .to(targetPivotRef.position, {
            x: 0.45 * sideSign,
            y: 0.8,
            z: 0.45,
            duration: 0.18,
            ease: 'power2.out'
          })
          .to(targetPivotRef.rotation, {
            x: 0,
            y: 0,
            z: -Math.PI / 12 * sideSign,
            duration: 0.18
          }, '<');
      }
      punchLeft.current = !punchLeft.current;
    }
  }, { dependencies: [attackTrigger] });

  // Main R3F frame tick loop for physics, screenshake & walk hand-swing bobs
  useFrame((state, delta) => {
    const effectiveDelta = delta * (weaponWheelOpen ? 0.15 : 1.0);
    
    // Accumulate custom timing delta for perfect scale-dilation
    cumulativeTime.current += effectiveDelta;
    const time = cumulativeTime.current;

    const x = mvX.get();
    const y = mvY.get();
    const jump = mvJump.get() > 0.5;
    const { camera } = state;

    // Direct screen camera rebound
    if (cameraShakeVel.current > 0.01) {
      const amp = cameraShakeVel.current * 0.4;
      camera.position.x += (Math.random() - 0.5) * amp;
      camera.position.y += (Math.random() - 0.5) * amp;
      camera.position.z += (Math.random() - 0.5) * amp;
      cameraShakeVel.current *= 0.8;
    }

    // Physical landing detection
    const landed = pos.current.y === 0 && lastYPos.current > 0.05;
    lastYPos.current = pos.current.y;
    if (landed) {
      jumpImpactLag.current = -0.16; // Compress posture
    }
    jumpImpactLag.current = THREE.MathUtils.lerp(jumpImpactLag.current, 0, 1 - Math.exp(-8 * effectiveDelta));

    // Stethoscopic chest breathing expansions & body bobs
    const breath = Math.sin(time * breathFreq) * 0.035;
    const chestExpansion = 1.0 + Math.sin(time * breathFreq) * 0.007;

    if (bodyRef.current) {
      bodyRef.current.scale.set(1, 1, 1);
      bodyRef.current.position.y = 0.8 + Math.sin(time * breathFreq) * 0.014 + jumpImpactLag.current * 0.6;
    }

    const speed = Math.sqrt(x ** 2 + y ** 2);

    // Timing parameters for walk locomotion cycle
    const swingFactor = weaponWheelOpen ? 0.35 : 1.0;
    const targetSwingZ = speed > 0.01 ? Math.sin(time * 9.5 * swingFactor) * 0.38 : 0;
    const targetSwingY = speed > 0.01 ? Math.abs(Math.cos(time * 9.5 * swingFactor)) * 0.08 : 0;

    // Decay swing movement elegantly with fluid momentum
    smoothSwingZ.current = THREE.MathUtils.lerp(smoothSwingZ.current, targetSwingZ, 1 - Math.exp(-8 * effectiveDelta));
    smoothSwingY.current = THREE.MathUtils.lerp(smoothSwingY.current, targetSwingY, 1 - Math.exp(-8 * effectiveDelta));

    // Tilt hands forward and backward naturally during foot swinging
    const pitchL = smoothSwingZ.current * 0.55;
    const yawL = Math.sin(time * 9.5) * 0.08 * (speed > 0.01 ? 1 : 0);

    // Apply inertia weight lag on arms during jump ascension & weightless descent
    const lagY = -velocity.current.y * 0.045;
    const clampedLagY = THREE.MathUtils.clamp(lagY, -0.22, 0.22);

    const targetLPos = new THREE.Vector3();
    const targetLRot = new THREE.Vector3();
    const targetRPos = new THREE.Vector3();
    const targetRRot = new THREE.Vector3();

    if (leftHandPivotRef.current && rightHandPivotRef.current) {
        // Dynamic game layout coordinates based on equipped weapons
        if (currentWeapon === 'handgun') {
          // Tactical dual-guns hold: chest height, gorgeous canted forward angle with micro sways
          targetLPos.set(-0.45, 0.8 + breath + smoothSwingY.current + clampedLagY, 0.46 - smoothSwingZ.current * 0.4);
          targetLRot.set(pitchL * 0.2 + 0.05, 0.12, Math.PI / 6 + Math.sin(time * 0.8) * 0.012);

          targetRPos.set(0.45, 0.8 + breath + smoothSwingY.current + clampedLagY, 0.46 + smoothSwingZ.current * 0.4);
          targetRRot.set(-pitchL * 0.2 + 0.05, -0.12, -Math.PI / 6 - Math.sin(time * 0.8) * 0.012);
        } else if (currentWeapon === 'knife') {
          // Hunter stance: dual blades canted forward ready to slash
          targetLPos.set(-0.48, 0.82 + breath + smoothSwingY.current + clampedLagY, 0.42 - smoothSwingZ.current * 0.65);
          targetLRot.set(0.24 + pitchL * 0.4, 0.15, Math.PI / 4 + Math.sin(time * 1.4) * 0.015);

          targetRPos.set(0.48, 0.82 + breath + smoothSwingY.current + clampedLagY, 0.42 + smoothSwingZ.current * 0.65);
          targetRRot.set(0.24 - pitchL * 0.4, -0.15, -Math.PI / 4 - Math.sin(time * 1.4) * 0.015);
        } else {
          // --- Slap ready high-stature hands, rotated horizontally 180 degrees ---
          targetLPos.set(
            -0.46, 
            0.85 + breath * 0.2 + smoothSwingY.current * 1.5 + clampedLagY, 
            0.05 - smoothSwingZ.current * 0.95
          );
          targetLRot.set(
            pitchL * 1.1, 
            -1.2 + Math.PI + yawL * 0.4, 
            Math.PI - 0.25 + smoothSwingY.current * 0.15
          );

          targetRPos.set(
            0.46, 
            0.85 + breath * 0.2 + smoothSwingY.current * 1.5 + clampedLagY, 
            0.05 + smoothSwingZ.current * 0.95
          );
          targetRRot.set(
            -pitchL * 1.1, 
            1.2 - Math.PI - yawL * 0.4, 
            -Math.PI + 0.25 - smoothSwingY.current * 0.15
          );
        }

      // Smooth lag spring interpolation towards final orientations
      const lerpFactor = 1 - Math.exp(-14 * effectiveDelta); // Fast, snappy but elastic

      const leftMoving = gsap.getTweensOf(leftHandPivotRef.current.position).length > 0;
      const rightMoving = gsap.getTweensOf(rightHandPivotRef.current.position).length > 0;

      if (!leftMoving) {
        handLeftPosActual.current.lerp(targetLPos, lerpFactor);
        handLeftRotActual.current.lerp(targetLRot, lerpFactor);

        leftHandPivotRef.current.position.copy(handLeftPosActual.current);
        leftHandPivotRef.current.position.y += jumpImpactLag.current;
        leftHandPivotRef.current.rotation.set(
          handLeftRotActual.current.x,
          handLeftRotActual.current.y,
          handLeftRotActual.current.z
        );
      }

      if (!rightMoving) {
        handRightPosActual.current.lerp(targetRPos, lerpFactor);
        handRightRotActual.current.lerp(targetRRot, lerpFactor);

        rightHandPivotRef.current.position.copy(handRightPosActual.current);
        rightHandPivotRef.current.position.y += jumpImpactLag.current;
        rightHandPivotRef.current.rotation.set(
          handRightRotActual.current.x,
          handRightRotActual.current.y,
          handRightRotActual.current.z
        );
      }
    }



    // Flame rocket dynamics
    if (jump !== lastJump.current) {
      lastJump.current = jump;
      if (flameRef.current) {
        gsap.killTweensOf(flameRef.current.scale);
        if (jump) {
          gsap.to(flameRef.current.scale, { x: 1, y: 1.2, z: 1, duration: 0.2, ease: 'power2.out' });
        } else {
          gsap.to(flameRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.2, ease: 'power2.in' });
        }
      }
    }

    // Camera relative calculations
    if (speed > 0.01) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).negate();
      right.y = 0;
      right.normalize();

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, y)
        .addScaledVector(right, x)
        .normalize();

      velocity.current.x = moveDir.x * 9 * speed;
      velocity.current.z = moveDir.z * 9 * speed;

      if (characterRef.current) {
        const targetRotation = Math.atan2(moveDir.x, moveDir.z);
        const currentRotation = characterRef.current.rotation.y;
        const diff = Math.abs(angleDelta(currentRotation, targetRotation));
        const rotationFactor = diff > Math.PI * 0.6 ? 0.5 : 0.3;

        characterRef.current.rotation.y = lerpAngle(currentRotation, targetRotation, rotationFactor);
        const turnSpeedPenalty = THREE.MathUtils.mapLinear(Math.min(diff, Math.PI), 0, Math.PI, 1, 0.4);
        velocity.current.x *= turnSpeedPenalty;
        velocity.current.z *= turnSpeedPenalty;
      }
    } else {
      velocity.current.x *= 0.8;
      velocity.current.z *= 0.8;
    }

    pos.current.x += velocity.current.x * effectiveDelta;
    pos.current.z += velocity.current.z * effectiveDelta;

    if (jump) {
      velocity.current.y += 1.5 * effectiveDelta;
    }

    if (pos.current.y > 0 || velocity.current.y > 0) {
      velocity.current.y -= 0.8 * effectiveDelta;
    }

    pos.current.y += velocity.current.y;

    if (pos.current.y < 0) {
      pos.current.y = 0;
      velocity.current.y = 0;
    }

    if (characterRef.current) {
      characterRef.current.position.set(pos.current.x, pos.current.y, pos.current.z);
    }

    // Alternate leg swings in movement direction
    if (speed > 0.01) {
      const legRotation = Math.sin(time * 9.5 * swingFactor) * 0.48;
      if (leftLegRef.current) leftLegRef.current.rotation.x = legRotation;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legRotation;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.12);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.12);
    }
  });

  // Calculate matching grip states for hands
  const getGripType = (isHandLeft: boolean) => {
    if (currentWeapon === 'handgun') return 'pistol';
    if (currentWeapon === 'knife') return 'knife';
    // Slapping stays wide-open flat hand
    if (isHandLeft && isClenched === 'left') return 'open';
    if (!isHandLeft && isClenched === 'right') return 'open';
    return 'open';
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={characterRef} rotation={[0, Math.PI / 2, 0]}>
        
        {/* Torso capsule & Back utilities */}
        <group ref={bodyRef} position={[0, 0.8, 0]}>
          <Capsule args={[0.35, 0.6, 8, 12]}>
            <meshStandardMaterial color={bodyColor} />
          </Capsule>

          {/* Backpack and Rocket Jet flames */}
          <group ref={backpackRef}>
            <Box args={[0.3, 0.5, 0.25]} position={[0, 0.1, -0.3]}>
              <meshStandardMaterial color={bodyColor} />
            </Box>
            <group ref={flameRef} position={[0, -0.2, -0.3]} scale={0}>
              <Box args={[0.15, 0.3, 0.15]} position={[0, -0.15, 0]}>
                <meshBasicMaterial color="#fbbf24" />
              </Box>
              <Box args={[0.1, 0.2, 0.1]} position={[0, -0.25, 0]}>
                <meshBasicMaterial color="#ef4444" />
              </Box>
            </group>
          </group>

          {/* Visor Bezel Layer (Reduces Depth Flicker) */}
          <group position={[0, 0.2, 0.345]}>
            <RoundedBox args={[0.43, 0.26, 0.08]} radius={0.09} smoothness={4} position={[0, 0, 0]}>
              <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.1} />
            </RoundedBox>
            <RoundedBox args={[0.395, 0.225, 0.085]} radius={0.075} smoothness={4} position={[0, 0, 0.015]}>
              <meshPhysicalMaterial 
                color={visorColor} 
                roughness={0.12} 
                metalness={0.12} 
                transmission={0.4} 
                thickness={0.1} 
                transparent 
                opacity={0.9} 
                emissive={visorColor} 
                emissiveIntensity={0.25} 
              />
            </RoundedBox>
          </group>
        </group>

        {/* --- DUAL HAND 1: LEFT HAND SYSTEM --- */}
        <group ref={leftHandPivotRef}>
          <FloatingHand 
            isLeft={true} 
            color={bodyColor} 
            scale={1.25} 
            position={[0, 0, 0]} 
            gripType={getGripType(true)} 
          >
            {/* Always keep mounted for seamless smooth slide of weapons on draw/grab */}
            <KnifeAttachment isLeft={true} active={currentWeapon === 'knife'} />
            <HandgunAttachment 
              isLeft={true} 
              active={currentWeapon === 'handgun'}
              flashActive={leftFlashActive} 
              tracerActive={leftTracerActive} 
            />
          </FloatingHand>

          {/* Left blade sweep lines */}
          {leftSlashActive && (
            <group position={[0, 0.2, 0.6]} rotation={[-Math.PI / 8, -Math.PI / 4, 0]}>
              <mesh>
                <torusGeometry args={[0.55, 0.025, 8, 16, Math.PI / 2.3]} />
                <meshBasicMaterial color="#e2e8f0" transparent opacity={0.75} />
              </mesh>
            </group>
          )}
        </group>

        {/* --- DUAL HAND 2: RIGHT HAND SYSTEM --- */}
        <group ref={rightHandPivotRef}>
          <FloatingHand 
            isLeft={false} 
            color={bodyColor} 
            scale={1.25} 
            position={[0, 0, 0]} 
            gripType={getGripType(false)} 
          >
            {/* Always keep mounted for seamless smooth slide of weapons on draw/grab */}
            <KnifeAttachment isLeft={false} active={currentWeapon === 'knife'} />
            <HandgunAttachment 
              isLeft={false} 
              active={currentWeapon === 'handgun'}
              flashActive={rightFlashActive} 
              tracerActive={rightTracerActive} 
            />
          </FloatingHand>

          {/* Right blade sweep curve torus trail */}
          {rightSlashActive && (
            <group position={[0, 0.2, 0.6]} rotation={[-Math.PI / 8, Math.PI / 4, 0]}>
              <mesh>
                <torusGeometry args={[0.55, 0.025, 8, 16, Math.PI / 2.3]} />
                <meshBasicMaterial color="#e2e8f0" transparent opacity={0.75} />
              </mesh>
            </group>
          )}
        </group>

        {/* Legs locomotion */}
        <group position={[0, 0.3, 0]}>
          <group ref={leftLegRef} position={[-0.15, 0, 0]}>
            <Capsule args={[0.12, 0.3, 8, 8]} position={[0, -0.15, 0]}>
              <meshStandardMaterial color={bodyColor} />
            </Capsule>
          </group>
          <group ref={rightLegRef} position={[0.15, 0, 0]}>
            <Capsule args={[0.12, 0.3, 8, 8]} position={[0, -0.15, 0]}>
              <meshStandardMaterial color={bodyColor} />
            </Capsule>
          </group>
        </group>

      </group>
    </group>
  );
});
