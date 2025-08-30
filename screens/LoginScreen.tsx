import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../services/authContext';
// import { GoogleSignin} from '@react-native-google-signin/google-signin';
import authService from '../services/authService';
// import { useGoogleAuth } from '../services/googleAuthService'; 

type RootParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootParamList, 'Login'>;

const schema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu'),
});

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });

  const onLogin = async (data: any) => {
  setIsLoading(true);
  setMessage('');
  try {
    await login(data.email, data.password);
    navigation.replace('Home');
  } catch (error: any) {
    let errMsg = 'Đăng nhập thất bại.';

    if (typeof error === 'string') {
      errMsg = error;
    } else if (error instanceof Error) {
      errMsg = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errMsg = (error as any).message;
    }
    setMessage(errMsg);
  } finally {
    setIsLoading(false);
  }
};


  // const handleGoogleLogin = async () => {
  // try {
  //   await GoogleSignin.hasPlayServices();
  //   const userInfo = await GoogleSignin.signIn();
  //   const tokens = await GoogleSignin.getTokens();
  //   const idToken = tokens.idToken;

  //   if (idToken) {
  //     setIsLoading(true);
  //     const result = await authService.googleLogin(idToken);
  //     navigation.replace('Home');
  //   } else {
  //     setMessage('Không nhận được ID token từ Google.');
  //   }
  // } catch (error) {
  //   console.log('Google Login Error:', error);
  //   setMessage('Đăng nhập Google thất bại.');
  // } finally {
  //   setIsLoading(false);
  // }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Home')}>
          <Icon name="close-circle-outline" size={40} color="white" style={styles.headerIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng nhập</Text>

        {/* Email Input */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </>
          )}
        />

        {/* Password Input */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={{ width: '100%', position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#888"
                secureTextEntry={showPassword}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconEye}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
              {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            </View>
          )}
        />

        {/* Error Message */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onLogin)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        {isLoading && <ActivityIndicator />}

        {/* Other Actions */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Tạo tài khoản ngay</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
          <Image
            source={require('../assets/Picture/google48.png')}
            style={styles.googleIcon}
          />
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF7E42' },
  header: { height: 100, backgroundColor: '#FF7E42' },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF6F2',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  iconEye: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  message: {
    color: '#ff7e42',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF7E42',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  forgotPassword: { color: '#333', marginBottom: 12 },
  footerText: { marginTop: 8, color: '#333' },
  registerLink: { color: '#FF7E42', marginTop: 4, fontWeight: '600' },
  googleBtn: { marginTop: 20, padding: 8, borderRadius: 8 },
  googleIcon: { width: 36, height: 36, resizeMode: 'contain' },
  headerIcon: {
    color: 'white',
    fontSize: 35,
    marginTop: 40,
    marginLeft: 15,
  },
});

export default LoginScreen;
