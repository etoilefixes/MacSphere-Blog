'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start off-screen
  const [isClicked, setIsClicked] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [mounted, setMounted] = useState(false); // New state for ensuring client-side rendering
  const requestRef = useRef<number>();

  useEffect(() => {
    setMounted(true); // Component has mounted on the client

    const updateMouseState = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button, [role="link"], [role="button"]'))) {
        setIsHoveringInteractive(true);
      } else {
        setIsHoveringInteractive(false);
      }
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    // Optimized mouse move using requestAnimationFrame
    const onMouseMove = (e: MouseEvent) => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      requestRef.current = requestAnimationFrame(() => {
        updateMouseState(e);
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Hide cursor when mouse leaves the window
    const handleMouseLeave = () => {
      setPosition({ x: -100, y: -100 }); // Move off-screen
    };
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseMove); // Re-appear on mouse enter

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  if (!mounted) {
    return null; // Render nothing on the server or before client-side mount
  }

  // Determine cursor visibility (don't render if position is initial off-screen for the very first render)
  const isVisible = position.x !== -100 || position.y !== -100;


  return (
    <div
      className={`${styles.customCursor} ${isClicked ? styles.clicked : ''} ${isHoveringInteractive ? styles.interactive : ''} ${isVisible ? styles.visible : styles.hidden}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className={styles.cursorDot}></div>
    </div>
  );
};

export default CustomCursor;