import React, { useRef, useEffect, useCallback } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { CaretDoubleUp } from 'phosphor-react';

interface ControlsProps {
  mvX: MotionValue<number>;
  mvY: MotionValue<number>;
  mvJump: MotionValue<number>;
}

export const GameControls = React.memo(({ mvX, mvY, mvJump }: ControlsProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickActive = useRef(false);

  // Derived motion values for the joystick knob UI
  const knobX = useTransform(mvX, [-1, 1], [-40, 40]);
  const knobY = useTransform(mvY, [-1, 1], [40, -40]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w') mvY.set(1);
      if (key === 's') mvY.set(-1);
      if (key === 'a') mvX.set(-1);
      if (key === 'd') mvX.set(1);
      if (key === ' ') mvJump.set(1);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 's'].includes(key)) mvY.set(0);
      if (['a', 'd'].includes(key)) mvX.set(0);
      if (key === ' ') mvJump.set(0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mvX, mvY, mvJump]);

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
    
    // Clamp to -1, 1
    const x = Math.max(-1, Math.min(1, dx));
    const y = Math.max(-1, Math.min(1, dy));
    
    mvX.set(x);
    mvY.set(y);
  }, [mvX, mvY]);

  const resetJoystick = useCallback(() => {
    joystickActive.current = false;
    mvX.set(0);
    mvY.set(0);
  }, [mvX, mvY]);

  return (
    <>
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
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
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
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          boxShadow: '0 0 20px rgba(255,255,255,0.1)',
          x: knobX,
          y: knobY
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
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'all 0.2s ease'
          }}
        >
          <CaretDoubleUp size={32} weight="bold" />
        </button>
      </div>
    </>
  );
});
