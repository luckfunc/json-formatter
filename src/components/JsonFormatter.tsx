import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import './JsonFormatter.less';

interface JsonFormatterProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

const JsonFormatter: React.FC<JsonFormatterProps> = ({ isDarkMode, onThemeChange }) => {
  const [inputJson, setInputJson] = useState(`{
  "name": "JSON Formatter",
  "version": "1.0.0",
  "description": "A beautiful JSON formatting tool",
  "features": ["format", "minify", "validate", "copy", "download"],
  "author": {
    "name": "Developer",
    "email": "dev@example.com"
  },
  "nested": {
    "level1": {
      "level2": {
        "data": "deeply nested value"
      }
    }
  }
}`);
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setError('');
      setSuccess('JSON formatted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setOutputJson('');
      setSuccess('');
    }
  }, [inputJson]);

  const minifyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setError('');
      setSuccess('JSON minified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setOutputJson('');
      setSuccess('');
    }
  }, [inputJson]);

  const clearAll = useCallback(() => {
    setInputJson('');
    setOutputJson('');
    setError('');
    setSuccess('');
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (outputJson) {
      try {
        await navigator.clipboard.writeText(outputJson);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  }, [outputJson]);

  const downloadJson = useCallback(() => {
    if (outputJson) {
      const blob = new Blob([outputJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('JSON downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [outputJson]);

  const toggleTheme = useCallback(() => {
    onThemeChange(!isDarkMode);
  }, [isDarkMode, onThemeChange]);

  const themeClass = isDarkMode ? 'dark' : 'light';

  return (
    <div className={`formatter-container ${themeClass}`}>
      <div className={`controls-bar ${themeClass}`}>
        <div className="button-group">
          <button className={`button primary ${themeClass}`} onClick={formatJson}>
            fmt
          </button>
          <button className={`button ${themeClass}`} onClick={minifyJson}>
            min
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={copyToClipboard}
            disabled={!outputJson}
          >
            cp
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={downloadJson}
            disabled={!outputJson}
          >
            dl
          </button>
        </div>
        <div className="theme-controls">
          <button className={`button danger ${themeClass}`} onClick={clearAll}>
            clr
          </button>
          <button className={`button theme-button ${themeClass}`} onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {error && <div className={`error-message ${themeClass}`}>{error}</div>}
      {success && <div className={`success-message ${themeClass}`}>{success}</div>}

      <div className="editor-section">
        <div className={`editor-panel ${themeClass}`}>
          <div className={`panel-header ${themeClass}`}>input</div>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={inputJson}
            onChange={(value) => setInputJson(value || '')}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              tabSize: 2,
              fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Consolas, monospace',
            }}
          />
        </div>

        <div className={`editor-panel ${themeClass}`}>
          <div className={`panel-header ${themeClass}`}>output</div>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={outputJson}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              tabSize: 2,
              fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Consolas, monospace',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;
