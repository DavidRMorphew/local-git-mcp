import Fuse from "fuse.js";

export interface SearchResult {
  content: string;
  filePath: string;
  score: number;
  matches?: any[];
  type?: "documentation" | "code";
}

export class SearchService {
  private indexes: Map<string, Fuse<any>> = new Map();

  createIndex(
    repositoryPath: string,
    documents: Array<{
      content: string;
      filePath: string;
      title?: string;
      type?: "documentation" | "code";
    }>
  ) {
    const options = {
      keys: [
        { name: "content", weight: 0.7 },
        { name: "title", weight: 0.2 },
        { name: "filePath", weight: 0.1 },
      ],
      threshold: 0.4, // More lenient fuzzy matching
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2, // Allow shorter matches
      ignoreLocation: true, // Don't penalize matches based on location in text
      distance: 1000, // Allow matches further apart
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

    // Enhanced query processing for multi-word queries
    const processedQueries = this.processQuery(query);
    let allResults: SearchResult[] = [];

    for (const processedQuery of processedQueries) {
      const results = index.search(processedQuery, { limit: limit * 2 });

      const mappedResults = results.map((result) => ({
        content: result.item.content,
        filePath: result.item.filePath,
        score: result.score || 0,
        matches: result.matches ? [...result.matches] : undefined,
        type: result.item.type,
      }));

      allResults = allResults.concat(mappedResults);
    }

    // Remove duplicates and sort by score
    const uniqueResults = this.deduplicateResults(allResults);
    return uniqueResults
      .sort((a, b) => a.score - b.score) // Lower score = better match in Fuse.js
      .slice(0, limit);
  }

  private processQuery(query: string): string[] {
    const trimmedQuery = query.trim();

    // If query is in quotes, treat as exact phrase
    if (
      (trimmedQuery.startsWith('"') && trimmedQuery.endsWith('"')) ||
      (trimmedQuery.startsWith("'") && trimmedQuery.endsWith("'"))
    ) {
      return [trimmedQuery.slice(1, -1)];
    }

    // Split multi-word queries and create different search strategies
    const words = trimmedQuery.split(/\s+/).filter((word) => word.length > 0);

    if (words.length === 1) {
      return [trimmedQuery];
    }

    // Return multiple query variations:
    // 1. Original full query (for phrase-like matching)
    // 2. Individual words (for OR-like behavior)
    return [trimmedQuery, ...words.filter((word) => word.length >= 2)];
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter((result) => {
      const key = result.filePath;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  hasIndex(repositoryPath: string): boolean {
    return this.indexes.has(repositoryPath);
  }

  clearIndex(repositoryPath: string): void {
    this.indexes.delete(repositoryPath);
  }
}
