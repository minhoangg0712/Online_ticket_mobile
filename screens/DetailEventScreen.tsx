
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

// Định nghĩa type cho navigation params, đồng bộ với PaymentScreen
type RootStackParamList = {
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[]; event: any };
  'Vé của tôi': undefined;
};

// Định nghĩa type cho navigation và route
type DetailEventScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chi tiết sự kiện'>;
type DetailEventScreenRouteProp = RouteProp<RootStackParamList, 'Chi tiết sự kiện'>;

interface Props {
  navigation: DetailEventScreenNavigationProp;
  route: DetailEventScreenRouteProp;
}

const DetailEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { event } = route.params || {}; // Lấy dữ liệu sự kiện từ navigation

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

  // Tính giá hiển thị
  const getPriceDisplay = () => {
    if (!event.ticketPrices || !Object.keys(event.ticketPrices).length) {
      return { displayPrice: 'Miễn phí', originalPrice: null };
    }

    const ticketKeys = Object.keys(event.ticketPrices);
    if (!ticketKeys.length) {
      return { displayPrice: 'Miễn phí', originalPrice: null };
    }

    const minOriginalPrice = Math.min(...ticketKeys.map((key) => Number(event.ticketPrices[key] || 0)));
    const soldKeys = event.ticketsSold
      ? ticketKeys.filter((key) => (event.ticketsSold[key] || 0) > 0)
      : [];

    if (soldKeys.length > 0) {
      const soldPrices = soldKeys.map((key) => Number(event.ticketPrices[key] || 0));
      const minSoldPrice = Math.min(...soldPrices);
      return {
        displayPrice: `${minSoldPrice.toLocaleString('vi-VN')} VNĐ`,
        originalPrice: minSoldPrice < minOriginalPrice ? `${minOriginalPrice.toLocaleString('vi-VN')} VNĐ` : null,
      };
    }

    return {
      displayPrice: `${minOriginalPrice.toLocaleString('vi-VN')} VNĐ`,
      originalPrice: null,
    };
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
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FB923C',
    paddingVertical: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
  backCircle: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageBackground: {
    width: '100%',
    height: 200,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: 'white',
  },
  detailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
  },
  bottomPadding: {
    height: 80,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  originalPrice: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  buyButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default DetailEventScreen;
