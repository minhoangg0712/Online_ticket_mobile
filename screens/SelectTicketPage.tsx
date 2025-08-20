import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ChevronLeft, Minus, Plus } from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

// Định nghĩa type cho navigation params
type RootStackParamList = {
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[]; event: any };
  'Vé của tôi': undefined;
};

// Định nghĩa type cho navigation và route
type SelectTicketPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chọn vé'>;
type SelectTicketPageRouteProp = RouteProp<RootStackParamList, 'Chọn vé'>;

interface Props {
  navigation: SelectTicketPageNavigationProp;
  route: SelectTicketPageRouteProp;
}

const SelectTicketPage: React.FC<Props> = ({ navigation, route }) => {
  const { event } = route.params || {};
  
  // Kiểm tra nếu không có event
  if (!event || !event.ticketPrices) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không có dữ liệu sự kiện hoặc vé
        </Text>
      </SafeAreaView>
    );
  }

  // Khởi tạo quantities dựa trên số lượng loại vé
  const ticketTypes = Object.keys(event.ticketPrices);
  const [quantities, setQuantities] = useState<number[]>(new Array(ticketTypes.length).fill(0));

  const updateQuantity = (index: number, change: number) => {
    setQuantities((prev) => {
      const newQuantities = [...prev];
      const maxAvailable = event.ticketsTotal?.[ticketTypes[index]] || 100; // Giới hạn số vé còn lại
      newQuantities[index] = Math.max(0, Math.min(maxAvailable, newQuantities[index] + change));
      return newQuantities;
    });
  };

  const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

  // Tạo danh sách tickets để gửi sang PaymentPage
  const tickets = ticketTypes
    .map((type, index) => ({
      ticketId: index + 1, // Giả định ticketId, cần thay bằng dữ liệu thực từ API
      quantity: quantities[index],
    }))
    .filter((ticket) => ticket.quantity > 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.circle}>
            <ChevronLeft size={20} color="#374151" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn số lượng vé</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Section Headers */}
        <View style={styles.sectionHeaders}>
          <Text style={styles.headerText}>Loại vé</Text>
          <Text style={styles.headerText}>Số lượng</Text>
        </View>

        {/* Ticket List */}
        <View style={styles.ticketList}>
          {ticketTypes.map((type, index) => (
            <React.Fragment key={type}>
              <View style={styles.ticketRow}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>{type}</Text>
                  <Text style={styles.ticketPrice}>
                    {Number(event.ticketPrices[type]).toLocaleString('vi-VN')} đ
                  </Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(index, -1)}
                    style={[
                      styles.quantityButton,
                      quantities[index] === 0 && styles.disabledButton,
                    ]}
                    disabled={quantities[index] === 0}
                  >
                    <Minus size={16} color="#4B5563" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantities[index]}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(index, 1)}
                    style={styles.quantityButton}
                  >
                    <Plus size={16} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </View>
              {index < ticketTypes.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <View style={styles.eventDetails}>
            <Text style={styles.eventEmoji}>🎭</Text>
            <View style={styles.eventText}>
              <Text style={styles.eventTitle}>{event.eventName}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.startTime).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              totalQuantity > 0 ? styles.activeButton : styles.inactiveButton,
            ]}
            disabled={totalQuantity === 0}
            onPress={() =>
              navigation.navigate('Thanh toán', {
                eventId: event.eventId,
                tickets,
                event, // Truyền thêm event để hiển thị thông tin
              })
            }
          >
            <Text
              style={[
                styles.buttonText,
                totalQuantity > 0 ? styles.activeButtonText : styles.inactiveButtonText,
              ]}
            >
              Tiếp tục
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 10,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  ticketList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  ticketPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  bottomSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  eventInfo: {
    marginBottom: 16,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  eventText: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FB923C',
  },
  inactiveButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#fff',
  },
  inactiveButtonText: {
    color: '#6B7280',
  },
});
export default SelectTicketPage;
