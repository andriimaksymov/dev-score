export interface GithubProfile {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  topics: string[];
  homepage: string | null;
  size: number;
  default_branch: string;
  has_issues: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GithubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: unknown;
  public: boolean;
  created_at: string;
}

export interface GithubData {
  profile: GithubProfile;
  repositories: GithubRepo[];
  events: GithubEvent[];
}
