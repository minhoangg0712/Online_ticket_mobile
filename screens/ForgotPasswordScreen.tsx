import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { sendCode, resetPassword } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotPasswordScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [currentNewPassword, setCurrentNewPassword] = useState(true);
  const [validateNewPassword, setValidateNewPassword] = useState(true);
  
  type RootStackParamList = {
    Login: undefined;
  };
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      code: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const toggleCurrentNewPasswordVisibility = () => {
    setCurrentNewPassword(!currentNewPassword);
  };

  const toggleValidateNewPasswordVisibility = () => {
    setValidateNewPassword(!validateNewPassword);
  };

  const resetToStep1 = () => {
    setCurrentStep(1);
    setValue('code', '');
    setValue('newPassword', '');
    setValue('confirmNewPassword', '');
  };

  const handleSendCode = async (data) => {
    setIsLoading(true);
    try {
      await sendCode(data.email);
      setRegisteredEmail(data.email);
      setCurrentStep(2);
    } catch (error) {
      Alert.alert('Lỗi', error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        email: registeredEmail,
        code: data.code,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword
      });
      setCurrentStep(3);
    } catch (error) {
      Alert.alert('Lỗi', error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const onPopupClosed = () => {
    navigation.navigate('Login'); // hoặc về màn chính
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        {/* Bước 1: Nhập email */}
        {currentStep === 1 && (
          <>
            <Controller
              control={control}
              name="email"
              rules={{ required: 'Email không được để trống', pattern: { value: /\S+@\S+\.\S+/, message: 'Email không hợp lệ' } }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Vui lòng nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(handleSendCode)} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Bước 2: Nhập mã và mật khẩu mới */}
        {currentStep === 2 && (
          <>
            <Text style={styles.emailDisplay}>
              <Text style={styles.bold}>{registeredEmail}</Text>{' '}
              <Text onPress={resetToStep1} style={styles.editText}>✏️</Text>
            </Text>

            {/* Mã xác thực */}
            <Controller
              control={control}
              name="code"
              rules={{ required: 'Mã xác thực không được để trống' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.code && styles.inputError]}
                  placeholder="Nhập mã xác thực"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}

            {/* Mật khẩu mới */}
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: 'Mật khẩu không được để trống',
                minLength: { value: 10, message: 'Ít nhất 10 ký tự' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: 'Phải chứa chữ in hoa, số và ký tự đặc biệt'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <View style={[styles.passwordContainer, errors.newPassword && styles.inputError]}>
                  <TextInput
                    secureTextEntry={currentNewPassword}
                    style={styles.passwordInput}
                    placeholder="Mật khẩu mới"
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity onPress={toggleCurrentNewPasswordVisibility} style={styles.eyeIcon}>
                    <Icon name={currentNewPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.newPassword && <Text style={styles.error}>{errors.newPassword.message}</Text>}

            {/* Xác nhận mật khẩu */}
            <Controller
              control={control}
              name="confirmNewPassword"
              rules={{ required: 'Vui lòng xác nhận mật khẩu' }}
              render={({ field: { onChange, value } }) => (
                <View style={[
                  styles.passwordContainer,
                  (errors.confirmNewPassword || watch('newPassword') !== watch('confirmNewPassword')) && styles.inputError
                ]}>
                  <TextInput
                    secureTextEntry={validateNewPassword}
                    style={styles.passwordInput}
                    placeholder="Xác nhận mật khẩu mới"
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity onPress={toggleValidateNewPasswordVisibility} style={styles.eyeIcon}>
                    <Icon name={validateNewPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmNewPassword && <Text style={styles.error}>{errors.confirmNewPassword.message}</Text>}
            {watch('newPassword') !== watch('confirmNewPassword') && (
              <Text style={styles.error}>Mật khẩu xác nhận không khớp</Text>
            )}

            {/* Nút gửi */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit(handleResetPassword)} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Bước 3: Thành công */}
        {currentStep === 3 && (
          <>
            <Text style={styles.success}>🎉 Mật khẩu đã được đặt lại thành công!</Text>
            <TouchableOpacity style={styles.button} onPress={onPopupClosed}>
              <Text style={styles.buttonText}>Về trang đăng nhập</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6f2',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF6F2',
    padding: 14,
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ff7e42',
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 150,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef2f2'
  },
  error: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#ff7e42',
    width: '100%',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  emailDisplay: {
    fontSize: 14,
    marginBottom: 10
  },
  bold: {
    fontWeight: 'bold'
  },
  editText: {
    color: '#007bff',
    textDecorationLine: 'underline'
  },
  success: {
    fontSize: 16,
    textAlign: 'center',
    color: 'green',
    marginBottom: 20
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: '#fff6f2'
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    paddingRight: 8,          
    fontFamily: 'System',   
  },
  eyeIcon: {
    marginLeft: 8,
    padding: 4
  }
});
