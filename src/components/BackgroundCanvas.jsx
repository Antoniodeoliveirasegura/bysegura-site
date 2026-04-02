import { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export function BackgroundCanvas() {
  const canvasRef = useRef(null);
  const { isDark, animationEnabled } = useTheme();
  const isDarkRef = useRef(isDark);
  const animRef = useRef(animationEnabled);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);
  useEffect(() => { animRef.current = animationEnabled; }, [animationEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [], clouds = [];
    let animId;
    const mouse = { x: -9999, y: -9999 };

    function onResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
        });
      }
    }

    function initClouds() {
      clouds = [];
      for (let i = 0; i < 50; i++) {
        clouds.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.1,
          size: 30 + Math.random() * 40,
        });
      }
    }

    // Track previous theme to detect changes inside the animation loop
    let prevIsDark = isDarkRef.current;

    function animate() {
      // Re-init particles whenever theme changes
      if (isDarkRef.current !== prevIsDark) {
        prevIsDark = isDarkRef.current;
        if (isDarkRef.current) initStars();
        else initClouds();
      }

      ctx.clearRect(0, 0, width, height);

      if (isDarkRef.current) {
        ctx.fillStyle = '#fff';
        stars.forEach(s => {
          s.x += s.vx; s.y += s.vy;
          if (s.x < 0 || s.x > width) s.vx *= -1;
          if (s.y < 0 || s.y > height) s.vy *= -1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        if (animRef.current && mouse.x > 0) {
          const nearest = stars
            .map(s => ({ obj: s, d: (s.x - mouse.x) ** 2 + (s.y - mouse.y) ** 2 }))
            .sort((a, b) => a.d - b.d).slice(0, 3).map(o => o.obj);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          nearest.forEach(s => {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
          });
        }
      } else {
        clouds.forEach(c => {
          c.x += c.vx; c.y += c.vy;
          if (c.x < -c.size) c.x = width + c.size;
          if (c.x > width + c.size) c.x = -c.size;
          if (c.y < -c.size) c.y = height + c.size;
          if (c.y > height + c.size) c.y = -c.size;
          ctx.fillStyle = 'rgba(200,210,220,0.7)';
          [{ dx: 0, dy: 0 }, { dx: -c.size * 0.4, dy: c.size * 0.1 }, { dx: c.size * 0.4, dy: c.size * 0.1 }]
            .forEach(o => {
              ctx.beginPath();
              ctx.arc(c.x + o.dx, c.y + o.dy, c.size, 0, Math.PI * 2);
              ctx.fill();
            });
        });
        if (animRef.current && mouse.x > 0) {
          const nearest = clouds
            .map(c => ({ obj: c, d: (c.x - mouse.x) ** 2 + (c.y - mouse.y) ** 2 }))
            .sort((a, b) => a.d - b.d).slice(0, 3).map(o => o.obj);
          ctx.strokeStyle = 'rgba(120,130,140,0.5)';
          nearest.forEach(c => {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            const dx = (c.x - mouse.x) / 4;
            const dy = (c.y - mouse.y) / 4;
            for (let j = 1; j <= 4; j++) {
              ctx.lineTo(mouse.x + dx * j + (Math.random() - 0.5) * 30,
                         mouse.y + dy * j + (Math.random() - 0.5) * 30);
            }
            ctx.stroke();
          });
        }
      }

      animId = requestAnimationFrame(animate);
    }

    const onMouseMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseOut = () => { mouse.x = mouse.y = -9999; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseout', onMouseOut);

    onResize();
    if (isDarkRef.current) initStars();
    else initClouds();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return <canvas ref={canvasRef} id="bgCanvas" />;
}
