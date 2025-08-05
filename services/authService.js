import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://10.0.2.2:8080/api';

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
    // Gửi yêu cầu đăng nhập đến server
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('🔍 Server response:', response.data);
    const { token } = response.data;

    // Kiểm tra xem có token không
    if (!token) {
      throw new Error('Không nhận được token từ server.');
    }

    // Lưu token vào AsyncStorage
    try {
      await AsyncStorage.setItem('token', token);
      console.log('✅ Token đã lưu vào AsyncStorage:', token);
    } catch (storageError) {
      console.log('🚨 Lỗi khi lưu token vào AsyncStorage:', storageError.message);
      throw new Error('Lỗi lưu token: ' + storageError.message);
    }

    // Giải mã token
    let decoded;
    try {
      decoded = jwtDecode(token);
      console.log('✅ Token đã được giải mã:', decoded);
    } catch (decodeError) {
      console.log('🚨 Lỗi khi giải mã token:', decodeError.message);
      throw new Error('Lỗi giải mã token: ' + decodeError.message);
    }

    // Lưu thông tin user vào AsyncStorage
    try {
      await AsyncStorage.setItem('user', JSON.stringify(decoded));
      console.log('✅ User đã được lưu vào AsyncStorage:', decoded);
    } catch (storageError) {
      console.log('🚨 Lỗi khi lưu user vào AsyncStorage:', storageError.message);
      throw new Error('Lỗi lưu user: ' + storageError.message);
    }

    return response.data;
  } catch (error) {
    // Log lỗi chi tiết
    console.log('🚨 Lỗi đầy đủ trong quá trình đăng nhập:', error.message, error);
    if (error.response?.data) {
      if (Array.isArray(error.response.data)) {
        throw error.response.data;
      }
      throw error.response.data.message || 'Đăng nhập thất bại.';
    }
    throw error.message || 'Lỗi kết nối tới server.';
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

export const sendCode = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/send-code`, { email }, {
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Lỗi gửi mã';
  }
};

export const resetPassword = async ({ email, code, newPassword, confirmNewPassword }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password-by-code`, {
      email,
      code,
      newPassword,
      confirmNewPassword
    }, {
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Lỗi đặt lại mật khẩu';
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

const decodeToken = async () => {
  const token = await getToken();
  const decoded = jwtDecode(token);
  console.log('Decoded JWT:', decoded);
  return decoded;
};

export default {
  sendVerificationCode,
  verifyCode,
  register,
  login,
  getToken,
  logout,
  googleLogin,
  sendCode,
  resetPassword
};