import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import searchService from '../services/searchService';
import eventService from '../services/eventService';

const { width } = Dimensions.get('window');

type SearchStackParamList = {
  SearchScreen: undefined;
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[]; event: any };
};

type NavigationProp = NativeStackNavigationProp<SearchStackParamList, 'SearchScreen'>;

interface Event {
  eventId: string | number;
  eventName: string;
  address?: string;
  startTime: string;
  endTime?: string;
  category?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  minPrice?: string | number;
  totalTicketSold?: number;
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [selectedAddress, setSelectedAddress] = useState<string>(''); // thêm state cho địa chỉ

  const categories = [
    { label: 'Tất cả', value: '' },
    { label: 'Âm nhạc', value: 'Music' },
    { label: 'Nghệ thuật sân khấu', value: 'Theatre-Arts' },
    { label: 'Hội thảo', value: 'Workshop' },
    { label: 'Thể thao', value: 'Sport' },
    { label: 'Khác', value: 'Other' },
  ];

  const address = [
    { label: 'Toàn quốc', value: '' },
    { label: 'Hà Nội', value: 'Hà Nội' },
    { label: 'TP. Hồ Chí Minh', value: 'TP. Hồ Chí Minh' },
    { label: 'Đà Lạt', value: 'Đà Lạt' },
    { label: 'Vị trí Khác', value: 'Vị trí khác' },
  ];

  const handleEventPress = async (eventId: string | number) => {
    if (!eventId) {
      setError('Không thể mở chi tiết sự kiện');
      return;
    }
    try {
      const eventDetails = await eventService.getEventDetails(String(eventId));
      if (!eventDetails) {
        setError('Không thể tải thông tin sự kiện');
        return;
      }
      navigation.navigate('Chi tiết sự kiện', { event: eventDetails.data || eventDetails });
    } catch (error) {
      setError('Lỗi khi tải chi tiết sự kiện');
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim() && !selectedCategory && !selectedAddress) {
      setError('Vui lòng nhập từ khóa hoặc chọn bộ lọc');
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const data = await searchService.getRecommendedEvents({
        name: keyword,
        category: selectedCategory,
        address: selectedAddress,
      });

      let eventList: Event[] = [];
      if (Array.isArray(data.events)) {
        eventList = data.events
          .filter(event => event && event.eventId)
          .map(event => ({
            ...event,
            eventId: String(event.eventId),
            minPrice: event.minPrice ? parseFloat(String(event.minPrice)) || event.minPrice : 0,
            eventName: event.eventName || 'Sự kiện không tên',
            startTime: event.startTime || new Date().toISOString(),
          }));
      }

      setResults(eventList);
      if (eventList.length === 0) {
        setError('Không tìm thấy sự kiện nào phù hợp');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tìm kiếm');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Thời gian không xác định';
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Thời gian không xác định';
    }
  };

  const formatPrice = (price: string | number) => {
    try {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (isNaN(numPrice) || numPrice <= 0) return 'Miễn phí';
      return `${numPrice.toLocaleString('vi-VN')} VNĐ`;
    } catch {
      return 'Miễn phí';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Nhập từ khóa"
            value={keyword}
            onChangeText={(text) => {
              setKeyword(text);
              if (error && text.trim()) setError('');
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!loading}
          />
          <TouchableOpacity onPress={handleSearch} disabled={loading} style={styles.searchIconBtn}>
            {loading ? (
              <ActivityIndicator size="small" color="#FF7E42" />
            ) : (
              <Feather name="search" size={26} color="#FF7E42" />
            )}
          </TouchableOpacity>
        </View>

        {/* Dropdown category */}
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={styles.picker}
          >
            {categories.map(cat => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>

        {/* Dropdown address */}
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedAddress}
            onValueChange={(value) => setSelectedAddress(value)}
            style={styles.picker}
          >
            {address.map(addr => (
              <Picker.Item key={addr.value} label={addr.label} value={addr.value} />
            ))}
          </Picker>
        </View>

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Search results */}
        <View style={styles.resultsContainer}>
          {hasSearched && results.length === 0 && !loading && !error ? (
            <View style={styles.noResultContainer}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultText}>Không tìm thấy sự kiện nào</Text>
              <Text style={styles.noResultSubText}>Thử tìm kiếm với từ khóa khác</Text>
            </View>
          ) : (
            results.map((item) => (
              <TouchableOpacity
                style={styles.eventCard}
                key={`event-${item.eventId}`}
                onPress={() => handleEventPress(item.eventId)}
              >
                <View style={styles.cardImageContainer}>
                  {item.logoUrl ? (
                    <Image source={{ uri: item.logoUrl }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cardImage, styles.placeholderImage]}>
                      <Ionicons name="image-outline" size={24} color="#ccc" />
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.eventName}</Text>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="calendar" size={12} color="#FF7E42" />
                    <Text style={styles.cardDate}>{formatDateTime(item.startTime)}</Text>
                  </View>
                  <Text style={styles.cardPrice}>
                    <Text style={{ fontSize: 15, color: '#FF7E42' }}>Từ </Text>
                    {formatPrice(item.minPrice)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F2', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, marginBottom: 20, position: 'relative' },
  backBtn: { position: 'absolute', left: 0, height: '100%', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderColor: '#FF7E42', paddingVertical: 6, marginBottom: 10 },
  input: { marginLeft: 8, flex: 1, paddingVertical: 4, fontSize: 16 },
  searchIconBtn: { paddingHorizontal: 8 },
  dropdownContainer: { borderWidth: 1, borderColor: '#FF7E42', borderRadius: 8, marginBottom: 15 },
  picker: { height: 50, width: '100%' },
  errorText: { color: 'red', marginTop: 10, marginBottom: 10, textAlign: 'center', fontSize: 14 },
  resultsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  noResultContainer: { alignItems: 'center', paddingVertical: 40 },
  noResultText: { fontSize: 16, color: '#666', marginBottom: 5, marginTop: 10 },
  noResultSubText: { fontSize: 14, color: '#999', textAlign: 'center' },
  eventCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardImageContainer: { width: '100%', height: 100, backgroundColor: '#f0f0f0' },
  cardImage: { width: '100%', height: '100%' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  cardContent: { padding: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333', lineHeight: 18 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#666', marginLeft: 4, flex: 1 },
  cardPrice: { fontSize: 13, marginTop: 4, color: '#333', fontWeight: '500' },
});
