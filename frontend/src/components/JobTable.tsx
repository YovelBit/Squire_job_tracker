import { Job } from '../api/jobs';

interface Props {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  orderBy?: keyof Job;
  descending?: boolean;
  onSortChange: (column: keyof Job) => void;
}

const JobTable = ({ jobs, onEdit, onDelete, orderBy, descending, onSortChange }: Props) => {
  const headers: { key: keyof Job; label: string }[] = [
    { key: 'company_display', label: 'Company' },
    { key: 'title_display', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'location_display', label: 'Location' },
    { key: 'source_display', label: 'Source' },
    { key: 'date_applied', label: 'Applied' },
    { key: 'next_action', label: 'Next Action' }
  ];

  const renderStatusBadge = (status: string) => {
    const key = status.toLowerCase();
    return <span className={`badge status-${key}`}>{status}</span>;
  };

  const renderSortIcon = (key: keyof Job) => {
    if (orderBy !== key) return '⇅';
    return descending ? '↓' : '↑';
  };

  return (
    <div className="card table-container">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.key as string} onClick={() => onSortChange(header.key)}>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  {header.label}
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{renderSortIcon(header.key)}</span>
                </span>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.public_id}>
              <td>{job.company_display}</td>
              <td>{job.title_display}</td>
              <td>{renderStatusBadge(job.status)}</td>
              <td>{job.location_display ?? '—'}</td>
              <td>{job.source_display ?? '—'}</td>
              <td>{job.date_applied ?? '—'}</td>
              <td>{job.next_action ?? '—'}</td>
              <td>
                <div className="stack">
                  <button className="btn secondary" onClick={() => onEdit(job)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => onDelete(job)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: 18 }}>
                No jobs found with the current filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;
