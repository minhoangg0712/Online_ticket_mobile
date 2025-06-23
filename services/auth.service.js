import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api';

const sendVerificationCode = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/sendVerificationCode`, { email }, {
      responseType: 'text'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Không thể gửi mã xác minh.';
  }
};

const verifyCode = async (email, code) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verifyCode`, { email, code });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Mã xác thực không hợp lệ.';
  }
};

const register = async (email, code, fullName, password, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      code,
      fullName,
      password,
      confirmPassword,
    }, {
      responseType: 'text'
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data.message || 'Đăng ký thất bại.';
    }
    throw 'Lỗi kết nối tới server.';
  }
};

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
      if (Array.isArray(error.response.data)) {
        throw error.response.data;
      }
      throw error.response.data.message || 'Đăng nhập thất bại.';
    }
    throw 'Lỗi kết nối tới server.';
  }
};

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

const logout = async () => {
  await AsyncStorage.removeItem('token');
};

export default {
  sendVerificationCode,
  verifyCode,
  register,
  login,
  getToken,
  logout,
};
