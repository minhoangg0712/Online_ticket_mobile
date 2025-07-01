import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api';
// const API_URL = 'http://localhost:8080/api'; // Hoặc IP thực của server

const sendVerificationCode = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/sendVerificationCode`, { email }, {
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể gửi mã xác minh.';
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
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Đăng ký thất bại.';
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token } = response.data;

    if (!token) {
      throw new Error('Không nhận được token từ server.');
    }

    await AsyncStorage.setItem('token', token);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      if (Array.isArray(error.response.data)) {
        throw error.response.data;
      }
      throw error.response.data.message || 'Đăng nhập thất bại.';
    }
    throw 'Lỗi kết nối tới server.';
  }
};

const googleLogin = async (idToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google`, { idToken });
    const { token } = response.data;

    if (!token) throw new Error('Không nhận được token từ server.');
    await AsyncStorage.setItem('token', token);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Đăng nhập Google thất bại.';
  }
};


const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token || null;
  } catch (error) {
    console.log('Lỗi khi lấy token:', error);
    return null;
  }
};

const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.log('Lỗi khi đăng xuất:', error);
  }
};

export default {
  sendVerificationCode,
  verifyCode,
  register,
  login,
  getToken,
  logout,
  googleLogin,
};