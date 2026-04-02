import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { TouchBar } from './components/TouchBar';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import './styles.css';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <BackgroundCanvas />
        <TouchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
