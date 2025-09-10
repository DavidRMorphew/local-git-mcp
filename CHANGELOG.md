# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-10

### Added

- Initial release of Local Git MCP Server
- Offline documentation and code search capabilities
- Three core tools: `fetch_documentation`, `search_documentation`, `search_code`
- Fuzzy search powered by Fuse.js with intelligent query processing
- Regex-based code search with contextual snippets
- In-memory indexing for fast performance
- Support for multiple documentation patterns (README\*, docs/\*\*, etc.)
- MCP-compatible interface for AI assistants like GitHub Copilot Chat
- Comprehensive TypeScript implementation
- Apache 2.0 license with proper attribution

### Features

- **Smart Documentation Discovery**: Automatically finds and indexes README files, docs folders, and other documentation
- **Intelligent Search**: Fuzzy search with weighted scoring (content 70%, title 20%, file path 10%)
- **Code Pattern Matching**: Regex-based search across code files with context
- **Offline Operation**: No network access required - fully local operation
- **Memory Efficient**: In-memory caching per repository with automatic cleanup
- **Extensible Architecture**: Clean separation of services and tools

### Technical Details

- Built with TypeScript 5.3+
- Requires Node.js 18+
- Uses stdio for MCP communication
- Supports ESM modules
- Comprehensive error handling and logging
