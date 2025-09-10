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
        output.push(
          `## Result ${index + 1} (Score: ${(1 - result.score).toFixed(2)})`
        );
        output.push(`**File:** ${result.filePath}\n`);

        // Show relevant snippet
        const snippet = this.extractSnippet(result.content, query);
        output.push(snippet);
        output.push("\n---\n");
      });

      return output.join("\n");
    } catch (error) {
      throw new Error(`Search failed: ${error}`);
    }
  }

  private async buildSearchIndex(repositoryPath: string): Promise<void> {
    const docFiles = await this.fileService.findDocumentationFiles(
      repositoryPath
    );
    const documents: Array<{
      content: string;
      filePath: string;
      title?: string;
    }> = [];

    for (const fileInfo of docFiles) {
      try {
        const docFile = await this.fileService.readDocumentationFile(
          fileInfo.path
        );
        documents.push({
          content: docFile.content,
          filePath: fileInfo.relativePath,
          title: docFile.frontMatter?.title || fileInfo.relativePath,
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
    maxLength: number = 300
  ): string {
    const words = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    // Find the best match position
    let bestPosition = 0;
    let bestScore = 0;

    for (const word of words) {
      const position = contentLower.indexOf(word);
      if (position !== -1) {
        const score = words.filter((w) =>
          contentLower.substring(position, position + maxLength).includes(w)
        ).length;

        if (score > bestScore) {
          bestScore = score;
          bestPosition = Math.max(0, position - 50);
        }
      }
    }

    const snippet = content.substring(bestPosition, bestPosition + maxLength);
    const prefix = bestPosition > 0 ? "..." : "";
    const suffix = bestPosition + maxLength < content.length ? "..." : "";

    return `${prefix}${snippet}${suffix}`;
  }
}
