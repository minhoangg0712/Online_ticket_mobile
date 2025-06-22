import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import authService from '../services/auth.service';

type RootStackParamList = {
  Profile: undefined;
  Account: undefined;
  Login: undefined;
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await authService.logout(); 
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header & Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../assets/avatar.jpg')}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>Nguyễn Minh Hoàng</Text>
        </View>

        {/* Section Header: Cài đặt tài khoản */}
        <View style={styles.sectionHeader}>
          <Icon name="user" size={20} color="#000" />
          <Text style={styles.sectionText}>Cài đặt tài khoản</Text>
        </View>

        {/* Setting Items */}
        <View style={styles.settingGroup}>
          <TouchableOpacity style={styles.settingItem}  onPress={() => navigation.navigate('Account')}>
            <Text style={styles.settingText}>Thông tin tài khoản</Text>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Xoá tài khoản</Text>
            <Text style={styles.chevron}>▶</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <Icon name="sign-out" size={20} color="white" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Phiên bản 3.1.1(30225)</Text>
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

  // Header & Avatar
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
    borderWidth: 4,
    borderColor: '#000',
  },

  // Name
  nameContainer: {
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 16,
  },
  name: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },

  // Section Header
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
    fontSize: 20,
    fontWeight: 'bold',
  },

  settingGroup: {
    backgroundColor: '#fff7f3',        
    borderRadius: 12,              
    borderWidth: 1,                   
    borderColor: '#000',               
    marginHorizontal: 16,
    marginTop: 20,
    overflow: 'hidden',
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderBottomColor: '#000',
    backgroundColor: '#fff7f3',
  },

  settingText: {
    color: '#000',
    fontSize: 16,
  },

  chevron: {
    color: '#000',
    fontSize: 16,
  },

  logoutItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7f3',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 999,
    paddingVertical: 12,
    marginHorizontal: 40,
    marginTop: 100,
  },

  logoutIcon: {
    color: 'red',
    marginRight: 8,
  },

  logoutText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },

  version: {
    textAlign: 'center',
    color: '#000',
    marginTop: 35,
    fontSize: 12,
  },
});


