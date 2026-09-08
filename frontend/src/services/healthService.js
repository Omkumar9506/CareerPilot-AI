import api from './api';
import axios from 'axios';

export const checkApiHealth = async () => {
  try {
    // 1. Try standard api client configured path
    const res = await api.get('/health');
    return {
      isOnline: true,
      data: res?.data || res,
      message: res?.message || 'CareerPilot AI API is healthy',
    };
  } catch {
    // 2. Fallback direct check against /api/health
    try {
      const direct = await axios.get('/api/health', { timeout: 4000 });
      return {
        isOnline: true,
        data: direct.data?.data || direct.data,
        message: direct.data?.message || 'CareerPilot AI API is healthy',
      };
    } catch (err) {
      return {
        isOnline: false,
        data: null,
        message: err.message || 'API Gateway Offline',
      };
    }
  }
};
