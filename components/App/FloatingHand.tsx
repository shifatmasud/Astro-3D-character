import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/*
  === AMONG US / CARTOON STYLE RED FLOATING 5-FINGER WRIST ===
  - Track Errors: Scaled with precision to maintain zero clipping. Fully supports custom color inputs.
  - Tiny Comments: Placed detailed inline annotation for each phalanx (knuckle base, intermediate, and tips).
  - Explain what changed: Completely removed the forearm elements, wrist sleeve cuff cylinders, and the base sphere.
    Replaced the generic sphere palm with a beautiful flat RoundedBox palm. Corrected the thumb alignment to fan
    outward symmetrically and adjusted all finger positions for a highly polished, stylized aesthetic.
  - How to undo change: Revert to using a sphereGeometry for the center palm and add base sphere components.
*/

interface FloatingHandProps {
  position?: [number, number, number];
  scale?: number | [number, number, number];
  isLeft?: boolean;
  color?: string;
}

// Chubby cartoon phalanx helper (purely fat, smooth fingers)
const ChubbyPhalanx = ({ length, radius, color, rotation = [0, 0, 0] }: { length: number, radius: number, color: string, rotation?: [number, number, number] }) => (
  <group rotation={rotation}>
    {/* Smooth joint sphere */}
    <mesh>
      <sphereGeometry args={[radius * 1.1, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.4} 
        metalness={0.15} 
      />
    </mesh>
    {/* Chubby cylinder bone segment */}
    <mesh position={[0, length / 2, 0]}>
      <cylinderGeometry args={[radius * 0.95, radius, length, 16]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.4} 
        metalness={0.1} 
      />
    </mesh>
    {/* Round finger tip */}
    <mesh position={[0, length, 0]}>
      <sphereGeometry args={[radius * 0.95, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.4} 
        metalness={0.15} 
      />
    </mesh>
  </group>
);

export const FloatingHand = ({ 
  position = [0, 0, 0], 
  scale = 1, 
  isLeft, 
  color = "#ef4444" 
}: FloatingHandProps) => {
  const handRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);

  // References for idle finger flexing
  const thumbBaseRef = useRef<THREE.Group>(null);
  const indexBaseRef = useRef<THREE.Group>(null);
  const middleBaseRef = useRef<THREE.Group>(null);
  const ringBaseRef = useRef<THREE.Group>(null);
  const pinkyBaseRef = useRef<THREE.Group>(null);

  // Determine hand orientation index
  const isLeftHand = isLeft !== undefined ? isLeft : position[0] < 0;
  const sideSign = isLeftHand ? 1 : -1;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (handRef.current) {
      // Gentle natural breathing / floating animation
      handRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.1;

      // Realistic weightless idle organic rotations
      handRef.current.rotation.y = Math.sin(t * 0.7) * 0.1 * sideSign;
      handRef.current.rotation.x = Math.cos(t * 1.0) * 0.08;
      handRef.current.rotation.z = Math.sin(t * 0.6) * 0.05 * sideSign;
    }

    if (wristRef.current) {
      // Gentle pulsing of the hand itself
      const pulse = 1.0 + Math.sin(t * 2.2) * 0.006;
      wristRef.current.scale.set(pulse, pulse, pulse);
    }

    // Dynamic, life-like idle curling of all 5 fingers for responsive action
    const curlSpeed = 2.4;
    const waveOffset = isLeftHand ? 0 : 0.3;
    const generalCurlAmt = 0.06 + Math.sin(t * curlSpeed + waveOffset) * 0.08;

    if (thumbBaseRef.current) {
      // Thumb curls outwards slightly
      thumbBaseRef.current.rotation.y = (0.15 + Math.sin(t * curlSpeed * 0.8) * 0.03) * sideSign;
      thumbBaseRef.current.rotation.z = (-Math.PI / 4.5 - generalCurlAmt * 0.3) * sideSign;
    }
    if (indexBaseRef.current) {
      indexBaseRef.current.rotation.x = generalCurlAmt * 0.8;
      indexBaseRef.current.rotation.z = (0.12 + Math.sin(t * 1.5) * 0.02) * sideSign;
    }
    if (middleBaseRef.current) {
      middleBaseRef.current.rotation.x = (generalCurlAmt + 0.02) * 0.9;
    }
    if (ringBaseRef.current) {
      ringBaseRef.current.rotation.x = (generalCurlAmt + 0.01) * 0.85;
      ringBaseRef.current.rotation.z = (-0.08 - Math.sin(t * 1.5) * 0.01) * sideSign;
    }
    if (pinkyBaseRef.current) {
      pinkyBaseRef.current.rotation.x = generalCurlAmt * 0.95;
      pinkyBaseRef.current.rotation.z = (-0.2 - Math.sin(t * 1.5) * 0.02) * sideSign;
    }
  });

  // Base red body color
  const baseRed = color;

  return (
    <group ref={handRef} position={position} scale={scale}>
      <group ref={wristRef}>

        {/* === MAIN PALM === */}
        {/* A beautiful RoundedBox that defines a structured flat cartoon palm */}
        <RoundedBox args={[0.13, 0.13, 0.035]} radius={0.015} smoothness={4} position={[0, 0.04, 0]}>
          <meshStandardMaterial 
            color={baseRed} 
            roughness={0.35} 
            metalness={0.1} 
          />
        </RoundedBox>

        {/* === 5 CHUBBY FINGERS (Organized inner-to-outer: Thumb pointing outwards) === */}

        {/* 1. THUMB (Steered outwards on the appropriate side) */}
        <group 
          ref={thumbBaseRef} 
          position={[isLeftHand ? 0.065 : -0.065, 0.02, 0]} 
          rotation={[0.1, 0.1 * sideSign, -Math.PI / 4 * sideSign]}
        >
          <ChubbyPhalanx length={0.055} radius={0.016} color={baseRed} />
          <group position={[0, 0.055, 0]} rotation={[0, 0, -0.1 * sideSign]}>
            <ChubbyPhalanx length={0.045} radius={0.0145} color={baseRed} />
          </group>
        </group>

        {/* 2. INDEX FINGER */}
        <group 
          ref={indexBaseRef} 
          position={[isLeftHand ? 0.045 : -0.045, 0.09, 0]} 
          rotation={[0, 0, 0.12 * sideSign]}
        >
          <ChubbyPhalanx length={0.055} radius={0.014} color={baseRed} />
          <group position={[0, 0.055, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.045} radius={0.0125} color={baseRed} />
          </group>
        </group>

        {/* 3. MIDDLE FINGER */}
        <group 
          ref={middleBaseRef} 
          position={[isLeftHand ? 0.015 : -0.015, 0.10, 0]} 
          rotation={[0, 0, 0]}
        >
          <ChubbyPhalanx length={0.065} radius={0.014} color={baseRed} />
          <group position={[0, 0.065, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.05} radius={0.0125} color={baseRed} />
          </group>
        </group>

        {/* 4. RING FINGER */}
        <group 
          ref={ringBaseRef} 
          position={[isLeftHand ? -0.015 : 0.015, 0.095, 0]} 
          rotation={[0, 0, -0.08 * sideSign]}
        >
          <ChubbyPhalanx length={0.06} radius={0.0135} color={baseRed} />
          <group position={[0, 0.06, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.048} radius={0.012} color={baseRed} />
          </group>
        </group>

        {/* 5. PINKY FINGER */}
        <group 
          ref={pinkyBaseRef} 
          position={[isLeftHand ? -0.045 : 0.045, 0.075, 0]} 
          rotation={[0, 0, -0.2 * sideSign]}
        >
          <ChubbyPhalanx length={0.048} radius={0.0125} color={baseRed} />
          <group position={[0, 0.048, 0]} rotation={[0.2, 0, 0]}>
            <ChubbyPhalanx length={0.038} radius={0.011} color={baseRed} />
          </group>
        </group>

      </group>
    </group>
  );
};
