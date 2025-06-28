import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import UserService from '../services/user.service';

const AccountScreen = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const navigation = useNavigation();

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await UserService.getCurrentUserProfile();
        const data = res.data.data;
        
        setFullName(data.fullName || '');
        setPhone(data.phoneNumber || '');
        setGender((data.gender || ''));
        setEmail(data.email || '');
        if (data.avatarUrl) setImageUri(data.avatarUrl);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const pickImageAsync = () => {
    Alert.alert('Chọn ảnh đại diện', 'Bạn muốn chọn ảnh từ đâu?', [
      { text: 'Thư viện ảnh', onPress: openImageLibrary },
      { text: 'Chụp ảnh mới', onPress: openCamera },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      // Cập nhật thông tin hồ sơ
      await UserService.updateUserProfile({
        fullName,
        phoneNumber: phone,
        gender,
      });

      // Upload ảnh nếu có chọn mới
      if (imageUri && !imageUri.startsWith('http')) {
        await UserService.uploadAvatar(imageUri);
      }

      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
    } catch (error) {
      console.error('Lỗi cập nhật hồ sơ:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ do sai định dạng ảnh hoặc thiếu thông tin');
    }
  };

  const imageSource = imageUri
    ? { uri: imageUri }
    : require('../assets/avatar.jpg');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={20} color="white" style={styles.headerIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImageAsync}>
                <Icon name="camera" size={10} color="white" />
              </TouchableOpacity>
              <Text style={styles.avatarText}>
                Cung cấp thông tin chính xác sẽ hỗ trợ bạn trong quá trình mua vé, hoặc khi cần xác thực vé
              </Text>
            </View>

            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+84</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.disabledInputContainer}>
              <TextInput style={styles.disabledInput} value={email} editable={false} />
              <TouchableOpacity style={styles.copyButton}>
                <Icon name="copy" size={16} color="#fb7e3f" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity key={g} style={styles.genderOption} onPress={() => setGender(g)}>
                  <View
                    style={[
                      styles.radioCircle,
                      gender === g && styles.radioChecked,
                    ]}
                  />
                  <Text>{
                    g === 'Male'
                      ? 'Nam'
                      : g === 'Female'
                        ? 'Nữ'
                        : g === 'Other'
                          ? 'Khác'
                          : 'Other'
                  }</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Hoàn thành</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff6f3',
  },
  container: {
    flex: 1
  },
  card: {
    flex: 1,
    backgroundColor: '#fff6f3',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fb7e3f',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    paddingHorizontal: 16,
  },
  headerIcon: {
    color: 'white',
    fontSize: 20,
    marginTop: 20
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 20,
    marginLeft: 25
  },
  form: {
    padding: 24,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    borderWidth: 2,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 32,
    right: 150,
    backgroundColor: '#fb7e3f',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#3a3a3a',
    maxWidth: 280,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  input: {
    height: 40,
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryCode: {
    width: 72,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  countryCodeText: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    color: '#000',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  disabledInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  disabledInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#a3a3a3',
    borderRadius: 6,
    color: 'white',
    paddingHorizontal: 12,
    fontSize: 12,
  },
  copyButton: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 25,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fb7e3f',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioChecked: {
    backgroundColor: '#fb7e3f',
  },
  submitButton: {
    backgroundColor: '#fb7e3f',
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
