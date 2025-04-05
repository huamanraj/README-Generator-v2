// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting implementation
const rateLimit = {
    requests: 0,
    maxRequests: 100,
    resetTime: Date.now() + 3600000, // 1 hour from now
    
    // Check if rate limit exceeded
    isLimited() {
        // Reset counter if the hour has passed
        if (Date.now() > this.resetTime) {
            this.requests = 0;
            this.resetTime = Date.now() + 3600000;
        }
        
        return this.requests >= this.maxRequests;
    },
    
    // Increment request counter
    increment() {
        // Reset counter if the hour has passed
        if (Date.now() > this.resetTime) {
            this.requests = 0;
            this.resetTime = Date.now() + 3600000;
        }
        
        this.requests++;
    }
};

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
    if (rateLimit.isLimited()) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded', 
            message: 'Too many requests, please try again later',
            resetAt: new Date(rateLimit.resetTime).toISOString()
        });
    }
    
    rateLimit.increment();
    next();
};

// Apply rate limiting to all routes
app.use(rateLimitMiddleware);

// Middleware
app.use(cors({
    origin: [
        'https://readme-generator-v2-client.vercel.app',
        'https://readmegenerator.amanraj.me',
        'https://readmegeneratorbackend.vercel.app'
        
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configure Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure GitHub API
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// Extract owner and repo from GitHub URL
function extractRepoInfo(url) {
    try {
        const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
        const match = url.match(regex);

        if (!match) {
            throw new Error('Invalid GitHub repository URL');
        }

        return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ''),
        };
    } catch (error) {
        console.error('URL parsing error:', error);
        throw new Error('Could not parse GitHub URL');
    }
}

// Get repository data from GitHub
async function getRepoData(owner, repo) {
    try {
        console.log(`Fetching repo data for ${owner}/${repo}`);
        
        // Get repo information
        const repoResponse = await octokit.repos.get({ owner, repo });
        
        // Get languages
        const languagesResponse = await octokit.repos.listLanguages({ owner, repo });
        
        // Get contributors (with error handling if repo has no contributors)
        let contributors = [];
        try {
            const contributorsResponse = await octokit.repos.listContributors({ 
                owner, 
                repo, 
                per_page: 10 
            });
            contributors = contributorsResponse.data.map(contributor => ({
                login: contributor.login,
                contributions: contributor.contributions,
            }));
        } catch (err) {
            console.log('No contributors found or error fetching contributors:', err.message);
            // Continue without contributors
        }

        return {
            name: repoResponse.data.name,
            fullName: repoResponse.data.full_name,
            description: repoResponse.data.description || '',
            homepage: repoResponse.data.homepage,
            defaultBranch: repoResponse.data.default_branch,
            stars: repoResponse.data.stargazers_count,
            forks: repoResponse.data.forks_count,
            issues: repoResponse.data.open_issues_count,
            languages: Object.keys(languagesResponse.data),
            contributors: contributors,
            license: repoResponse.data.license ? repoResponse.data.license.spdx_id : null,
            topics: repoResponse.data.topics || [],
            createdAt: repoResponse.data.created_at,
            updatedAt: repoResponse.data.updated_at,
            url: repoResponse.data.html_url,
        };
    } catch (error) {
        console.error('GitHub API error:', error.message);
        throw new Error(`Failed to fetch repository data: ${error.message}`);
    }
}

// Fallback function to generate a generic README when AI fails
function generateGenericReadme(repoData, additionalInfo = {}) {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Construct badges based on available information
    let badges = '';
    if (repoData.license) {
        badges += `![License](https://img.shields.io/badge/License-${encodeURIComponent(repoData.license)}-blue.svg) `;
    }
    if (repoData.languages && repoData.languages.length > 0) {
        badges += repoData.languages.map(lang => 
            `![${lang}](https://img.shields.io/badge/${encodeURIComponent(lang)}-language-brightgreen.svg)`
        ).join(' ');
    }

    // Construct features section if provided
    let featuresSection = '';
    if (additionalInfo.features) {
        featuresSection = `
## Features

${additionalInfo.features.split('\n').map(feature => `- ${feature.trim()}`).join('\n')}
`;
    }

    // Construct tech stack section
    let techStackSection = '';
    let techStackItems = [];
    
    if (additionalInfo.techStack) {
        techStackItems = techStackItems.concat(additionalInfo.techStack.split(',').map(tech => tech.trim()));
    }
    
    if (repoData.languages && repoData.languages.length > 0) {
        techStackItems = techStackItems.concat(repoData.languages);
    }
    
    // Remove duplicates
    techStackItems = [...new Set(techStackItems)];
    
    if (techStackItems.length > 0) {
        techStackSection = `
## Technologies Used

${techStackItems.map(tech => `- ${tech}`).join('\n')}
`;
    }

    // Construct installation section if provided
    let installationSection = '';
    if (additionalInfo.installation) {
        installationSection = `
## Installation

\`\`\`bash
${additionalInfo.installation}
\`\`\`
`;
    }

    // Construct usage section if provided
    let usageSection = '';
    if (additionalInfo.usage) {
        usageSection = `
## Usage

${additionalInfo.usage}
`;
    }

    // Construct contributing section if provided
    let contributingSection = '';
    if (additionalInfo.contributing) {
        contributingSection = `
## Contributing

${additionalInfo.contributing}
`;
    } else if (repoData.contributors && repoData.contributors.length > 0) {
        contributingSection = `
## Contributors

${repoData.contributors.map(contributor => `- [@${contributor.login}](https://github.com/${contributor.login})`).join('\n')}
`;
    }

    // Construct license section
    let licenseSection = '';
    if (repoData.license || additionalInfo.license) {
        licenseSection = `
## License

This project is licensed under the ${repoData.license || additionalInfo.license || 'Unspecified'} License.
`;
    }

    // Construct contact section if any contact info is provided
    let contactSection = '';
    if (additionalInfo.contactName || additionalInfo.contactEmail || 
        additionalInfo.contactWebsite || additionalInfo.contactTwitter || 
        additionalInfo.contactLinkedIn) {
        
        contactSection = `
## Contact

`;
        if (additionalInfo.contactName) contactSection += `- Name: ${additionalInfo.contactName}\n`;
        if (additionalInfo.contactEmail) contactSection += `- Email: ${additionalInfo.contactEmail}\n`;
        if (additionalInfo.contactWebsite) contactSection += `- Website: [Personal Website](${additionalInfo.contactWebsite})\n`;
        if (additionalInfo.contactTwitter) contactSection += `- Twitter: [@${additionalInfo.contactTwitter}](https://twitter.com/${additionalInfo.contactTwitter})\n`;
        if (additionalInfo.contactLinkedIn) contactSection += `- LinkedIn: [Profile](${additionalInfo.contactLinkedIn})\n`;
    }

    // Construct the final README
    return `# ${repoData.name || 'Project README'}

${badges}

${repoData.description || additionalInfo.description || 'No description provided.'}

${repoData.homepage ? `**Website:** [${repoData.homepage}](${repoData.homepage})` : ''}

${featuresSection}
${techStackSection}
${installationSection}
${usageSection}
${contributingSection}
${licenseSection}
${contactSection}

## Repository Statistics
- Stars: ${repoData.stars || 0}
- Forks: ${repoData.forks || 0}
- Open Issues: ${repoData.issues || 0}
${repoData.topics && repoData.topics.length > 0 ? `- Topics: ${repoData.topics.join(', ')}` : ''}

---
*Generated on ${currentDate}*
`;
}

// Generate README with Gemini AI
async function generateReadmeWithAI(repoData, additionalInfo = {}, owner, repo) {
    try {
        console.log('Generating README with AI...');
        
        // Get the model - using the newer API format
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Prepare contact information section if available
        let contactSection = '';
        if (additionalInfo.contactName || additionalInfo.contactEmail || 
            additionalInfo.contactWebsite || additionalInfo.contactTwitter || 
            additionalInfo.contactLinkedIn) {
            
            contactSection = 'Contact Information:\n';
            if (additionalInfo.contactName) contactSection += `Name: ${additionalInfo.contactName}\n`;
            if (additionalInfo.contactEmail) contactSection += `Email: ${additionalInfo.contactEmail}\n`;
            if (additionalInfo.contactWebsite) contactSection += `Website: ${additionalInfo.contactWebsite}\n`;
            if (additionalInfo.contactTwitter) contactSection += `Twitter: ${additionalInfo.contactTwitter}\n`;
            if (additionalInfo.contactLinkedIn) contactSection += `LinkedIn: ${additionalInfo.contactLinkedIn}\n`;
        }
        
        const prompt = `
Generate a professional GitHub README.md for the following repository:

# Repository Info
Name: ${repoData.name || 'Repository'}
Owner: ${owner || 'Not specified'}
Full Name: ${repoData.fullName || `${owner}/${repo}`}
URL: ${repoData.url || `https://github.com/${owner}/${repo}`}
Description: ${repoData.description || additionalInfo.description || 'No description provided'}
Languages: ${repoData.languages?.join(', ') || 'Not specified'}
${additionalInfo.techStack ? `Tech Stack: ${additionalInfo.techStack}` : ''}
${repoData.topics?.length ? `Topics: ${repoData.topics.join(', ')}` : ''}
Stars: ${repoData.stars || 0}
Forks: ${repoData.forks || 0}
Issues: ${repoData.issues || 0}
Created: ${repoData.createdAt ? new Date(repoData.createdAt).toLocaleDateString() : 'Unknown'}
Last Updated: ${repoData.updatedAt ? new Date(repoData.updatedAt).toLocaleDateString() : 'Unknown'}

# Content Sections
${additionalInfo.features ? `Features:\n${additionalInfo.features}` : ''}
${additionalInfo.installation ? `Installation:\n${additionalInfo.installation}` : ''}
${additionalInfo.usage ? `Usage:\n${additionalInfo.usage}` : ''}
${additionalInfo.contributing ? `Contributing:\n${additionalInfo.contributing}` : ''}
License: ${repoData.license || additionalInfo.license || 'MIT'}
${contactSection ? `Contact:\n${contactSection}` : ''}
${repoData.contributors?.length ? `Contributors: ${repoData.contributors.map(c => '@' + c.login).join(', ')}` : ''}

Create a complete, professional README with:
- Clear project title with logo/banner if available
- Concise description with badges for build status, version, license
- Quick start section for immediate implementation
- Detailed features with bullet points or screenshots
- Installation steps in code blocks with command examples
- Usage examples with code snippets
- API documentation if applicable
- Contributing guidelines
- License information
- Support/contact details

Use modern markdown formatting with proper heading hierarchy, code syntax highlighting, and emoji for visual appeal.
The README should be ready for immediate use without requiring edits.
`;

        console.log('Sending prompt to Gemini API...');
        
        // Generate content using the correct API format
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Successfully generated README');
        return { readme: text, isGenericFallback: false };
    } catch (error) {
        console.error('AI Generation error:', error);
        console.log('Falling back to generic README generator');
        const genericReadme = generateGenericReadme(repoData, additionalInfo);
        return { readme: genericReadme, isGenericFallback: true };
    }
}

// Get file contents from GitHub repository
async function getFileContents(owner, repo, path, branch) {
    try {
        const response = await octokit.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
        });

        if (response.data.type !== 'file') {
            throw new Error('Path does not point to a file');
        }

        const content = Buffer.from(response.data.content, 'base64').toString('utf8');
        return content;
    } catch (error) {
        if (error.status === 404) {
            return null; // File not found
        }
        console.error('Error getting file contents:', error);
        throw error;
    }
}

// Route to check repository existence and get initial data
app.post('/api/check-repo', async (req, res) => {
    try {
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        const { owner, repo } = extractRepoInfo(repoUrl);

        try {
            const repoData = await getRepoData(owner, repo);
            const existingReadme = await getFileContents(owner, repo, 'README.md', repoData.defaultBranch).catch(() => null);

            return res.status(200).json({
                exists: true,
                repoData,
                hasReadme: !!existingReadme,
            });
        } catch (error) {
            if (error.message.includes('Not Found')) {
                return res.status(404).json({ exists: false, error: 'Repository not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error in /api/check-repo:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Route to generate README with basic info
app.post('/api/generate-readme', async (req, res) => {
    try {
        console.log('Received request to /api/generate-readme');
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        const { owner, repo } = extractRepoInfo(repoUrl);
        const repoData = await getRepoData(owner, repo);
        
        const { readme, isGenericFallback } = await generateReadmeWithAI(repoData, {}, owner, repo);

        return res.status(200).json({ readme, repoData, isGenericFallback });
    } catch (error) {
        console.error('Error in /api/generate-readme:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Route to generate README with detailed info
app.post('/api/generate-readme-detailed', async (req, res) => {
    try {
        console.log('Received request to /api/generate-readme-detailed', req.body);
        const { repoUrl, ...additionalInfo } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        const { owner, repo } = extractRepoInfo(repoUrl);
        console.log(`Extracted repo info: ${owner}/${repo}`);
        
        const repoData = await getRepoData(owner, repo);
        console.log('Retrieved repo data successfully');
        
        const { readme, isGenericFallback } = await generateReadmeWithAI(repoData, additionalInfo, owner, repo);
        
        console.log('Generated README, sending response');
        console.log('Is generic fallback:', isGenericFallback);

        return res.status(200).json({ readme, repoData, isGenericFallback });
    } catch (error) {
        console.error('Error in /api/generate-readme-detailed:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString() 
    });
});

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API key loaded: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`GitHub token loaded: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
});

module.exports = app;