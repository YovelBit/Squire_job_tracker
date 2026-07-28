import { Job } from '../api/jobs';
import {
  applyQuickFilter,
  formatActivePipelineBreakdown,
  getActionItemsCount,
  getActivePipeline,
  getResponseRate,
  getWeeklyMomentum
} from './kpiMetrics';

const job = (overrides: Partial<Job>): Job => ({
  public_id: overrides.public_id ?? Math.random().toString(),
  company_display: 'Acme',
  title_display: 'Engineer',
  status: 'Applied',
  ...overrides
});

const NOW = new Date('2026-07-28T12:00:00.000Z');

describe('getWeeklyMomentum', () => {
  it('counts applications within the last 7 and last 30 days', () => {
    const jobs = [
      job({ date_applied: '2026-07-27' }), // 1 day ago -> in both
      job({ date_applied: '2026-07-20' }), // 8 days ago -> in 30 only
      job({ date_applied: '2026-07-01' }), // 27 days ago -> in 30 only
      job({ date_applied: '2026-05-01' }), // way outside -> neither
      job({}) // no date_applied -> ignored
    ];
    expect(getWeeklyMomentum(jobs, NOW)).toEqual({ last7: 1, last30: 3 });
  });

  it('returns zeros for an empty jobs array', () => {
    expect(getWeeklyMomentum([], NOW)).toEqual({ last7: 0, last30: 0 });
  });
});

describe('getResponseRate', () => {
  it('computes rounded percentage of Interview + Offer + Offer_Accepted over total', () => {
    const jobs = [
      job({ status: 'Applied' }),
      job({ status: 'Interview' }),
      job({ status: 'Offer' }),
      job({ status: 'Offer_Accepted' })
    ];
    // 3 responded / 4 total = 75%
    expect(getResponseRate(jobs)).toBe(75);
  });

  it('returns 0 when there are no applications, avoiding division by zero', () => {
    expect(getResponseRate([])).toBe(0);
  });
});

describe('getActivePipeline', () => {
  it('excludes Rejected and buckets Interview/Offer counts', () => {
    const jobs = [
      job({ status: 'Applied' }),
      job({ status: 'Interview' }),
      job({ status: 'Interview' }),
      job({ status: 'Offer' }),
      job({ status: 'Offer_Accepted' }),
      job({ status: 'Rejected' })
    ];
    expect(getActivePipeline(jobs)).toEqual({ activeCount: 5, interviewCount: 2, offerCount: 2 });
  });
});

describe('formatActivePipelineBreakdown', () => {
  it('formats a two-part breakdown with correct pluralization', () => {
    expect(formatActivePipelineBreakdown({ activeCount: 3, interviewCount: 2, offerCount: 1 })).toBe(
      '2 Interviews • 1 Offer'
    );
  });

  it('returns an empty string when there are no interviews or offers', () => {
    expect(formatActivePipelineBreakdown({ activeCount: 1, interviewCount: 0, offerCount: 0 })).toBe('');
  });
});

describe('getActionItemsCount', () => {
  it('counts jobs whose next_action is today or earlier', () => {
    const jobs = [
      job({ next_action: '2026-07-27' }), // overdue
      job({ next_action: '2026-07-28' }), // due today
      job({ next_action: '2026-08-01' }), // future -> not counted
      job({}) // no next_action -> not counted
    ];
    expect(getActionItemsCount(jobs, NOW)).toBe(2);
  });
});

describe('applyQuickFilter', () => {
  const jobs = [
    job({ public_id: 'a', status: 'Rejected', next_action: undefined }),
    job({ public_id: 'b', status: 'Interview', next_action: '2026-08-01' }),
    job({ public_id: 'c', status: 'Applied', next_action: undefined })
  ];

  it('returns all jobs when quickFilter is null', () => {
    expect(applyQuickFilter(jobs, null)).toEqual(jobs);
  });

  it('activePipeline excludes Rejected jobs', () => {
    expect(applyQuickFilter(jobs, 'activePipeline').map((j) => j.public_id)).toEqual(['b', 'c']);
  });

  it('actionItems keeps only jobs with a next_action set', () => {
    expect(applyQuickFilter(jobs, 'actionItems').map((j) => j.public_id)).toEqual(['b']);
  });
});
