import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Search: undefined;
  // Thêm các màn hình khác nếu cần
};

type NavigationProp = BottomTabNavigationProp<RootStackParamList>;

const featuredEvents = [
  {
    id: '1',
    title: 'THE BEST POP ROCK MOVIE MUSIC',
    date: '17-20.06.2025',
    location: 'Tại Nhà Hát Lớn Hà Nội',
    image: require('../assets/Picture/Anh1.jpg'),
    price: '500K - 1.5M VNĐ',
    category: 'Âm nhạc',
  },
  {
    id: '2',
    title: 'Tía Gì Má Dìa',
    date: '25.06.2025',
    location: 'Cung Văn Hóa Hữu Nghị',
    image: require('../assets/Picture/Anh2.jpg'),
    price: '300K - 800K VNĐ',
    category: 'Workshop',
  },
  {
    id: '3',
    title: 'Festival Mùa Hè 2025',
    date: '30.06.2025',
    location: 'Công Viên Thống Nhất',
    image: require('../assets/Picture/Anh2.jpg'),
    price: '200K - 600K VNĐ',
    category: 'Festival',
  },
  {
    id: '4',
    title: 'Đêm Nhạc Acoustic',
    date: '05.07.2025',
    location: 'Không Gian Văn Hóa',
    image: require('../assets/Picture/Anh1.jpg'),
    price: '150K - 400K VNĐ',
    category: 'Âm nhạc',
  },
];

const Home = () => {
  const navigation = useNavigation<NavigationProp>();
  const renderBannerSlide = (item) => (
    <View key={item.id} style={styles.slide}>
      <Image source={item.image} style={styles.banner} />
      <View style={styles.bannerGradient}>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
      </View>
    </View>
  );

  const renderEventCard = ({ item }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.cardImageContainer}>
        <Image source={item.image} style={styles.cardImage} />
        <View style={styles.cardCategoryBadge}>
          <Text style={styles.cardCategoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardInfoRow}>
          <Icon name="calendar" size={12} color="#FF7E42" />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <View style={styles.cardInfoRow}>
          <Icon name="map-marker" size={12} color="#FF7E42" />
          <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đặt vé</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={[styles.categoryItem, { backgroundColor: item.color }]}>
      <Icon name={item.icon} size={24} color="#fff" />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.swiperContainer}>
          <Swiper
            style={styles.swiper}
            autoplay
            autoplayTimeout={4}
            height={280}
            dot={<View style={styles.dot} />}
            activeDot={<View style={styles.activeDot} />}
            paginationStyle={styles.pagination}
          >
            {featuredEvents.map(renderBannerSlide)}
          </Swiper>
        </View>

        {/* Special Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện đặc biệt</Text>
          </View>
          <FlatList
            data={featuredEvents}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={renderEventCard}
            contentContainerStyle={styles.eventsContainer}
          />
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện xu hướng</Text>
          </View>
          <FlatList
            data={featuredEvents.slice(0, 3)}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={renderEventCard}
            contentContainerStyle={styles.eventsContainer}
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF7E42',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    elevation: 8,
    shadowColor: '#FF7E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  logoImage: {
    width: 130,
    height: 45,
    resizeMode: 'contain',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    marginLeft: 15,
    position: 'relative',
    padding: 8,
  },

  swiperContainer: {
    height: 280,
    marginBottom: 20,
  },

  swiper: {
    height: 280,
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

  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  categoryBadge: {
    backgroundColor: 'rgba(255, 126, 66, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  bannerDate: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },

  bannerLocation: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },

  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  detailButtonText: {
    color: '#FF7E42',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },

  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },

  activeDot: {
    backgroundColor: '#fff',
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
    paddingHorizontal: 20,
  },

  seeAllText: {
    color: '#FF7E42',
    fontSize: 14,
    fontWeight: '600',
  },

  categoriesContainer: {
    paddingHorizontal: 15,
  },

  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  categoryName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  eventsContainer: {
    paddingHorizontal: 15,
  },

  eventCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    width: 220,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  cardImageContainer: {
    position: 'relative',
  },

  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },

  cardCategoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 126, 66, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  cardCategoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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

  cardLocation: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7E42',
  },

  bookButton: {
    backgroundColor: '#FF7E42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  bookButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  bottomSpace: {
    height: 30,
  },
});

export default Home;