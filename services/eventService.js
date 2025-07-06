import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api/events/recommend';

const eventService = {
  getRecommendedEvents: async (params = {}) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(API_URL, {
        params,
        headers,
      });

      console.log('API response.data:', response.data);

      // Get correct path to events array
      const events =
        Array.isArray(response?.data?.data?.listEvents)
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
};

export default eventService;