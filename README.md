# ReadMI - AI-Powered README Generator

ReadMI is a modern web application that helps developers create professional README files for their GitHub repositories using AI. The application streamlines the documentation process, saving developers time and ensuring consistent, high-quality project documentation.

## Features

- **AI-Powered README Generation**: Leverages AI to create comprehensive README files tailored to your project
- **GitHub Integration**: Connect with GitHub to easily access your repositories
- **Real-time Preview**: See your generated README before downloading
- **Fallback System**: Provides template-based README generation when AI service is unavailable
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **AI Integration**: OpenAI API
- **Authentication**: GitHub OAuth

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- GitHub account (for authentication)
- OpenAI API key (for AI generation)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/readmi-gen.git
   cd readmi-gen
   ```

2. Install dependencies for both client and server
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables
   - Create `.env` files in both client and server directories based on provided examples

4. Start the development servers
   ```bash
   # Start server
   cd server
   npm run dev
   
   # Start client in another terminal
   cd client
   npm start
   ```

## Usage

1. Sign in with your GitHub account
2. Select a repository from your GitHub account
3. Provide additional information if needed
4. Generate your README using AI
5. Preview, copy, or download the generated README

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
