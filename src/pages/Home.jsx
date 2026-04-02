import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContactSection } from '../components/ContactSection';

export function Home() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = 'Antonio De Oliveira Segura';
  }, []);

  useEffect(() => {
    if (searchParams.get('contact') === '1') {
      setTimeout(() => {
        document.getElementById('contactSection')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  return (
    <>
      <div className="header">
        <h1 className="antonio">antonio</h1>
        <h2>de oliveira segura</h2>
        <p>engineer, researcher &amp; data analyst</p>

        <div className="achievements">
          <h2>things i'm proud of</h2>
          <ul>
            <li>pursuing degree in Computer Engineering at Purdue University</li>
            <li>conducted research on energy harvesting &amp; IoT security with real-world impact</li>
            <li>researched extending life of electrodes</li>
            <li>study abroad in Korea: exploring microchips &amp; the semiconductor industry</li>
            <li>hands-on with embedded systems, web development, and prototyping hardware-software solutions</li>
            <li>published and maintained open-source projects &amp; personal portfolio</li>
            <li>learning, and delivering value wherever I go</li>
          </ul>
        </div>

        <div className="achievements">
          <h2>things i want to do next</h2>
          <ul>
            <li>gain life experience by working in diverse environments like startups to medium and large companies</li>
            <li>expand my expertise in low-power embedded systems and machine learning at the edge</li>
            <li>explore entrepreneurship by building meaningful, impactful tools and products</li>
            <li>work on projects at the intersection of finance, technology, and sustainability</li>
            <li>continue to learn, and grow through open-source and educational initiatives</li>
          </ul>
        </div>
      </div>

      <ContactSection />

      <footer>
        &copy; 2025 Antonio De Oliveira Segura · bysegura.com
      </footer>
    </>
  );
}
