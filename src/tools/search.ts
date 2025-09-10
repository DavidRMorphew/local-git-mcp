import { GitService } from "../services/git-service.js";
import { FileService } from "../services/file-service.js";
import { SearchService } from "../services/search-service.js";

export class SearchTool {
  constructor(
    private gitService: GitService,
    private fileService: FileService,
    private searchService: SearchService
  ) {}

  async execute(args: {
    repository_path: string;
    query: string;
  }): Promise<string> {
    const { repository_path, query } = args;

    // Validate repository
    if (!(await this.gitService.validateRepository(repository_path))) {
      throw new Error(`Invalid git repository: ${repository_path}`);
    }

    try {
      // Check if we have an existing search index
      if (!this.searchService.hasIndex(repository_path)) {
        await this.buildSearchIndex(repository_path);
      }

      // Perform search
      const results = this.searchService.search(repository_path, query, 10);

      if (results.length === 0) {
        return `No results found for query: "${query}" in ${repository_path}`;
      }

      const output: string[] = [];
      output.push(`# Search Results for: "${query}"\n`);
      output.push(`Found ${results.length} matches in ${repository_path}\n`);

      results.forEach((result, index) => {
        const fileType = result.type || "unknown";
        const typeIcon = fileType === "code" ? "💻" : "📄";

        output.push(
          `## ${typeIcon} Result ${index + 1} (Score: ${(
            1 - result.score
          ).toFixed(2)}) [${fileType}]`
        );
        output.push(`**File:** ${result.filePath}\n`);

        // Show relevant snippet
        const snippet = this.extractSnippet(result.content, query, fileType);
        output.push(snippet);
        output.push("\n---\n");
      });

      return output.join("\n");
    } catch (error) {
      throw new Error(`Search failed: ${error}`);
    }
  }

  private async buildSearchIndex(repositoryPath: string): Promise<void> {
    // Get both documentation and code files
    const docFiles = await this.fileService.findDocumentationFiles(
      repositoryPath
    );
    const codeFiles = await this.fileService.findCodeFiles(repositoryPath);

    const documents: Array<{
      content: string;
      filePath: string;
      title?: string;
      type: "documentation" | "code";
    }> = [];

    // Index documentation files
    for (const fileInfo of docFiles) {
      try {
        const docFile = await this.fileService.readDocumentationFile(
          fileInfo.path
        );
        documents.push({
          content: docFile.content,
          filePath: fileInfo.relativePath,
          title: docFile.frontMatter?.title || fileInfo.relativePath,
          type: "documentation",
        });
      } catch (error) {
        console.warn(`Error indexing ${fileInfo.relativePath}:`, error);
      }
    }

    // Index code files
    for (const fileInfo of codeFiles) {
      try {
        const content = await this.fileService.readFileContent(fileInfo.path);
        documents.push({
          content,
          filePath: fileInfo.relativePath,
          title: fileInfo.relativePath,
          type: "code",
        });
      } catch (error) {
        console.warn(`Error indexing ${fileInfo.relativePath}:`, error);
      }
    }

    this.searchService.createIndex(repositoryPath, documents);
  }

  private extractSnippet(
    content: string,
    query: string,
    fileType: string = "unknown",
    maxLength: number = 300
  ): string {
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2);
    const contentLower = content.toLowerCase();

    // Find the best match position considering all query words
    let bestPosition = 0;
    let bestScore = 0;

    // Try to find a region that contains multiple query terms
    for (let i = 0; i < content.length - maxLength; i += 50) {
      const region = contentLower.substring(i, i + maxLength);
      const score = words.reduce((count, word) => {
        return count + (region.includes(word) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = i;
      }
    }

    // If no good region found, fall back to first occurrence of any word
    if (bestScore === 0) {
      for (const word of words) {
        const position = contentLower.indexOf(word);
        if (position !== -1) {
          bestPosition = Math.max(0, position - 50);
          break;
        }
      }
    }

    // For code files, try to include complete lines
    if (fileType === "code") {
      const lines = content.split("\n");
      let startLine = 0;
      let charCount = 0;

      // Find which line the best position falls in
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= bestPosition) {
          startLine = Math.max(0, i - 2); // Include 2 lines before for context
          break;
        }
        charCount += lines[i].length + 1; // +1 for newline
      }

      // Extract complete lines up to maxLength
      let snippet = "";
      let currentLength = 0;
      let lineCount = 0;

      for (
        let i = startLine;
        i < lines.length && currentLength < maxLength;
        i++
      ) {
        const line = lines[i];
        if (currentLength + line.length > maxLength && lineCount > 0) break;

        snippet += (lineCount > 0 ? "\n" : "") + line;
        currentLength += line.length + (lineCount > 0 ? 1 : 0);
        lineCount++;
      }

      const prefix = startLine > 0 ? `... (line ${startLine + 1})\n` : "";
      const suffix =
        startLine + lineCount < lines.length ? `\n... (continues)` : "";

      return `\`\`\`\n${prefix}${snippet}${suffix}\n\`\`\``;
    }

    // For documentation files, use the original approach
    const snippet = content.substring(bestPosition, bestPosition + maxLength);
    const prefix = bestPosition > 0 ? "..." : "";
    const suffix = bestPosition + maxLength < content.length ? "..." : "";

    return `${prefix}${snippet}${suffix}`;
  }
}
