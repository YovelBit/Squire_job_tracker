import { FormEvent, useEffect, useState } from 'react';
import { JobCreate, JobUpdate } from '../api/jobs';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: JobCreate | JobUpdate) => Promise<void>;
  initialData?: JobUpdate;
}

const defaultJob: JobCreate = {
  company: '',
  title: '',
  status: 'open',
  location: '',
  source: '',
  referred: false,
  applied_date: '',
  interview_date: '',
  decision_date: '',
  notes: '',
  application_url: ''
};

const JobFormModal = ({ open, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<JobCreate>(defaultJob);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...defaultJob, ...initialData });
    }
  }, [initialData, open]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
      setForm(defaultJob);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{initialData ? 'Edit job' : 'Add job'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <input
                name="company"
                placeholder="Company"
                value={form.company}
                onChange={handleChange}
                required
              />
              <input
                name="title"
                placeholder="Role title"
                value={form.title}
                onChange={handleChange}
                required
              />
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="open">Open</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                name="location"
                placeholder="Location"
                value={form.location ?? ''}
                onChange={handleChange}
              />
              <input
                name="source"
                placeholder="Source"
                value={form.source ?? ''}
                onChange={handleChange}
              />
              <label className="chip-input" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  name="referred"
                  checked={Boolean(form.referred)}
                  onChange={handleChange}
                />
                <span>Referred</span>
              </label>
              <label className="stack" style={{ alignItems: 'center' }}>
                <span className="muted" style={{ minWidth: 100 }}>Applied date</span>
                <input type="date" name="applied_date" value={form.applied_date ?? ''} onChange={handleChange} />
              </label>
              <label className="stack" style={{ alignItems: 'center' }}>
                <span className="muted" style={{ minWidth: 100 }}>Interview</span>
                <input
                  type="date"
                  name="interview_date"
                  value={form.interview_date ?? ''}
                  onChange={handleChange}
                />
              </label>
              <label className="stack" style={{ alignItems: 'center' }}>
                <span className="muted" style={{ minWidth: 100 }}>Decision</span>
                <input
                  type="date"
                  name="decision_date"
                  value={form.decision_date ?? ''}
                  onChange={handleChange}
                />
              </label>
              <input
                name="application_url"
                placeholder="Application URL"
                value={form.application_url ?? ''}
                onChange={handleChange}
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={form.notes ?? ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
