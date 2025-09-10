import { GitService } from "../services/git-service.js";
import { FileService } from "../services/file-service.js";

export class CodeAnalysisTool {
  constructor(
    private gitService: GitService,
    private fileService: FileService
  ) {}

  async execute(args: {
    repository_path: string;
    query: string;
    file_pattern?: string;
  }): Promise<string> {
    const { repository_path, query, file_pattern } = args;

    // Validate repository
    if (!(await this.gitService.validateRepository(repository_path))) {
      throw new Error(`Invalid git repository: ${repository_path}`);
    }

    try {
      // Find code files
      const codeFiles = await this.fileService.findCodeFiles(
        repository_path,
        file_pattern
      );

      if (codeFiles.length === 0) {
        return `No code files found in ${repository_path}${
          file_pattern ? ` matching pattern: ${file_pattern}` : ""
        }`;
      }

      // Search through code files
      const results: Array<{
        filePath: string;
        matches: Array<{ line: number; content: string; context: string[] }>;
      }> = [];
      const queryRegex = new RegExp(query, "gi");

      for (const fileInfo of codeFiles.slice(0, 50)) {
        // Limit to 50 files
        try {
          const content = await this.fileService.readFileContent(fileInfo.path);
          const lines = content.split("\n");
          const matches: Array<{
            line: number;
            content: string;
            context: string[];
          }> = [];

          lines.forEach((line, index) => {
            if (queryRegex.test(line)) {
              const contextStart = Math.max(0, index - 2);
              const contextEnd = Math.min(lines.length, index + 3);
              const context = lines.slice(contextStart, contextEnd);

              matches.push({
                line: index + 1,
                content: line,
                context,
              });
            }
          });

          if (matches.length > 0) {
            results.push({
              filePath: fileInfo.relativePath,
              matches: matches.slice(0, 5), // Limit matches per file
            });
          }
        } catch (error) {
          console.warn(`Error searching in ${fileInfo.relativePath}:`, error);
        }
      }

      if (results.length === 0) {
        return `No matches found for "${query}" in code files`;
      }

      // Format results
      const output: string[] = [];
      output.push(`# Code Search Results for: "${query}"\n`);
      output.push(`Found matches in ${results.length} files\n`);

      results.forEach((result) => {
        output.push(`## ${result.filePath}\n`);

        result.matches.forEach((match) => {
          output.push(`**Line ${match.line}:**`);
          output.push("```");
          match.context.forEach((contextLine, i) => {
            const lineNum = match.line - 2 + i;
            const isMatchLine = i === 2;
            const marker = isMatchLine ? ">" : " ";
            output.push(`${marker} ${lineNum}: ${contextLine}`);
          });
          output.push("```\n");
        });

        output.push("---\n");
      });

      return output.join("\n");
    } catch (error) {
      throw new Error(`Code search failed: ${error}`);
    }
  }
}
