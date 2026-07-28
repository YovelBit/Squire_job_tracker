# Hero Metric Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4-card KPI bar to the dashboard header (Weekly Momentum, Response Rate, Active Pipeline, Action Items), computed client-side from the existing `jobs` array, with click-to-filter behavior on two of the cards.

**Architecture:** A pure-function metrics module (`utils/kpiMetrics.ts`) computes all four metrics and a client-side quick-filter predicate from the `Job[]` array already held in `DashboardPage`. A new `KpiCard` (dumb, reusable) and `KpiBar` (computes metrics via `useMemo`, renders four `KpiCard`s, owns the click-toggle logic) are added to `frontend/src/components/`. `DashboardPage` gets one new piece of state, `quickFilter`, and applies it on top of the existing search-filtered `visibleJobs` before handing rows to `JobTable`. No backend changes, no new API endpoints — matches the spec's "no new API endpoints required" constraint and the fact that exclusion/date-relative filters (e.g. "not Rejected", "next_action <= today") cannot be expressed by the existing single-value-equality `JobFilter`/`/jobs/filter` endpoint.

**Tech Stack:** React 18 + TypeScript (Vite 6), plain global CSS (no Tailwind/CSS-in-JS exists in this repo despite the spec's Tailwind-flavored class names — those are translated to equivalent plain CSS). Vitest + React Testing Library are net-new additions (no test framework currently exists in `frontend/`).

## Global Constraints

- No new backend/API endpoints — all four metrics and both quick-filters are computed entirely from the `Job[]` array already fetched by `DashboardPage` (spec §5, "Frontend State Management").
- Layout: responsive grid, 1 column → 2 columns → 4 columns (spec's `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`, translated to plain CSS media queries at 640px / 1024px since this repo has no Tailwind).
- Component names must be exactly `KpiBar` and `KpiCard` (spec §5).
- `KpiCard` must accept `title`, `value`, `subtitle`, `isActive`, `onClick` props (spec §5); this plan adds one extra optional prop, `isWarning`, for the Action Items amber-border state (spec §3, "Visual State").
- Response Rate must render `0%` when total applications is `0` (spec §3, explicit zero-division guard).
- Metrics must recalculate automatically whenever `jobs` changes (add/edit/delete) — satisfied for free by deriving everything from the `jobs` prop with `useMemo`, since `DashboardPage` already calls `fetchJobs()` after every create/update/delete.
- **Codebase reality that overrides literal spec wording** (documented here since the plan deviates from the spec text, not from oversight):
  - This app's `status` values are exactly `Applied`, `Home_Assignment`, `Interview`, `Offer`, `Offer_Accepted`, `Rejected` (`app/models.py:53` `CheckConstraint`). There is **no `Withdrawn` status**. Everywhere the spec says "not Rejected or Withdrawn," this plan implements "not Rejected."
  - The spec's `applied_date` field is actually `date_applied` on `Job` (`frontend/src/api/jobs.ts:11`). The spec's `next_action_date` field is actually `next_action` (`frontend/src/api/jobs.ts:12`), a plain date string with no separate "completed" flag.
  - Response Rate's "Interviews + Offers" bucket counts `status === 'Interview' || status === 'Offer' || status === 'Offer_Accepted'` (treating an accepted offer as still counting as an offer).
  - Action Items' primary count (spec §3) is strictly `next_action <= today` (overdue only). The click-to-filter table view (spec §4) is intentionally broader — "pending or overdue" — and shows every job with a `next_action` set at all, since there is no separate "pending vs. overdue" flag in the data model.

---

## Task 1: Vitest + React Testing Library infrastructure

No test framework exists in `frontend/` today (`package.json` has no test script or test dependencies). This task adds one so later tasks can follow TDD.

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/tsconfig.json`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/test/setup.test.ts`

**Interfaces:**
- Produces: `npm run test` (in `frontend/`) runs Vitest once in `jsdom` environment with RTL/jest-dom matchers globally available (`describe`/`it`/`expect`/`toBeInTheDocument` usable without imports) — later tasks rely on this.

- [ ] **Step 1: Install test dependencies**

Run in `frontend/`:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Add the Vitest config block to `vite.config.ts`**

Replace the full contents of `frontend/vite.config.ts` with:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
});
```

- [ ] **Step 3: Add the setup file**

Create `frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Register test globals in `tsconfig.json`**

In `frontend/tsconfig.json`, change the `"types"` line from:

```json
    "types": ["vite/client"]
```

to:

```json
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
```

- [ ] **Step 5: Add the `test` script to `package.json`**

In `frontend/package.json`, add `"test": "vitest run"` to `"scripts"`:

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest run"
  },
```

- [ ] **Step 6: Write a smoke test verifying jsdom + RTL + jest-dom are wired correctly**

Create `frontend/src/test/setup.test.ts`:

```ts
import { render, screen } from '@testing-library/react';

describe('test infrastructure smoke test', () => {
  it('renders into jsdom and jest-dom matchers work', () => {
    render(<div>hello kpi bar</div>);
    expect(screen.getByText('hello kpi bar')).toBeInTheDocument();
  });
});
```

Note: this file has JSX so it must actually be named `setup.test.tsx`, not `.ts`. Create it as `frontend/src/test/setup.test.tsx` (delete any `.ts` version if one was created).

- [ ] **Step 7: Run the test suite**

Run: `cd frontend && npm run test`
Expected: 1 test file, 1 test, PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/tsconfig.json frontend/src/test/setup.ts frontend/src/test/setup.test.tsx
git commit -m "test: add Vitest + React Testing Library infrastructure"
```

---

## Task 2: KPI metrics utility module

Pure, framework-free functions that compute the four metrics and the quick-filter predicate from a `Job[]` array. Kept dependency-free (native `Date`, no date library — matches the rest of the frontend, which has none) and fully unit-testable without rendering React.

**Files:**
- Create: `frontend/src/utils/kpiMetrics.ts`
- Test: `frontend/src/utils/kpiMetrics.test.ts`

**Interfaces:**
- Consumes: `Job` from `frontend/src/api/jobs.ts` (`public_id`, `status`, `date_applied?`, `next_action?`).
- Produces (used by Task 4's `KpiBar`, and by Task 5's `DashboardPage`):
  - `type QuickFilter = 'actionItems' | 'activePipeline' | null`
  - `getWeeklyMomentum(jobs: Job[], now?: Date): { last7: number; last30: number }`
  - `getResponseRate(jobs: Job[]): number` — integer 0-100
  - `getActivePipeline(jobs: Job[]): { activeCount: number; interviewCount: number; offerCount: number }`
  - `formatActivePipelineBreakdown(pipeline: ActivePipeline): string` — e.g. `"2 Interviews • 1 Offer"`, or `""` if both are zero
  - `getActionItemsCount(jobs: Job[], now?: Date): number`
  - `applyQuickFilter(jobs: Job[], quickFilter: QuickFilter): Job[]`

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/utils/kpiMetrics.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npm run test -- kpiMetrics`
Expected: FAIL — `Cannot find module './kpiMetrics'` (file doesn't exist yet).

- [ ] **Step 3: Implement the module**

Create `frontend/src/utils/kpiMetrics.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && npm run test -- kpiMetrics`
Expected: PASS, all 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/kpiMetrics.ts frontend/src/utils/kpiMetrics.test.ts
git commit -m "feat: add pure KPI metrics calculation utilities"
```

---

## Task 3: `KpiCard` reusable display component

**Files:**
- Create: `frontend/src/components/KpiCard.tsx`
- Test: `frontend/src/components/KpiCard.test.tsx`
- Modify: `frontend/src/styles/index.css`

**Interfaces:**
- Consumes: nothing new (plain props).
- Produces (used by Task 4's `KpiBar`):

```ts
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isActive?: boolean;
  isWarning?: boolean;
  onClick?: () => void;
}
```

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/components/KpiCard.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import KpiCard from './KpiCard';

describe('KpiCard', () => {
  it('renders title, value, and subtitle', () => {
    render(<KpiCard title="Weekly Momentum" value={3} subtitle="12 in the last 30 days" />);
    expect(screen.getByText('Weekly Momentum')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12 in the last 30 days')).toBeInTheDocument();
  });

  it('omits the subtitle element when none is given', () => {
    render(<KpiCard title="Response Rate" value="42%" />);
    expect(screen.queryByText(/in the last/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked, and is keyboard-activatable', () => {
    const onClick = vi.fn();
    render(<KpiCard title="Active Pipeline" value={5} onClick={onClick} />);
    const card = screen.getByRole('button', { name: /Active Pipeline/i });
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('is not a button role when onClick is not provided', () => {
    render(<KpiCard title="Weekly Momentum" value={3} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies the active class when isActive is true', () => {
    render(<KpiCard title="Active Pipeline" value={5} isActive onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('active');
  });

  it('applies the warning class when isWarning is true', () => {
    render(<KpiCard title="Action Items" value={2} isWarning onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('warning');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npm run test -- KpiCard`
Expected: FAIL — `Cannot find module './KpiCard'`.

- [ ] **Step 3: Implement the component**

Create `frontend/src/components/KpiCard.tsx`:

```tsx
import { KeyboardEvent } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  isActive?: boolean;
  isWarning?: boolean;
  onClick?: () => void;
}

const KpiCard = ({ title, value, subtitle, isActive, isWarning, onClick }: Props) => {
  const classNames = ['kpi-card'];
  if (onClick) classNames.push('clickable');
  if (isActive) classNames.push('active');
  if (isWarning) classNames.push('warning');

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classNames.join(' ')}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? isActive ?? false : undefined}
    >
      <p className="kpi-card-title muted">{title}</p>
      <p className="kpi-card-value">{value}</p>
      {subtitle && <p className="kpi-card-subtitle muted">{subtitle}</p>}
    </div>
  );
};

export default KpiCard;
```

- [ ] **Step 4: Add KPI card CSS**

Append to `frontend/src/styles/index.css`:

```css
.kpi-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
}

.kpi-card.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.kpi-card.clickable:hover {
  transform: translateY(-1px);
}

.kpi-card.active {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
}

.kpi-card.warning {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.kpi-card-title {
  margin: 0 0 6px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-card-value {
  margin: 0 0 4px;
  font-size: 1.8rem;
  font-weight: 700;
}

.kpi-card-subtitle {
  margin: 0;
  font-size: 0.85rem;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd frontend && npm run test -- KpiCard`
Expected: PASS, all 6 tests green.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/KpiCard.tsx frontend/src/components/KpiCard.test.tsx frontend/src/styles/index.css
git commit -m "feat: add reusable KpiCard component"
```

---

## Task 4: `KpiBar` parent component

Computes all four metrics from a `jobs` prop via `useMemo`, renders the responsive grid of four `KpiCard`s, and owns the toggle logic for which quick-filter is active (clicking an already-active card clears it).

**Files:**
- Create: `frontend/src/components/KpiBar.tsx`
- Test: `frontend/src/components/KpiBar.test.tsx`
- Modify: `frontend/src/styles/index.css`

**Interfaces:**
- Consumes: `Job` and nothing else from `frontend/src/api/jobs.ts`; `QuickFilter`, `getWeeklyMomentum`, `getResponseRate`, `getActivePipeline`, `formatActivePipelineBreakdown`, `getActionItemsCount` from `frontend/src/utils/kpiMetrics.ts` (Task 2); `KpiCard` from `frontend/src/components/KpiCard.tsx` (Task 3).
- Produces (used by Task 5's `DashboardPage`):

```ts
interface KpiBarProps {
  jobs: Job[];
  activeFilter: QuickFilter;
  onFilterToggle: (filter: QuickFilter) => void;
}
```

`KpiBar` calls `onFilterToggle(null)` if the clicked card's filter is already active, otherwise `onFilterToggle('activePipeline' | 'actionItems')`.

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/components/KpiBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Job } from '../api/jobs';
import KpiBar from './KpiBar';

const job = (overrides: Partial<Job>): Job => ({
  public_id: overrides.public_id ?? Math.random().toString(),
  company_display: 'Acme',
  title_display: 'Engineer',
  status: 'Applied',
  ...overrides
});

const jobs: Job[] = [
  job({ public_id: '1', status: 'Interview', date_applied: '2026-07-27' }),
  job({ public_id: '2', status: 'Offer', date_applied: '2026-07-27' }),
  job({ public_id: '3', status: 'Rejected', date_applied: '2026-07-01' }),
  job({ public_id: '4', status: 'Applied', next_action: '2020-01-01' })
];

describe('KpiBar', () => {
  it('renders all four KPI cards with computed values', () => {
    render(<KpiBar jobs={jobs} activeFilter={null} onFilterToggle={() => {}} />);
    expect(screen.getByText('Weekly Momentum')).toBeInTheDocument();
    expect(screen.getByText('Response Rate')).toBeInTheDocument();
    expect(screen.getByText('Active Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Action Items')).toBeInTheDocument();
    // Active Pipeline excludes the Rejected job -> 3 active
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders 0% response rate for an empty jobs array without throwing', () => {
    render(<KpiBar jobs={[]} activeFilter={null} onFilterToggle={() => {}} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('toggles activePipeline filter on when its card is clicked', async () => {
    const onFilterToggle = vi.fn();
    const user = userEvent.setup();
    render(<KpiBar jobs={jobs} activeFilter={null} onFilterToggle={onFilterToggle} />);
    await user.click(screen.getByText('Active Pipeline'));
    expect(onFilterToggle).toHaveBeenCalledWith('activePipeline');
  });

  it('toggles activePipeline filter off when its card is already active', async () => {
    const onFilterToggle = vi.fn();
    const user = userEvent.setup();
    render(<KpiBar jobs={jobs} activeFilter="activePipeline" onFilterToggle={onFilterToggle} />);
    await user.click(screen.getByText('Active Pipeline'));
    expect(onFilterToggle).toHaveBeenCalledWith(null);
  });

  it('marks the Action Items card as warning when its count is greater than zero', () => {
    render(<KpiBar jobs={jobs} activeFilter={null} onFilterToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /Action Items/i })).toHaveClass('warning');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npm run test -- KpiBar`
Expected: FAIL — `Cannot find module './KpiBar'`.

- [ ] **Step 3: Implement the component**

Create `frontend/src/components/KpiBar.tsx`:

```tsx
import { useMemo } from 'react';
import { Job } from '../api/jobs';
import {
  QuickFilter,
  formatActivePipelineBreakdown,
  getActionItemsCount,
  getActivePipeline,
  getResponseRate,
  getWeeklyMomentum
} from '../utils/kpiMetrics';
import KpiCard from './KpiCard';

interface Props {
  jobs: Job[];
  activeFilter: QuickFilter;
  onFilterToggle: (filter: QuickFilter) => void;
}

const KpiBar = ({ jobs, activeFilter, onFilterToggle }: Props) => {
  const momentum = useMemo(() => getWeeklyMomentum(jobs), [jobs]);
  const responseRate = useMemo(() => getResponseRate(jobs), [jobs]);
  const pipeline = useMemo(() => getActivePipeline(jobs), [jobs]);
  const actionItemsCount = useMemo(() => getActionItemsCount(jobs), [jobs]);

  const pipelineBreakdown = formatActivePipelineBreakdown(pipeline) || 'No active interviews or offers yet';

  const toggle = (filter: 'activePipeline' | 'actionItems') => {
    onFilterToggle(activeFilter === filter ? null : filter);
  };

  return (
    <div className="kpi-grid">
      <KpiCard
        title="Weekly Momentum"
        value={momentum.last7}
        subtitle={`${momentum.last30} in the last 30 days`}
      />
      <KpiCard title="Response Rate" value={`${responseRate}%`} subtitle="Interviews + Offers / Total" />
      <KpiCard
        title="Active Pipeline"
        value={pipeline.activeCount}
        subtitle={pipelineBreakdown}
        isActive={activeFilter === 'activePipeline'}
        onClick={() => toggle('activePipeline')}
      />
      <KpiCard
        title="Action Items"
        value={actionItemsCount}
        subtitle={actionItemsCount > 0 ? 'Needs attention' : 'All caught up'}
        isActive={activeFilter === 'actionItems'}
        isWarning={actionItemsCount > 0}
        onClick={() => toggle('actionItems')}
      />
    </div>
  );
};

export default KpiBar;
```

- [ ] **Step 4: Add the responsive grid CSS**

Append to `frontend/src/styles/index.css`:

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

@media (min-width: 640px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd frontend && npm run test -- KpiBar`
Expected: PASS, all 5 tests green.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/KpiBar.tsx frontend/src/components/KpiBar.test.tsx frontend/src/styles/index.css
git commit -m "feat: add KpiBar component with click-to-filter toggle logic"
```

---

## Task 5: Wire `KpiBar` into `DashboardPage`

Adds the `quickFilter` state, renders `KpiBar` above the filter bar, applies the quick filter on top of the existing search-filtered jobs before they reach `JobTable`, and makes the existing "Clear Filters" button also reset the quick filter.

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Test: `frontend/src/pages/DashboardPage.test.tsx`

**Interfaces:**
- Consumes: `KpiBar` (Task 4), `QuickFilter` and `applyQuickFilter` from `frontend/src/utils/kpiMetrics.ts` (Task 2).

- [ ] **Step 1: Write the failing test**

Create `frontend/src/pages/DashboardPage.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';
import * as jobsApi from '../api/jobs';

vi.mock('../api/jobs', async () => {
  const actual = await vi.importActual<typeof import('../api/jobs')>('../api/jobs');
  return {
    ...actual,
    filterJobs: vi.fn(),
    createJob: vi.fn(),
    updateJob: vi.fn(),
    deleteJob: vi.fn()
  };
});

const sampleJobs: jobsApi.Job[] = [
  {
    public_id: '1',
    company_display: 'Acme',
    title_display: 'Engineer',
    status: 'Interview',
    date_applied: '2026-07-25'
  },
  {
    public_id: '2',
    company_display: 'Globex',
    title_display: 'Designer',
    status: 'Rejected',
    date_applied: '2026-07-01'
  }
];

describe('DashboardPage KPI click-to-filter', () => {
  beforeEach(() => {
    vi.mocked(jobsApi.filterJobs).mockResolvedValue(sampleJobs);
  });

  it('hides Rejected jobs when Active Pipeline is clicked, and restores them on a second click', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getByText('Globex')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Active Pipeline/i }));
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.queryByText('Globex')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Active Pipeline/i }));
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('clears an active quick filter when Clear Filters is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Active Pipeline/i }));
    expect(screen.queryByText('Globex')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm run test -- DashboardPage`
Expected: FAIL — no "Active Pipeline" button exists yet in the rendered output.

- [ ] **Step 3: Wire `KpiBar` into `DashboardPage`**

In `frontend/src/pages/DashboardPage.tsx`:

Add imports (after the existing `JobTable` import, before the `LoadingSpinner` import, keeping the alphabetical-ish grouping already in the file):

```tsx
import KpiBar from '../components/KpiBar';
```

and change the `../api/jobs` import line to also bring in the metrics helpers from Task 2:

```tsx
import { Job, JobCreate, JobFilter, JobUpdate, createJob, deleteJob, filterJobs, updateJob } from '../api/jobs';
import { QuickFilter, applyQuickFilter } from '../utils/kpiMetrics';
```

Add a new piece of state next to the existing ones (after `const [searchTerm, setSearchTerm] = useState('');`):

```tsx
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
```

Update `handleClearFilters` to also reset it:

```tsx
  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setQuickFilter(null);
  };
```

Add a `tableJobs` memo directly below the existing `visibleJobs` memo (after its closing `}, [jobs, searchTerm]);`):

```tsx
  const tableJobs = useMemo(() => applyQuickFilter(visibleJobs, quickFilter), [visibleJobs, quickFilter]);
```

In the JSX, insert `<KpiBar />` as the first child inside the top-level fragment, before `<FilterBar .../>`:

```tsx
  return (
    <>
      <KpiBar jobs={jobs} activeFilter={quickFilter} onFilterToggle={setQuickFilter} />

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onClearFilters={handleClearFilters}
      />
```

And change the `JobTable`'s `jobs` prop from `visibleJobs` to `tableJobs`:

```tsx
        <JobTable
          jobs={tableJobs}
          onEdit={openEditModal}
          onDelete={handleDeleteJob}
          orderBy={orderBy}
          descending={descending}
          onSortChange={handleSortChange}
        />
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npm run test -- DashboardPage`
Expected: PASS, both tests green.

- [ ] **Step 5: Run the full test suite**

Run: `cd frontend && npm run test`
Expected: All test files pass (Task 1's smoke test, Task 2's `kpiMetrics`, Task 3's `KpiCard`, Task 4's `KpiBar`, Task 5's `DashboardPage`).

- [ ] **Step 6: Verify the production build and type-check still succeed**

Run: `cd frontend && npm run build`
Expected: `tsc -b` and `vite build` both succeed with no type errors.

- [ ] **Step 7: Manual smoke check**

Run: `cd frontend && npm run dev`, open the dashboard in a browser, and confirm:
- Four KPI cards render above the filter bar and reflow from 1 → 2 → 4 columns as the viewport widens.
- Clicking "Active Pipeline" hides Rejected jobs from the table and puts a blue ring on the card; clicking it again restores them.
- Clicking "Action Items" filters the table to jobs with a next action set; clicking again clears it.
- If any job has an overdue `next_action`, the Action Items card shows an amber border.
- Adding, editing, or deleting a job updates all four card values without a page reload.
- "Clear Filters" also clears whichever KPI card filter is active.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx frontend/src/pages/DashboardPage.test.tsx
git commit -m "feat: wire KpiBar into DashboardPage with click-to-filter"
```
