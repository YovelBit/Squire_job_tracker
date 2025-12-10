import { apiClient } from './httpClient';

export interface Job {
  public_id: string;
  company: string;
  title: string;
  status: 'open' | 'interviewing' | 'offer' | 'rejected' | string;
  location?: string;
  source?: string;
  referred?: boolean;
  applied_date?: string;
  interview_date?: string;
  decision_date?: string;
  notes?: string;
  application_url?: string;
  created_at?: string;
}

export interface JobFilter {
  company?: string;
  status?: string;
  location?: string;
  source?: string;
  referred?: boolean;
  applied_date?: string;
  interview_date?: string;
  decision_date?: string;
}

export interface JobCreate {
  company: string;
  title: string;
  status: string;
  location?: string;
  source?: string;
  referred?: boolean;
  applied_date?: string;
  interview_date?: string;
  decision_date?: string;
  notes?: string;
  application_url?: string;
}

export interface JobUpdate extends Partial<JobCreate> {}

export const getJobs = async (): Promise<Job[]> => {
  const { data } = await apiClient.get<Job[]>('/jobs');
  return data;
};

export const filterJobs = async (
  filters: JobFilter,
  order_by?: keyof Job,
  descending?: boolean
): Promise<Job[]> => {
  const { data } = await apiClient.post<Job[]>(
    '/jobs/filter',
    {
      filters,
      order_by,
      descending
    }
  );
  return data;
};

export const createJob = async (payload: JobCreate): Promise<Job> => {
  const { data } = await apiClient.post<Job>('/jobs', payload);
  return data;
};

export const updateJob = async (publicId: string, payload: JobUpdate): Promise<Job> => {
  const { data } = await apiClient.patch<Job>(`/jobs/${publicId}`, payload);
  return data;
};

export const deleteJob = async (publicId: string): Promise<void> => {
  await apiClient.delete(`/jobs/${publicId}`);
};
