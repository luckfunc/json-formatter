import { useState, useEffect } from 'react';
import { JsonFormatter, GitHubIcon } from './components';
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
        <a
          href="https://github.com/luckfunc"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          <GitHubIcon width={16} height={16} />
        </a>
      </div>
      <JsonFormatter isDarkMode={isDarkMode} onThemeChange={setIsDarkMode} />
    </div>
  );
}
