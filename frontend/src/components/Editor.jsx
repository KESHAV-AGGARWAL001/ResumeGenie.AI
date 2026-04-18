import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ value, onChange, height = '80vh', theme = 'vs-dark', options = {} }) {
    return (
        <div className="w-full h-full rounded-lg shadow border border-gray-800 bg-[#1e1e1e] overflow-hidden">
            <MonacoEditor
                height={height}
                width={"100%"}
                defaultLanguage="latex"
                value={value}
                onChange={onChange}
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
                    ...options
                }}
            />
        </div>
    );
}