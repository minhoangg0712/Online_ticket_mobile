// services/eventService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8080/api'; // URL API của bạn

const eventService = {
  // Hàm lấy danh sách sự kiện đã có
  getRecommendedEvents: async (params = {}) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${BASE_URL}/events/recommend`, {
        params,
        headers,
      });

      // Get correct path to events array
      const events = Array.isArray(response?.data?.data?.listEvents)
        ? response.data.data.listEvents
        : [];

      if (!events.length) {
        throw new Error('No events found in response');
      }

      // Map to desired fields
      return events.map(event => ({
        eventId: event.eventId,
        eventName: event.eventName,
        backgroundUrl: event.backgroundUrl,
        minPrice: event.minPrice,
        startTime: event.startTime,
        category: event.category,
      }));
    } catch (error) {
      console.error(
        'Error fetching recommended events:',
        error?.response?.data || error
      );
      throw error;
    }
  },

  // Hàm lấy chi tiết sự kiện
  getEventDetails: async (eventId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${BASE_URL}/events/${eventId}`, {
        headers,
      });

      return response.data.data; 
    } catch (error) {
      console.error(
        'Error fetching event details:',
        error?.response?.data || error
      );
      throw error;
    }
  },
  // Hàm lấy danh sách bình luận của sự kiện
  getEventComments: async (eventId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${BASE_URL}/review/event/${eventId}`, {
        headers,
        timeout: 5000,
      });

      // Kiểm tra và lấy reviewDetails
      const reviews = response.data.data?.reviewDetails || [];
      if (!Array.isArray(reviews)) {
        console.warn('reviewDetails is not an array:', reviews);
        return [];
      }

      // Ánh xạ dữ liệu sang định dạng Comment
      return reviews.map(review => ({
        commentId: review.reviewId,
        userName: review.userFullName,
        commentText: review.comment,
        createdAt: review.reviewDate,
        rating: review.rating,
      }));
    } catch (error) {
      console.error('Error fetching event comments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${BASE_URL}/review/event/${eventId}`,
      });
      throw error;
    }
  },
  postEventComment: async (eventId, rating, comment) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, please login');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const body = {
        rating,
        comment,
      };

      const response = await axios.post(`${BASE_URL}/review/upload/${eventId}`, body, {
        headers,
        timeout: 5000,
      });

      console.log('Post comment response:', JSON.stringify(response.data, null, 2));

      // Giả sử API trả về bình luận mới trong response.data.data
      const newComment = response.data.data || {
        commentId: Date.now(), // ID tạm thời nếu API không trả về
        userName: 'Người dùng hiện tại', // Cần API trả về userFullName
        commentText: comment,
        createdAt: new Date().toISOString(),
        rating,
      };

      return newComment;
    } catch (error) {
      console.error('Error posting event comment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${BASE_URL}/review/upload/${eventId}`,
      });
      throw error;
    }
  },
   // Hàm cập nhật bình luận
  updateEventComment: async (reviewId, rating, comment) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, please login');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const body = {
        rating,
        comment,
      };

      const response = await axios.put(`${BASE_URL}/review/update/${reviewId}`, body, {
        headers,
        timeout: 5000,
      });

      console.log('Update comment response:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error('Error updating event comment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${BASE_URL}/review/update/${reviewId}`,
      });
      throw error;
    }
  },
};

export default eventService;