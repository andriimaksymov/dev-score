import { Injectable } from '@nestjs/common';
import { GithubData } from '../github/interfaces/github.interfaces';

/**
 * All scoring thresholds in one place so the rubric is reviewable at a
 * glance. Each *_TARGET is the value at which that factor saturates.
 */
const WEIGHTS = {
  activity: 1.0, // Activity is key
  projectQuality: 1.2, // Quality is king
  techStack: 0.8, // Broad stack is good but depth matters more
  consistency: 1.0, // Consistency shows discipline
} as const;

const ACTIVITY = {
  REPO_TARGET: 10, // public repos for full repo-count credit
  REPO_POINTS: 20,
  FOLLOWERS_TARGET: 20,
  FOLLOWERS_POINTS: 20,
  RECENT_EVENTS_TARGET: 20, // events in the recent window
  RECENT_EVENTS_POINTS: 30,
  STARS_TARGET: 50, // total stars across repos
  STARS_POINTS: 30,
} as const;

const QUALITY = {
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_POINTS: 15,
  HOMEPAGE_POINTS: 10,
  MIN_SIZE_KB: 100, // tiny repos should not auto-score on quality
  SIZE_POINTS: 5,
  TOPICS_POINTS: 10,
  ANY_STARS_POINTS: 10,
  POPULAR_STARS_THRESHOLD: 10,
  POPULAR_STARS_POINTS: 10,
  FRESH_MONTHS: 1,
  FRESH_POINTS: 20,
  MAINTAINED_MONTHS: 6,
  MAINTAINED_POINTS: 10,
  ISSUES_POINTS: 5,
  STANDARD_BRANCH_POINTS: 5,
  LANGUAGE_POINTS: 10,
  POPULAR_FORK_STARS: 5, // forks above this star count still count as personal work
} as const;

const TECH_STACK_LANGUAGE_TARGET = 10; // distinct languages for a full score

const CONSISTENCY_ACTIVE_WEEKS_TARGET = 12;

@Injectable()
export class ScoringService {
  calculateScore(githubData: GithubData) {
    const activityScore = this.calculateActivityScore(githubData);
    const projectQualityScore = this.calculateProjectQualityScore(githubData);
    const techStackScore = this.calculateTechStackScore(githubData);
    const consistencyScore = this.calculateConsistencyScore(githubData);

    const overall = Math.round(
      (activityScore * WEIGHTS.activity +
        projectQualityScore * WEIGHTS.projectQuality +
        techStackScore * WEIGHTS.techStack +
        consistencyScore * WEIGHTS.consistency) /
        4,
    );

    return {
      overall: Math.min(overall, 100),
      activity: activityScore,
      projectQuality: projectQualityScore,
      techStackDiversity: techStackScore,
      consistency: consistencyScore,
    };
  }

  private calculateActivityScore(githubData: GithubData): number {
    const { profile, repositories, events } = githubData;

    const repoCountScore =
      Math.min(profile.public_repos / ACTIVITY.REPO_TARGET, 1) *
      ACTIVITY.REPO_POINTS;
    const followersScore =
      Math.min(profile.followers / ACTIVITY.FOLLOWERS_TARGET, 1) *
      ACTIVITY.FOLLOWERS_POINTS;
    const recentActivityScore =
      Math.min(events.length / ACTIVITY.RECENT_EVENTS_TARGET, 1) *
      ACTIVITY.RECENT_EVENTS_POINTS;
    const starsScore =
      Math.min(
        repositories.reduce(
          (sum, repo) => sum + (repo.stargazers_count || 0),
          0,
        ) / ACTIVITY.STARS_TARGET,
        1,
      ) * ACTIVITY.STARS_POINTS;

    return Math.round(
      repoCountScore + followersScore + starsScore + recentActivityScore,
    );
  }

  private calculateProjectQualityScore(githubData: GithubData): number {
    const { repositories } = githubData;
    if (!repositories || repositories.length === 0) return 0;

    // Judge personal work: skip forks unless they gathered their own stars.
    const sourceRepos = repositories.filter(
      (repo) =>
        !repo.fork || repo.stargazers_count > QUALITY.POPULAR_FORK_STARS,
    );
    const reposToAnalyze = sourceRepos.length > 0 ? sourceRepos : repositories;

    let totalScore = 0;

    reposToAnalyze.forEach((repo) => {
      let repoScore = 0;

      if (
        repo.description &&
        repo.description.length > QUALITY.DESCRIPTION_MIN_LENGTH
      ) {
        repoScore += QUALITY.DESCRIPTION_POINTS;
      }
      if (repo.homepage) repoScore += QUALITY.HOMEPAGE_POINTS;
      if (repo.size > QUALITY.MIN_SIZE_KB) repoScore += QUALITY.SIZE_POINTS;
      if (repo.topics && repo.topics.length > 0)
        repoScore += QUALITY.TOPICS_POINTS;
      if (repo.stargazers_count > 0) repoScore += QUALITY.ANY_STARS_POINTS;
      if (repo.stargazers_count > QUALITY.POPULAR_STARS_THRESHOLD)
        repoScore += QUALITY.POPULAR_STARS_POINTS;

      // Maintenance recency uses pushed_at (last code push); updated_at also
      // moves on metadata-only changes like renames or stars.
      const lastPush = repo.pushed_at || repo.updated_at;
      const monthsSincePush =
        (new Date().getTime() - new Date(lastPush).getTime()) /
        (1000 * 60 * 60 * 24 * 30);
      if (monthsSincePush < QUALITY.FRESH_MONTHS)
        repoScore += QUALITY.FRESH_POINTS;
      else if (monthsSincePush < QUALITY.MAINTAINED_MONTHS)
        repoScore += QUALITY.MAINTAINED_POINTS;

      if (repo.has_issues) repoScore += QUALITY.ISSUES_POINTS;
      if (['main', 'master'].includes(repo.default_branch))
        repoScore += QUALITY.STANDARD_BRANCH_POINTS;
      if (repo.language) repoScore += QUALITY.LANGUAGE_POINTS;

      totalScore += Math.min(repoScore, 100);
    });

    return Math.round(totalScore / reposToAnalyze.length);
  }

  private calculateTechStackScore(githubData: GithubData): number {
    const { repositories } = githubData;

    const languages = new Set();
    repositories.forEach((repo) => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });

    const diversityScore =
      Math.min(languages.size / TECH_STACK_LANGUAGE_TARGET, 1) * 100;

    return Math.round(diversityScore);
  }

  private calculateConsistencyScore(githubData: GithubData): number {
    const { events } = githubData;

    if (events.length === 0) return 0;

    // Group events by week
    const weeklyActivity = new Map();

    events.forEach((event) => {
      const date = new Date(event.created_at);
      const weekKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;

      weeklyActivity.set(weekKey, (weeklyActivity.get(weekKey) || 0) + 1);
    });

    const activeWeeks = weeklyActivity.size;
    const consistencyScore =
      Math.min(activeWeeks / CONSISTENCY_ACTIVE_WEEKS_TARGET, 1) * 100;

    return Math.round(consistencyScore);
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
