import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

const MarkdownEditor = ({ initialValue, onSave, previewOnly = false }) => {
  const [markdown, setMarkdown] = useState(initialValue || '');
  const [viewMode, setViewMode] = useState(previewOnly ? 'preview' : 'split'); // 'edit', 'preview', 'split'
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    // Sync scroll between editor and preview in split mode
    if (viewMode === 'split' && editorRef.current && previewRef.current) {
      const handleEditorScroll = () => {
        const editorScrollPercentage = editorRef.current.scrollTop / 
          (editorRef.current.scrollHeight - editorRef.current.clientHeight);
        
        previewRef.current.scrollTop = editorScrollPercentage * 
          (previewRef.current.scrollHeight - previewRef.current.clientHeight);
      };

      const editor = editorRef.current;
      editor.addEventListener('scroll', handleEditorScroll);
      
      return () => {
        editor.removeEventListener('scroll', handleEditorScroll);
      };
    }
  }, [viewMode]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Call the onSave prop with the current markdown
    if (onSave) {
      onSave(markdown);
    }
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    // Handle tab key to insert spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '  '; // 2 spaces for indentation

      // Insert spaces at cursor position or around selected text
      const newValue = markdown.substring(0, start) + spaces + markdown.substring(end);
      setMarkdown(newValue);
      
      // Move cursor after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + spaces.length;
      }, 0);
    }
    
    // Save with Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const renderMarkdownPreview = () => (
    <ReactMarkdown
      children={markdown}
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, '')}
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    />
  );

  // If preview only mode is enabled, just show the preview
  if (previewOnly) {
    return (
      <div className="bg-darker rounded-md p-4 h-full overflow-auto markdown-preview" style={{ minHeight: '70vh' }}>
        {renderMarkdownPreview()}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '100vh' }}>
      <div className="flex justify-between items-center mb-4">
        <div className="bg-darker rounded-md flex">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-4 py-2 text-sm rounded-l-md focus:outline-none ${
              viewMode === 'edit' 
                ? 'bg-primary text-black font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-4 py-2 text-sm focus:outline-none ${
              viewMode === 'split' 
                ? 'bg-primary text-black font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 text-sm rounded-r-md focus:outline-none ${
              viewMode === 'preview' 
                ? 'bg-primary text-black font-semibold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-black py-2 px-4 rounded-md text-sm font-semibold flex items-center transition-colors"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </>
          )}
        </motion.button>
      </div>

      <div 
        className={`flex flex-1 gap-4 overflow-hidden ${
          viewMode === 'edit' ? 'flex-col' : 
          viewMode === 'preview' ? 'flex-col' : 
          'flex-row'
        }`} 
        style={{ height: 'calc(70vh - 56px)' }} // Subtract the height of the toolbar
      >
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full`}>
            <div className="bg-darker rounded-md p-2 h-full">
              <textarea
                ref={editorRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-darker text-gray-200 font-mono text-sm p-2 focus:outline-none resize-none"
                placeholder="# Write your markdown here..."
                spellCheck="false"
                style={{ height: '100%', minHeight: viewMode === 'split' ? 'calc(70vh - 60px)' : 'calc(70vh - 56px)' }}
              />
            </div>
          </div>
        )}
        
        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full`}>
            <div 
              ref={previewRef}
              className="bg-darker rounded-md p-4 h-full overflow-auto markdown-preview"
              style={{ minHeight: viewMode === 'split' ? 'calc(70vh - 60px)' : 'calc(70vh - 56px)' }}
            >
              {renderMarkdownPreview()}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Tip: Use <kbd className="bg-darker px-1 py-0.5 rounded">Ctrl+S</kbd> to save. <kbd className="bg-darker px-1 py-0.5 rounded">Tab</kbd> inserts two spaces.</p>
      </div>
    </div>
  );
};

export default MarkdownEditor;
