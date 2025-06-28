import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api';
// const API_URL = 'http://localhost:8080/api'; // Hoặc IP thực của server

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const token = response.data.token;
    if (token) {
      await AsyncStorage.setItem('token', token);
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Nếu server trả về mảng lỗi dạng validation
      if (Array.isArray(error.response.data)) {
        throw error.response.data;
      }
      // Nếu trả về object lỗi
      throw error.response.data.message || 'Đăng nhập thất bại.';
    } else {
      throw 'Lỗi kết nối tới server.';
    }
  }
};

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

const logout = async () => {
  await AsyncStorage.removeItem('token');
};

export default {
  login,
  getToken,
  logout,
};
