import { ChangeEvent } from 'react';
import { JobFilter } from '../api/jobs';

interface Props {
  filters: JobFilter;
  onChange: (filters: JobFilter) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  onClearFilters: () => void;
}

const FilterBar = ({ filters, onChange, searchTerm, onSearch, onClearFilters }: Props) => {
  const handleInput = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof JobFilter
  ) => {
    const value = event.target.type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : event.target.value;
    
    // Remove filter field if empty/unchecked, otherwise set it
    if (event.target.type === 'checkbox') {
      const newFilters = { ...filters };
      if (value) {
        newFilters[key] = true as any;
      } else {
        delete newFilters[key];
      }
      onChange(newFilters);
    } else if (value === '' || value === null) {
      const newFilters = { ...filters };
      delete newFilters[key];
      onChange(newFilters);
    } else {
      onChange({ ...filters, [key]: value });
    }
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
        <button
          type="button"
          className="btn secondary"
          onClick={onClearFilters}
          style={{ marginLeft: 'auto' }}
        >
          Clear Filters
        </button>
      </div>
      <div className="form-grid">
        <input
          placeholder="Company"
          value={filters.company_display ?? ''}
          onChange={(e) => handleInput(e, 'company_display')}
        />
        <input
          placeholder="Location"
          value={filters.location_display ?? ''}
          onChange={(e) => handleInput(e, 'location_display')}
        />
        <input
          placeholder="Source (e.g. LinkedIn)"
          value={filters.source_display ?? ''}
          onChange={(e) => handleInput(e, 'source_display')}
        />
        <select value={filters.status ?? ''} onChange={(e) => handleInput(e, 'status')}>
          <option value="">Any status</option>
          <option value="Applied">Applied</option>
          <option value="Home_Assignment">Home Assignment</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Offer_Accepted">Offer Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
        <label className="stack" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ minWidth: 90 }}>Applied</span>
          <input
            type="date"
            value={filters.date_applied ?? ''}
            onChange={(e) => handleInput(e, 'date_applied')}
          />
        </label>
        <label className="stack" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ minWidth: 90 }}>Next action</span>
          <input
            type="date"
            value={filters.next_action ?? ''}
            onChange={(e) => handleInput(e, 'next_action')}
          />
        </label>
      </div>
    </div>
  );
};

export default FilterBar;
