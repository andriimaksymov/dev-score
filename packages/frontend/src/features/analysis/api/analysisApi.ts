import apiClient from '@/api/client';
import type { AnalysisResult, AnalyzePortfolioRequest } from '../types/analysis.types';

export const analyzePortfolio = async (
  request: AnalyzePortfolioRequest
): Promise<AnalysisResult> => {
  const response = await apiClient.post<AnalysisResult>('/analysis/analyze', request);
  return response.data;
};
