import { Job } from '../api/jobs';

export type QuickFilter = 'actionItems' | 'activePipeline' | null;

const daysAgo = (days: number, now: Date): Date => {
  const result = new Date(now);
  result.setDate(result.getDate() - days);
  return result;
};

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export interface WeeklyMomentum {
  last7: number;
  last30: number;
}

export const getWeeklyMomentum = (jobs: Job[], now: Date = new Date()): WeeklyMomentum => {
  const cutoff7 = daysAgo(7, now);
  const cutoff30 = daysAgo(30, now);
  let last7 = 0;
  let last30 = 0;
  for (const j of jobs) {
    const applied = parseDate(j.date_applied);
    if (!applied) continue;
    if (applied >= cutoff30) last30 += 1;
    if (applied >= cutoff7) last7 += 1;
  }
  return { last7, last30 };
};

export const getResponseRate = (jobs: Job[]): number => {
  if (jobs.length === 0) return 0;
  const responded = jobs.filter(
    (j) => j.status === 'Interview' || j.status === 'Offer' || j.status === 'Offer_Accepted'
  ).length;
  return Math.round((responded / jobs.length) * 100);
};

export interface ActivePipeline {
  activeCount: number;
  interviewCount: number;
  offerCount: number;
}

export const getActivePipeline = (jobs: Job[]): ActivePipeline => {
  const active = jobs.filter((j) => j.status !== 'Rejected');
  const interviewCount = active.filter((j) => j.status === 'Interview').length;
  const offerCount = active.filter((j) => j.status === 'Offer' || j.status === 'Offer_Accepted').length;
  return { activeCount: active.length, interviewCount, offerCount };
};

export const formatActivePipelineBreakdown = (pipeline: ActivePipeline): string => {
  const parts: string[] = [];
  if (pipeline.interviewCount > 0) {
    parts.push(`${pipeline.interviewCount} Interview${pipeline.interviewCount === 1 ? '' : 's'}`);
  }
  if (pipeline.offerCount > 0) {
    parts.push(`${pipeline.offerCount} Offer${pipeline.offerCount === 1 ? '' : 's'}`);
  }
  return parts.join(' • ');
};

export const getActionItemsCount = (jobs: Job[], now: Date = new Date()): number => {
  return jobs.filter((j) => {
    const nextAction = parseDate(j.next_action);
    return nextAction !== null && nextAction <= now;
  }).length;
};

export const applyQuickFilter = (jobs: Job[], quickFilter: QuickFilter): Job[] => {
  if (quickFilter === 'actionItems') {
    return jobs.filter((j) => Boolean(j.next_action));
  }
  if (quickFilter === 'activePipeline') {
    return jobs.filter((j) => j.status !== 'Rejected');
  }
  return jobs;
};
