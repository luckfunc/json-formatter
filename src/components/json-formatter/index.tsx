import { useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { DEFAULT_JSON } from '@constants';
import { validateJson } from '@utils';
import './style.less';

interface JsonFormatterProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export default function JsonFormatter({ isDarkMode, onThemeChange }: JsonFormatterProps) {
  const [jsonText, setJsonText] = useState(DEFAULT_JSON);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const jsonValidation = useMemo(() => validateJson(jsonText), [jsonText]);

  const applyJsonValue = useCallback((value: string) => {
    setJsonText(value);
    setError('');
    setSuccess('');
  }, []);

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError('');
      setSuccess('JSON formatted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setSuccess('');
    }
  }, [jsonText]);

  const handleInputChange = useCallback(
    (value: string | undefined) => {
      applyJsonValue(value || '');
    },
    [applyJsonValue],
  );

  const minifyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const minified = JSON.stringify(parsed);
      setJsonText(minified);
      setError('');
      setSuccess('JSON minified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setSuccess('');
    }
  }, [jsonText]);

  const clearAll = useCallback(() => {
    setJsonText('');
    setError('');
    setSuccess('');
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (jsonText) {
      try {
        await navigator.clipboard.writeText(jsonText);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        setError('Failed to copy to clipboard');
      }
    }
  }, [jsonText]);

  const downloadJson = useCallback(() => {
    if (jsonText) {
      try {
        JSON.parse(jsonText);
      } catch (err) {
        setError(`Invalid JSON: ${(err as Error).message}`);
        setSuccess('');
        return;
      }

      const blob = new Blob([jsonText], { type: 'application/json' });
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
  }, [jsonText]);

  const toggleTheme = useCallback(() => {
    onThemeChange(!isDarkMode);
  }, [isDarkMode, onThemeChange]);

  const themeClass = isDarkMode ? 'dark' : 'light';
  const validationError =
    jsonValidation.status === 'invalid' ? `Invalid JSON: ${jsonValidation.message}` : '';
  const activeError = error || validationError;
  const statusText = activeError || success || jsonValidation.message;
  const statusType = activeError ? 'invalid' : success ? 'valid' : jsonValidation.status;

  return (
    <div className={`formatter-container ${themeClass}`}>
      <div className={`controls-bar ${themeClass}`}>
        <div className="button-group">
          <button className={`button primary ${themeClass}`} onClick={formatJson} type="button">
            format
          </button>
          <button className={`button ${themeClass}`} onClick={minifyJson} type="button">
            minify
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={copyToClipboard}
            disabled={!jsonText}
            type="button"
          >
            copy
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={downloadJson}
            disabled={!jsonText}
            type="button"
          >
            download
          </button>
        </div>
        <div className="theme-controls">
          <button className={`button danger ${themeClass}`} onClick={clearAll} type="button">
            clear
          </button>
          <button
            className={`button theme-button ${themeClass}`}
            onClick={toggleTheme}
            type="button"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="editor-section">
        <div className={`editor-panel ${themeClass}`}>
          <div className={`panel-header ${themeClass}`}>
            <span>json</span>
            <span className={`validation-status ${themeClass} ${statusType}`} title={statusText}>
              <span className="validation-dot" />
              <span className="validation-text">{statusText}</span>
            </span>
          </div>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={jsonText}
            onChange={handleInputChange}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            options={{
              contextmenu: false,
              minimap: { enabled: false },
              mouseWheelZoom: true,
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
}
