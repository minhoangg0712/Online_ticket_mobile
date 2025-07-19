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

      console.log('API response.data:', response.data);

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

      console.log('Event details response:', response.data);

      return response.data.data; // Trả về dữ liệu chi tiết sự kiện
    } catch (error) {
      console.error(
        'Error fetching event details:',
        error?.response?.data || error
      );
      throw error;
    }
  },
};

export default eventService;