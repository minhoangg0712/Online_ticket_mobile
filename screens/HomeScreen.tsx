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
};

type NavigationProp = BottomTabNavigationProp<RootStackParamList>;
const featuredEvents = [
  {
    id: '1',
    title: 'THE BEST POP ROCK MOVIE MUSIC',
    date: '17-20.06.2025',
    location: 'Tại Nhà Hát Lớn Hà Nội',
    image: require('../assets/Picture/Anh1.jpg'),
    price: '100.000 VNĐ',
  },
  {
    id: '2',
    title: 'Tía Gì Má Dìa',
    date: '25.06.2025',
    location: 'Cung Văn Hóa Hữu Nghị',
    image: require('../assets/Picture/Anh2.jpg'),
    price: '800.000 VNĐ',
  },
  {
    id: '3',
    title: 'Festival Mùa Hè 2025',
    date: '30.06.2025',
    location: 'Công Viên Thống Nhất',
    image: require('../assets/Picture/Anh2.jpg'),
    price: '600.000 VNĐ',
  },
  {
    id: '4',
    title: 'Đêm Nhạc Acoustic',
    date: '05.07.2025',
    location: 'Không Gian Văn Hóa',
    image: require('../assets/Picture/Anh1.jpg'),
    price: '400.000 VNĐ',
  },
];

const Home = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderBannerSlide = (item, index) => (
    <View key={`slide-${item.id}-${index}`} style={styles.slide}>
      <Image source={item.image} style={styles.banner} />
      <View style={styles.bannerGradient}>
        <TouchableOpacity style={styles.detailButton}>
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageOnlyCard = ({ item }) => (
    <TouchableOpacity style={styles.eventOnlyCard} key={item.id}>
      <Image source={item.image} style={styles.cardOnlyImage} />
    </TouchableOpacity>
  );

  const renderImageCard = ({ item }) => (
    <TouchableOpacity style={styles.horizontalImageCard} key={item.id}>
      <Image source={item.image} style={styles.horizontalImage} />
    </TouchableOpacity>
  );

  const renderEventCard = ({ item }) => (
    <TouchableOpacity style={styles.eventCard} key={item.id}>
      <View style={styles.cardImageContainer}>
        <Image source={item.image} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardInfoRow}>
          <Icon name="calendar" size={12} color="#FF7E42" />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <Text style={styles.cardPrice}>
          <Text style={{ fontSize: 15, color: '#FF7E42' }}>Từ </Text>
          {item.price}
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
            onPress={() => navigation.navigate('Search')}>
            <Icon name="search" size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
            {featuredEvents.map((item, index) => renderBannerSlide(item, index))}
          </Swiper>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện đặc biệt</Text>
          </View>
          <FlatList
            data={featuredEvents}
            horizontal
            keyExtractor={(item) => `special-${item.id}`}
            showsHorizontalScrollIndicator={false}
            renderItem={renderImageOnlyCard}
            contentContainerStyle={styles.eventsContainer}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện xu hướng</Text>
          </View>
          <FlatList
            data={featuredEvents.slice(0, 3)}
            horizontal
            keyExtractor={(item) => `trending-${item.id}`}
            showsHorizontalScrollIndicator={false}
            renderItem={renderImageCard}
            contentContainerStyle={styles.eventsContainer}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dành cho bạn</Text>
          </View>
          <FlatList
            data={featuredEvents}
            horizontal
            keyExtractor={(item) => `foryou-${item.id}`}
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
    backgroundColor: '#FFF6F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF7E42',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
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
});

export default Home;