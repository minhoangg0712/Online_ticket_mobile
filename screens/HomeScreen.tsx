import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import eventService from '../services/eventService';

const { width } = Dimensions.get('window');

export type HomeStackParamList = {
  HomeMain: undefined;
  Search: undefined;
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': {
    eventId: number;
    tickets: { ticketId: number; quantity: number }[];
    event: any;
  };
};

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Home = () => {
  const navigation = useNavigation<NavigationProp>();
  const [timeTab, setTimeTab] = React.useState<'thisWeek' | 'thisMonth'>('thisWeek');
  const [loading, setLoading] = React.useState(true);
  const [recommendedEvents, setRecommendedEvents] = React.useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const data = await eventService.getRecommendedEvents();
        if (isMounted) setRecommendedEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchEvents();
    return () => { isMounted = false; };
  }, []);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const eventsThisWeek = recommendedEvents.filter(event => {
    if (!event.startTime) return false;
    const startTime = new Date(event.startTime);
    return startTime >= startOfWeek && startTime <= endOfWeek;
  });

  const eventsThisMonth = recommendedEvents.filter(event => {
    const startTime = new Date(event.startTime);
    return startTime >= startOfMonth && startTime <= endOfMonth;
  });

  const handleEventPress = async (eventId: string) => {
    try {      
      const eventDetails = await eventService.getEventDetails(eventId);
      navigation.navigate('Chi tiết sự kiện', { event: eventDetails.data || eventDetails });
    } catch (error) {
      console.error('Error navigating to event details:', error);
    }
  };

  const renderBannerSlide = ({ item, index }) => (
    <View key={`slide-${item.eventId}-${index}`} style={styles.slide}>
      <Image source={{ uri: item.backgroundUrl }} style={styles.banner} />
      <View style={styles.bannerGradient}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handleEventPress(item.eventId)}
        >
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageOnlyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.eventOnlyCard}
      key={item.eventId}
      onPress={() => handleEventPress(item.eventId)}
    >
      <Image source={{ uri: item.backgroundUrl }} style={styles.cardOnlyImage} />
    </TouchableOpacity>
  );

  const renderImageCard = ({ item }) => (
    <TouchableOpacity
      style={styles.horizontalImageCard}
      key={item.eventId}
      onPress={() => handleEventPress(item.eventId)}
    >
      <Image source={{ uri: item.backgroundUrl }} style={styles.horizontalImage} />
    </TouchableOpacity>
  );

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      key={item.eventId}
      onPress={() => handleEventPress(item.eventId)}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.backgroundUrl }} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.eventName}</Text>
        <View style={styles.cardInfoRow}>
          <Icon name="calendar" size={12} color="#FF7E42" />
          <Text style={styles.cardDate}>
            {new Date(item.startTime).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.cardPrice}>
          <Text style={{ fontSize: 15, color: '#FF7E42' }}>Từ </Text>
        {parseFloat(item.minPrice) > 0 
          ? `${Number(item.minPrice).toLocaleString('vi-VN')} VNĐ` 
          : 'Miễn phí'}
      </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logoeventa.png')}
          style={styles.logoImage}
        />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF7E42" style={{ marginTop: 50 }} />
      ) : recommendedEvents.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không có sự kiện nào để hiển thị
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banner Swiper */}
          <View style={styles.swiperContainer}>
            <Swiper
              style={styles.swiper}
              autoplay={true}
              autoplayTimeout={5}
              height={250}
              showsPagination={true}
              dot={<View style={styles.dot} />}
              activeDot={<View style={styles.activeDot} />}
              paginationStyle={styles.pagination}
              removeClippedSubviews={false}
              loop={true}
              index={0}
            >
              {recommendedEvents.slice(0, 5).map((item, index) => renderBannerSlide({ item, index }))}
            </Swiper>
          </View>

          {/* Sự kiện đặc biệt */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sự kiện đặc biệt</Text>
            </View>
            <FlatList
              data={recommendedEvents}
              horizontal
              keyExtractor={(item) => `special-${item.eventId}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderImageOnlyCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>

          {/* Sự kiện xu hướng */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sự kiện xu hướng</Text>
            </View>
            <FlatList
              data={recommendedEvents.slice(0, 3)}
              horizontal
              keyExtractor={(item) => `trending-${item.eventId}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderImageCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>

          {/* Dành cho bạn */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dành cho bạn</Text>
            </View>
            <FlatList
              data={recommendedEvents}
              horizontal
              keyExtractor={(item) => `foryou-${item.eventId}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>

          {/* Sự kiện theo thời gian */}
          <View style={styles.section}>
            <View style={styles.timeTabContainer}>
              {['thisWeek', 'thisMonth'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setTimeTab(tab as 'thisWeek' | 'thisMonth')}
                  style={[styles.timeTabButton,]}
                >
                  <Text
                    style={[
                      styles.timeTabText,
                      timeTab === tab && styles.timeTabTextSelected,
                    ]}
                  >
                    {tab === 'thisWeek' ? 'Tuần này' : 'Tháng này'}
                  </Text>
                  {timeTab === tab && <View style={styles.timeTabUnderline} />}
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              data={timeTab === 'thisWeek' ? eventsThisWeek : eventsThisMonth}
              horizontal
              keyExtractor={(item, index) => item.eventId?.toString() || index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>

          {/* Các danh mục sự kiện */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Âm nhạc</Text>
            </View>
            <FlatList
              data={recommendedEvents.filter(event => event.category === 'Music')}
              horizontal
              keyExtractor={(item, index) => item.eventId ? `music-${item.eventId}` : `music-${index}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sân khấu và nghệ thuật</Text>
            </View>
            <FlatList
              data={recommendedEvents.filter(event => event.category === 'Theatre-Arts')}
              horizontal
              keyExtractor={(item, index) => item.eventId ? `Theatre-Arts-${item.eventId}` : `Theatre-Arts-${index}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workshop</Text>
            </View>
            <FlatList
              data={recommendedEvents.filter(event => event.category === 'Workshop')}
              horizontal
              keyExtractor={(item, index) => item.eventId ? `workshop-${item.eventId}` : `workshop-${index}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thể thao</Text>
            </View>
            <FlatList
              data={recommendedEvents.filter(event => event.category === 'Sport')}
              horizontal
              keyExtractor={(item, index) => item.eventId ? `Thể thao-${item.eventId}` : `Thể thao-${index}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khác</Text>
            </View>
            <FlatList
              data={recommendedEvents.filter(event => event.category === 'Other')}
              horizontal
              keyExtractor={(item, index) => item.eventId ? `Khác-${item.eventId}` : `Khác-${index}`}
              showsHorizontalScrollIndicator={false}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF7E42',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
  },
  logoImage: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
    padding: 8,
  },
  swiperContainer: {
    height: 250,
    marginBottom: 20,
  },
  swiper: {
    height: 250,
  },
  slide: {
    flex: 1,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  detailButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  detailButtonText: {
    color: '#FF7E42',
    fontWeight: '600',
    fontSize: 14,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#FF7E42',
    width: 20,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  pagination: {
    bottom: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  eventsContainer: {
    paddingHorizontal: 15,
  },
  eventCard: {
    backgroundColor: '#fff6f2',
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    width: 270,
  },
  eventOnlyCard: {
    backgroundColor: '#fff6f2',
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    width: 190,
  },
  cardOnlyImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 16,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 16,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6,
    fontWeight: '500',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7E42',
  },
  bottomSpace: {
    height: 30,
  },
  horizontalImageCard: {
    width: width * 0.65,
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeTabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  timeTabButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    position: 'relative',
  },
  timeTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  timeTabTextSelected: {
    color: '#FF7E42',
    fontWeight: '600',
  },
  timeTabUnderline: {
    height: 3,
    width: 90,
    backgroundColor: '#FF7E42',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  timeGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeImageBox: {
    width: width * 0.65,
    backgroundColor: '#fff6f2',
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 0,
  },
});

export default Home;