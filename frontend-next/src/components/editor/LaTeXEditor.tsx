'use client';

import MonacoEditor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: string;
  options?: editor.IStandaloneEditorConstructionOptions;
}

export default function LaTeXEditor({
  value,
  onChange,
  height = '80vh',
  theme = 'vs-dark',
  options = {},
}: LaTeXEditorProps) {
  return (
    <div className="w-full h-full rounded-lg shadow border border-gray-800 bg-[#1e1e1e] overflow-hidden">
      <MonacoEditor
        height={height}
        width="100%"
        defaultLanguage="latex"
        value={value}
        onChange={(val) => onChange(val ?? '')}
        theme={theme}
        options={{
          fontSize: 16,
          fontFamily: 'Fira Code, JetBrains Mono, Courier New, monospace',
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          autoIndent: 'full',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          scrollbar: { vertical: 'visible', horizontal: 'visible' },
          ...options,
        }}
      />
    </div>
  );
}
