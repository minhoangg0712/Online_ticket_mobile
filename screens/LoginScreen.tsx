import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const LoginScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng nhập</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ email"
          placeholderTextColor="#888"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Chưa có tài khoản?</Text>

        <TouchableOpacity>
          <Text style={styles.registerLink}>Tạo tài khoản ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleBtn}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
            }}
            style={styles.googleIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7E42',
  },
  header: {
    height: 100,
    backgroundColor: '#FF7E42',
  },
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
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF7E42',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotPassword: {
    color: '#333',
    marginBottom: 12,
  },
  footerText: {
    marginTop: 8,
    color: '#333',
  },
  registerLink: {
    color: '#FF7E42',
    marginTop: 4,
    fontWeight: '600',
  },
  googleBtn: {
    marginTop: 20,
    padding: 8,
    borderRadius: 8,
  },
  googleIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
});

export default LoginScreen;