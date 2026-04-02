const body = document.body;
const touchBar = document.querySelector(".touch-bar");
const toggleBtn = document.getElementById("toggle-theme");
const toggleIcon = toggleBtn.querySelector("i");
const contactSection = document.getElementById("contactSection");
const toggleAnimBtn = document.getElementById("toggle-animation");

// Animation toggle state - starts as OFF
let animationEnabled = false;

// —————— Load saved prefs ——————
document.addEventListener("DOMContentLoaded", () => {
  // Theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme !== null) {
    setTheme(savedTheme === "dark");
  } else {
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  // Animation - Fixed: properly handle null/undefined values
  const savedAnimation = localStorage.getItem("animationEnabled");
  animationEnabled = savedAnimation === "true"; // Will be false if null/undefined
  
  if (animationEnabled) {
    toggleAnimBtn.classList.add("on");
    toggleAnimBtn.classList.remove("off");
    toggleAnimBtn.querySelector("i").classList.replace("fa-mouse-pointer","fa-magic");
  } else {
    toggleAnimBtn.classList.add("off");
    toggleAnimBtn.classList.remove("on");
    toggleAnimBtn.querySelector("i").classList.replace("fa-magic", "fa-mouse-pointer");
  }
});

const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function setTheme(dark) {
    if (dark) {
        body.classList.remove("light");
        body.classList.add("dark");
        touchBar.classList.remove("light");
        touchBar.classList.add("dark");
        toggleIcon.classList.remove("fa-moon");
        toggleIcon.classList.add("fa-sun");
    } else {
        body.classList.remove("dark");
        body.classList.add("light");
        touchBar.classList.remove("dark");
        touchBar.classList.add("light");
        toggleIcon.classList.remove("fa-sun");
        toggleIcon.classList.add("fa-moon");
    }
    
    // Update particle mode when theme changes
    setMode();
    
    // Save theme to localStorage
    localStorage.setItem("theme", dark ? "dark" : "light");
}

// Listen for system theme changes - Fixed: save preference properly
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    setTheme(e.matches);
});

// Grab the canvas and context
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width, height;

// Resize to fill viewport
function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', onResize);
onResize();

// Track mouse position globally
const mouse = { x: -9999, y: -9999 };
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = mouse.y = -9999;
});

// Particle containers
let stars = [];
let clouds = [];

// Initialize stars (dark mode)
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1
        });
    }
}

// Initialize clouds (light mode)
function initClouds() {
    clouds = [];
    for (let i = 0; i < 50; i++) {
        clouds.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.1,
            size: 30 + Math.random() * 40
        });
    }
}

// Main render loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    if (document.body.classList.contains('dark')) {
        // DARK MODE: starfield + optional lines to cursor
        ctx.fillStyle = '#fff';
        stars.forEach(s => {
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0 || s.x > width) s.vx *= -1;
            if (s.y < 0 || s.y > height) s.vy *= -1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Only draw cursor lines if animation is enabled
        if (animationEnabled && mouse.x > 0) {
            const nearestStars = stars
                .map(s => ({ obj: s, d: (s.x - mouse.x) ** 2 + (s.y - mouse.y) ** 2 }))
                .sort((a, b) => a.d - b.d)
                .slice(0, 3)
                .map(o => o.obj);

            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            nearestStars.forEach(s => {
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(s.x, s.y);
                ctx.stroke();
            });
        }

    } else {
        // LIGHT MODE: fluffy grey clouds + optional lightning to cursor
        clouds.forEach(c => {
            c.x += c.vx; c.y += c.vy;
            if (c.x < -c.size) c.x = width + c.size;
            if (c.x > width + c.size) c.x = -c.size;
            if (c.y < -c.size) c.y = height + c.size;
            if (c.y > height + c.size) c.y = -c.size;

            ctx.fillStyle = 'rgba(200,210,220,0.7)';
            const offsets = [
                { dx: 0, dy: 0 },
                { dx: -c.size * 0.4, dy: c.size * 0.1 },
                { dx: c.size * 0.4, dy: c.size * 0.1 }
            ];
            offsets.forEach(o => {
                ctx.beginPath();
                ctx.arc(c.x + o.dx, c.y + o.dy, c.size, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Only draw cursor lightning if animation is enabled
        if (animationEnabled && mouse.x > 0) {
            const nearestClouds = clouds
                .map(c => ({ obj: c, d: (c.x - mouse.x) ** 2 + (c.y - mouse.y) ** 2 }))
                .sort((a, b) => a.d - b.d)
                .slice(0, 3)
                .map(o => o.obj);

            ctx.strokeStyle = 'rgba(120,130,140,0.5)';
            nearestClouds.forEach(c => {
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                const dx = (c.x - mouse.x) / 4;
                const dy = (c.y - mouse.y) / 4;
                for (let j = 1; j <= 4; j++) {
                    const nx = mouse.x + dx * j + (Math.random() - 0.5) * 30;
                    const ny = mouse.y + dy * j + (Math.random() - 0.5) * 30;
                    ctx.lineTo(nx, ny);
                }
                ctx.stroke();
            });
        }
    }

    requestAnimationFrame(animate); 
}

// Update touch-bar class + particle sets when theme changes
function setMode() {
    const touchBar = document.querySelector('.touch-bar');
    if (document.body.classList.contains('dark')) {
        initStars();
        touchBar.classList.add('dark');
        touchBar.classList.remove('light');
    } else {
        initClouds();
        touchBar.classList.add('light');
        touchBar.classList.remove('dark');
    }
}

// Hook up theme toggle button - Fixed: use setTheme function consistently
toggleBtn.addEventListener("click", () => {
  const nowDark = body.classList.contains("dark");
  setTheme(!nowDark);
});

// Hook up cursor animation toggle button - Fixed: save as string
toggleAnimBtn.addEventListener("click", () => {
  animationEnabled = !animationEnabled;

  if (animationEnabled) {
    toggleAnimBtn.classList.add("on");
    toggleAnimBtn.classList.remove("off");
    toggleAnimBtn.querySelector("i")
      .classList.replace("fa-mouse-pointer", "fa-magic");
  } else {
    toggleAnimBtn.classList.add("off");
    toggleAnimBtn.classList.remove("on");
    toggleAnimBtn.querySelector("i")
      .classList.replace("fa-magic", "fa-mouse-pointer");
  }

  // Fixed: save as string to localStorage
  localStorage.setItem("animationEnabled", animationEnabled.toString());
});

async function checkTwitchStatus() {
    try {
        const response = await fetch('https://api.bysegura.com/api/twitch-status');
        const data = await response.json();

        const twitchButton = document.querySelector('.touch-bar button[title="Twitch"]');
        if (data.isLive) {
            twitchButton.style.display = 'block';
            twitchButton.classList.add('live');
        } else {
            twitchButton.style.display = 'none';
            twitchButton.classList.remove('live');
        }
    } catch (error) {
        console.error('Error checking Twitch status:', error);
        // Hide button on error
        const twitchButton = document.querySelector('.touch-bar button[title="Twitch"]');
        twitchButton.style.display = 'none';
    }
}

// Initial mode setup
if (!document.body.classList.contains('light') && !document.body.classList.contains('dark')) {
    document.body.classList.add('light');
}
setMode();
animate();

// Check Twitch status on page load and then every 5 minutes
checkTwitchStatus();
setInterval(checkTwitchStatus, 5 * 60 * 1000); // Check every 5 minutes

// Touch bar button handlers
const touchBarButtons = document.querySelectorAll('.touch-bar button');

touchBarButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const title = button.getAttribute('title');

        switch (title) {
            case 'Home':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'Ideas':
                window.location.href = '/projects';
                break;
            case 'Music':
                window.open('https://open.spotify.com/user/960cigs19p1bbo35a35wiiu4x?si=02f9d763ab844093', '_blank');
                break;
            case 'GitHub':
                window.open('https://github.com/antoniodeoliveirasegura', '_blank');
                break;
            case 'Twitch':
                window.open('https://www.twitch.tv/technoant', '_blank');
                break;
            case 'Contact':
                contactSection.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'Resume':
                window.location.href = 'resume.pdf';
                break;
            case 'Toggle Cursor Animation':
                break;
        }
    });
});

