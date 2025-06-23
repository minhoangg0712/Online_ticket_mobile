import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/auth.service';
import { Alert } from 'react-native';

const AuthContext = createContext();
const ALLOWED_ROLE = 'ROLE_customer';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await authService.getToken();
        if (token) {
          const decoded = parseJwt(token);
          if (!decoded) {
            throw new Error('Token không hợp lệ.');
          }
          const role = decoded?.role?.toLowerCase();

          if (role !== ALLOWED_ROLE) {
            await authService.logout();
            setUser(null);
            return;
          }

          setUser({
            token,
            email: decoded?.email || decoded?.sub,
            role,
          });
        }
      } catch (err) {
        console.log('Lỗi khi load user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      const { token } = res;
      if (!token) {
        throw new Error('Không nhận được token.');
      }

      const decoded = parseJwt(token);
      if (!decoded) {
        await authService.logout();
        throw new Error('Token không hợp lệ.');
      }

      const role = decoded?.role?.toLowerCase();
        if (role !== ALLOWED_ROLE.toLowerCase()) {
        await authService.logout();
        throw new Error('Vui lòng dùng máy tính để sử dụng tính năng này.');
        }

      setUser({
        token,
        email: decoded?.email || decoded?.sub,
        role,
      });
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Đăng nhập thất bại.');
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={{login}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw new Error('Token đã hết hạn.');
    }
    return decoded;
  } catch (e) {
    throw new Error('Token không hợp lệ.');
  }
}