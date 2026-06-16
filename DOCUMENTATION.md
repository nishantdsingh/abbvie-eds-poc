# Documentation Quick Start

## 🚀 Running the Documentation

The AEM Multi-Brand documentation is now configured to run on **port 3030** to avoid conflicts with the main app on port 3000.

### Quick Setup

1. **Install documentation dependencies:**
```bash
cd docs
./setup-docs.sh
```

2. **Start the documentation server:**
```bash
npm start
```

3. **Access the documentation:**
Open [http://localhost:3030](http://localhost:3030) in your browser

### Running Both Apps Simultaneously

To run both the main AEM app and documentation at the same time:

```bash
# From the project root
npm run start:all
```

This will start:
- **Main AEM App**: http://localhost:3000
- **Documentation**: http://localhost:3030
- **Theme Server**: Running in background

### Individual Commands

```bash
# Main app only
npm start

# Documentation only
npm run docs:start

# Build documentation
npm run docs:build

# Deploy documentation to GitHub Pages
npm run docs:deploy
```

## 📚 Documentation Structure

- **Getting Started**: `/docs/intro`
- **Theme Management**: `/docs/theme-management`
- **Components**: `/docs/blocks-components`
- **Development**: `/docs/development-workflow`
- **Deployment**: `/docs/deployment`

## 🔧 Configuration

- **Port**: 3030 (configured in `docs/package.json`)
- **Base URL**: `/eds-multi-brand/` (for GitHub Pages)
- **Framework**: Docusaurus 3.x

## 📝 Adding Content

1. **Create new pages** in `docs/docs/`
2. **Update sidebar** in `docs/sidebars.ts`
3. **Add images** to `docs/static/img/`
4. **Customize styles** in `docs/src/css/custom.css`

## 🚀 Deployment

The documentation automatically deploys to GitHub Pages when you push to the main branch.

Manual deployment:
```bash
npm run docs:deploy
```

## 🆘 Troubleshooting

### Port Issues
If port 3030 is busy:
```bash
npm start -- --port 3031
```

### Dependencies
If you encounter dependency issues:
```bash
cd docs
rm -rf node_modules package-lock.json
npm install
```

### Build Issues
Clear cache and rebuild:
```bash
cd docs
npm run clear
npm run build
```

## 📖 More Information

- **Full Documentation**: See `docs/README.md`
- **Docusaurus Docs**: https://docusaurus.io/docs
- **Project Issues**: https://github.com/adobe/eds-multi-brand/issues 