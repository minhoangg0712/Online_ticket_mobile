import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageBackground
} from 'react-native';
import { ArrowLeft, Clock, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MadameShowBooking({ navigation }) {
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
              source={{ uri: 'https://your-server.com/path-to-image.jpg' }}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View style={styles.overlay}>
                <Text style={styles.eventTitle}>MADAME SHOW - NHỮNG ĐƯỜNG CHIM BAY</Text>

                <View style={styles.infoRow}>
                  <Clock size={16} color="white" />
                  <Text style={styles.infoText}>18:30 - 19:30, 28 tháng 06, 2025</Text>
                </View>

                <View style={styles.infoRow}>
                  <MapPin size={16} color="white" />
                  <Text style={styles.infoText}>Madame de Dalat</Text>
                </View>

                <Text style={styles.locationText}>
                  Số 2 Yết Kiêu, Phường 5, Thành phố Đà Lạt, Tỉnh Lâm Đồng
                </Text>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Giới thiệu */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.eventName}>MADAME SHOW</Text>
          <Text style={styles.description}>
            Với sân khấu độc đáo trên nền hồ nước nóng đầy bí ẩn của khu biệt thự Bạch
            Ngọc cổ kính, Madame Show là không
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Phần chân mua vé */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Từ </Text>
          <Text style={styles.price}>650.000 đ</Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => navigation.navigate('Chọn vé')}
        >
          <Text style={styles.buyButtonText}>Mua vé ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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