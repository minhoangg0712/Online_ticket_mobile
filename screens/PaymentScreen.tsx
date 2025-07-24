import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sử dụng IP máy hoặc 10.0.2.2 cho emulator
const API_URL = 'http://10.0.2.2:8080/api/orders'; // Thay bằng IP máy nếu chạy trên thiết bị vật lý

// Định nghĩa type cho navigation params
type RootStackParamList = {
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[]; event: any };
  'Vé của tôi': undefined;
};

// Định nghĩa type cho navigation và route
type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Thanh toán'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Thanh toán'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

export default function PaymentScreen({ navigation, route }: Props) {
  const { eventId, tickets, event } = route.params || {};
  const [timeLeft, setTimeLeft] = useState({ minutes: 15, seconds: 0 });
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Bộ đếm thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        clearInterval(timer);
        Alert.alert('Hết thời gian', 'Thời gian đặt vé đã hết. Vui lòng thử lại.');
        navigation.goBack();
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigation]);

  // Tính tổng tiền
  const totalAmount = tickets && event?.ticketPrices && event?.ticketTypes
    ? tickets.reduce((sum, ticket) => {
        const ticketType = event.ticketTypes[ticket.ticketId.toString()];
        const price = Number(event.ticketPrices[ticketType] || 0);
        return sum + ticket.quantity * price;
      }, 0)
    : 0;

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!eventId || !tickets || tickets.length === 0) {
      Alert.alert('Lỗi', 'Không có thông tin vé hoặc sự kiện');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('Token not found');
      }

      // Cập nhật request body với returnUrl và cancelUrl
      const body = { 
        eventId, 
        tickets, 
        discountCode: discountCode || undefined,
        returnUrl: "https://url.ngrok-free.app/success",
        cancelUrl: "https://url.ngrok-free.app/cancel"
      };
      
      console.log('Request body:', body);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      
      // Kiểm tra nếu có payment URL (cho các payment gateway như PayPal, Stripe, etc.)
      if (result.paymentUrl) {
        Alert.alert(
          'Chuyển hướng thanh toán', 
          'Bạn sẽ được chuyển đến trang thanh toán',
          [
            {
              text: 'Hủy',
              style: 'cancel',
            },
            {
              text: 'Tiếp tục',
              onPress: () => {
                // Ở đây bạn có thể mở WebView hoặc deep link đến payment URL
                console.log('Payment URL:', result.paymentUrl);
                // Tạm thời navigate đến success page
                Alert.alert('Thành công', 'Đơn hàng đã được tạo thành công!');
                navigation.navigate('Vé của tôi');
              }
            }
          ]
        );
      } else {
        // Trường hợp thanh toán trực tiếp thành công
        Alert.alert('Thành công', 'Đơn hàng đã được tạo thành công!');
        navigation.navigate('Vé của tôi');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', `Không thể tạo đơn hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra nếu không có dữ liệu
  if (!event || !eventId || !tickets) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không có dữ liệu sự kiện hoặc vé
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.eventName}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="white" />
            <Text style={styles.infoText}>{event.address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="white" />
            <Text style={styles.infoText}>
              {new Date(event.startTime).toLocaleString('vi-VN', {
                weekday: 'long',
                month: 'long',
                day: '2-digit',
                year: 'numeric',
              })}
            </Text>
          </View>
          
          <Text style={styles.timeText}>
            {new Date(event.startTime).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })} -{' '}
            {new Date(event.endTime).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })},{' '}
            {new Date(event.startTime).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
          
          {/* Ticket Info */}
          <View style={styles.ticketInfo}>
            <Text style={styles.sectionTitle}>Thông tin vé</Text>
            {tickets.map((ticket, index) => (
              <Text key={index} style={styles.ticketText}>
                {event.ticketTypes[ticket.ticketId.toString()]}: {ticket.quantity} vé
              </Text>
            ))}
            <TextInput
              style={styles.input}
              placeholder="Nhập mã giảm giá"
              placeholderTextColor="#9CA3AF"
              value={discountCode}
              onChangeText={setDiscountCode}
            />
          </View>
          
          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Hoàn tất đặt vé trong</Text>
            <View style={styles.timerNumbers}>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>MÃ QR</Text>
          
          {/* QR Code Placeholder */}
          <View style={styles.qrContainer}>
            <View style={styles.qrCode}>
              <Text style={styles.qrPlaceholder}>QR Code</Text>
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentInfoTitle}>Thông tin thanh toán</Text>
            <Text style={styles.paymentInfoText}>
              • Sau khi nhấn "Thanh toán", bạn sẽ được chuyển đến trang thanh toán an toàn
            </Text>
            <Text style={styles.paymentInfoText}>
              • Hệ thống sẽ tự động xử lý và gửi vé qua email
            </Text>
            <Text style={styles.paymentInfoText}>
              • Vé sẽ xuất hiện trong tab "Vé của tôi" sau khi thanh toán thành công
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Tổng tiền</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>
                {totalAmount.toLocaleString('vi-VN')} đ
              </Text>
              <Ionicons name="chevron-up" size={16} color="#FF7E42" />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.disabledButton]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.payButtonText}>Thanh toán</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#FF7E42',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  eventInfo: {
    backgroundColor: '#9F9A9A',
    padding: 16,
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 16,
  },
  ticketInfo: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ticketText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  timerContainer: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timerLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  timerNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  timerBox: {
    backgroundColor: '#FF7E42',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrSection: {
    padding: 16,
    flex: 1,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCode: {
    width: 300,
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  paymentInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7E42',
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7E42',
    marginRight: 4,
  },
  payButton: {
    backgroundColor: '#FF7E42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});