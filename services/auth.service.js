import axios from 'axios';

const API_URL = 'http://10.0.2.2:8080/api'; // hoặc IP LAN nếu dùng thiết bị thật

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data; // trả lỗi từ server
    } else {
      throw 'Lỗi kết nối tới server.';
    }
  }
};

export default {
  login,
};
