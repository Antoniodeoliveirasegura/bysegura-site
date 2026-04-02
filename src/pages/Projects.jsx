import { useEffect } from 'react';

export function Projects() {
  useEffect(() => {
    document.title = 'Antonio • Projects';
  }, []);

  return (
    <main>
      <div className="page-header">
        <h1>Projects &amp; Ideas</h1>
        <p>Building the future, sometimes one project at a time</p>
      </div>

      <section id="projects">
        <h2>Current Projects</h2>
        <div className="project-grid">
          <div className="project">
            <div className="project-header">
              <h3 className="project-title">Ubuntu Server Projects</h3>
              <span className="project-date">Jun 2025 - Present</span>
            </div>
            <div className="project-description">
              Setting up and configuring Ubuntu servers for various applications. Learning server
              administration, security configurations, and deployment processes. Implementing 24/7 APIs.
            </div>
          </div>

          <div className="project">
            <div className="project-header">
              <h3 className="project-title">Panini Sticker Collector App</h3>
              <span className="project-date">Jun 2025 - Present</span>
            </div>
            <div className="project-description">
              A mobile app to help collectors track their Panini sticker collections. Features include
              wishlist management, trading opportunities, and collection statistics. Being developed in Swift.
            </div>
          </div>

          <div className="project">
            <div className="project-header">
              <h3 className="project-title">Voice-Controlled Twitch Moderator</h3>
              <span className="project-date">Mar 2025 - Present</span>
            </div>
            <div className="project-description">
              An AI-powered Twitch bot that responds to voice commands for moderation tasks. Uses speech
              recognition and natural language processing to manage chat efficiently.
            </div>
            <a href="https://github.com/Antoniodeoliveirasegura/twitch-voice-modbot" target="_blank" rel="noreferrer" className="project-link">
              <i className="fab fa-github"></i> View on GitHub
            </a>
          </div>

          <div className="project">
            <div className="project-header">
              <h3 className="project-title">Sustainability API</h3>
              <span className="project-date">May 2025 - Jun 2025</span>
            </div>
            <div className="project-description">
              RESTful API providing sustainability metrics and environmental data. Includes carbon footprint
              calculations, renewable energy statistics, and eco-friendly recommendations.
            </div>
            <a href="https://github.com/Antoniodeoliveirasegura/sustainability-api" target="_blank" rel="noreferrer" className="project-link">
              <i className="fab fa-github"></i> View on GitHub
            </a>
          </div>

          <div className="project">
            <div className="project-header">
              <h3 className="project-title">Sustainability Browser Extension</h3>
              <span className="project-date">May 2025 - Jun 2025</span>
            </div>
            <div className="project-description">
              Browser extension that tracks and suggests eco-friendly alternatives while browsing. Shows
              carbon impact of websites and promotes sustainable online habits.
            </div>
            <a href="https://github.com/Antoniodeoliveirasegura/sustainabilityExtension" target="_blank" rel="noreferrer" className="project-link">
              <i className="fab fa-github"></i> View on GitHub
            </a>
          </div>

          <div className="project">
            <div className="project-header">
              <h3 className="project-title">Spotify Listening Pattern Analyzer</h3>
              <span className="project-date">Mar 2025</span>
            </div>
            <div className="project-description">
              Python tool that analyzes Spotify listening history to identify patterns, favorite genres, and
              listening habits. Generates personalized music insights and statistics.
            </div>
            <a href="https://github.com/Antoniodeoliveirasegura/Spotify-Listening-Pattern-Analyzer" target="_blank" rel="noreferrer" className="project-link">
              <i className="fab fa-github"></i> View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section id="future-ideas">
        <h2>Future Ideas</h2>
        <div className="future-grid">
          <div className="future-idea">
            <h3>SoundCloud API Music App</h3>
            <p>Custom music streaming app using SoundCloud's API. Will feature personalized playlists, social sharing, and advanced audio controls.</p>
          </div>
          <div className="future-idea">
            <h3>Instagram Follower Checker</h3>
            <p>Tool to analyze Instagram followers and identify accounts that don't follow back. Includes unfollowing automation and engagement analytics.</p>
          </div>
          <div className="future-idea">
            <h3>Audio Amplifier Extension</h3>
            <p>Browser extension that amplifies quiet audio and provides full-screen mode for better viewing experience on low-volume content.</p>
          </div>
          <div className="future-idea">
            <h3>Smart Glasses for Presentations</h3>
            <p>AR smart glasses application for displaying presentation notes and cues invisible to the audience. Perfect for public speaking and presentations.</p>
          </div>
          <div className="future-idea">
            <h3>Universal File Converter</h3>
            <p>Custom file converter - got tired of converting files using other websites and having to pay for some after inputting the file.</p>
          </div>
          <div className="future-idea">
            <h3>Minimalist Sudoku App</h3>
            <p>Clean Sudoku app with multiple difficulty levels, hint system, and progress tracking. Clean design focused on pure puzzle-solving experience.</p>
          </div>
          <div className="future-idea">
            <h3>Sims-Style Clothing Customizer</h3>
            <p>Potentially used for a stream, based on the context "Controlling his life". This way users can upload clothes and dress the character like Sims.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
