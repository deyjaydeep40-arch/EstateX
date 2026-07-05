/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  originalRadius: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Sync dark mode updates
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    const maxPoints = 42;
    const maxDistance = 140;
    
    // Mouse coords
    let mouse = { x: -1000, y: -1000, active: false };

    // Resize handling using standard high-DPI scaling
    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Re-populate points relative to the viewport size if empty
      if (points.length === 0) {
        points = [];
        for (let i = 0; i < maxPoints; i++) {
          points.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 2 + 1.5,
            originalRadius: Math.random() * 2 + 1.5,
          });
        }
      } else {
        // Adjust points to fit inside resized boundary gracefully
        points.forEach(p => {
          if (p.x > rect.width) p.x = Math.random() * rect.width;
          if (p.y > rect.height) p.y = Math.random() * rect.height;
        });
      }
    };

    // Use ResizeObserver for parent container as recommended in guidelines
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const animate = () => {
      const rect = containerRef.current?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Color scheme based on dark/light theme
      // Light mode: clean slate/indigo colors
      // Dark mode: cool neon slate/indigo translucent lights
      const nodeColor = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.25)';
      const lineColor = isDark ? 'rgba(99, 102, 241, ' : 'rgba(79, 70, 229, ';
      const highlightNodeColor = isDark ? 'rgba(16, 185, 129, 0.6)' : 'rgba(79, 70, 229, 0.5)';

      // Update & Draw Points
      points.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > rect.width) p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;

        // Mouse hover interaction: expand points slightly when close to mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            // Soft pull effect
            p.x += dx * 0.015;
            p.y += dy * 0.015;
            p.radius = Math.min(p.originalRadius * 1.8, p.radius + 0.1);
          } else {
            p.radius = Math.max(p.originalRadius, p.radius - 0.1);
          }
        } else {
          p.radius = Math.max(p.originalRadius, p.radius - 0.1);
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = mouse.active && Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2) < 120 
          ? highlightNodeColor 
          : nodeColor;
        ctx.fill();
      });

      // Draw Connection Lines (Mesh)
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Line opacity based on proximity
            const alpha = ((1 - dist / maxDistance) * 0.08).toFixed(3);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDark]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden -z-20 transition-colors duration-500 bg-neutral-50/10 dark:bg-neutral-950/5"
    >
      {/* Delicate Architectural Blueprint Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Slow Moving Ambient Radial Light Gradients */}
      <div className="absolute top-[10%] left-[5%] w-[60vw] h-[60vw] sm:w-[40vw] sm:h-[40vw] rounded-full bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04] blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[15%] right-[5%] w-[50vw] h-[50vw] sm:w-[35vw] sm:h-[35vw] rounded-full bg-violet-500/[0.02] dark:bg-violet-500/[0.03] blur-[100px] animate-pulse-slow-delay pointer-events-none" />
      
      {/* The interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
