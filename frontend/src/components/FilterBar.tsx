import { ChangeEvent } from 'react';
import { JobFilter } from '../api/jobs';

interface Props {
  filters: JobFilter;
  onChange: (filters: JobFilter) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
}

const FilterBar = ({ filters, onChange, searchTerm, onSearch }: Props) => {
  const handleInput = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof JobFilter
  ) => {
    const value = event.target.type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : event.target.value;
    onChange({ ...filters, [key]: value === '' ? undefined : value });
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="stack wrap" style={{ marginBottom: 12 }}>
        <input
          className="search-input"
          placeholder="Search by company or title"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="stack">
          <label className="chip-input">
            <input
              type="checkbox"
              checked={Boolean(filters.referred)}
              onChange={(e) => handleInput(e, 'referred')}
            />
            <span className="muted">Referred</span>
          </label>
        </div>
      </div>
      <div className="form-grid">
        <input
          placeholder="Company"
          value={filters.company ?? ''}
          onChange={(e) => handleInput(e, 'company')}
        />
        <input
          placeholder="Location"
          value={filters.location ?? ''}
          onChange={(e) => handleInput(e, 'location')}
        />
        <input
          placeholder="Source (e.g. LinkedIn)"
          value={filters.source ?? ''}
          onChange={(e) => handleInput(e, 'source')}
        />
        <select value={filters.status ?? ''} onChange={(e) => handleInput(e, 'status')}>
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        <label className="stack" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ minWidth: 90 }}>Applied</span>
          <input
            type="date"
            value={filters.applied_date ?? ''}
            onChange={(e) => handleInput(e, 'applied_date')}
          />
        </label>
        <label className="stack" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ minWidth: 90 }}>Interview</span>
          <input
            type="date"
            value={filters.interview_date ?? ''}
            onChange={(e) => handleInput(e, 'interview_date')}
          />
        </label>
        <label className="stack" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ minWidth: 90 }}>Decision</span>
          <input
            type="date"
            value={filters.decision_date ?? ''}
            onChange={(e) => handleInput(e, 'decision_date')}
          />
        </label>
      </div>
    </div>
  );
};

export default FilterBar;
