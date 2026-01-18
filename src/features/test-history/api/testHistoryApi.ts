import { TestRecord, TestConfiguration, UserProfile } from '../types/testHistoryTypes';
import api from '../../../lib/apiConfig';

export const testHistoryApi = {
  async fetchTestHistory(page: number, pageSize: number): Promise<{ items: TestRecord[]; totalPages: number }> {
    try {
      const res = await api.get('/api/v1/cbtsessions/', {
        params: {
          pageNumber: page,
          pageSize: pageSize,
        },
      });

      if (!res.data.isSuccess) {
        throw new Error(res.data.message || 'Failed to fetch test history');
      }

      const items = res.data.value.items.map((item: any) => ({
        id: item.id,
        date: formatDate(item.createdOn),
        subjects: item.subjectScore.map((subject: any) => ({
          name: subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1),
          score: subject.score,
          maxScore: subject.maxScore
        })),
        score: item.score || 0,
        maxScore: item.maxScore || 0,
        timeUsed: formatDuration(item.durationUsed),
        avgSpeed: formatAverageSpeed(item.averageSpeed),
        status: mapSessionStatus(item.cbtSessionStatus),
        practiceTestType: item.practiceTestType || 1,
        numberOfQuestion: item.numberOfQuestion,
        numberOfQuestionAttempted: item.numberOfQuestionAttempted,
        numberOfCorrectAnswers: item.numberOfCorrectAnswers,
        numberOfWrongAnswers: item.numberOfWrongAnswers
      }));

      return {
        items,
        totalPages: res.data.value.metaData?.totalPages || 1
      };
    } catch (error: any) {
      if (error.message === 'No authentication token found') {
        window.location.href = '/signin';
      }
      throw error;
    }
  },

  // async fetchTestConfiguration(cbtSessionId: string): Promise<TestConfiguration> {
  //   try {
      
  //     const res = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`);
      
  //     if (!res.data?.isSuccess) {
  //       throw new Error(res.data?.message || 'Failed to fetch test configuration');
  //     }

  //     return {
  //       cbtSessionId: res.data.value.cbtSessionId,
  //       preparedQuestion: res.data.value.preparedQuestion,
  //       examConfig: {
  //         time: res.data.value.duration,
  //         questions: res.data.value.totalQuestionsCount,
  //       },
  //       status: mapSessionStatus(res.data.value.status),
  //     };
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || error.message || 'Failed to fetch test configuration');
  //   }
  // },

  async fetchUserProfile(): Promise<UserProfile> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await api.get('/api/v1/students/me', {
      });

      if (!res.data?.isSuccess) {
        throw new Error('Failed to fetch user profile');
      }

      const data = res.data.value;
      return {
        name: data.firstName && data.lastName 
          ? `${data.firstName} ${data.lastName}`
          : data.firstName || data.lastName || data.name,
        email: data.email,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          data.firstName || data.name || 'Student'
        )}`,
      };
    } catch (error: any) {
      throw error;
    }
  },

  async cancelTestSession(cbtSessionId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const res = await api.put(`/api/v1/cbtsessions/${cbtSessionId}`, "Cancel", {
        headers: { "Content-Type": "application/json" }
      });
      if (!res.data?.isSuccess) {
        throw new Error(res.data?.message || 'Failed to cancel test session');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to cancel test session');
    }
  }
};

// Helper Functions
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
};

const formatDuration = (duration: string) => {
  if (!duration) return "--";
  const [h, m, s] = duration.split(":");
  let str = "";
  if (h && h !== "00") str += `${parseInt(h)}h `;
  if (m && m !== "00") str += `${parseInt(m)}m `;
  if (s && s !== "00") {
    const seconds = Math.floor(parseFloat(s));
    str += seconds.toString() + "s";
  }
  return str.trim() || "--";
};

const formatAverageSpeed = (speed: string) => {
  if (!speed || speed === "00:00:00") return "--";
  const [h, m, s] = speed.split(":");
  let str = "";
  if (h && h !== "00") str += `${parseInt(h)}h `;
  if (m && m !== "00") str += `${parseInt(m)}m `;
  if (s && s !== "00") {
    const seconds = Math.floor(parseFloat(s));
    str += seconds.toString() + "s";
  }
  return str.trim() || "--";
};

const mapSessionStatus = (status: number) => {
  switch (status) {
    case 1: return "not-started";
    case 2: return "in-progress";
    case 3: return "submitted";
    case 4: return "cancelled";
    default: return "error";
  }
}; 