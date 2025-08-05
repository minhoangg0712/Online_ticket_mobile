import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  Image,
  RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTicketByUserIdAxios } from '../services/userService';

const TicketScreen = ({}) => {
  const [mainTab, setMainTab] = useState('all');
  const [subTab, setSubTab] = useState('upcoming')
  const [userId, setUserId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser?.sub) {
            setUserId(parsedUser.sub);
            console.log('✅ User ID (sub):', parsedUser.sub);
          } else {
            console.warn('⚠️ Không tìm thấy sub trong user');
          }
        }
      } catch (err) {
        console.error('❌ Lỗi khi lấy user từ AsyncStorage:', err);
      }
    };

    fetchUserId();
  }, []);


  useEffect(() => {
    if (userId) {
      fetchUserTickets();
    }
  }, [userId]);


  useEffect(() => {
    filterTickets();
  }, [tickets, mainTab, subTab]);

  const fetchUserTickets = async (isRefresh = false) => {
    if (!userId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const orders = await getTicketByUserIdAxios(userId);

      let allTickets = [];
      for (const order of orders) {
        const { tickets, orderDate, status, cancellationReason, totalAmount } = order;
        
        if (Array.isArray(tickets)) {
          const enriched = tickets.map(ticket => ({
            ...ticket,
            orderDate,
            status,
            cancellationReason,
            totalAmount,
            eventName: ticket.event?.name,
            eventAddress: ticket.event?.address,
            eventImage: ticket.event?.image,
          }));
          allTickets.push(...enriched);
        }
      }

      setTickets(allTickets);
    } catch (err) {
      setError(err.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách vé');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const filterTickets = () => {
    let filtered = [...tickets];
    const currentDate = new Date();

    // Filter by main tab (status)
    if (mainTab === 'success') {
      filtered = filtered.filter(ticket => 
        ticket.status === 'paid'
      );
    } else if (mainTab === 'cancelled') {
      filtered = filtered.filter(ticket => 
        ticket.status === 'cancelled'
      );
    }

    // Filter by sub tab (time)
    if (subTab === 'upcoming') {
      filtered = filtered.filter(ticket => {
        const eventDate = new Date(ticket.eventStartTime || ticket.startTime);
        return eventDate >= currentDate;
      });
    } else if (subTab === 'finished') {
      filtered = filtered.filter(ticket => {
        const eventDate = new Date(ticket.eventEndTime || ticket.endTime || ticket.eventStartTime);
        return eventDate < currentDate;
      });
    }

    setFilteredTickets(filtered);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'paid': 'Thành công',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'paid': '#4CAF50',
      'cancelled': '#F44336'
    };
    return colorMap[status] || '#666';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseFloat(price));
  };

  const handleRefresh = () => {
    fetchUserTickets(true);
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity style={styles.ticketCard}>
      {/* Ticket Header */}
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketId}>#{item.ticketId || item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      {/* Event Image */}
      {item.eventImage && (
        <Image 
          source={{ uri: item.eventImage }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}

      {/* Event Details */}
      <View style={styles.eventDetails}>
        <Text style={styles.eventName} numberOfLines={2}>
          {item.eventName || item.title || 'Tên sự kiện'}
        </Text>
        
        {item.eventAddress && (
          <Text style={styles.eventAddress} numberOfLines={2}>
            📍 {item.eventAddress}
          </Text>
        )}

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            🗓️ {formatDateTime(item.eventStartTime || item.startTime)}
          </Text>
          {item.eventEndTime && (
            <Text style={styles.timeText}>
              ⏰ Kết thúc: {formatDateTime(item.eventEndTime)}
            </Text>
          )}
        </View>

        {/* Ticket Details */}
        <View style={styles.ticketDetails}>
          {item.ticketType && (
            <Text style={styles.ticketType}>
              🎫 Loại vé: {item.ticketType}
            </Text>
          )}
          {item.quantity && (
            <Text style={styles.quantity}>
              Số lượng: {item.quantity}
            </Text>
          )}
          {item.price && (
            <Text style={styles.price}>
              💰 {formatCurrency(item.price)}
            </Text>
          )}
        </View>

        {/* Purchase Date */}
        {item.purchaseDate && (
          <Text style={styles.purchaseDate}>
            Mua ngày: {formatDateTime(item.purchaseDate)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vé của tôi</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fb7e3f" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vé của tôi</Text>

        {/* Tabs chính */}
        <View style={styles.mainTabContainer}>
          {['all', 'success', 'cancelled'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.mainTabButton,
                mainTab === tab && styles.mainTabSelected,
              ]}
              onPress={() => {
                setMainTab(tab);
                setSubTab('upcoming'); // reset sub tab khi đổi main tab
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mainTab === tab && styles.tabTextSelected,
                ]}
              >
                {tab === 'all' ? 'Tất cả' : tab === 'success' ? 'Thành công' : 'Đã huỷ'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tabs phụ */}
      <View style={styles.subTabContainer}>
        {['upcoming', 'finished'].map((sub) => (
          <TouchableOpacity
            key={sub}
            onPress={() => setSubTab(sub)}
            style={[
              styles.subTabButton,
              subTab === sub && styles.subTabSelected,
            ]}
          >
            <Text
              style={[
                styles.subText,
                subTab === sub && styles.subTextSelected,
              ]}
            >
              {sub === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tickets List */}
      <FlatList
        data={filteredTickets}
        keyExtractor={(item, index) => `${item.ticketId || item.id || 'ticket'}-${index}`}
        renderItem={renderTicketItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#fb7e3f']}
          />
        }
        contentContainerStyle={
          filteredTickets.length === 0 ? styles.emptyList : styles.ticketsList
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default TicketScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6f3',
  },
  header: {
    backgroundColor: '#fb7e3f',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
  },
  mainTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  mainTabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    borderWidth: 0.3,
    marginHorizontal: 4,
  },
  mainTabSelected: {
    backgroundColor: '#fff',
    borderColor: '#fb7e3f',
    borderWidth: 1,
  },
  tabText: {
    color: '#fb7e3f',
    fontWeight: '600',
    opacity: 0.6,
  },
  tabTextSelected: {
    color: '#fb7e3f',
    opacity: 1,
  },
  subTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  subTabButton: {
    paddingBottom: 4,
  },
  subTabSelected: {
    borderBottomWidth: 2,
    borderColor: '#fb7e3f',
  },
  subText: {
    fontSize: 14,
    color: '#000',
  },
  subTextSelected: {
    color: '#fb7e3f',
    fontWeight: '600',
  },
  ticketsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  ticketId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventDetails: {
    padding: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  eventAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  timeContainer: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  ticketDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketType: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fb7e3f',
  },
  purchaseDate: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buyButton: {
    backgroundColor: '#fb7e3f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});