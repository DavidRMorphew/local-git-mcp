# 🔍 Local Git MCP Server

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue)](https://www.typescriptlang.org/)
[![Apache 2.0 License](https://img.shields.io/badge/license-Apache%202.0-green)](LICENSE)

> **Supercharge your AI coding assistant with offline access to your local Git repositories**

Transform any MCP-compatible client (like GitHub Copilot Chat) into a powerful code assistant that can search, analyze, and reference your local documentation and codebase - completely offline.

## ✨ Why Use This?

- 🏠 **Fully Offline** - No data leaves your machine
- 📚 **Smart Documentation Search** - Fuzzy search across README files, docs folders, and more
- 🔎 **Intelligent Code Analysis** - Regex-based code search with context
- ⚡ **Lightning Fast** - In-memory indexing for instant results
- 🤖 **AI-Ready** - Perfect integration with GitHub Copilot Chat and other MCP clients

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Your favorite MCP-compatible client (GitHub Copilot Chat, etc.)

### 1. Installation & Setup

```bash
# Clone and install
git clone https://git@github.com:DavidRMorphew/local-git-mcp.git
cd local-git-mcp
npm install

# Build the project
npm run build

# Start the server
npm start
```

### 2. Clone Target Repositories Locally

**Important**: You need to have the repositories you want to search cloned locally on your machine.

```bash
# Example: Clone the repos you want to search
git clone https://github.com/your-org/your-project.git /Users/you/projects/your-project
git clone https://github.com/facebook/react.git /Users/you/repos/react
```

### 3. Configure Your MCP Client

Create a `mcp.json` file in your project's `.vscode` folder:

```json
{
  "servers": {
    "local-git-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/local-git-mcp/dist/index.js"]
    }
  }
}
```

### 4. Start Using It!

Ask your AI assistant to search your **locally cloned** repos using their **full local paths**:

```
💬 "Use local-git-mcp to search for 'authentication setup' in /Users/you/projects/your-project"
💬 "Use search_documentation with repository_path '/Users/you/repos/react' and query 'hooks'"
💬 "Find error handling patterns in /Users/you/projects/my-app using search_code"
```

> 💡 **Key Point**: Always provide the full local file system path to your cloned repository in your queries!

## 🛠 Available Tools

| Tool                   | Purpose                           | Example Usage                                  |
| ---------------------- | --------------------------------- | ---------------------------------------------- |
| `fetch_documentation`  | Get all documentation files       | Extract READMEs, docs/, CONTRIBUTING files     |
| `search_documentation` | Fuzzy search across docs and code | Find "JWT implementation" across your codebase |
| `search_code`          | Regex-based code search           | Search for specific functions or patterns      |

## 📖 Usage Examples

### Search Documentation

```
Use search_documentation with:
- repository_path: "/Users/you/projects/my-app" (local clone path)
- query: "database migration"
```

### Find Code Patterns

```
Use search_code with:
- repository_path: "/Users/you/projects/my-app" (local clone path)
- query: "async.*fetch"
- file_pattern: "**/*.ts"
```

### Fetch All Docs

```
Use fetch_documentation with:
- repository_path: "/Users/you/projects/my-app" (local clone path)
```

> ⚠️ **Remember**: The `repository_path` must point to a **locally cloned** Git repository on your file system!

## 🎯 Perfect For

- **Learning New Codebases** - Quickly understand project structure and conventions
- **Code Reviews** - Find similar patterns and best practices in your existing code
- **Documentation Discovery** - Surface relevant docs you didn't know existed
- **Refactoring** - Find all usages of patterns you want to change
- **Onboarding** - Help new team members navigate large projects

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │───▶│  Local Git MCP   │───▶│  Git Repository │
│ (Copilot Chat)  │    │     Server       │    │   (Your Code)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

The server creates in-memory indexes of your documentation and code, enabling fast fuzzy search and regex-based analysis without requiring network access.

## 🔧 Development

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

### Key Components

- **Search Index**: Powered by Fuse.js for fuzzy matching
- **File Discovery**: Smart pattern matching for docs and code files
- **Snippet Extraction**: Context-aware result highlighting
- **Memory Management**: Efficient in-memory caching per repository

### Search Implementation Details

<details>
<summary>🔍 How Search Works (Click to expand)</summary>

**Fuzzy Search (`search_documentation`)**

- Indexes documentation (README*, docs/\*\*/*.md) and code files
- Uses Fuse.js with weighted scoring: content (70%), title (20%), file path (10%)
- Supports quoted exact phrases and multi-word queries
- Results are deduplicated and ranked by relevance

**Regex Search (`search_code`)**

- Scans up to 50 code files with case-insensitive regex
- Returns matches with 2 lines of context before/after
- Supports file pattern filtering

**Performance Notes**

- Indexes are kept in-memory per repository path
- Large repositories auto-limit to 50 files for regex search
- No network access required - fully offline operation

</details>

## 📝 License

Apache 2.0 License - see [LICENSE](LICENSE) file for details.

## 🙏 Attribution

This project builds upon concepts and implementations from the original [git-mcp](https://github.com/idosal/git-mcp) project, which is licensed under the Apache 2.0 License.

## 🤝 Contributing

Contributions welcome! This MCP server helps developers work more efficiently with their local codebases.

---

<div align="center">
<sub>Built with ❤️ for the developer community</sub>
</div>
