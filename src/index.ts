import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { GitService } from "./services/git-service.js";
import { FileService } from "./services/file-service.js";
import { SearchService } from "./services/search-service.js";
import { DocumentationTool } from "./tools/documentation.js";
import { SearchTool } from "./tools/search.js";
import { CodeAnalysisTool } from "./tools/code-analysis.js";

class LocalGitMCPServer {
  private server: Server;
  private gitService: GitService;
  private fileService: FileService;
  private searchService: SearchService;
  private tools: Map<string, any>;

  constructor() {
    this.server = new Server(
      {
        name: "local-git-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.gitService = new GitService();
    this.fileService = new FileService();
    this.searchService = new SearchService();
    this.tools = new Map();

    this.setupTools();
    this.setupHandlers();
  }

  private setupTools() {
    const documentationTool = new DocumentationTool(
      this.gitService,
      this.fileService
    );
    const searchTool = new SearchTool(
      this.gitService,
      this.fileService,
      this.searchService
    );
    const codeAnalysisTool = new CodeAnalysisTool(
      this.gitService,
      this.fileService
    );

    // Register tools
    this.tools.set("fetch_documentation", documentationTool);
    this.tools.set("search_documentation", searchTool);
    this.tools.set("search_code", codeAnalysisTool);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "fetch_documentation",
          description:
            "Fetch documentation from a local git repository (README, docs/, etc.)",
          inputSchema: {
            type: "object",
            properties: {
              repository_path: {
                type: "string",
                description: "Path to the local git repository",
              },
            },
            required: ["repository_path"],
          },
        },
        {
          name: "search_documentation",
          description: "Search through documentation in a local git repository",
          inputSchema: {
            type: "object",
            properties: {
              repository_path: {
                type: "string",
                description: "Path to the local git repository",
              },
              query: {
                type: "string",
                description: "Search query",
              },
            },
            required: ["repository_path", "query"],
          },
        },
        {
          name: "search_code",
          description: "Search through code files in a local git repository",
          inputSchema: {
            type: "object",
            properties: {
              repository_path: {
                type: "string",
                description: "Path to the local git repository",
              },
              query: {
                type: "string",
                description: "Code search query",
              },
              file_pattern: {
                type: "string",
                description: "Optional file pattern (e.g., '*.ts', '*.py')",
              },
            },
            required: ["repository_path", "query"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = this.tools.get(name);
      if (!tool) {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }

      try {
        const result = await tool.execute(args);
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Local Git MCP Server running on stdio");
  }
}

// Start the server
const server = new LocalGitMCPServer();
server.run().catch(console.error);
