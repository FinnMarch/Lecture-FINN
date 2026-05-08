import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function VisualLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const cursorSize = 8;
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const cursorX = mouseX;
  const cursorY = mouseY;
  const ringX = useSpring(mouseX, { damping: 30, stiffness: 150 });
  const ringY = useSpring(mouseY, { damping: 30, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const dots: { x: number; y: number; originX: number; originY: number }[] = [];
    const spacing = 40;
    const repelRadius = 150;
    const repelStrength = 0.5;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      dots.length = 0;

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({ x, y, originX: x, originY: y });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseX.get();
      const my = mouseY.get();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      dots.forEach(dot => {
        const dx = mx - dot.originX;
        const dy = my - dot.originY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repelRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (repelRadius - distance) / repelRadius;
          const targetX = dot.originX - Math.cos(angle) * force * repelRadius * repelStrength;
          const targetY = dot.originY - Math.sin(angle) * force * repelRadius * repelStrength;
          
          dot.x += (targetX - dot.x) * 0.1;
          dot.y += (targetY - dot.y) * 0.1;
        } else {
          dot.x += (dot.originX - dot.x) * 0.1;
          dot.y += (dot.originY - dot.y) * 0.1;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[-1] opacity-40"
      />
      
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-zinc-900 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-zinc-900/30 rounded-full pointer-events-none z-[9999]"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-zinc-900/10 rounded-full pointer-events-none z-[9998]"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          scale: 1.5
        }}
      />
    </>
  );
}
