import { apiClient } from '../client';
import { FeedbackPayload } from '../../types/domain';

export const feedbackApi = {
  submitFeedback: async (payload: FeedbackPayload): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ data: { success: boolean; message: string } }>('/feedback', payload);
    return response.data.data;
  },
};
