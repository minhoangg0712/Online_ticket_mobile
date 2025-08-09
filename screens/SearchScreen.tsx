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
  Modal,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import searchService from '../services/searchService';
import eventService from '../services/eventService';
import { Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type SearchStackParamList = {
  SearchScreen: undefined;
  'Chi tiết sự kiện': { event: any };
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
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

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
    try {
      const eventDetails = await eventService.getEventDetails(String(eventId));
      navigation.navigate('Chi tiết sự kiện', { event: eventDetails.data || eventDetails });
    } catch {
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

      const eventList: Event[] = (data.events || [])
        .filter(event => event?.eventId)
        .map(event => ({
          ...event,
          eventId: String(event.eventId),
          minPrice: event.minPrice ? parseFloat(String(event.minPrice)) || event.minPrice : 0,
          eventName: event.eventName || 'Sự kiện không tên',
          startTime: event.startTime || new Date().toISOString(),
        }));

      setResults(eventList);
      if (eventList.length === 0) setError('Không tìm thấy sự kiện nào phù hợp');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tìm kiếm');
      setResults([]);
    } finally {
      setLoading(false);
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

        {/* Filter icons */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowCategoryPicker(true)}>
            <Feather name="grid" size={22} color="#FF7E42" />
            <Text style={styles.filterLabel}>
              {categories.find(cat => cat.value === selectedCategory)?.label || 'Tất cả'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowAddressPicker(true)}>
            <Ionicons name="location-outline" size={22} color="#FF7E42" />
            <Text style={styles.filterLabel}>
              {address.find(addr => addr.value === selectedAddress)?.label || 'Toàn quốc'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Picker Modal */}
        <Modal transparent visible={showCategoryPicker} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setShowCategoryPicker(false);
                }}
              >
                {categories.map(cat => (
                  <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Address Picker Modal */}
        <Modal transparent visible={showAddressPicker} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={selectedAddress}
                onValueChange={(value) => {
                  setSelectedAddress(value);
                  setShowAddressPicker(false);
                }}
              >
                {address.map(addr => (
                  <Picker.Item key={addr.value} label={addr.label} value={addr.value} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

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
                  {item.backgroundUrl ? (
                    <Image source={{ uri: item.backgroundUrl }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="image-outline" size={28} color="#ccc" />
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.eventName}</Text>
                  <View style={styles.cardInfoRow}>
                    <Calendar size={12} color="#FF7E42" />
                    <Text style={styles.cardDate}>
                      {new Date(item.startTime).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <Text style={styles.cardPrice}>
                    <Text style={{ fontSize: 15, color: '#FF7E42' }}>Từ </Text>
                    {Number(item.minPrice) > 0 
                      ? `${Number(item.minPrice).toLocaleString('vi-VN')} VNĐ` 
                      : 'Miễn phí'}
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
  filterRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    padding: 10,
  },
  errorText: { color: 'red', marginTop: 10, marginBottom: 10, textAlign: 'center', fontSize: 14 },
  resultsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  noResultContainer: { alignItems: 'center', paddingVertical: 40 },
  noResultText: { fontSize: 16, color: '#666', marginBottom: 5, marginTop: 10 },
  noResultSubText: { fontSize: 14, color: '#999', textAlign: 'center' },
  eventCard: {
    backgroundColor: '#fff6f2',
    borderRadius: 16,
    overflow: 'hidden',
    width: (width - 20 * 2 - 10) / 2,
    marginBottom: 15,
  },
  cardImageContainer: { width: '100%', height: 100, backgroundColor: '#f0f0f0' },
  cardImage: { width: '100%', height: '100%' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  cardContent: { padding: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333', lineHeight: 18 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#666', marginLeft: 4, flex: 1 },
  cardPrice: { fontSize: 13, marginTop: 4, color: '#333', fontWeight: '500' },
  filterBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: '#FF7E42',
  borderRadius: 8,
  backgroundColor: '#fff6f2',
},
filterLabel: {
  marginLeft: 6,
  fontSize: 14,
  color: '#FF7E42',
  fontWeight: '500',
},

});
