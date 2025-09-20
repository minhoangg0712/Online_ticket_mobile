import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { ArrowLeft, Clock, MapPin, Star } from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventService from '../services/eventService';

const { width } = Dimensions.get('window');

// Define type for navigation params, synced with PaymentScreen
type RootStackParamList = {
  'Chi tiết sự kiện': { event: any };
  'Chọn vé': { event: any };
  'Thanh toán': { eventId: number; tickets: { ticketId: number; quantity: number }[]; event: any };
  'Vé của tôi': undefined;
  'Login': undefined;
};

// Define types for navigation and route
type DetailEventScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chi tiết sự kiện'>;
type DetailEventScreenRouteProp = RouteProp<RootStackParamList, 'Chi tiết sự kiện'>;

// Define type for comment
interface Comment {
  commentId: number;
  userName: string;
  commentText: string;
  createdAt: string;
  rating?: number;
  userId?: number; // Added for edit check
}

interface Props {
  navigation: DetailEventScreenNavigationProp;
  route: DetailEventScreenRouteProp;
}

const DetailEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { event } = route.params || {}; // Get event data from navigation
  const [comment, setComment] = useState(''); // State for comment input
  const [rating, setRating] = useState(0); // State for rating input
  const [comments, setComments] = useState<Comment[]>([]); // State for fetched comments
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // State for editing comment
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(0);

  // Check if no event is provided
  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Vui lòng chọn một sự kiện từ Trang chủ
        </Text>
      </View>
    );
  }

  // Check if event has ended
  const isEventEnded = new Date(event.endTime) < new Date();
  // Check if event status is completed
  const isEventComplete = event.status === 'completed' || event.status === 'complete';

  // Fetch comments when event is complete
  useEffect(() => {
    const fetchComments = async () => {
      if (!isEventComplete) {
        return;
      }
      setLoadingComments(true);
      setErrorComments(null);
      try {
        const fetchedComments = await eventService.getEventComments(event.eventId);
        setComments(fetchedComments);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setComments([]); // Không có bình luận, hiển thị "Chưa có bình luận nào"
        } else {
          console.error('Failed to fetch comments:', error);
          setErrorComments('Không thể tải bình luận. Vui lòng kiểm tra kết nối mạng và thử lại.');
          Alert.alert(
            'Lỗi',
            'Không thể tải bình luận. Vui lòng thử lại sau.',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Thử lại', onPress: () => fetchComments() },
            ]
          );
        }
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [isEventComplete, event.eventId]);

  // Calculate price display
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

  // Handle "Mua vé ngay" button press
  const handleBuyTicket = async () => {
    if (isEventEnded) {
      Alert.alert('Thông báo', 'Sự kiện đã kết thúc, không thể mua vé nữa.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để mua vé!');
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('Chọn vé', { event });
    } catch (error) {
      console.error('Error checking token:', error);
      Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái đăng nhập. Vui lòng thử lại.');
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận!');
      return;
    }
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn đánh giá (1-5 sao)!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để gửi bình luận!');
        navigation.navigate('Login');
        return;
      }

      const newComment = await eventService.postEventComment(event.eventId, rating, comment);
      setComments([newComment, ...comments]);
      setComment('');
      setRating(0);
      Alert.alert('Thành công', 'Bình luận đã được gửi!');
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại sau.');
    }
  };

  // Handle edit comment
  const handleUpdateComment = async (reviewId: number) => {
    if (!editingComment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận!');
      return;
    }
    if (editingRating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn đánh giá (1-5 sao)!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để cập nhật bình luận!');
        navigation.navigate('Login');
        return;
      }

      await eventService.updateEventComment(reviewId, editingRating, editingComment);
      const updatedComments = comments.map(c => 
        c.commentId === reviewId ? { ...c, commentText: editingComment, rating: editingRating } : c
      );
      setComments(updatedComments);
      setEditingCommentId(null);
      setEditingComment('');
      setEditingRating(0);
      Alert.alert('Thành công', 'Bình luận đã được cập nhật!');
    } catch (error: any) {
      console.error('Error updating comment:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật bình luận. Vui lòng thử lại sau.');
    }
  };

  // Start editing a comment
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.commentId);
    setEditingComment(comment.commentText);
    setEditingRating(comment.rating || 0);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingComment('');
    setEditingRating(0);
  };

  // Handle text input change
  const handleCommentChange = (text: string) => {
    setComment(text);
  };

  // Render rating stars
  const renderRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={24}
              color={star <= rating ? '#FB923C' : '#D1D5DB'}
              fill={star <= rating ? '#FB923C' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render editing rating stars
  const renderEditingRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setEditingRating(star)}
            style={styles.starButton}
          >
            <Star
              size={24}
              color={star <= editingRating ? '#FB923C' : '#D1D5DB'}
              fill={star <= editingRating ? '#FB923C' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        <View style={styles.cardContainer}>
          <View style={styles.eventCard}>
            <Image
              source={{ uri: event.backgroundUrl || 'https://via.placeholder.com/300' }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.eventTitle}>{event.eventName}</Text>
          <View style={styles.infoRow}>
            <Clock size={16} color="#4B5563" />
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
            <MapPin size={16} color="#4B5563" />
            <Text style={styles.infoText}>{event.address}</Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.eventName}>{event.eventName}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Comment Section */}
        {isEventComplete && (
          <View style={styles.commentContainer}>
            <Text style={styles.sectionTitle}>Bình luận</Text>
            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <View style={styles.inputWrapper}>
                {renderRatingStars()}
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận của bạn..."
                  value={comment}
                  onChangeText={handleCommentChange}
                  multiline
                  autoCapitalize="none"
                  keyboardType="default"
                  returnKeyType="done"
                  textContentType="none"
                />
              </View>
              <TouchableOpacity style={styles.submitCommentButton} onPress={handleSubmitComment}>
                <Text style={styles.submitCommentButtonText}>Gửi</Text>
              </TouchableOpacity>
            </View>
            {/* Comment List */}
            <View style={styles.commentList}>
              {loadingComments ? (
                <Text style={styles.commentText}>Đang tải bình luận...</Text>
              ) : errorComments ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.commentText}>{errorComments}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                      setLoadingComments(true);
                      setErrorComments(null);
                      eventService.getEventComments(event.eventId).then(setComments).catch(() => {
                        setErrorComments('Không thể tải bình luận. Vui lòng thử lại.');
                      }).finally(() => setLoadingComments(false));
                    }}
                  >
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.commentId} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{comment.userName || 'Người dùng ẩn danh'}</Text>
                    {comment.rating && (
                      <Text style={styles.commentRating}>Đánh giá: {comment.rating}/5</Text>
                    )}
                    <Text style={styles.commentText}>{comment.commentText}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {editingCommentId === comment.commentId ? (
                      <View style={styles.editContainer}>
                        {renderEditingRatingStars()}
                        <TextInput
                          style={styles.editInput}
                          value={editingComment}
                          onChangeText={setEditingComment}
                          multiline
                        />
                        <View style={styles.editButtons}>
                          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdateComment(comment.commentId)}>
                            <Text style={styles.updateButtonText}>Cập nhật</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.editButton} onPress={() => startEditing(comment)}>
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.commentText}>Chưa có bình luận nào.</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Price and Buy Button */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Từ </Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          )}
          <Text style={styles.price}>{displayPrice}</Text>
        </View>
        <TouchableOpacity
          style={[styles.buyButton, isEventEnded && styles.disabledButton]}
          onPress={handleBuyTicket}
          disabled={isEventEnded}
        >
          <Text style={styles.buyButtonText}>
            {isEventEnded ? 'Sự kiện đã kết thúc' : 'Mua vé ngay'}
          </Text>
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
    paddingTop: 20,
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
  eventImage: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
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
  commentContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    marginRight: 4,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    backgroundColor: '#F9FAFB',
    fontFamily: undefined, // Use default system font
  },
  submitCommentButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitCommentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  commentList: {
    marginTop: 8,
  },
  commentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  commentRating: {
    fontSize: 14,
    color: '#FB923C',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#1F2937',
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    minHeight: 60,
    backgroundColor: '#F9FAFB',
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  updateButtonText: {
    fontSize: 14,
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: 'white',
  },
  errorContainer: {
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  bottomPadding: {
    height: 80,
  },
});

export default DetailEventScreen;