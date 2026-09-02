import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CAPTCHA_LENGTH = 6;
const COLOR_PALETTE = ['#22d3ee', '#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];

export default function CaptchaCanvas({ onCaptchaChange }) {
  const canvasRef = useRef(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Generate random string
  const generateRandomCode = useCallback(() => {
    let result = '';
    for (let i = 0; i < CAPTCHA_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
      result += CAPTCHA_CHARS[randomIndex];
    }
    return result;
  }, []);

  // Draw captcha onto canvas
  const drawCaptcha = useCallback((code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#06101d');
    bgGrad.addColorStop(0.5, '#0b1c30');
    bgGrad.addColorStop(1, '#050c17');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Security distortion lines (bezier curves)
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)] + '40';
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        width - Math.random() * 20,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Scattered noise dots
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)] + '70';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render characters
    const charSpacing = width / (code.length + 1);
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const charColor = COLOR_PALETTE[i % COLOR_PALETTE.length];

      ctx.save();
      const x = charSpacing * (i + 0.8) + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      // Shadow glow
      ctx.shadowColor = charColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = charColor;
      ctx.font = `bold ${Math.floor(Math.random() * 4 + 22)}px 'JetBrains Mono', 'Courier New', monospace`;

      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    setIsSpinning(true);
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    drawCaptcha(newCode);
    if (onCaptchaChange) {
      onCaptchaChange(newCode);
    }
    setTimeout(() => setIsSpinning(false), 500);
  }, [generateRandomCode, drawCaptcha, onCaptchaChange]);

  // Initial draw
  useEffect(() => {
    const initialCode = generateRandomCode();
    setCaptchaCode(initialCode);
    drawCaptcha(initialCode);
    if (onCaptchaChange) {
      onCaptchaChange(initialCode);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative rounded-lg overflow-hidden border border-vertex-border/80 shadow-inner bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={180}
          height={48}
          className="block cursor-pointer select-none"
          onClick={refreshCaptcha}
          title="Click to refresh security code"
        />
        <div className="absolute top-1 left-1.5 flex items-center gap-1 pointer-events-none opacity-40">
          <ShieldCheck size={10} className="text-vertex-cyan" />
          <span className="text-[8px] font-mono tracking-wider text-slate-400">SECURE-CODE</span>
        </div>
      </div>

      <button
        type="button"
        onClick={refreshCaptcha}
        title="Refresh CAPTCHA"
        className="h-12 w-12 flex items-center justify-center rounded-lg glass border border-vertex-border text-slate-300 hover:text-vertex-cyan hover:border-vertex-cyan/50 hover:bg-vertex-cyan/10 active:scale-95 transition-all group"
      >
        <RotateCw
          size={18}
          className={`transition-transform duration-500 text-slate-400 group-hover:text-vertex-cyan ${
            isSpinning ? 'rotate-180 animate-spin text-vertex-cyan' : ''
          }`}
        />
      </button>
    </div>
  );
}
