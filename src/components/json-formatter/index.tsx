import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { DEFAULT_JSON } from '../../constants';
import { compress, decompress } from '../../utils';
import './style.less';

const URL_PARAM = 'json';

interface JsonFormatterProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export default function JsonFormatter({ isDarkMode, onThemeChange }: JsonFormatterProps) {
  const [inputJson, setInputJson] = useState(DEFAULT_JSON);
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  const applyInputValue = useCallback((value: string) => {
    setInputJson(value);
    setSuccess('');

    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setError('');
    } catch {
      if (value.trim()) {
        setError('');
        setOutputJson('');
      } else {
        setError('');
        setOutputJson('');
      }
    }
  }, []);

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

  const handleInputChange = useCallback((value: string | undefined) => {
    applyInputValue(value || '');
  }, [applyInputValue]);

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
      } catch {
        setError('Failed to copy to clipboard');
      }
    }
  }, [outputJson]);

  const copyShareUrl = useCallback(async () => {
    if (!inputJson) {
      return;
    }

    try {
      const url = new URL(window.location.href);
      const encoded = await compress(inputJson);
      const hashParams = new URLSearchParams(url.hash.slice(1));
      hashParams.set(URL_PARAM, encoded);
      url.hash = hashParams.toString();
      url.searchParams.delete(URL_PARAM);

      await navigator.clipboard.writeText(url.toString());
      setSuccess('Share URL copied!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to copy share URL');
      setTimeout(() => setError(''), 3000);
    }
  }, [inputJson]);

  useEffect(() => {
    let cancelled = false;

    const loadFromUrl = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      let encoded = hashParams.get(URL_PARAM);

      if (!encoded) {
        const searchParams = new URLSearchParams(window.location.search);
        encoded = searchParams.get(URL_PARAM);
      }

      if (!encoded) {
        setHasInitializedFromUrl(true);
        return;
      }

      try {
        const text = await decompress(encoded);
        if (!cancelled) {
          applyInputValue(text);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to read JSON from URL');
          setTimeout(() => setError(''), 3000);
        }
      } finally {
        if (!cancelled) {
          setHasInitializedFromUrl(true);
        }
      }
    };

    loadFromUrl();

    return () => {
      cancelled = true;
    };
  }, [applyInputValue]);

  useEffect(() => {
    if (!hasInitializedFromUrl) {
      return;
    }

    let cancelled = false;

    const syncToUrl = async () => {
      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.slice(1));

        if (!inputJson) {
          hashParams.delete(URL_PARAM);
        } else {
          const encoded = await compress(inputJson);
          if (cancelled) {
            return;
          }
          hashParams.set(URL_PARAM, encoded);
        }

        url.hash = hashParams.toString();
        url.searchParams.delete(URL_PARAM);

        if (!cancelled) {
          window.history.replaceState(null, '', url.toString());
        }
      } catch {
        if (!cancelled) {
          setError('Failed to sync JSON to URL');
          setTimeout(() => setError(''), 3000);
        }
      }
    };

    syncToUrl();

    return () => {
      cancelled = true;
    };
  }, [inputJson, hasInitializedFromUrl]);

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
          <button className={`button primary ${themeClass}`} onClick={formatJson} type="button">
            format
          </button>
          <button className={`button ${themeClass}`} onClick={minifyJson} type="button">
            minify
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={copyToClipboard}
            disabled={!outputJson}
            type="button"
          >
            copy
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={copyShareUrl}
            disabled={!inputJson}
            type="button"
          >
            share
          </button>
          <button
            className={`button ${themeClass}`}
            onClick={downloadJson}
            disabled={!outputJson}
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

      {error && <div className={`error-message ${themeClass}`}>{error}</div>}
      {success && <div className={`success-message ${themeClass}`}>{success}</div>}

      <div className="editor-section">
        <div className={`editor-panel ${themeClass}`}>
          <div className={`panel-header ${themeClass}`}>input</div>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={inputJson}
            onChange={handleInputChange}
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
}
