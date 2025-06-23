import React, { useState } from 'react';
import { View, SafeAreaView, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import authService from '../services/auth.service';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [message, setMessage] = useState('');

  const schema = Yup.object().shape({
    email: Yup.string().email('Email không hợp lệ').required('Email không được để trống'),
    code: Yup.string().matches(/^\d+$/, 'Mã xác thực chỉ được chứa số').required('Mã xác thực không được để trống'),
    fullName: Yup.string().matches(/^[^!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]*$/, 'Không được chứa ký tự đặc biệt').required('Họ và tên không được để trống'),
    password: Yup.string().min(10, 'Mật khẩu tối thiểu 10 ký tự, gồm hoa, thường, số và ký tự đặc biệt.').required('Mật khẩu không được để trống'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Vui lòng nhập lại mật khẩu'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });

  const onSendVerification = async () => {
    const valid = await trigger('email');
    if (!valid) return;

    const { email } = getValues();

    try {
      setIsLoading(true);
      setMessage('');
      await authService.sendVerificationCode(email);
      setMessage('Mã xác thực đã được gửi!');
      setCurrentStep(2);
    } catch (error) {
      setMessage(error?.message || 'Không thể gửi mã xác minh.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyCode = async () => {
    const valid = await trigger('code');
    if (!valid) return;

    const { email, code } = getValues();

    try {
      setIsLoading(true);
      setMessage('');
      await authService.verifyCode(email, code);
      setCurrentStep(3);
    } catch (error) {
      setMessage(error?.message || 'Mã xác thực không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: any) => {
    setIsLoading(true);
    setMessage('');
    try {
      const res = await authService.register(
        data.email,
        data.code,
        data.fullName,
        data.password,
        data.confirmPassword
      );
      setMessage('Đăng ký thành công!');
      console.log('Token:', res.token);
      navigation.navigate('Login');
    } catch (error) {
      if (Array.isArray(error)) {
        setMessage(error.join('\n'));
      } else {
        setMessage(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header} />
        <View style={styles.fromContainer}>
        <Text style={styles.title}>Đăng ký</Text>

        {currentStep === 1 && (
            <>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                <>
                    <TextInput
                    style={styles.input}
                    placeholder="Nhập email"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    value={value}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                </>
                )}
            />
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={onSendVerification} disabled={isLoading}>
                <Text style={styles.buttonText}>Gửi mã xác thực</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator />}
            </>
        )}

        {currentStep === 2 && (
            <>
            <Controller
                control={control}
                name="code"
                render={({ field: { onChange, value } }) => (
                <>
                    <TextInput
                    style={styles.input}
                    placeholder="Nhập mã xác thực"
                    keyboardType="numeric"
                    onChangeText={onChange}
                    value={value}
                    />
                    {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}
                </>
                )}
            />
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={onVerifyCode} disabled={isLoading}>
                <Text style={styles.buttonText}>Kiểm tra mã</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator />}
            </>
        )}

        {currentStep === 3 && (
            <>
            <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                <>
                    <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    onChangeText={onChange}
                    value={value}
                    />
                    {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}
                </>
                )}
            />

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                    <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={showPassword}
                    onChangeText={onChange}
                    value={value}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconEye}>
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
                    </TouchableOpacity>
                    {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                </View>
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                    <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry={showConfirmPassword}
                    onChangeText={onChange}
                    value={value}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.iconEye}>
                    <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
                    </TouchableOpacity>
                    {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
                </View>
                )}
            />

            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={handleSubmit(onRegister)} disabled={isLoading}>
                <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>
            {isLoading && <ActivityIndicator />}
            </>
        )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fromContainer: {
    padding: 20,
    marginTop: 40,
    backgroundColor: '#FFF6F2',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FF7E42',
  },
  header: {
    height: 100,
    backgroundColor: '#FF7E42',
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingRight: 40,
    marginVertical: 8,
    borderRadius: 5,
  },
  iconEye: {
    position: 'absolute',
    right: 10,
    height: 48,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff7e42',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  message: {
    color: '#ff7e42',
    marginTop: 5,
    textAlign: 'center',
  },
});
