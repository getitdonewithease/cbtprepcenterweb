import { testHistoryApi } from '../api/testHistoryApi';
 
export const testHistoryService = {
  async getTestHistory(page: number, pageSize: number) {
    return testHistoryApi.fetchTestHistory(page, pageSize);
  },
}; 