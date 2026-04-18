# Rawi AI (راوي) 🖋️

**Rawi AI** is a professional Arabic novel writing assistant designed to help authors create, manage, and write their masterpieces. With AI-powered plot generation, character management, and an intuitive Arabic-first editor, Rawi makes the creative process seamless and inspiring.

## ✨ Features

- 📖 **Novel Library**: Organize and manage multiple novel projects.
- 🤖 **AI Plot Generation**: Get inspiration for your story arcs and synopses.
- ✍️ **Intelligent Editor**: A clean, focused writing environment with auto-save.
- 👥 **Character Management**: Track your characters, their traits, and roles.
- 📤 **Export to PDF**: Generate print-ready versions of your chapters.
- 🌍 **Public Library**: Share your work and explore novels by other authors.
- 🌓 **RTL & Dark Mode**: Fully optimized for Arabic writing with customizable themes.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rawi-ai.git
   cd rawi-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Copy `.env.example` to `.env` and fill in your details.
   ```bash
   cp .env.example .env
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Run in development mode:
   ```bash
   npm run dev
   ```

## 🛠️ Deployment

### Google Cloud (Cloud Run)
You can deploy this application using the provided `Dockerfile`:
```bash
gcloud run deploy rawi-ai --source .
```

### Render
This project includes a `render.yaml` file for easy deployment on Render.com:
1. Create a new "Blueprint" on Render.
2. Connect your GitHub repository.
3. Render will automatically setup the Web Service and PostgreSQL database.
4. Add your OpenAI and Firebase keys in the Render Dashboard Environment Variables.

### GitHub
This repository is pre-configured for GitHub. Ensure you don't commit your `.env` file (it's already in `.gitignore`).

### Netlify
While this is a full-stack app, you can deploy the frontend to Netlify by setting the build command to `npm run build` and the publish directory to `dist/public`. Note that the API will need a separate backend hosting (like Railway or GCP).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

تم التطوير بكل ❤️ لدعم المحتوى العربي.
Developed with ❤️ to support Arabic content.
