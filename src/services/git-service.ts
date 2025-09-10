import simpleGit, { SimpleGit } from "simple-git";
import { existsSync } from "fs";
import { join } from "path";

export interface GitInfo {
  repositoryPath: string;
  currentBranch: string;
  remoteUrl?: string;
  isClean: boolean;
}

export class GitService {
  async validateRepository(repositoryPath: string): Promise<boolean> {
    try {
      const gitDir = join(repositoryPath, ".git");
      return existsSync(gitDir);
    } catch {
      return false;
    }
  }

  async getRepositoryInfo(repositoryPath: string): Promise<GitInfo> {
    if (!(await this.validateRepository(repositoryPath))) {
      throw new Error(`Invalid git repository: ${repositoryPath}`);
    }

    const git: SimpleGit = simpleGit(repositoryPath);

    try {
      const currentBranch = await git.revparse(["--abbrev-ref", "HEAD"]);
      const status = await git.status();
      const remotes = await git.getRemotes(true);

      return {
        repositoryPath,
        currentBranch: currentBranch.trim(),
        remoteUrl: remotes.find((r) => r.name === "origin")?.refs?.fetch,
        isClean: status.files.length === 0,
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error}`);
    }
  }

  async getFileHistory(
    repositoryPath: string,
    filePath: string,
    limit: number = 10
  ) {
    const git: SimpleGit = simpleGit(repositoryPath);

    try {
      const log = await git.log({
        file: filePath,
        maxCount: limit,
      });

      return log.all.map((commit) => ({
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
        author: commit.author_name,
      }));
    } catch (error) {
      throw new Error(`Failed to get file history: ${error}`);
    }
  }
}
