declare const __BUILD_TIME__: string;

export const DEFAULT_JSON = `{
  "name": "JSON Formatter",
  "version": "1.0.0",
  "description": "A beautiful JSON formatting tool",
  "author": "const",
  "site": "https://json.const.site",
  "blog": "https://blog.luckfunc.com",
  "updateTime": "${__BUILD_TIME__}",
  "features": [
    "format",
    "minify",
    "validate",
    "copy",
    "download",
    "auto-format"
  ],
  "config": {
    "theme": "auto",
    "autoFormat": true,
    "lineNumbers": true
  },
  "meta": {
    "created": "2025",
    "license": "MIT",
    "repository": "https://github.com/luckfunc/json-formatter"
  }
}`;
