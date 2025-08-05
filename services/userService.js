import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api';

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token || null;
  } catch (error) {
    console.log('Lỗi khi lấy token:', error);
    return null;
  }
};

const getCurrentUserProfile = async () => {
  const token = await getToken();
  return axios.get(`${API_URL}/users/current-profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const updateUserProfile = async (data) => {
  const token = await getToken();
  return axios.put(`${API_URL}/users/update-profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


const uploadAvatar = async (imageUri) => {
  const token = await getToken();

  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const lowerUri = imageUri.toLowerCase();

  const isValid = allowedExtensions.some(ext => lowerUri.endsWith(ext));
  if (!isValid) {
    throw new Error('Chỉ hỗ trợ ảnh định dạng .jpg, .jpeg, .png');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  });

  return axios.post(`${API_URL}/users/upload-profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    transformRequest: () => formData,
  });
};

export const deleteAccount = async () => {
  const token = await getToken();
  return axios.delete(`${API_URL}/users/delete-account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTicketByUserIdAxios = async (userId) => {
  try {
    if (!userId) throw new Error('userId không hợp lệ');

    const token = await AsyncStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    console.log('📡 Đang gọi API lấy vé cho userId:', userId);

    const { data } = await axios.get(`${API_URL}/users/ticket/${userId}`, {
      headers,
    });

    console.log('🎟️ Vé lấy được:', data);

    return data?.data ?? []; // Trả về mảng rỗng nếu không có vé
  } catch (error) {
    console.error('❌ Lỗi khi gọi API lấy vé:', error?.response?.data || error.message);
    throw error;
  }
};



export default {
  getCurrentUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAccount,
  getTicketByUserIdAxios
};
