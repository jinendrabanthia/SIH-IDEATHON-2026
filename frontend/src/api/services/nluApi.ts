import { apiClient } from '../client';
import { NLUExtractResult } from '../../types/domain';

export const nluApi = {
  extractPreferences: async (prompt: string): Promise<NLUExtractResult> => {
    const response = await apiClient.post<{ data: NLUExtractResult }>('/nlu/extract', { prompt });
    return response.data.data;
  },

  narrateItinerary: async (
    itinerary: Array<{ attractionName: string; startTime: string; endTime: string; factId?: string }>,
    validFactIds: string[]
  ): Promise<{ narration: string }> => {
    const response = await apiClient.post<{ data: { narration: string } }>('/nlu/narrate', {
      itinerary,
      validFactIds,
    });
    return response.data.data;
  },
};
