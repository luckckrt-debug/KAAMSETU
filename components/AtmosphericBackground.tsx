'use client';

import React, { useEffect, useRef } from 'react';

export default function AtmosphericBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      vy: number;
      vx: number;
      phase: number;
    }

    const particleCount = width < 768 ? 16 : 28;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
        alpha: Math.random() * 0.35 + 0.15,
        vy: -(Math.random() * 0.35 + 0.15),
        vx: (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
        render(lastTime);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Draw subtle drifting particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.vy * (delta * 60);
        p.x += p.vx * (delta * 60) + Math.sin(p.phase) * 0.2;
        p.phase += 0.015;

        // Pulse alpha gently
        p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.1;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 131, 213, ${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(96, 181, 245, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none" aria-hidden="true">
      {/* Dynamic Ambient Glow Spheres (Light Sky Blue palette) */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#2583D5]/15 via-[#60B5F5]/12 to-transparent blur-[120px] animate-ambient-a"
      />
      <div 
        className="absolute top-[35%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#C5E5FF]/40 via-[#D9EEFF]/30 to-transparent blur-[140px] animate-ambient-b"
      />
      <div 
        className="absolute bottom-[-15%] right-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-[#2583D5]/12 via-[#EAF6FF]/60 to-transparent blur-[130px] animate-ambient-a"
      />

      {/* Subtle Flowing Wave SVG Layers */}
      <svg 
        className="absolute top-24 left-0 w-full h-[500px] opacity-[0.06] text-[#2583D5]" 
        viewBox="0 0 1440 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0,128L60,144C120,160,240,192,360,181.3C480,171,600,117,720,117.3C840,117,960,171,1080,186.7C1200,203,1320,181,1380,170.7L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" 
          fill="currentColor"
        />
      </svg>

      <svg 
        className="absolute bottom-40 right-0 w-full h-[600px] opacity-[0.05] text-[#19639E]" 
        viewBox="0 0 1440 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,218.7C1120,213,1280,171,1360,149.3L1440,128L1440,400L1360,400C1280,400,1120,400,960,400C800,400,640,400,480,400C320,400,160,400,80,400L0,400Z" 
          fill="currentColor"
        />
      </svg>

      {/* Lightweight Canvas Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
