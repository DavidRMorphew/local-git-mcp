import { readFile, stat } from "fs/promises";
import { join, extname, basename } from "path";
import glob from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";
import { lookup } from "mime-types";

export interface FileInfo {
  path: string;
  relativePath: string;
  size: number;
  modified: Date;
  extension: string;
  mimeType: string;
}

export interface DocumentationFile extends FileInfo {
  content: string;
  frontMatter?: any;
  htmlContent?: string;
}

export class FileService {
  private readonly DOCUMENTATION_PATTERNS = [
    "**/README*",
    "**/readme*",
    "**/docs/**/*.md",
    "**/docs/**/*.mdx",
    "**/documentation/**/*.md",
    "**/*.md",
    "**/CONTRIBUTING*",
    "**/CHANGELOG*",
    "**/LICENSE*",
    "**/llms.txt",
  ];

  private readonly CODE_PATTERNS = [
    "**/*.ts",
    "**/*.js",
    "**/*.jsx",
    "**/*.tsx",
    "**/*.py",
    "**/*.java",
    "**/*.c",
    "**/*.cpp",
    "**/*.cs",
    "**/*.go",
    "**/*.rs",
    "**/*.php",
    "**/*.rb",
    "**/*.swift",
    "**/*.kotlin",
  ];

  async findDocumentationFiles(repositoryPath: string): Promise<FileInfo[]> {
    const files = await glob(this.DOCUMENTATION_PATTERNS, {
      cwd: repositoryPath,
      ignore: ["**/node_modules/**", "**/.*/**", "**/dist/**", "**/build/**"],
    });

    const fileInfos: FileInfo[] = [];

    for (const file of files) {
      try {
        const fullPath = join(repositoryPath, file);
        const stats = await stat(fullPath);

        fileInfos.push({
          path: fullPath,
          relativePath: file,
          size: stats.size,
          modified: stats.mtime,
          extension: extname(file),
          mimeType: lookup(file) || "text/plain",
        });
      } catch (error) {
        console.warn(`Error processing file ${file}:`, error);
      }
    }

    // Sort by priority: README first, then by modification date
    return fileInfos.sort((a, b) => {
      const aIsReadme = basename(a.relativePath)
        .toLowerCase()
        .startsWith("readme");
      const bIsReadme = basename(b.relativePath)
        .toLowerCase()
        .startsWith("readme");

      if (aIsReadme && !bIsReadme) return -1;
      if (!aIsReadme && bIsReadme) return 1;

      return b.modified.getTime() - a.modified.getTime();
    });
  }

  async findCodeFiles(
    repositoryPath: string,
    pattern?: string
  ): Promise<FileInfo[]> {
    const patterns = pattern ? [pattern] : this.CODE_PATTERNS;

    const files = await glob(patterns, {
      cwd: repositoryPath,
      ignore: ["**/node_modules/**", "**/.*/**", "**/dist/**", "**/build/**"],
    });

    const fileInfos: FileInfo[] = [];

    for (const file of files) {
      try {
        const fullPath = join(repositoryPath, file);
        const stats = await stat(fullPath);

        fileInfos.push({
          path: fullPath,
          relativePath: file,
          size: stats.size,
          modified: stats.mtime,
          extension: extname(file),
          mimeType: lookup(file) || "text/plain",
        });
      } catch (error) {
        console.warn(`Error processing file ${file}:`, error);
      }
    }

    return fileInfos;
  }

  async readDocumentationFile(filePath: string): Promise<DocumentationFile> {
    try {
      const content = await readFile(filePath, "utf-8");
      const stats = await stat(filePath);
      const extension = extname(filePath);
      const relativePath = filePath; // You might want to make this relative to repo root

      let frontMatter: any = undefined;
      let processedContent = content;
      let htmlContent: string | undefined = undefined;

      // Process markdown files
      if ([".md", ".mdx"].includes(extension.toLowerCase())) {
        const parsed = matter(content);
        frontMatter = parsed.data;
        processedContent = parsed.content;

        try {
          htmlContent = await marked(processedContent);
        } catch (error) {
          console.warn(`Error parsing markdown for ${filePath}:`, error);
        }
      }

      return {
        path: filePath,
        relativePath,
        size: stats.size,
        modified: stats.mtime,
        extension,
        mimeType: lookup(filePath) || "text/plain",
        content: processedContent,
        frontMatter,
        htmlContent,
      };
    } catch (error) {
      throw new Error(
        `Failed to read documentation file ${filePath}: ${error}`
      );
    }
  }

  async readFileContent(filePath: string): Promise<string> {
    try {
      return await readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }
}
