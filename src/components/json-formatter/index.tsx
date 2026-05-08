import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import type { IDisposable } from 'monaco-editor';
import {
  DEFAULT_JSON,
  VITESSE_DARK_MONACO_THEME,
  VITESSE_DARK_THEME,
  VITESSE_LIGHT_MONACO_THEME,
  VITESSE_LIGHT_THEME,
} from '@constants';
import { validateJson } from '@utils';
import './style.less';

interface JsonFormatterProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

function formatJsonValue(value: string) {
  return JSON.stringify(JSON.parse(value), null, 2);
}

function minifyJsonValue(value: string) {
  return JSON.stringify(JSON.parse(value));
}

export default function JsonFormatter({ isDarkMode, onThemeChange }: JsonFormatterProps) {
  const [jsonText, setJsonText] = useState(DEFAULT_JSON);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pasteDisposableRef = useRef<IDisposable | null>(null);
  const jsonValidation = useMemo(() => validateJson(jsonText), [jsonText]);

  const applyJsonValue = useCallback((value: string) => {
    setJsonText(value);
    setError('');
    setSuccess('');
  }, []);

  const formatJson = useCallback(() => {
    try {
      const formatted = formatJsonValue(jsonText);
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
      const minified = minifyJsonValue(jsonText);
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

  const registerEditorThemes = useCallback<BeforeMount>((monaco) => {
    monaco.editor.defineTheme(VITESSE_DARK_THEME, VITESSE_DARK_MONACO_THEME);
    monaco.editor.defineTheme(VITESSE_LIGHT_THEME, VITESSE_LIGHT_MONACO_THEME);
  }, []);

  const handleEditorMount = useCallback<OnMount>((editor) => {
    pasteDisposableRef.current?.dispose();
    pasteDisposableRef.current = editor.onDidPaste(() => {
      const value = editor.getValue();

      try {
        const formatted = formatJsonValue(value);

        if (formatted !== value) {
          const model = editor.getModel();

          if (model) {
            editor.executeEdits('auto-format-paste', [
              {
                range: model.getFullModelRange(),
                text: formatted,
                forceMoveMarkers: true,
              },
            ]);
            editor.pushUndoStop();
          }
        }

        setError('');
        setSuccess('JSON formatted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        // Keep the pasted text unchanged; the existing validation status shows the parse error.
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      pasteDisposableRef.current?.dispose();
    };
  }, []);

  const themeClass = isDarkMode ? 'dark' : 'light';
  const editorTheme = isDarkMode ? VITESSE_DARK_THEME : VITESSE_LIGHT_THEME;
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
            beforeMount={registerEditorThemes}
            onMount={handleEditorMount}
            theme={editorTheme}
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
