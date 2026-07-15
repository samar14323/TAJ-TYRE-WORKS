"use client";

import React, { useRef, useEffect, useState } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function TyreCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [exploded, setExploded] = useState(false);
  const explodedRef = useRef(false);
  const explosionProgress = useRef(0);

  // Toggle explosion effect
  const toggleExplosion = () => {
    const next = !explodedRef.current;
    explodedRef.current = next;
    setExploded(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = 1;
    if (typeof window !== "undefined") {
      dpr = window.innerWidth < 768 ? 1 : Math.min(2, window.devicePixelRatio || 1);
    }
    
    let width = (canvas.width = (canvas.parentElement?.clientWidth || 600) * dpr);
    let height = (canvas.height = (canvas.parentElement?.clientHeight || 600) * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const nextDpr = window.innerWidth < 768 ? 1 : Math.min(2, window.devicePixelRatio || 1);
      width = canvas.width = rect.width * nextDpr;
      height = canvas.height = rect.height * nextDpr;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Normalize to -1 to 1
      mouseRef.current.targetX = (clientX / rect.width) * 2 - 1;
      mouseRef.current.targetY = (clientY / rect.height) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Mobile touch gestures support
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
        
        mouseRef.current.targetX = (touchStartX / rect.width) * 2 - 1;
        mouseRef.current.targetY = (touchStartY / rect.height) * 2 - 1;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Prevent background scrolling while dragging the tyre
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        mouseRef.current.targetX = (touchX / rect.width) * 2 - 1;
        mouseRef.current.targetY = (touchY / rect.height) * 2 - 1;
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    // 3D Geometry generation: A Tyre (Torus-like cylinder)
    interface Vertex {
      x: number;
      y: number;
      z: number;
      nx: number; // Normal x
      ny: number; // Normal y
      nz: number; // Normal z
      type: "tread" | "sidewall" | "rim" | "spoke";
      groupIndex: number; // For explosion direction
    }

    const vertices: Vertex[] = [];
    const treadSegments = 40;
    const widthSegments = 8;
    const tyreWidth = 60;
    const outerRadius = 120;
    const innerRadius = 80;
    const rimRadius = 78;
    const hubRadius = 25;

    // 1. Generate Tread & Sidewall vertices
    for (let i = 0; i < treadSegments; i++) {
      const angle = (i / treadSegments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const groupIndex = Math.floor((i / treadSegments) * 8);

      for (let j = 0; j < widthSegments; j++) {
        const wOffset = -tyreWidth / 2 + (j / (widthSegments - 1)) * tyreWidth;
        const profileFactor = Math.sin((j / (widthSegments - 1)) * Math.PI);
        const currentRadius = innerRadius + (outerRadius - innerRadius) * profileFactor;

        const nx = cosA * profileFactor;
        const ny = sinA * profileFactor;
        const nz = wOffset / tyreWidth;

        vertices.push({
          x: cosA * currentRadius,
          y: sinA * currentRadius,
          z: wOffset,
          nx,
          ny,
          nz,
          type: j === 0 || j === widthSegments - 1 ? "sidewall" : "tread",
          groupIndex,
        });
      }
    }

    // 2. Generate Rim vertices
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const groupIndex = Math.floor((i / 24) * 8);

      // Rim front and back rings
      vertices.push({
        x: cosA * rimRadius,
        y: sinA * rimRadius,
        z: -tyreWidth / 2 + 5,
        nx: cosA * 0.2,
        ny: sinA * 0.2,
        nz: -0.9,
        type: "rim",
        groupIndex,
      });
      vertices.push({
        x: cosA * rimRadius,
        y: sinA * rimRadius,
        z: tyreWidth / 2 - 5,
        nx: cosA * 0.2,
        ny: sinA * 0.2,
        nz: 0.9,
        type: "rim",
        groupIndex,
      });

      // Hub rings
      vertices.push({
        x: cosA * hubRadius,
        y: sinA * hubRadius,
        z: -10,
        nx: cosA,
        ny: sinA,
        nz: -0.5,
        type: "spoke",
        groupIndex,
      });
      vertices.push({
        x: cosA * hubRadius,
        y: sinA * hubRadius,
        z: 10,
        nx: cosA,
        ny: sinA,
        nz: 0.5,
        type: "spoke",
        groupIndex,
      });
    }

    // Particles system
    const smokeParticles: Particle[] = [];
    const dustParticles: Particle[] = [];
    
    // Initialize background dust particles
    for (let i = 0; i < 80; i++) {
      dustParticles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.1,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.4 ? "#f59e0b" : "#4b5563",
        life: 0,
        maxLife: 1,
      });
    }

    let rotationY = 0;
    const rotationX = 0.3;
    const rotationZ = 0;
    const focalLength = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      // Protect mouse coordinates from NaN or Infinity
      if (!Number.isFinite(mouse.targetX)) mouse.targetX = 0;
      if (!Number.isFinite(mouse.targetY)) mouse.targetY = 0;
      
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      if (!Number.isFinite(mouse.x)) mouse.x = 0;
      if (!Number.isFinite(mouse.y)) mouse.y = 0;

      if (!explodedRef.current) {
        rotationY += 0.012;
      }
      
      const currentRotX = rotationX + mouse.y * 0.4;
      const currentRotY = rotationY + mouse.x * 0.6;
      const currentRotZ = rotationZ - mouse.x * 0.1;

      if (explodedRef.current) {
        explosionProgress.current += (1 - explosionProgress.current) * 0.06;
      } else {
        explosionProgress.current += (0 - explosionProgress.current) * 0.08;
      }

      const expVal = explosionProgress.current;

      const lightSource = {
        x: mouse.x * 300,
        y: -200 + mouse.y * 200,
        z: -300,
      };

      // Safe Radial Gradient Helper
      const createSafeRadialGradient = (
        x1: number, y1: number, r1: number,
        x2: number, y2: number, r2: number
      ) => {
        const sx1 = Number.isFinite(x1) ? x1 : width / 2;
        const sy1 = Number.isFinite(y1) ? y1 : height / 2;
        const sr1 = Number.isFinite(r1) && r1 >= 0 ? r1 : 0;
        const sx2 = Number.isFinite(x2) ? x2 : width / 2;
        const sy2 = Number.isFinite(y2) ? y2 : height / 2;
        const sr2 = Number.isFinite(r2) && r2 >= 0 ? r2 : 1;
        
        const finalR1 = Math.max(0, sr1);
        const finalR2 = Math.max(finalR1 + 0.1, sr2);

        return ctx.createRadialGradient(sx1, sy1, finalR1, sx2, sy2, finalR2);
      };

      const glowRadius = Math.min(width, height) / 1.2;
      const bgGlow = createSafeRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Number.isFinite(glowRadius) && glowRadius > 50 ? glowRadius : 300
      );
      bgGlow.addColorStop(0, "rgba(24, 24, 37, 0.4)");
      bgGlow.addColorStop(0.5, "rgba(10, 10, 15, 0.2)");
      bgGlow.addColorStop(1, "rgba(5, 5, 7, 0.95)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      if (Math.random() < 0.35) {
        smokeParticles.push({
          x: (Math.random() - 0.5) * 60,
          y: 120 + Math.random() * 20,
          z: (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 1.5 + mouse.x * 2,
          vy: -Math.random() * 2 - 1.2,
          vz: (Math.random() - 0.5) * 1.2,
          size: Math.random() * 15 + 10,
          alpha: Math.random() * 0.35 + 0.1,
          color: Math.random() > 0.7 ? "245, 158, 11" : "30, 30, 45",
          life: 0,
          maxLife: Math.random() * 60 + 50,
        });
      }

      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.size += 0.3;
        const lifeRatio = p.life / p.maxLife;
        p.alpha = (1 - lifeRatio) * 0.4;

        if (p.life >= p.maxLife) {
          smokeParticles.splice(i, 1);
          continue;
        }

        const denom = p.z + 400;
        const scale = focalLength / (Number.isFinite(denom) && Math.abs(denom) > 0.1 ? denom : 400);
        const safeScale = Number.isFinite(scale) ? scale : 1.0;
        const px = p.x * safeScale + width / 2;
        const py = p.y * safeScale + height / 2;

        if (Number.isFinite(px) && Number.isFinite(py) && px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          const radG = createSafeRadialGradient(px, py, 0, px, py, p.size);
          radG.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
          radG.addColorStop(0.6, `rgba(${p.color}, ${p.alpha * 0.3})`);
          radG.addColorStop(1, `rgba(${p.color}, 0)`);
          ctx.fillStyle = radG;
          
          const safeRad = Number.isFinite(p.size) && p.size > 0 ? p.size : 1;
          ctx.arc(px, py, safeRad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];
        p.y += p.vy;
        p.x += p.vx + mouse.x * 0.3;
        
        if (p.y < -height / 2) {
          p.y = height / 2;
          p.x = (Math.random() - 0.5) * 800;
        }

        const denom = p.z + 400;
        const scale = focalLength / (Number.isFinite(denom) && Math.abs(denom) > 0.1 ? denom : 400);
        const safeScale = Number.isFinite(scale) ? scale : 1.0;
        const px = p.x * safeScale + width / 2;
        const py = p.y * safeScale + height / 2;
        const dustSize = p.size * safeScale * 0.8;

        if (Number.isFinite(px) && Number.isFinite(py) && px >= 0 && px <= width && py >= 0 && py <= height && Number.isFinite(dustSize) && dustSize > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(px, py, dustSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      interface ProjectedVertex {
        x2d: number;
        y2d: number;
        z3d: number;
        brightness: number;
        type: string;
        color: string;
      }

      const projected: ProjectedVertex[] = [];

      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];

        const expAngle = (v.groupIndex / 8) * Math.PI * 2;
        const expX = Math.cos(expAngle) * 80 * expVal;
        const expY = Math.sin(expAngle) * 80 * expVal;
        const expZ = (v.type === "sidewall" ? (v.z > 0 ? 40 : -40) : 0) * expVal;

        const x = v.x + expX;
        const y = v.y + expY;
        const z = v.z + expZ;

        const x1 = x * Math.cos(currentRotY) + z * Math.sin(currentRotY);
        const z1 = -x * Math.sin(currentRotY) + z * Math.cos(currentRotY);

        const y2 = y * Math.cos(currentRotX) - z1 * Math.sin(currentRotX);
        const z2 = y * Math.sin(currentRotX) + z1 * Math.cos(currentRotX);

        const x3 = x1 * Math.cos(currentRotZ) - y2 * Math.sin(currentRotZ);
        const y3 = x1 * Math.sin(currentRotZ) + y2 * Math.cos(currentRotZ);

        const nx1 = v.nx * Math.cos(currentRotY) + v.nz * Math.sin(currentRotY);
        const nz1 = -v.nx * Math.sin(currentRotY) + v.nz * Math.cos(currentRotY);
        const ny2 = v.ny * Math.cos(currentRotX) - nz1 * Math.sin(currentRotX);
        const nz2 = v.ny * Math.sin(currentRotX) + nz1 * Math.cos(currentRotX);
        const nx3 = nx1 * Math.cos(currentRotZ) - ny2 * Math.sin(currentRotZ);
        const ny3 = nx1 * Math.sin(currentRotZ) + ny2 * Math.cos(currentRotZ);

        const lx = lightSource.x - x3;
        const ly = lightSource.y - y3;
        const lz = lightSource.z - z2;
        const lLength = Math.sqrt(lx * lx + ly * ly + lz * lz);
        const lnx = lx / lLength;
        const lny = ly / lLength;
        const lnz = lz / lLength;

        let dot = nx3 * lnx + ny3 * lny + nz2 * lnz;
        if (dot < 0) dot = 0.05;

        const brightness = Math.min(1.0, dot * 1.2);

        const cameraDistance = 350;
        const scale = focalLength / (z2 + cameraDistance);
        
        const cameraOffsetX = mouse.x * 20;
        const cameraOffsetY = mouse.y * 15;

        const x2d = x3 * scale + width / 2 + cameraOffsetX;
        const y2d = y3 * scale + height / 2 + cameraOffsetY;

        let color = "#1f2937";
        if (v.type === "tread" || v.type === "sidewall") {
          const colorValue = Math.floor(25 + brightness * 40);
          color = `rgb(${colorValue}, ${colorValue}, ${Math.floor(colorValue * 1.1)})`;
        } else if (v.type === "rim") {
          const r = Math.floor(180 + brightness * 75);
          const g = Math.floor(120 + brightness * 50);
          const b = Math.floor(20 + brightness * 10);
          color = `rgb(${r}, ${g}, ${b})`;
        } else if (v.type === "spoke") {
          const c = Math.floor(110 + brightness * 80);
          color = `rgb(${c}, ${Math.floor(c * 0.9)}, ${Math.floor(c * 0.6)})`;
        }

        projected.push({
          x2d,
          y2d,
          z3d: z2,
          brightness,
          type: v.type,
          color,
        });
      }

      ctx.lineWidth = 1.2;

      for (let i = 0; i < treadSegments; i++) {
        const nextI = (i + 1) % treadSegments;
        const isExplodingTreadLine = expVal > 0.05;

        const groupI = Math.floor((i / treadSegments) * 8);
        const nextGroupI = Math.floor((nextI / treadSegments) * 8);
        const connectsTreads = !isExplodingTreadLine || groupI === nextGroupI;

        for (let j = 0; j < widthSegments; j++) {
          const idx = i * widthSegments + j;
          const nextIdx = nextI * widthSegments + j;

          const p1 = projected[idx];
          const p2 = projected[nextIdx];

          if (p1 && p2 && connectsTreads && p1.z3d < 200 && p2.z3d < 200) {
            ctx.beginPath();
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = p1.z3d > 100 ? 0.25 : 0.85;
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.stroke();
          }

          if (j < widthSegments - 1) {
            const nextWidthIdx = idx + 1;
            const p3 = projected[nextWidthIdx];
            if (p1 && p3 && p1.z3d < 200 && p3.z3d < 200) {
              ctx.beginPath();
              if (j === 0 || j === widthSegments - 2) {
                ctx.strokeStyle = `rgba(245, 158, 11, ${p1.z3d > 100 ? 0.3 : 0.8})`;
                ctx.lineWidth = 1.5;
              } else {
                ctx.strokeStyle = p1.color;
                ctx.lineWidth = 1.0;
              }
              ctx.moveTo(p1.x2d, p1.y2d);
              ctx.lineTo(p3.x2d, p3.y2d);
              ctx.stroke();
              ctx.lineWidth = 1.2;
            }
          }
        }
      }

      ctx.globalAlpha = 1.0;

      const offsetRim = treadSegments * widthSegments;
      const rimSegments = 24;
      for (let i = 0; i < rimSegments; i++) {
        const nextI = (i + 1) % rimSegments;
        const groupI = Math.floor((i / rimSegments) * 8);
        const nextGroupI = Math.floor((nextI / rimSegments) * 8);
        const connectsRim = expVal < 0.05 || groupI === nextGroupI;

        const r1 = offsetRim + i * 4;
        const r2 = offsetRim + i * 4 + 1;
        const s1 = offsetRim + i * 4 + 2;
        const s2 = offsetRim + i * 4 + 3;

        const nr1 = offsetRim + nextI * 4;
        const nr2 = offsetRim + nextI * 4 + 1;
        const ns1 = offsetRim + nextI * 4 + 2;
        const ns2 = offsetRim + nextI * 4 + 3;

        const pr1 = projected[r1];
        const pr2 = projected[r2];
        const ps1 = projected[s1];
        const ps2 = projected[s2];

        const pnr1 = projected[nr1];
        const pnr2 = projected[nr2];
        const pns1 = projected[ns1];
        const pns2 = projected[ns2];

        ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
        
        if (connectsRim) {
          if (pr1 && pnr1) {
            ctx.beginPath();
            ctx.strokeStyle = pr1.color;
            ctx.moveTo(pr1.x2d, pr1.y2d);
            ctx.lineTo(pnr1.x2d, pnr1.y2d);
            ctx.stroke();
          }
          if (pr2 && pnr2) {
            ctx.beginPath();
            ctx.strokeStyle = pr2.color;
            ctx.moveTo(pr2.x2d, pr2.y2d);
            ctx.lineTo(pnr2.x2d, pnr2.y2d);
            ctx.stroke();
          }
          if (ps1 && pns1) {
            ctx.beginPath();
            ctx.strokeStyle = ps1.color;
            ctx.moveTo(ps1.x2d, ps1.y2d);
            ctx.lineTo(pns1.x2d, pns1.y2d);
            ctx.stroke();
          }
        }

        if (pr1 && ps1) {
          ctx.beginPath();
          ctx.strokeStyle = pr1.color;
          ctx.moveTo(pr1.x2d, pr1.y2d);
          ctx.lineTo(ps1.x2d, ps1.y2d);
          ctx.stroke();
        }
        if (pr2 && ps2) {
          ctx.beginPath();
          ctx.strokeStyle = pr2.color;
          ctx.moveTo(pr2.x2d, pr2.y2d);
          ctx.lineTo(ps2.x2d, ps2.y2d);
          ctx.stroke();
        }
      }

      if (expVal < 0.8) {
        ctx.beginPath();
        const centerScale = focalLength / (350);
        const cx = width / 2 + mouse.x * 20;
        const cy = height / 2 + mouse.y * 15;
        
        const safeCx = Number.isFinite(cx) ? cx : width / 2;
        const safeCy = Number.isFinite(cy) ? cy : height / 2;
        const logoRadius = 15 * centerScale;
        const safeLogoRadius = Number.isFinite(logoRadius) && logoRadius > 0 ? logoRadius : 15;

        const gradLogo = createSafeRadialGradient(safeCx, safeCy, 0, safeCx, safeCy, safeLogoRadius);
        gradLogo.addColorStop(0, "rgba(245, 158, 11, 0.95)");
        gradLogo.addColorStop(0.4, "rgba(217, 119, 6, 0.8)");
        gradLogo.addColorStop(1, "rgba(5, 5, 7, 0)");
        
        ctx.fillStyle = gradLogo;
        ctx.arc(safeCx, safeCy, safeLogoRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px Geist Sans, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("TAJ", cx, cy);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "11px Geist Mono, Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        explodedRef.current ? "[ CLICK TYRE TO ASSEMBLE ]" : "[ CLICK TYRE TO EXPLODE ]",
        width / 2,
        height - 35
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      
      const dx = cx - width / 2;
      const dy = cy - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        toggleExplosion();
      }
    };
    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center select-none overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_65%)] animate-pulse-slow"></div>
      <div className="absolute w-[320px] h-[320px] border border-amber-500/10 rounded-full pointer-events-none scale-100 opacity-60 animate-pulse-slow"></div>
      <div className="absolute w-[240px] h-[240px] border border-amber-500/5 rounded-full pointer-events-none scale-95 opacity-40"></div>

      <canvas
        ref={canvasRef}
        className="relative z-10 cursor-pointer block drop-shadow-[0_0_35px_rgba(245,158,11,0.15)]"
        title="Click to explode/assemble tyre"
      />
    </div>
  );
}
