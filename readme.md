# Minerva Agent - GitHub Pages Version

A web-based AI research and monitoring application deployed on GitHub Pages. This application helps monitor AI research websites, track influencer activity on X/Twitter, and provide AI-powered insights and chatting capabilities.

## Features

- **Website Monitoring**: Track and analyze content from AI research blogs and websites
- **X/Twitter Monitoring**: Follow and analyze tweets from leading AI influencers
- **Knowledge Base (RAG)**: Build a local knowledge base for more informed AI interactions
- **Direct Chat**: Communicate with AI models using different chat modes

## Directory Structure

```
minerva-agent/
│
├── index.html              # Main HTML file
├── js/
│   └── app.js              # JavaScript logic for the application
├── README.md               # Project documentation
└── .gitignore              # Git ignore file
```

## Setup and Deployment

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/yourusername/minerva-agent.git
   cd minerva-agent
   ```

2. Open `index.html` in your browser for testing

### Deploying to GitHub Pages

1. Create a GitHub repository for your project
   - Go to https://github.com/new
   - Name your repository (e.g., `minerva-agent`)
   - Click "Create repository"

2. Initialize the local repository and push to GitHub
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/minerva-agent.git
   git push -u origin main
   ```

3. Enable GitHub Pages
   - Go to your repository on GitHub
   - Navigate to "Settings" > "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be published at `https://yourusername.github.io/minerva-agent/`

## Customization

### API Keys

The application uses mock API functions for demonstration purposes. To connect with real APIs:

1. Open `js/app.js`
2. Replace the mock API functions with actual API calls
3. Update the API keys in the configuration section

### Adding New Features

To extend the functionality:

1. Add new HTML elements to `index.html`
2. Implement new JavaScript functions in `app.js`
3. Update the corresponding event listeners and UI logic

## Usage Notes

- This version uses browser localStorage for data persistence, which has limitations:
  - Data is stored only in the current browser
  - Storage size is limited (usually 5-10MB)
  - Data may be cleared by the user or browser settings
  
- For actual production use, consider integrating with:
  - Backend services for API calls and data processing
  - Database storage for persistent data
  - User authentication for personalized experiences

## Important Differences from Streamlit Version

1. **Client-side processing**: All operations run in the browser instead of on a server
2. **Data persistence**: Uses localStorage instead of server-side files
3. **API calls**: Made directly from the browser instead of from a Python backend
4. **Mock functionality**: Some APIs are mocked for demonstration purposes
5. **Reduced capabilities**: Some complex operations might require backend support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Streamlit app developed by [Original Author]
- GitHub Pages deployment by [Your Name]
