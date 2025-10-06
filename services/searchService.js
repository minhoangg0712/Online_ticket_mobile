import axios from 'axios';

const API_BASE_URL = 'http://113.20.107.77:8080/api';

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const searchService = {
  testConnection: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/events/recommend`, {
        params: { page: 1, size: 1 },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  getRecommendedEvents: async (params) => {
    try {
      const {
        category,
        address,
        name,
        startTime,
        endTime,
        page = 1,
        size = 10,
        sortBy,
      } = params || {};

      const filteredParams = {};

      if (category && category.trim()) filteredParams.category = category.trim();
      if (address && address.trim()) filteredParams.address = address.trim();
      if (name && name.trim()) filteredParams.name = name.trim();
      if (sortBy && sortBy.trim()) filteredParams.sortBy = sortBy.trim();

      if (startTime) {
        filteredParams.startTime = startTime instanceof Date
          ? startTime.toISOString()
          : startTime;
      }
      if (endTime) {
        filteredParams.endTime = endTime instanceof Date
          ? endTime.toISOString()
          : endTime;
      }

      filteredParams.page = Math.max(1, parseInt(page) || 1);
      filteredParams.size = Math.max(1, Math.min(100, parseInt(size) || 10));

      const response = await axiosInstance.get(`${API_BASE_URL}/events/recommend`, {
        params: filteredParams,
      });

      const resData = response.data?.data;

      return {
        events: resData?.listEvents || [],
        page: resData?.pageNo || 1,
        totalPages: resData?.totalPages || 1,
        pageSize: resData?.pageSize || 10,
        raw: response.data,
      };
    } catch (error) {
      let errorMessage = 'Có lỗi xảy ra khi tìm kiếm';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout - Server phản hồi quá chậm';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Không thể kết nối đến server. Kiểm tra mạng hoặc API URL.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy API endpoint';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server nội bộ';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.statusCode = error.response?.status;
      throw enhancedError;
    }
  },

  testSearch: async () => {
    try {
      const result = await searchService.getRecommendedEvents({
        name: 'A',
        page: 1,
        size: 5,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default searchService;
