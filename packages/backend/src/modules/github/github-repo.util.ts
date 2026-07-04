import type { GithubRepo } from './interfaces/github.interfaces';

/**
 * Ranks repositories by portfolio signal: source repos over forks, then
 * stars, then last push, then size. Shared by the analysis and AI services.
 */
export const rankGithubRepos = (repositories: GithubRepo[]): GithubRepo[] =>
  [...repositories].sort((a, b) => {
    const forkWeight = Number(!b.fork) - Number(!a.fork);
    if (forkWeight !== 0) return forkWeight;
    const starWeight = b.stargazers_count - a.stargazers_count;
    if (starWeight !== 0) return starWeight;
    const recencyWeight =
      new Date(b.pushed_at || b.updated_at).getTime() -
      new Date(a.pushed_at || a.updated_at).getTime();
    if (recencyWeight !== 0) return recencyWeight;
    return b.size - a.size;
  });
