import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FilterBar from '../components/FilterBar';
import JobFormModal from '../components/JobFormModal';
import JobTable from '../components/JobTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { Job, JobCreate, JobFilter, JobUpdate, createJob, deleteJob, filterJobs, updateJob } from '../api/jobs';

const DashboardPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilter>({});
  const [orderBy, setOrderBy] = useState<keyof Job | undefined>('applied_date');
  const [descending, setDescending] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await filterJobs(filters, orderBy, descending);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderBy, descending]);

  const handleFilterChange = (updated: JobFilter) => {
    setFilters(updated);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const visibleJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const lower = searchTerm.toLowerCase();
    return jobs.filter(
      (job) => job.company.toLowerCase().includes(lower) || job.title.toLowerCase().includes(lower)
    );
  }, [jobs, searchTerm]);

  const handleSortChange = (column: keyof Job) => {
    if (orderBy === column) {
      setDescending(!descending);
    } else {
      setOrderBy(column);
      setDescending(false);
    }
  };

  const handleSubmitJob = async (payload: JobCreate | JobUpdate) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.public_id, payload);
        toast.success('Job updated');
      } else {
        await createJob(payload as JobCreate);
        toast.success('Job created');
      }
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      toast.error('Could not save job');
      console.error(error);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(job.public_id);
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <div className="stack" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: '4px 0' }}>Jobs</h3>
          <p className="muted">Filter, sort, and manage your pipeline</p>
        </div>
        <button className="btn primary" onClick={openCreateModal}>
          + Add job
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <JobTable
          jobs={visibleJobs}
          onEdit={openEditModal}
          onDelete={handleDeleteJob}
          orderBy={orderBy}
          descending={descending}
          onSortChange={handleSortChange}
        />
      )}

      <JobFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitJob}
        initialData={editingJob ?? undefined}
      />
    </>
  );
};

export default DashboardPage;
