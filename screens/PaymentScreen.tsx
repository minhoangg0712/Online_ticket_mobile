import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen({ navigation }) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 15, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Chi tiết sự kiện')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>MADAME SHOW - NHỮNG ĐƯỜNG CHIM BAY</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="white" />
            <Text style={styles.infoText}>Madame de Dalat</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="white" />
            <Text style={styles.infoText}>Thứ 2 - Thứ 5: Tháng 3,6,9,12,4,7,1, Tháng 1,4m Đông</Text>
          </View>
          
          <Text style={styles.timeText}>18:30 - 19:30, 28 tháng 05.2025</Text>
          
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
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Tổng tiền</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>650.000 đ</Text>
              <Ionicons name="chevron-up" size={16} color="#FF7E42" />
            </View>
          </View>
          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>Thanh toán</Text>
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
    flex: 1,
  },
  qrCode: {
    width: 350,
    height: 320,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7E42',
    marginRight: 4,
  },
  payButton: {
    backgroundColor: '#FF7E42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});