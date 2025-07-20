
// screens/DetailEventScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { ArrowLeft, Clock, MapPin } from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

// Định nghĩa type cho navigation params
type RootStackParamList = {
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[] };
};

// Định nghĩa type cho navigation và route
type DetailEventScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chi tiết sự kiện'>;
type DetailEventScreenRouteProp = RouteProp<RootStackParamList, 'Chi tiết sự kiện'>;

interface Props {
  navigation: DetailEventScreenNavigationProp;
  route: DetailEventScreenRouteProp;
}

const DetailEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { event } = route.params || {}; // Lấy dữ liệu sự kiện từ navigation, thêm kiểm tra route.params

  // Kiểm tra nếu không có event
  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Vui lòng chọn một sự kiện từ Trang chủ
        </Text>
      </View>
    );
  }

  // Lấy giá vé dựa trên ticketsSold
  const getPriceDisplay = () => {
    if (!event.ticketPrices || Object.keys(event.ticketPrices).length === 0) {
      return { displayPrice: 'Miễn phí', originalPrice: null };
    }

    const ticketKeys = Object.keys(event.ticketPrices);
    const soldKeys = ticketKeys.filter((key) => event.ticketsSold?.[key] > 0);
    const minOriginalPrice = Math.min(...ticketKeys.map((key) => Number(event.ticketPrices[key])));

    if (soldKeys.length > 0) {
      // Có vé đã bán, lấy giá nhỏ nhất từ các loại vé đã bán
      const soldPrices = soldKeys.map((key) => Number(event.ticketPrices[key]));
      const minSoldPrice = Math.min(...soldPrices);
      return {
        displayPrice: `${minSoldPrice} VNĐ`,
        originalPrice: minSoldPrice < minOriginalPrice ? `${minOriginalPrice} VNĐ` : null,
      };
    } else {
      // Không có vé đã bán, hiển thị giá gốc
      return { displayPrice: `${minOriginalPrice} VNĐ`, originalPrice: null };
    }
  };

  const { displayPrice, originalPrice } = getPriceDisplay();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FB923C" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backCircle}>
            <ArrowLeft size={20} color="#FB923C" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
      </View>

      {/* Nội dung chính */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thẻ sự kiện */}
        <View style={styles.cardContainer}>
          <View style={styles.eventCard}>
            <ImageBackground
              source={{ uri: event.backgroundUrl || 'https://via.placeholder.com/300' }}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View style={styles.overlay}>
                <Text style={styles.eventTitle}>{event.eventName}</Text>

                <View style={styles.infoRow}>
                  <Clock size={16} color="white" />
                  <Text style={styles.infoText}>
                    {new Date(event.startTime).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })} -{' '}
                    {new Date(event.endTime).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MapPin size={16} color="white" />
                  <Text style={styles.infoText}>{event.address}</Text>
                </View>

                <Text style={styles.locationText}>{event.address}</Text>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Giới thiệu */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.eventName}>{event.eventName}</Text>
          <Text style={styles.description}>{event.description}</Text>

        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Phần chân mua vé */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Từ </Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          )}
          <Text style={styles.price}>{displayPrice}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => navigation.navigate('Chọn vé', { event })}
        >
          <Text style={styles.buyButtonText}>Mua vé ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FB923C',
    paddingTop: 50,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    padding: 16,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#D1D5DB',
  },
  imageBackground: {
    height: 300,
    backgroundColor: '#4B5563',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  eventName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  rejectReason: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 8,
  },
  bottomPadding: {
    height: 80,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  price: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  buyButton: {
    backgroundColor: '#FB923C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetailEventScreen;
