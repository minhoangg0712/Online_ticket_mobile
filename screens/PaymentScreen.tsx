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
  Image,
  Dimensions,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';

const { width } = Dimensions.get('window');

// Use machine IP or 10.0.2.2 for emulator
const API_URL = 'http://10.0.2.2:8080/api/orders'; // Replace with machine IP for physical device

// Define type for navigation params
type RootStackParamList = {
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[]; event: any };
  'Vé của tôi': undefined;
};

// Define types for navigation and route
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
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Countdown timer
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

  // Calculate total amount
  const totalAmount = tickets && event?.ticketPrices && event?.ticketTypes
    ? tickets.reduce((sum, ticket) => {
        const ticketType = event.ticketTypes[ticket.ticketId.toString()];
        const price = Number(event.ticketPrices[ticketType] || 0);
        return sum + ticket.quantity * price;
      }, 0)
    : 0;

  // Handle payment
  const handlePayment = async () => {
    if (!eventId || !tickets || tickets.length === 0) {
      Alert.alert('Lỗi', 'Không có thông tin vé hoặc sự kiện');
      return;
    }

    // Check ticket sale time
    const currentTime = new Date();
    const eventStartTime = new Date(event.startTime);
    if (currentTime > eventStartTime) {
      Alert.alert('Lỗi', 'Thời gian bán vé đã kết thúc');
      return;
    }

    

    // Check ticket availability for "Thường" or "Nguyên"
    const ticketTypeKey = event.ticketTypes[tickets[0].ticketId.toString()];
    const availableTickets = event.ticketsTotal[ticketTypeKey] - (event.ticketsSold[ticketTypeKey] || 0);
    const requestedTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);
    if (requestedTickets > availableTickets) {
      Alert.alert('Lỗi', `Chỉ còn ${availableTickets} vé ${ticketTypeKey} khả dụng`);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
  
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để mua vé!');
        setLoading(false);
        return;
      }
      const body = {
        eventId,
        tickets,
        ...(discountCode && { discountCode }),
        returnUrl: 'https://url.ngrok-free.app/success',
        cancelUrl: 'https://url.ngrok-free.app/cancel',
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
   
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo đơn hàng');
      }
      const result = await response.json();
      if (result.data?.checkoutUrl) {
        setCheckoutUrl(result.data.checkoutUrl);
      } else {
        throw new Error('No checkout URL provided');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.message.includes('Ticket sale for Thường has not started')) {
        Alert.alert('Lỗi', 'Thời gian bán vé cho loại vé Thường chưa bắt đầu. Vui lòng kiểm tra lại thời gian sự kiện.');
      } else {
        Alert.alert('Lỗi', `Không thể tạo đơn hàng: ${error.message}`);
      }
      setLoading(false);
    }
  };

  // Handle WebView navigation
  const handleWebViewNavigation = (navState: { url: string }) => {
    const { url } = navState;
    if (url.includes('https://url.ngrok-free.app/success')) {
      setCheckoutUrl(null); // Hide WebView
      Alert.alert('Thành công', 'Thanh toán hoàn tất!');
      navigation.navigate('Vé của tôi');
    } else if (url.includes('https://url.ngrok-free.app/cancel')) {
      setCheckoutUrl(null); // Hide WebView
      Alert.alert('Thông báo', 'Thanh toán đã bị hủy.');
      setLoading(false);
    }
  };

  // Check for missing data
  if (!event || !eventId || !tickets) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không có dữ liệu sự kiện hoặc vé
        </Text>
      </SafeAreaView>
    );
  }

  // Render WebView if checkoutUrl exists
  if (checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setCheckoutUrl(null);
              setLoading(false);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>
        <WebView
          source={{ uri: checkoutUrl }}
          style={styles.webView}
          onNavigationStateChange={handleWebViewNavigation}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator size="large" color="#FF7E42" style={styles.loading} />
          )}
        />
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          {/* Event Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.backgroundUrl || 'https://via.placeholder.com/300' }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.eventTitle}>{event.eventName}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#4B5563" />
            <Text style={styles.infoText}>{event.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#4B5563" />
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
        <View style={styles.bottomPadding} />
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
            <Text style={styles.payButtonText}>
              {loading ? 'Đang xử lý...' : 'Thanh toán'}
            </Text>
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
  } as ViewStyle,
  header: {
    backgroundColor: '#FF7E42',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 30,
    justifyContent: 'center',
  } as ViewStyle,
  backButton: {
    position: 'absolute',
    left: 16,
  } as ViewStyle,
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  } as ViewStyle,
  eventInfo: {
    backgroundColor: 'white',
    padding: 16,
    flex: 1,
  } as ViewStyle,
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    marginTop: -16,
  } as ViewStyle,
  eventImage: {
    width: '100%',
    height: 200,
  } as ImageStyle,
  eventTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  infoText: {
    color: '#4B5563',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 16,
  },
  ticketInfo: {
    marginBottom: 16,
  } as ViewStyle,
  sectionTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ticketText: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  timerContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  } as ViewStyle,
  timerLabel: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 8,
  },
  timerNumbers: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  timerBox: {
    backgroundColor: '#FF7E42',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  } as ViewStyle,
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as ViewStyle,
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  priceLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
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
  } as ViewStyle,
  disabledButton: {
    backgroundColor: '#E5E7EB',
  } as ViewStyle,
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  } as ViewStyle,
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  } as ViewStyle,
  bottomPadding: {
    height: 80,
  } as ViewStyle,
});