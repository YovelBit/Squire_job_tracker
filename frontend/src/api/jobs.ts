import { apiClient } from './httpClient';

export interface Job {
  public_id: string;
  company_display: string;
  title_display: string;
  status: 'Applied' | 'Home_Assignment' | 'Interview' | 'Offer' | 'Offer_Accepted' | 'Rejected' | string;
  location_display?: string;
  source_display?: string;
  referred?: boolean;
  date_applied?: string;
  next_action?: string;
  notes?: string;
  application_url?: string;
  created_at?: string;
  last_updated?: string;
}

export interface JobFilter {
  company_display?: string;
  status?: string;
  location_display?: string;
  source_display?: string;
  referred?: boolean;
  date_applied?: string;
  next_action?: string;
}

export interface JobCreate {
  company_display: string;
  title_display: string;
  status: string;
  location_display?: string;
  source_display?: string;
  referred?: boolean;
  date_applied?: string;
  next_action?: string;
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
  // Clean filters - remove undefined, null, and empty string values
  const cleanedFilters: JobFilter = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      cleanedFilters[key as keyof JobFilter] = value;
    }
  }
  
  // FastAPI expects filters at top level of body, order_by/descending as query params
  const params = new URLSearchParams();
  if (order_by) {
    params.append('order_by', order_by);
  }
  if (descending !== undefined) {
    params.append('descending', descending.toString());
  }
  
  const queryString = params.toString();
  const url = `/jobs/filter${queryString ? `?${queryString}` : ''}`;
  
  const { data } = await apiClient.post<Job[]>(url, cleanedFilters);
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
