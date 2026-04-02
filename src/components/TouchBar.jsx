import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function TouchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const { isDark, animationEnabled, toggleTheme, toggleAnimation } = useTheme();
  const [isLive, setIsLive] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    async function checkTwitch() {
      try {
        const res = await fetch('https://api.bysegura.com/api/twitch-status');
        const { isLive } = await res.json();
        setIsLive(isLive);
      } catch {
        setIsLive(false);
      }
    }
    checkTwitch();
    const interval = setInterval(checkTwitch, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  function handleHome() {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  }

  function handleIdeas() {
    if (isHome) {
      navigate('/projects');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleContact() {
    if (isHome) {
      document.getElementById('contactSection')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/?contact=1');
    }
  }

  return (
    <div className={`touch-bar ${isDark ? 'dark' : 'light'}`}>
      <button title="Home" onClick={handleHome}>
        <i className="fas fa-home"></i>
      </button>
      <button title={isHome ? 'Ideas' : 'Projects'} onClick={handleIdeas}>
        <i className={`fas ${isHome ? 'fa-lightbulb' : 'fa-folder-open'}`}></i>
      </button>
      <button title="Music" onClick={() => window.open('https://open.spotify.com/user/960cigs19p1bbo35a35wiiu4x?si=02f9d763ab844093', '_blank')}>
        <i className="fas fa-headphones"></i>
      </button>
      <button title="GitHub" onClick={() => window.open('https://github.com/antoniodeoliveirasegura', '_blank')}>
        <i className="fab fa-github"></i>
      </button>
      <button title="Contact" onClick={handleContact}>
        <i className="fas fa-envelope"></i>
      </button>
      <button title="Resume" onClick={() => { window.location.href = '/resume.pdf'; }}>
        <i className="fas fa-scroll"></i>
      </button>
      {isLive && (
        <button title="Twitch" className="live" onClick={() => window.open('https://www.twitch.tv/technoant', '_blank')}>
          <i className="fab fa-twitch"></i>
        </button>
      )}
      <hr />
      <button
        id="toggle-animation"
        className={animationEnabled ? 'on' : 'off'}
        title="Toggle Cursor Animation"
        onClick={toggleAnimation}
      >
        <i className={`fas ${animationEnabled ? 'fa-magic' : 'fa-mouse-pointer'}`}></i>
      </button>
      <button id="toggle-theme" title="Toggle Theme" onClick={toggleTheme}>
        <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
    </div>
  );
}
