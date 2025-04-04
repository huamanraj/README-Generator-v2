// src/pages/DetailsPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { postRequest, checkServerAvailability } from '../utils/api';

const DetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { repoUrl } = location.state || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        techStack: '',
        features: '',
        installation: '',
        usage: '',
        contributing: '',
        license: 'MIT',
        contactName: '',
        contactEmail: '',
        contactWebsite: '',
        contactTwitter: '',
        contactLinkedIn: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [serverAvailable, setServerAvailable] = useState(null);
    const [validateUrl, setValidateUrl] = useState({
        contactWebsite: true,
        contactTwitter: true,
        contactLinkedIn: true
    });

    // Check if repoUrl exists and redirect if not
    useEffect(() => {
        if (!repoUrl) {
            navigate('/');
        }
    }, [repoUrl, navigate]);

    // Check server availability when component mounts
    useEffect(() => {
        const checkServer = async () => {
            const isAvailable = await checkServerAvailability();
            setServerAvailable(isAvailable);
            
            if (!isAvailable) {
                setError('Cannot connect to the server. Please make sure the server is running.');
            }
        };
        
        checkServer();
    }, []);

    // Load personal details from localStorage on initial render
    useEffect(() => {
        const savedPersonalDetails = localStorage.getItem('readmiPersonalDetails');
        if (savedPersonalDetails) {
            try {
                const parsedDetails = JSON.parse(savedPersonalDetails);
                setFormData(prevData => ({
                    ...prevData,
                    contactName: parsedDetails.contactName || '',
                    contactEmail: parsedDetails.contactEmail || '',
                    contactWebsite: parsedDetails.contactWebsite || '',
                    contactTwitter: parsedDetails.contactTwitter || '',
                    contactLinkedIn: parsedDetails.contactLinkedIn || '',
                }));
            } catch (err) {
                console.error('Error parsing saved personal details:', err);
            }
        }
    }, []);

    const validateUrlField = (name, value) => {
        if (!value.trim()) return true;
        
        let isValid = true;
        if (name === 'contactWebsite') {
            isValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value);
        } else if (name === 'contactTwitter') {
            isValid = /^(https?:\/\/)?(www\.)?twitter\.com\/[A-Za-z0-9_]{1,15}\/?$/.test(value) || 
                      /^(https?:\/\/)?(www\.)?x\.com\/[A-Za-z0-9_]{1,15}\/?$/.test(value) ||
                      /^@?[A-Za-z0-9_]{1,15}$/.test(value);
        } else if (name === 'contactLinkedIn') {
            isValid = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+\/?$/.test(value) ||
                     /^[A-Za-z0-9_.-]+$/.test(value);
        }
        
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Validate URL fields
        if (['contactWebsite', 'contactTwitter', 'contactLinkedIn'].includes(name)) {
            setValidateUrl(prev => ({ ...prev, [name]: validateUrlField(name, value) }));
        }
    };

    const handleClearInput = (fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: '' }));
    };

    const handleNextStep = (e) => {
        // If this was triggered by a form submission, prevent default
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSkip = () => {
        handleNextStep();
    };

    const savePersonalDetails = () => {
        const personalDetails = {
            contactName: formData.contactName,
            contactEmail: formData.contactEmail, 
            contactWebsite: formData.contactWebsite,
            contactTwitter: formData.contactTwitter,
            contactLinkedIn: formData.contactLinkedIn,
        };
        localStorage.setItem('readmiPersonalDetails', JSON.stringify(personalDetails));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!serverAvailable) {
            setError('Cannot connect to the server. Please make sure the server is running.');
            return;
        }
        
        setIsLoading(true);
        setError('');

        // Save personal details to localStorage if they exist
        if (formData.contactName || formData.contactEmail) {
            savePersonalDetails();
        }

        try {
            const data = await postRequest('/generate-readme-detailed', {
                repoUrl,
                ...formData
            });
            
            navigate('/generated', { state: { readme: data.readme, repoData: data.repoData } });
        } catch (err) {
            console.error('Error generating README:', err);
            setError(err.message || 'Something went wrong while generating the README. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // Define the form steps
    const steps = [
        {
            title: "Basic Information",
            fields: [
                { name: "projectName", label: "Project Name", type: "text" },
                { name: "description", label: "Project Description", type: "textarea", rows: 3 },
            ]
        },
        {
            title: "Technical Details",
            fields: [
                { name: "techStack", label: "Tech Stack", type: "text", placeholder: "React, Node.js, MongoDB, etc." },
                { name: "features", label: "Key Features", type: "textarea", rows: 3, placeholder: "List the main features of your project" },
            ]
        },
        {
            title: "Setup Instructions",
            fields: [
                { name: "installation", label: "Installation Instructions", type: "textarea", rows: 3 },
                { name: "usage", label: "Usage Examples", type: "textarea", rows: 3 },
                { name: "contributing", label: "Contributing Guidelines", type: "textarea", rows: 3 },
                { name: "license", label: "License", type: "select", options: [
                    { value: "MIT", label: "MIT" },
                    { value: "Apache-2.0", label: "Apache 2.0" },
                    { value: "GPL-3.0", label: "GPL 3.0" },
                    { value: "BSD-3-Clause", label: "BSD 3-Clause" },
                    { value: "None", label: "None" },
                ]},
            ]
        },
        {
            title: "Contact Information",
            fields: [
                { name: "contactName", label: "Your Name", type: "text" },
                { name: "contactEmail", label: "Email Address", type: "email" },
                { name: "contactWebsite", label: "Personal Website", type: "text" },
                { name: "contactTwitter", label: "Twitter/X Handle", type: "text" },
                { name: "contactLinkedIn", label: "LinkedIn Profile", type: "text" },
            ]
        }
    ];

    const currentStepData = steps[currentStep - 1];
    const isLastStep = currentStep === steps.length;
    const isFirstStep = currentStep === 1;

    // Render form fields based on field type
    const renderField = (field) => {
        const { name, label, type, placeholder, rows, options } = field;
        
        // Determine if the field is a URL field that needs validation
        const isUrlField = ['contactWebsite', 'contactTwitter', 'contactLinkedIn'].includes(name);
        const isInvalid = isUrlField && !validateUrl[name] && formData[name].trim() !== '';

        // Define enhanced placeholders based on field name
        const enhancedPlaceholders = {
            projectName: "My Awesome Project",
            description: "A brief description of what this project does and who it's for",
            techStack: "React, Node.js, MongoDB, Express, etc.",
            features: "• User authentication\n• API integration\n• Responsive design",
            installation: "npm install\nnpm start",
            usage: "const myProject = require('my-project');\nmyProject.awesome();",
            contributing: "1. Fork the Project\n2. Create your Feature Branch\n3. Commit your Changes\n4. Push to the Branch\n5. Open a Pull Request",
            contactName: "John Doe",
            contactEmail: "john@example.com",
            contactWebsite: "https://johndoe.com",
            contactTwitter: "@johndoe or https://twitter.com/johndoe",
            contactLinkedIn: "john-doe or https://linkedin.com/in/john-doe"
        };
        
        const actualPlaceholder = placeholder || enhancedPlaceholders[name] || "";
        
        return (
            <div key={name} className="mb-4">
                <label htmlFor={name} className="block text-gray-400 font-inter mb-2">{label}</label>
                <div className="relative">
                    {type === 'textarea' ? (
                        <textarea
                            id={name}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            rows={rows || 3}
                            placeholder={actualPlaceholder}
                            className={`w-full bg-darker border ${
                                isInvalid ? 'border-red-500' : 'border-gray-700'
                            } rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary pr-10 max-h-[300px]`}
                        ></textarea>
                    ) : type === 'select' ? (
                        <select
                            id={name}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="w-full bg-darker border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {options.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id={name}
                            name={name}
                            type={type}
                            value={formData[name]}
                            onChange={handleChange}
                            placeholder={actualPlaceholder}
                            className={`w-full bg-darker border ${
                                isInvalid ? 'border-red-500' : 'border-gray-700'
                            } rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary pr-10`}
                        />
                    )}
                    
                    {formData[name] && type !== 'select' && (
                        <button
                            type="button"
                            onClick={() => handleClearInput(name)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            aria-label="Clear input"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}

                    {isInvalid && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
                {isInvalid && (
                    <p className="text-red-500 mt-1 text-sm">Please enter a valid URL format</p>
                )}
            </div>
        );
    };

    // Early return if we're redirecting due to missing repoUrl
    if (!repoUrl) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto my-4 md:my-8 px-4 sm:px-6"
        >
            <button 
                onClick={handleGoBack}
                className="flex items-center text-gray-400 hover:text-primary mb-4 transition-colors"
                aria-label="Go back"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span>Back</span>
            </button>
            
            <div className="mb-6">
                <h1 className="font-tomorrow text-2xl md:text-3xl font-bold mb-2">Customize Your README</h1>
                <p className="text-gray-400">Add additional details to enhance your README file</p>
            </div>

            {serverAvailable === false && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 text-red-300">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="font-tomorrow font-semibold">Server Connection Error</h3>
                            <p>Cannot connect to the backend server. Please try again later or check your internet connection.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-dark p-4 md:p-6 rounded-lg border border-gray-800">
                {/* Step progress indicator */}
                <div className="mb-6 overflow-x-auto pb-2">
                    <div className="flex items-center justify-between mb-2 min-w-[500px]">
                        <div className="w-full flex items-center">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-center flex-grow last:flex-grow-0">
                                    <div 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                                            ${currentStep > index + 1 
                                                ? 'bg-green-500 text-black' 
                                                : currentStep === index + 1 
                                                    ? 'bg-primary text-black' 
                                                    : 'bg-darker text-gray-400 border border-gray-700'}`}
                                    >
                                        {currentStep > index + 1 ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`h-0.5 w-full mx-2 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="font-tomorrow text-xl font-semibold">{currentStepData.title}</h2>
                        <p className="text-gray-400 text-sm">Step {currentStep} of {steps.length}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 font-inter mb-2">Repository URL</label>
                    <div className="bg-darker border border-gray-700 rounded-md py-3 px-4 text-gray-300 break-all">
                        {repoUrl}
                    </div>
                </div>

                <form onSubmit={isLastStep ? handleSubmit : handleNextStep}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentStepData.fields.map(renderField)}
                        </motion.div>
                    </AnimatePresence>

                    {error && <div className="text-red-500 mb-4 p-3 bg-red-500/10 border border-red-800 rounded-md">{error}</div>}

                    <div className="flex justify-between mt-6">
                        <div>
                            {!isFirstStep && (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="bg-darker border border-gray-700 text-white font-tomorrow py-3 px-6 rounded-md flex justify-center items-center transition-colors"
                                >
                                    Back
                                </motion.button>
                            )}
                        </div>
                        
                        <div className="flex space-x-3">
                            {!isLastStep && (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    onClick={handleSkip}
                                    className="bg-darker border border-gray-700 text-gray-400 font-tomorrow py-3 px-6 rounded-md flex justify-center items-center transition-colors hover:text-white"
                                >
                                    Skip
                                </motion.button>
                            )}
                            
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={isLoading || serverAvailable === false}
                                className="bg-primary hover:bg-primary/90 text-black font-tomorrow font-semibold py-3 px-8 rounded-md flex justify-center items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : isLastStep ? "Generate README" : "Next"}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default DetailsPage;