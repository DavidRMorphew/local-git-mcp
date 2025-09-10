# Contributing to Local Git MCP Server

Thank you for considering contributing to Local Git MCP Server! This project helps developers work more efficiently with their local codebases by providing AI assistants with offline access to documentation and code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Git
- TypeScript knowledge

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/local-git-mcp.git
   cd local-git-mcp
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Run in Development Mode**
   ```bash
   npm run dev
   ```

## 🛠 Development Workflow

### Project Structure

```
src/
├── services/           # Core business logic
│   ├── file-service.ts    # File discovery and reading
│   ├── git-service.ts     # Git repository operations
│   └── search-service.ts  # Search and indexing
├── tools/              # MCP tool implementations
│   ├── documentation.ts   # Documentation fetching
│   ├── search.ts          # Fuzzy search
│   └── code-analysis.ts   # Code pattern search
└── index.ts            # Server entry point
```

### Code Style

- **TypeScript**: Use strict TypeScript with proper typing
- **ES Modules**: Project uses ESM imports/exports
- **Error Handling**: Always handle errors gracefully with meaningful messages
- **Documentation**: Comment complex logic and public APIs
- **Naming**: Use descriptive variable and function names

### Testing

Currently the project relies on manual testing. When contributing:

1. Test your changes with actual MCP clients (like GitHub Copilot Chat)
2. Verify both small and large repositories work correctly
3. Test edge cases like empty repositories or missing files
4. Ensure memory usage remains reasonable

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Reproduction Steps**: Step-by-step instructions to reproduce
- **Expected vs Actual**: What you expected vs what happened
- **Environment**: Node.js version, OS, repository size/type
- **Logs**: Any relevant error messages or logs

## ✨ Feature Requests

We welcome feature requests! Please include:

- **Use Case**: Why this feature would be useful
- **Description**: Detailed description of the proposed feature
- **Examples**: Mock-ups or examples if applicable
- **Implementation Ideas**: Any thoughts on implementation

## 📝 Pull Requests

### Before You Start

- Check existing issues and PRs to avoid duplication
- For large features, consider opening an issue first to discuss

### PR Process

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test Your Changes**

   - Build the project: `npm run build`
   - Test with real repositories
   - Verify no regressions in existing functionality

4. **Commit Your Changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:

   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `perf:` for performance improvements

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Guidelines

- **Title**: Clear, descriptive title
- **Description**: Explain what and why, not just how
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Clearly mark any breaking changes

## 🔒 Security

If you discover a security vulnerability, please send an email to [security contact] instead of opening a public issue.

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

## ❓ Questions

- **General Questions**: Open a GitHub discussion
- **Bug Reports**: Open a GitHub issue
- **Feature Requests**: Open a GitHub issue with the "enhancement" label

## 🙏 Recognition

Contributors will be recognized in:

- CHANGELOG.md for their contributions
- GitHub contributors list
- Special thanks for significant contributions

Thank you for helping make Local Git MCP Server better! 🎉
