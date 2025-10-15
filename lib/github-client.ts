import { Octokit } from '@octokit/rest';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  private: boolean;
  updated_at: string | null;
  created_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }>;
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Fetch user's public repositories
   * @param perPage Number of results per page (default: 50)
   * @returns Array of repositories
   */
  async getUserRepositories(perPage: number = 50): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        type: 'public',
        sort: 'updated',
        per_page: perPage,
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        private: repo.private,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
      }));
    } catch (error: unknown) {
      const errorStatus = typeof error === 'object' && error !== null && 'status' in error 
        ? (error as { status: number }).status 
        : undefined;
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorStatus === 401) {
        throw new Error('Unable to access GitHub. Try logging in again.');
      }
      if (errorStatus === 403 && errorMessage.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch repositories: ${errorMessage}`);
    }
  }

  /**
   * Fetch commits for a specific repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param perPage Number of results per page (default: 50)
   * @param since Optional: only commits after this date
   * @returns Array of commits
   */
  async getRepositoryCommits(
    owner: string,
    repo: string,
    perPage: number = 50,
    since?: string
  ): Promise<GitHubCommit[]> {
    try {
      const params: { owner: string; repo: string; per_page: number; since?: string } = {
        owner,
        repo,
        per_page: perPage,
      };

      if (since) {
        params.since = since;
      }

      const { data } = await this.octokit.rest.repos.listCommits(params);

      return data as GitHubCommit[];
    } catch (error: unknown) {
      const errorStatus = typeof error === 'object' && error !== null && 'status' in error 
        ? (error as { status: number }).status 
        : undefined;
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorStatus === 401) {
        throw new Error('Unable to access GitHub. Try logging in again.');
      }
      if (errorStatus === 403 && errorMessage.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch commits: ${errorMessage}`);
    }
  }

  /**
   * Fetch a single commit with full details (including stats)
   * @param owner Repository owner
   * @param repo Repository name
   * @param sha Commit SHA
   * @returns Commit with stats
   */
  async getCommit(
    owner: string,
    repo: string,
    sha: string
  ): Promise<GitHubCommit> {
    try {
      const { data } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });

      return data as GitHubCommit;
    } catch (error: unknown) {
      const errorStatus = typeof error === 'object' && error !== null && 'status' in error 
        ? (error as { status: number }).status 
        : undefined;
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorStatus === 401) {
        throw new Error('Unable to access GitHub. Try logging in again.');
      }
      if (errorStatus === 403 && errorMessage.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch commit: ${errorMessage}`);
    }
  }

  /**
   * Get authenticated user's GitHub profile
   * @returns User profile data
   */
  async getUserProfile() {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return {
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name,
        email: data.email,
      };
    } catch (error: unknown) {
      const errorStatus = typeof error === 'object' && error !== null && 'status' in error 
        ? (error as { status: number }).status 
        : undefined;
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorStatus === 401) {
        throw new Error('Unable to access GitHub. Try logging in again.');
      }
      if (errorStatus === 403 && errorMessage.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch user profile: ${errorMessage}`);
    }
  }

  /**
   * Check rate limit status
   * @returns Rate limit information
   */
  async getRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1000),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch rate limit: ${errorMessage}`);
    }
  }
}

/**
 * Create a new GitHub client instance
 * @param accessToken GitHub access token from OAuth
 * @returns GitHubClient instance
 */
export function createGitHubClient(accessToken: string): GitHubClient {
  return new GitHubClient(accessToken);
}
