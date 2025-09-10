import Fuse from "fuse.js";

export interface SearchResult {
  content: string;
  filePath: string;
  score: number;
  matches?: any[];
}

export class SearchService {
  private indexes: Map<string, Fuse<any>> = new Map();

  createIndex(
    repositoryPath: string,
    documents: Array<{ content: string; filePath: string; title?: string }>
  ) {
    const options = {
      keys: [
        { name: "content", weight: 0.7 },
        { name: "title", weight: 0.3 },
        { name: "filePath", weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
    };

    const fuse = new Fuse(documents, options);
    this.indexes.set(repositoryPath, fuse);

    return fuse;
  }

  search(
    repositoryPath: string,
    query: string,
    limit: number = 10
  ): SearchResult[] {
    const index = this.indexes.get(repositoryPath);
    if (!index) {
      throw new Error(
        `No search index found for repository: ${repositoryPath}`
      );
    }

    const results = index.search(query, { limit });

    return results.map((result) => ({
      content: result.item.content,
      filePath: result.item.filePath,
      score: result.score || 0,
      matches: result.matches ? [...result.matches] : undefined,
    }));
  }

  hasIndex(repositoryPath: string): boolean {
    return this.indexes.has(repositoryPath);
  }

  clearIndex(repositoryPath: string): void {
    this.indexes.delete(repositoryPath);
  }
}
