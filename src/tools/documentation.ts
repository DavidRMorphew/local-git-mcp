import { GitService } from "../services/git-service.js";
import { FileService } from "../services/file-service.js";

export class DocumentationTool {
  constructor(
    private gitService: GitService,
    private fileService: FileService
  ) {}

  async execute(args: { repository_path: string }): Promise<string> {
    const { repository_path } = args;

    // Validate repository
    if (!(await this.gitService.validateRepository(repository_path))) {
      throw new Error(`Invalid git repository: ${repository_path}`);
    }

    try {
      // Get repository info
      const repoInfo = await this.gitService.getRepositoryInfo(repository_path);

      // Find documentation files
      const docFiles = await this.fileService.findDocumentationFiles(
        repository_path
      );

      if (docFiles.length === 0) {
        return `No documentation files found in ${repository_path}`;
      }

      // Read and process documentation files (prioritize README)
      const results: string[] = [];
      results.push(`# Documentation for ${repository_path}\n`);
      results.push(`**Repository Branch:** ${repoInfo.currentBranch}`);
      if (repoInfo.remoteUrl) {
        results.push(`**Remote URL:** ${repoInfo.remoteUrl}`);
      }
      results.push(`**Status:** ${repoInfo.isClean ? "Clean" : "Modified"}\n`);

      // Process up to 5 most important documentation files
      const filesToProcess = docFiles.slice(0, 5);

      for (const fileInfo of filesToProcess) {
        try {
          const docFile = await this.fileService.readDocumentationFile(
            fileInfo.path
          );

          results.push(`## ${fileInfo.relativePath}\n`);

          if (
            docFile.frontMatter &&
            Object.keys(docFile.frontMatter).length > 0
          ) {
            results.push("**Metadata:**");
            results.push(JSON.stringify(docFile.frontMatter, null, 2));
            results.push("");
          }

          results.push(docFile.content);
          results.push("\n---\n");
        } catch (error) {
          results.push(`Error reading ${fileInfo.relativePath}: ${error}\n`);
        }
      }

      if (docFiles.length > 5) {
        results.push(
          `\n*Note: ${
            docFiles.length - 5
          } additional documentation files available.*`
        );
      }

      return results.join("\n");
    } catch (error) {
      throw new Error(`Failed to fetch documentation: ${error}`);
    }
  }
}
