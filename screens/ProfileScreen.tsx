import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import authService from '../services/authService';
import UserService from '../services/userService';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Profile: undefined;
  Account: undefined;
  Login: undefined;
  Register: undefined;
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [fullName, setFullName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await authService.getToken();
        if (token) {
          setIsLoggedIn(true);
          const res = await UserService.getCurrentUserProfile();
          const data = res.data.data;
          setFullName(data.fullName || '');
          if (data.avatarUrl) setImageUri(data.avatarUrl);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra token:', error);
        setIsLoggedIn(false);
      }
    };

    checkToken();
  }, []);

  const imageSource = imageUri
    ? { uri: imageUri }
    : require('../assets/avatar.jpg');

  const handleLogout = async () => {
    await authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleDelete = async () => {
    try {
      const response = await UserService.deleteAccount();
      Alert.alert('Thành công', response.data || 'Tài khoản đã được xoá');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Lỗi xoá tài khoản:', error);
      const errorMessage =
        error.response?.data || error.message || 'Không thể xoá tài khoản';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FF7E42" />
        <View style={styles.authContainer}>
          <View style={styles.authHeader}>
            <Image
              source={require('../assets/logoeventa.png')} style={styles.authImage}/>
            <Text style={styles.authTitle}>Chào mừng bạn đến với Eventa</Text>
          </View>
          
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={[styles.authButton, styles.primaryButton]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.authButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.secondaryButtonText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.version}>Phiên bản 3.1.1(30225)</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header & Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image source={imageSource} style={styles.avatar} />
          </View>
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{fullName || 'Người dùng'}</Text>
        </View>

        {/* Section Header: Cài đặt tài khoản */}
        <View style={styles.sectionHeader}>
          <Icon name="user" size={20} color="#000" />
          <Text style={styles.sectionText}>Cài đặt tài khoản</Text>
        </View>

        {/* Setting Items */}
        <View style={styles.settingGroup}>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Account')}>
            <Text style={styles.settingText}>Thông tin tài khoản</Text>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {             
              Alert.alert(
                'Xác nhận xoá',
                'Bạn có chắc chắn muốn xoá tài khoản?',
                [
                  {
                    text: 'Huỷ',
                    style: 'cancel',
                  },
                  {
                    text: 'Xoá',
                    style: 'destructive',
                    onPress: handleDelete,
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.settingText}>Xoá tài khoản</Text>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <Icon name="sign-out" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionlast}>Phiên bản 3.1.1(30225)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6F2',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  
  // Auth Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFF6F2',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 50,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  authButtonsContainer: {
    width: '100%',
    height: 60,
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#FF7E42',
    paddingTop: 19,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#FF7E42',
    paddingTop: 19,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 2,
  },
  secondaryButtonText: {
    color: '#FF7E42',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header Styles
  header: {
    height: 140,
    backgroundColor: '#ff7e42',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },

  avatarWrapper: {
    position: 'absolute',
    bottom: -45,
    zIndex: 10,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#000',
  },

  // Name Section
  nameContainer: {
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 20,
  },

  name: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Section Styles
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  sectionText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },

  // Settings Group
  settingGroup: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  settingText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },

  chevron: {
    color: '#000',
    fontSize: 16,
  },

  // Logout Button
  logoutItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7E42',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: '#FF7E42',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 30,
  },

  // Logout Icon
  logoutIcon: {
    marginRight: 8,
  },

  // Logout Text
  logoutText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  // Version
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 130,
  },

  versionlast: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 30,
    marginBottom: 20,
  },

  authImage: {
    width: 180,
    height: 45,
    marginBottom: 16,
  },
});