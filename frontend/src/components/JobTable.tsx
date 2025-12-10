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
    { key: 'company', label: 'Company' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Location' },
    { key: 'source', label: 'Source' },
    { key: 'applied_date', label: 'Applied' },
    { key: 'interview_date', label: 'Interview' },
    { key: 'decision_date', label: 'Decision' }
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
              <td>{job.company}</td>
              <td>{job.title}</td>
              <td>{renderStatusBadge(job.status)}</td>
              <td>{job.location ?? '—'}</td>
              <td>{job.source ?? '—'}</td>
              <td>{job.applied_date ?? '—'}</td>
              <td>{job.interview_date ?? '—'}</td>
              <td>{job.decision_date ?? '—'}</td>
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
              <td colSpan={9} style={{ textAlign: 'center', padding: 18 }}>
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
