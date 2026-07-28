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
