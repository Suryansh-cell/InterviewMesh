import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useSessionStore } from '../store/sessionStore';

interface CodeEditorProps {
  onCodeChange?: (code: string) => void;
  onAnalyze?: () => void;
  readOnly?: boolean;
}

export default function CodeEditor({ onCodeChange, onAnalyze, readOnly = false }: CodeEditorProps) {
  const { code, language, setCode, setLanguage } = useSessionStore();
  const editorRef = useRef<any>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  type LanguageKey = keyof typeof languageTemplates;

  const languageTemplates = {
    javascript: `// JavaScript Solution
function solution() {
    // Your code here
    
}

// Test cases
console.log(solution());`,
    typescript: `// TypeScript Solution
function solution(): any {
    // Your code here
    
}

// Test cases
console.log(solution());`,
    python: `# Python Solution
def solution():
    # Your code here
    pass

# Test cases
if __name__ == "__main__":
    print(solution())`,
    java: `// Java Solution
public class Solution {
    public static void main(String[] args) {
        // Your code here
        
        // Test cases
        System.out.println("Solution result");
    }
}`,
    cpp: `// C++ Solution
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    
    // Test cases
    cout << "Solution result" << endl;
    return 0;
}`
  };

  const templateValues = Object.values(languageTemplates);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (newLanguage: LanguageKey) => {
    const currentCode = useSessionStore.getState().code;
    const isTemplateCode = templateValues.includes(currentCode);
    setLanguage(newLanguage);
    if (!currentCode || isTemplateCode) {
      setCode(languageTemplates[newLanguage]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b"
        style={{ background: 'rgba(30,41,59,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
            className="text-xs font-medium rounded-md px-2 py-1 outline-none cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#A5B4FC',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          <button
            onClick={() => {/* placeholder for run */}}
            className="text-xs px-3 py-1 rounded-md font-medium transition-colors"
            style={{
              background: 'rgba(16,185,129,0.15)',
              color: '#34D399',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            ▶ Run
          </button>
          <button
            onClick={onAnalyze}
            disabled={!onAnalyze}
            className="text-xs px-3 py-1 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#A5B4FC',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            🧠 Analyze
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/10"
            style={{ color: '#94A3B8' }}
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            readOnly,
            padding: { top: 12 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'gutter',
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs border-t"
        style={{
          background: 'rgba(30,41,59,0.8)',
          borderColor: 'rgba(255,255,255,0.08)',
          color: '#64748B',
        }}>
        <span>{language}</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Synced</span>
        </div>
      </div>
    </div>
  );
}
