import React, { useRef } from 'react';
import { MotionValue } from 'framer-motion';
import { Box, Capsule } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export interface CharacterProps {
  mvX: MotionValue<number>;
  mvY: MotionValue<number>;
  mvJump: MotionValue<number>;
  onColorChange?: (color: string) => void;
  bodyColor?: string;
  visorColor?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

// --- HELPERS ---
const lerpAngle = (a: number, b: number, t: number) => {
  const delta = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  return a + delta * t;
};

const angleDelta = (a: number, b: number) => {
  return ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
};

export const Character = React.memo(({ 
  mvX,
  mvY,
  mvJump,
  onColorChange,
  bodyColor = "#ef4444",
  visorColor = "#7dd3fc",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}: CharacterProps) => {
  const characterRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const backpackRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Use the color prop
  const activeBodyColor = bodyColor;

  const isJumping = useRef(false);
  const lastJump = useRef(false);
  const pos = useRef({ x: 0, y: 0, z: 0 });
  const velocity = useRef({ x: 0, y: 0, z: 0 });

  useFrame((state, delta) => {
    const x = mvX.get();
    const y = mvY.get();
    const jump = mvJump.get() > 0.5;
    const { camera } = state;

    // Handle Jump Animation with GSAP - Only on change
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

    // Camera-relative movement
    const speed = Math.sqrt(x ** 2 + y ** 2);
    
    if (speed > 0.01) {
      // Get camera forward and right vectors
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).negate();
      right.y = 0;
      right.normalize();

      // Calculate movement direction
      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, y)
        .addScaledVector(right, x)
        .normalize();

      velocity.current.x = moveDir.x * 5 * speed;
      velocity.current.z = moveDir.z * 5 * speed;

      if (characterRef.current) {
        const targetRotation = Math.atan2(moveDir.x, moveDir.z);
        const currentRotation = characterRef.current.rotation.y;
        const diff = Math.abs(angleDelta(currentRotation, targetRotation));
        
        // Faster rotation for larger turns (GTA style pivot)
        const rotationFactor = diff > Math.PI * 0.6 ? 0.35 : 0.2;
        
        characterRef.current.rotation.y = lerpAngle(
          currentRotation, 
          targetRotation, 
          rotationFactor
        );

        // Reduce forward speed during sharp turns to avoid "sliding"
        const turnSpeedPenalty = THREE.MathUtils.mapLinear(Math.min(diff, Math.PI), 0, Math.PI, 1, 0.4);
        velocity.current.x *= turnSpeedPenalty;
        velocity.current.z *= turnSpeedPenalty;

        // Procedural Lean (GTA 5 style)
        // Lean forward based on speed
        characterRef.current.rotation.x = THREE.MathUtils.lerp(
          characterRef.current.rotation.x,
          speed * 0.25,
          0.1
        );

        // Lean sideways based on turning
        const turnD = angleDelta(currentRotation, targetRotation);
        characterRef.current.rotation.z = THREE.MathUtils.lerp(
          characterRef.current.rotation.z,
          -turnD * 0.6,
          0.1
        );
      }
    } else {
      velocity.current.x *= 0.8;
      velocity.current.z *= 0.8;
      
      if (characterRef.current) {
        characterRef.current.rotation.x = THREE.MathUtils.lerp(characterRef.current.rotation.x, 0, 0.1);
        characterRef.current.rotation.z = THREE.MathUtils.lerp(characterRef.current.rotation.z, 0, 0.1);
      }
    }

    pos.current.x += velocity.current.x * delta;
    pos.current.z += velocity.current.z * delta;

    if (jump) {
      velocity.current.y += 1.5 * delta;
    }

    if (pos.current.y > 0 || velocity.current.y > 0) {
      velocity.current.y -= 0.8 * delta;
    }

    pos.current.y += velocity.current.y;

    if (pos.current.y < 0) {
      pos.current.y = 0;
      velocity.current.y = 0;
    }

    if (characterRef.current) {
      characterRef.current.position.set(pos.current.x, pos.current.y, pos.current.z);
    }

    if (speed > 0.01) {
      const time = state.clock.getElapsedTime();
      const legRotation = Math.sin(time * 10) * 0.5;
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = legRotation;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -legRotation;
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.8 + Math.sin(time * 10) * 0.05;
      }
    } else {
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.8, 0.1);
      }
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={characterRef} rotation={[0, Math.PI / 2, 0]}>
        {/* Main Body Group */}
        <group ref={bodyRef} position={[0, 0.8, 0]}>
            {/* Body Capsule */}
            <Capsule args={[0.35, 0.6, 2, 6]}>
              <meshStandardMaterial color={activeBodyColor} />
            </Capsule>

            {/* Backpack */}
            <group ref={backpackRef}>
                <Box args={[0.3, 0.5, 0.25]} position={[0, 0.1, -0.3]}>
                  <meshStandardMaterial color={activeBodyColor} />
                </Box>
                {/* Jetpack Flame */}
                <group 
                  ref={flameRef} 
                  position={[0, -0.2, -0.3]} 
                  scale={0} 
                >
                    <Box args={[0.15, 0.3, 0.15]} position={[0, -0.15, 0]}>
                        <meshBasicMaterial color="#fbbf24" />
                    </Box>
                    <Box args={[0.1, 0.2, 0.1]} position={[0, -0.25, 0]}>
                        <meshBasicMaterial color="#ef4444" />
                    </Box>
                </group>
            </group>

            {/* Visor */}
            <Box args={[0.4, 0.25, 0.15]} position={[0, 0.2, 0.3]}>
              <meshStandardMaterial color={visorColor} roughness={0.2} metalness={0.8} />
            </Box>
        </group>

        {/* Legs */}
        <group position={[0, 0.3, 0]}>
            <group ref={leftLegRef} position={[-0.15, 0, 0]}>
                <Capsule args={[0.12, 0.3, 2, 4]} position={[0, -0.15, 0]}>
                    <meshStandardMaterial color={activeBodyColor} />
                </Capsule>
            </group>
            <group ref={rightLegRef} position={[0.15, 0, 0]}>
                <Capsule args={[0.12, 0.3, 2, 4]} position={[0, -0.15, 0]}>
                    <meshStandardMaterial color={activeBodyColor} />
                </Capsule>
            </group>
        </group>
      </group>
    </group>
  );
});
