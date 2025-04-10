'use client';

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

interface ApiSpecEditorProps {
  content: string;
  language: 'json' | 'yaml';
  readOnly?: boolean;
  height?: string;
  onChange?: (value: string | undefined) => void;
}

export default function ApiSpecEditor({ 
  content, 
  language, 
  readOnly = true, 
  height = '500px',
  onChange
}: ApiSpecEditorProps) {
  const [mounted, setMounted] = useState(false);
  
  // Wait for client-side rendering to avoid SSR issues with Monaco
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="bg-gray-100 animate-pulse rounded-lg" 
        style={{ height }}
      ></div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={content}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
        }}
        onChange={onChange}
      />
    </div>
  );
} 