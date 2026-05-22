import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDoubleUp, Shield, Person, Crosshair, Sword, HandWaving, Star } from 'phosphor-react';
import { sound } from './soundEffects';

interface ControlsProps {
  mvX: any;
  mvY: any;
  mvJump: any;
  currentWeapon: 'slap' | 'knife' | 'handgun';
  setCurrentWeapon: (weapon: 'slap' | 'knife' | 'handgun') => void;
  weaponWheelOpen: boolean;
  setWeaponWheelOpen: (open: boolean) => void;
  onAttack: () => void;
}

export const GameControls = React.memo(({ 
  mvX, 
  mvY, 
  mvJump,
  currentWeapon,
  setCurrentWeapon,
  weaponWheelOpen,
  setWeaponWheelOpen,
  onAttack
}: ControlsProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickActive = useRef(false);

  // Knob states for UI rendering
  const [kbKnobX, setKbKnobX] = useState(0);
  const [kbKnobY, setKbKnobY] = useState(0);

  // Track cursor position for the weapon wheel
  const [wheelHoveredSector, setWheelHoveredSector] = useState<'slap' | 'knife' | 'handgun' | null>(null);

  // Keyboard state tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const updateInputFromKeys = useCallback(() => {
    let dx = 0;
    let dy = 0;

    if (keysPressed.current['w']) dy += 1;
    if (keysPressed.current['s']) dy -= 1;
    if (keysPressed.current['a']) dx -= 1;
    if (keysPressed.current['d']) dx += 1;

    // Normalize movement vectors
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    mvX.set(dx);
    mvY.set(dy);
    setKbKnobX(dx * 40);
    setKbKnobY(dy * -40);
  }, [mvX, mvY]);

  // Handle hotkeys & slow-mo trigger holding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Stop weapon wheel keys from scrolling page
      if (['q', 'tab'].includes(key)) {
        e.preventDefault();
        if (!weaponWheelOpen) {
          setWeaponWheelOpen(true);
          sound.playTick();
        }
      }

      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.current[key] = true;
        updateInputFromKeys();
      }

      if (key === ' ') {
        mvJump.set(1);
      }

      // Attack keys
      if (key === 'f' || key === 'e') {
        onAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (['q', 'tab'].includes(key)) {
        e.preventDefault();
        // Weapon wheel lock selection
        if (weaponWheelOpen) {
          if (wheelHoveredSector) {
            setCurrentWeapon(wheelHoveredSector);
            sound.playEquip();
          }
          setWeaponWheelOpen(false);
        }
      }

      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.current[key] = false;
        updateInputFromKeys();
      }

      if (key === ' ') {
        mvJump.set(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mvX, mvY, mvJump, weaponWheelOpen, wheelHoveredSector, onAttack, setCurrentWeapon, setWeaponWheelOpen, updateInputFromKeys]);

  // Joystick touch/mouse handler
  const handleJoystickMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickRef.current || !joystickActive.current) return;
    
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
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    let x = dx;
    let y = dy;

    if (dist > 1) {
      x = dx / dist;
      y = dy / dist;
    }
    
    mvX.set(x);
    mvY.set(y);
    setKbKnobX(x * 40);
    setKbKnobY(y * -40);
  }, [mvX, mvY]);

  const resetJoystick = useCallback(() => {
    joystickActive.current = false;
    mvX.set(0);
    mvY.set(0);
    setKbKnobX(0);
    setKbKnobY(0);
  }, [mvX, mvY]);

  // Radar Sector Hover Tracker
  const handleWheelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 30) {
      setWheelHoveredSector(null);
      return;
    }

    // Convert rads to degrees (0 right, 90 bottom, 180 left, 270 top)
    const angleDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

    let targetSector: 'slap' | 'knife' | 'handgun' = 'slap';
    // Slap: top (210 to 330)
    if (angleDeg >= 210 && angleDeg < 330) {
      targetSector = 'slap';
    } 
    // Knife: bottom-left (90 to 210)
    else if (angleDeg >= 90 && angleDeg < 210) {
      targetSector = 'knife';
    } 
    // Handgun: bottom-right (330 to 360, or 0 to 90)
    else {
      targetSector = 'handgun';
    }

    if (wheelHoveredSector !== targetSector) {
      setWheelHoveredSector(targetSector);
      sound.playTick();
    }
  };

  const handleMobileSectorSelect = (sector: 'slap' | 'knife' | 'handgun') => {
    setCurrentWeapon(sector);
    sound.playEquip();
    setWeaponWheelOpen(false);
  };

  return (
    <>
      {/* HUD Bar - Top Left */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
        pointerEvents: 'auto'
      }}>
        {/* Equipped weapon banner card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          width: '180px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc'
          }}>
            {currentWeapon === 'slap' && <HandWaving size={24} weight="bold" />}
            {currentWeapon === 'knife' && <Sword size={24} weight="bold" />}
            {currentWeapon === 'handgun' && <Crosshair size={24} weight="bold" />}
          </div>
          <div>
            <div style={{
              fontFamily: 'Bebas Neue',
              fontSize: '18px',
              letterSpacing: '1px',
              color: '#fff',
              lineHeight: 1
            }}>
              {currentWeapon.toUpperCase()}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '4px'
            }}>
              AMMO: {currentWeapon === 'handgun' ? '∞' : 'N/A'}
            </div>
          </div>
        </div>


      </div>

      {/* Touch-based Mobile Gun selector (Hold / Tap Weapon trigger) - Top Right */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        zIndex: 10,
        pointerEvents: 'auto'
      }}>
        <div 
          onMouseDown={() => {
            setWeaponWheelOpen(true);
            sound.playTick();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setWeaponWheelOpen(true);
            sound.playTick();
          }}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            padding: '14px',
            borderRadius: '50%',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Bebas Neue',
            width: '60px',
            height: '60px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          WHEEL
        </div>
      </div>

      {/* Radial GTA 5 Selection Overlay */}
      <AnimatePresence>
        {weaponWheelOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            {/* Title HUD display */}
            <div style={{
              fontFamily: 'Bebas Neue',
              fontSize: '44px',
              letterSpacing: '3px',
              color: '#fff',
              marginBottom: '20px',
              textShadow: '0 0 20px rgba(255,255,255,0.4)',
              textAlign: 'center'
            }}>
              WEAPON SELECTION WHEEL
            </div>

            {/* Inner Circular dial */}
            <div 
              onMouseMove={handleWheelMouseMove}
              style={{
                position: 'relative',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '2.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'crosshair',
                boxShadow: '0 0 60px rgba(0,0,0,0.5)'
              }}
            >
              {/* Radial Center Selector Core */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
                zIndex: 10,
                boxShadow: '0 0 20px rgba(0,0,0,0.8)'
              }}>
                {wheelHoveredSector ? wheelHoveredSector.toUpperCase() : 'SELECT'}
              </div>

              {/* Wedge Sector 1: SLAP (Top) */}
              <div 
                onClick={() => handleMobileSectorSelect('slap')}
                style={{
                  position: 'absolute',
                  top: '18px',
                  width: '120px',
                  height: '110px',
                  borderRadius: '16px',
                  background: wheelHoveredSector === 'slap' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: wheelHoveredSector === 'slap' ? '2.5px solid rgba(255,255,255,0.85)' : '1.5px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: wheelHoveredSector === 'slap' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  transform: wheelHoveredSector === 'slap' ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <HandWaving size={36} weight={wheelHoveredSector === 'slap' ? 'fill' : 'bold'} />
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '0.5px' }}>Slap</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', opacity: 0.6 }}>COMEDY MELEE</span>
              </div>

              {/* Wedge Sector 2: KNIFE (Bottom-Left) */}
              <div 
                onClick={() => handleMobileSectorSelect('knife')}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '16px',
                  width: '120px',
                  height: '110px',
                  borderRadius: '16px',
                  background: wheelHoveredSector === 'knife' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: wheelHoveredSector === 'knife' ? '2.5px solid rgba(255,255,255,0.85)' : '1.5px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: wheelHoveredSector === 'knife' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  transform: wheelHoveredSector === 'knife' ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Sword size={36} weight={wheelHoveredSector === 'knife' ? 'fill' : 'bold'} />
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '0.5px' }}>Knife</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', opacity: 0.6 }}>BIG METALLIC</span>
              </div>

              {/* Wedge Sector 3: HANDGUN (Bottom-Right) */}
              <div 
                onClick={() => handleMobileSectorSelect('handgun')}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '16px',
                  width: '120px',
                  height: '110px',
                  borderRadius: '16px',
                  background: wheelHoveredSector === 'handgun' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: wheelHoveredSector === 'handgun' ? '2.5px solid rgba(255,255,255,0.85)' : '1.5px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: wheelHoveredSector === 'handgun' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  transform: wheelHoveredSector === 'handgun' ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Crosshair size={36} weight={wheelHoveredSector === 'handgun' ? 'fill' : 'bold'} />
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '0.5px' }}>Handgun</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', opacity: 0.6 }}>UNLIMITED SLUGS</span>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              fontFamily: 'Inter',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              SWIPE / HOVER CURSOR ON SLOTS TO PREVIEW<br />
              <strong style={{ color: '#ffffff', fontFamily: 'JetBrains Mono' }}>
                RELEASE 'Q' / 'TAB' KEY OR TAP SELECT TO EQUIP
              </strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active attack controls (Combat keys overlay) */}
      <div style={{
        position: 'absolute',
        bottom: '150px',
        right: '40px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'auto'
      }}>
        {/* WEAPON ATTACK TRIGGER */}
        <button 
          onClick={onAttack}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.85)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.85)'; }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1px' }}>
            {currentWeapon === 'handgun' ? 'FIRE' : currentWeapon === 'knife' ? 'SLASH' : 'SLAP'}
          </span>
        </button>
      </div>

      {/* Virtual Joystick UI */}
      <div 
        ref={joystickRef}
        onMouseDown={(e) => { joystickActive.current = true; handleJoystickMove(e); }}
        onMouseMove={handleJoystickMove}
        onMouseUp={resetJoystick}
        onMouseLeave={resetJoystick}
        onTouchStart={(e) => { joystickActive.current = true; handleJoystickMove(e); }}
        onTouchMove={handleJoystickMove}
        onTouchEnd={resetJoystick}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          zIndex: 10,
          touchAction: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
          transform: `translate(${kbKnobX}px, ${kbKnobY}px)`,
          transition: joystickActive.current ? 'none' : 'transform 0.15s ease'
        }} />
      </div>

      {/* Jump Button UI */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        zIndex: 10
      }}>
        <button 
          onMouseDown={() => mvJump.set(1)}
          onMouseUp={() => mvJump.set(0)}
          onMouseLeave={() => mvJump.set(0)}
          onTouchStart={(e) => { e.preventDefault(); mvJump.set(1); }}
          onTouchEnd={() => mvJump.set(0)}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'all 0.2s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <CaretDoubleUp size={32} weight="bold" />
        </button>
      </div>
    </>
  );
});
