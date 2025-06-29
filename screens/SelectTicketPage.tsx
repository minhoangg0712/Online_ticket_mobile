import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { ChevronLeft, Minus, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function VIPTicketSelection() {
  const [quantities, setQuantities] = useState([0, 0]);

  const updateQuantity = (index, change) => {
    setQuantities(prev => {
      const newQuantities = [...prev];
      newQuantities[index] = Math.max(0, newQuantities[index] + change);
      return newQuantities;
    });
  };

  const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
  <View style={styles.circle}>
    <ChevronLeft size={20} color="#374151" />
  </View>
</TouchableOpacity>

      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Section Headers */}
        <View style={styles.sectionHeaders}>
          <Text style={styles.headerText}>Loại vé</Text>
          <Text style={styles.headerText}>Số lượng</Text>
        </View>

        {/* VIP Tickets */}
        <View style={styles.ticketList}>
          {/* First VIP Option */}
          <View style={styles.ticketRow}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketTitle}>VIP</Text>
              <Text style={styles.ticketPrice}>2.000.000 đ</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                onPress={() => updateQuantity(0, -1)}
                style={[
                  styles.quantityButton,
                  quantities[0] === 0 && styles.disabledButton
                ]}
                disabled={quantities[0] === 0}
              >
                <Minus size={16} color="#4B5563" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantities[0]}</Text>
              <TouchableOpacity 
                onPress={() => updateQuantity(0, 1)}
                style={styles.quantityButton}
              >
                <Plus size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Second VIP Option */}
          <View style={styles.ticketRow}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketTitle}>VIP</Text>
              <Text style={styles.ticketPrice}>2.000.000 đ</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                onPress={() => updateQuantity(1, -1)}
                style={[
                  styles.quantityButton,
                  quantities[1] === 0 && styles.disabledButton
                ]}
                disabled={quantities[1] === 0}
              >
                <Minus size={16} color="#4B5563" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantities[1]}</Text>
              <TouchableOpacity 
                onPress={() => updateQuantity(1, 1)}
                style={styles.quantityButton}
              >
                <Plus size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <View style={styles.eventDetails}>
            <Text style={styles.eventEmoji}>🎭</Text>
            <View style={styles.eventText}>
              <Text style={styles.eventTitle}>MADAME SHOW - NHỮNG ĐƯỜNG CHIM BAY</Text>
              <Text style={styles.eventTime}>19:30 - 19:30 Thứng 06 năm 2025</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              totalQuantity > 0 ? styles.activeButton : styles.inactiveButton
            ]}
            disabled={totalQuantity === 0}
          >
            <Text style={[
              styles.buttonText,
              totalQuantity > 0 ? styles.activeButtonText : styles.inactiveButtonText
            ]}>
              Vui lòng chọn vé
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8',
  },
  circle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#d1d5db',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 1,
  elevation: 2, // Android
},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fdf2f8',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  sectionHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
  },
  ticketList: {
    gap: 24,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  ticketPrice: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  eventInfo: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  eventEmoji: {
    fontSize: 14,
  },
  eventText: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  eventTime: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  buttonContainer: {
    padding: 16,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#f97316',
  },
  inactiveButton: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  inactiveButtonText: {
    color: '#6b7280',
  },
});