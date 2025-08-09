import 'react-native-get-random-values'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8080/api';
const storageKey = 'chatMessages_v1'; 
let encryptionKey = 'eventa-secret-key'; 

const safeParseJSON = (str, fallback = []) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export async function getMessages() {
  try {
    const saved = await AsyncStorage.getItem(storageKey);
    if (!saved) return [];
    // decrypt
    const bytes = CryptoJS.AES.decrypt(saved, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      // Không thể giải mã (khóa sai hoặc dữ liệu hỏng)
      console.warn('chatbotService: decrypt returned empty string');
      await AsyncStorage.removeItem(storageKey);
      return [];
    }
    return safeParseJSON(decrypted, []);
  } catch (err) {
    console.error('Lỗi khi load tin nhắn:', err);
    // on error, clear stored value to avoid repeated failures
    try { await AsyncStorage.removeItem(storageKey); } catch (_) {}
    return [];
  }
}

export async function saveMessages(messages = []) {
  try {
    const json = JSON.stringify(messages);
    const encrypted = CryptoJS.AES.encrypt(json, encryptionKey).toString();
    await AsyncStorage.setItem(storageKey, encrypted);
    return true;
  } catch (err) {
    console.error('Lỗi khi lưu tin nhắn:', err);
    return false;
  }
}

export async function clearMessages() {
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (err) {
    console.error('Lỗi khi xóa tin nhắn:', err);
  }
}

export async function changeEncryptionKey(newKey) {
  try {
    const currentMessages = await getMessages();
    encryptionKey = newKey;
    await saveMessages(currentMessages);
    return true;
  } catch (err) {
    console.error('Lỗi khi đổi khóa mã hóa:', err);
    return false;
  }
}

export async function chat(message) {
  try {
    const res = await axios.post(`${BASE_URL}/chat`, { message });
    return res.data;
  } catch (err) {
    console.error('chat API error:', err?.response?.data || err.message || err);
    throw err;
  }
}

export async function addUserMessage(text) {
  try {
    const messages = await getMessages();
    messages.push({ from: 'user', text });
    await saveMessages(messages);
    return messages;
  } catch (err) {
    console.error('addUserMessage error:', err);
    throw err;
  }
}

export async function addBotMessage(text) {
  try {
    const messages = await getMessages();
    messages.push({ from: 'bot', text });
    await saveMessages(messages);
    return messages;
  } catch (err) {
    console.error('addBotMessage error:', err);
    throw err;
  }
}

export default {
  getMessages,
  saveMessages,
  clearMessages,
  changeEncryptionKey,
  chat,
  addUserMessage,
  addBotMessage,
};
