// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postRequest, checkServerAvailability } from '../utils/api';

const HomePage = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [serverAvailable, setServerAvailable] = useState(null);
    const [urlValid, setUrlValid] = useState(true);
    const navigate = useNavigate();

    // Check server availability when component mounts
    useEffect(() => {
        const checkServer = async () => {
            const isAvailable = await checkServerAvailability();
            setServerAvailable(isAvailable);
        };
        
        checkServer();
    }, []);

    const validateUrl = (url) => {
        const githubRepoRegex = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
        return githubRepoRegex.test(url);
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setRepoUrl(url);
        if (url.trim() !== '') {
            setUrlValid(validateUrl(url));
        } else {
            setUrlValid(true);
        }
    };

    const handleGenerateReadme = async () => {
        if (!repoUrl.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        if (!validateUrl(repoUrl)) {
            setError('Please enter a valid GitHub repository URL');
            return;
        }

        if (!serverAvailable) {
            setError('Cannot connect to the server. Please make sure the server is running.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await postRequest('/generate-readme', { repoUrl });
            navigate('/generated', { state: { readme: data.readme, repoData: data.repoData } });
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToDetails = () => {
        if (!repoUrl.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        if (!validateUrl(repoUrl)) {
            setError('Please enter a valid GitHub repository URL');
            return;
        }

        if (!serverAvailable) {
            setError('Cannot connect to the server. Please make sure the server is running.');
            return;
        }

        navigate('/details', { state: { repoUrl } });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mt-8 md:mt-16 px-4 sm:px-6"
        >
            <div className="text-center mb-8">
                <h1 className="font-tomorrow text-3xl md:text-5xl font-bold mb-4">
                    <span className="text-primary">GitHub README</span> Generator
                </h1>
                <p className="font-inter text-gray-400 text-base md:text-lg">
                    Create production-ready README files for your GitHub repositories in seconds
                </p>
            </div>

            {serverAvailable === false && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 text-red-300">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="font-tomorrow font-semibold">Server Connection Error</h3>
                            <p>Cannot connect to the backend server. Please try again later or check your internet connection.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-dark p-4 md:p-6 rounded-lg border border-gray-800 shadow-xl">
                <div className="mb-6">
                    <label htmlFor="repoUrl" className="block text-gray-400 font-inter mb-2">GitHub Repository URL</label>
                    <div className={`relative ${!urlValid && repoUrl.trim() !== '' ? 'border-red-500' : ''}`}>
                        <input
                            id="repoUrl"
                            type="text"
                            value={repoUrl}
                            onChange={handleUrlChange}
                            placeholder="https://github.com/username/repository"
                            className={`w-full bg-darker border ${
                                !urlValid && repoUrl.trim() !== '' ? 'border-red-500' : 'border-gray-700'
                            } rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        {!urlValid && repoUrl.trim() !== '' && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {!urlValid && repoUrl.trim() !== '' && (
                        <p className="text-red-500 mt-2 text-sm">Please enter a valid GitHub repository URL</p>
                    )}
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                        
                        whileTap={{ scale: 0.97 }}
                        onClick={handleGenerateReadme}
                        disabled={isLoading || serverAvailable === false}
                        className="flex-1 bg-primary hover:bg-primary/90 text-black font-tomorrow font-semibold py-3 rounded-md flex justify-center items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Generate README"}
                    </motion.button>

                    <motion.button
                        
                        whileTap={{ scale: 0.97 }}
                        onClick={handleGoToDetails}
                        disabled={isLoading || serverAvailable === false}
                        className="flex-1 bg-dark hover:bg-gray-800 text-white border border-gray-700 font-tomorrow font-semibold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </motion.button>
                </div>
            </div>

            <div className="mt-8 md:mt-12">
                <h2 className="font-tomorrow text-xl md:text-2xl font-semibold mb-4">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[
                        {
                            step: "1",
                            title: "Enter Repository",
                            desc: "Paste your GitHub repository URL in the field above"
                        },
                        {
                            step: "2",
                            title: "Customize (Optional)",
                            desc: "Add additional details or skip straight to generation"
                        },
                        {
                            step: "3",
                            title: "Generate & Use",
                            desc: "Get a professional README file ready to use"
                        }
                    ].map((item) => (
                        <div key={item.step} className="bg-dark p-5 rounded-lg border border-gray-800">
                            <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center mb-3">
                                {item.step}
                            </div>
                            <h3 className="font-tomorrow font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-400 font-inter">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;