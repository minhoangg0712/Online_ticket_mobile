import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const TicketScreen = () => {
  const [mainTab, setMainTab] = useState('all'); // Tất cả, Thành công, Đã huỷ
  const [subTab, setSubTab] = useState('upcoming'); // Sắp diễn ra, Đã kết thúc

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

      {/* Content placeholder */}
      <View style={styles.content}>
        <Text>
          Tab chính: {mainTab} - Tab phụ: {subTab}
        </Text>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyText}>Mua vé ngay</Text>
        </TouchableOpacity>
        <View style={styles.line} />
      </View>
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
    paddingHorizontal: 50,
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
    marginBottom: 250
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
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  buyButton: {
    backgroundColor: '#fb7e3f',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  line: {
    height: 1,
    backgroundColor: '#000',
    width: '80%',
    marginTop: 30,
  },
});

