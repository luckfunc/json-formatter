import { useState, useEffect } from 'react';
import JsonFormatter from './components/JsonFormatter';
import './App.less';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`header ${isDarkMode ? 'dark' : 'light'}`}>
        json-formatter
      </div>
      <JsonFormatter isDarkMode={isDarkMode} onThemeChange={setIsDarkMode} />
    </div>
  );
}
