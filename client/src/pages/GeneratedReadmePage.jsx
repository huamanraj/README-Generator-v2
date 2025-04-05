// src/pages/GeneratedReadmePage.jsx
import { useLocation, Navigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';

const GeneratedReadmePage = () => {
    const location = useLocation();
    const { readme, repoData, isGenericFallback } = location.state || {};
    const [readmeContent, setReadmeContent] = useState(readme || '');
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('raw'); // 'raw', 'preview', 'edit'
    const readmeRef = useRef(null);

    if (!readmeContent) {
        return <Navigate to="/" />;
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(readmeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([readmeContent], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'README.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleToggleMode = (mode) => {
        setViewMode(mode);
    };

    const handleSaveChanges = (newContent) => {
        setReadmeContent(newContent);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[95%] mx-auto my-4 md:my-8"
        >
            <div className="mb-6">
                <h1 className="font-tomorrow text-2xl md:text-3xl font-bold mb-2">Your Generated README</h1>
                <p className="text-gray-400">Copy to clipboard or download as README.md</p>
                {isGenericFallback && (
                    <div className="mt-2 bg-yellow-900/30 border border-yellow-800 text-yellow-300 p-3 rounded-md text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium">AI Generation Notice</span>
                        </div>
                        <p className="mt-1">
                            We generated a standard README using the provided information as our AI service was unavailable. 
                            You can still edit this README to customize it further.
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-dark p-4 md:p-6 rounded-lg border border-gray-800 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="w-full sm:w-auto">
                        <h2 className="font-tomorrow font-semibold text-xl truncate max-w-[300px] sm:max-w-xs">
                            {repoData?.name || 'Repository README'}
                        </h2>
                        {repoData?.description && (
                            <p className="text-gray-400 text-sm truncate max-w-[300px] sm:max-w-xs">{repoData.description}</p>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-end">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleMode('raw')}
                            className={`flex-1 sm:flex-initial ${
                                viewMode === 'raw' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-darker hover:bg-gray-900 border border-gray-700 text-gray-300'
                            } py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1 transition-colors`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Raw
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleMode('preview')}
                            className={`flex-1 sm:flex-initial ${
                                viewMode === 'preview' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-darker hover:bg-gray-900 border border-gray-700 text-gray-300'
                            } py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1 transition-colors`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleMode('edit')}
                            className={`flex-1 sm:flex-initial ${
                                viewMode === 'edit' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-darker hover:bg-gray-900 border border-gray-700 text-gray-300'
                            } py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1 transition-colors`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyToClipboard}
                            className="flex-1 sm:flex-initial bg-darker hover:bg-gray-900 border border-gray-700 text-gray-300 py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownload}
                            className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-black py-2 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline">Download</span>
                        </motion.button>
                    </div>
                </div>

                {viewMode === 'edit' ? (
                    <MarkdownEditor 
                        initialValue={readmeContent} 
                        onSave={handleSaveChanges}
                        previewOnly={false}
                    />
                ) : viewMode === 'preview' ? (
                    <MarkdownEditor 
                        initialValue={readmeContent}
                        previewOnly={true}
                    />
                ) : (
                    <div className="bg-darker rounded-md p-4 overflow-auto min-h-[70vh] max-h-[70vh] font-mono text-sm">
                        <pre ref={readmeRef} className="whitespace-pre-wrap break-words">{readmeContent}</pre>
                    </div>
                )}
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-blue-300">
                <h3 className="font-tomorrow font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pro Tip
                </h3>
                <p>You can edit your README right here in the live editor. Use markdown syntax for headings, lists, code blocks, and more. When you're done, click 'Save Changes' and download your customized README.</p>
            </div>
        </motion.div>
    );
};

export default GeneratedReadmePage;