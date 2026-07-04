import apiClient from '@/api/client';
import type { ReportSummary, StoredReport } from '../types/analysis.types';

export const getReportsStatus = async (): Promise<{ enabled: boolean }> => {
  const response = await apiClient.get<{ enabled: boolean }>('/reports/status');
  return response.data;
};

export const listReports = async (): Promise<ReportSummary[]> => {
  const response = await apiClient.get<ReportSummary[]>('/reports');
  return response.data;
};

export const getReport = async (id: string): Promise<StoredReport> => {
  const response = await apiClient.get<StoredReport>(`/reports/${encodeURIComponent(id)}`);
  return response.data;
};
