import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const navigation = useNavigation();

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
          <Ionicons name="search" size={24} color="#000" />
          <TextInput style={styles.input} placeholder="Nhập từ khóa" />
        </View>

        {/* Filter buttons */}
        <View style={styles.filters}>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="calendar" size={16} color="#555" />
            <Text style={styles.filterText}>Tất cả các ngày</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="sliders" size={16} color="#555" />
            <Text style={styles.filterText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Keywords */}
        <Text style={styles.groupTitle}>Từ khóa phổ biến</Text>
        <View style={styles.tags}>
          {['ntpmm', 'kịch', 'workshop'].map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thể loại */}
        <Text style={styles.groupTitle}>Khám phá theo thể loại</Text>
        <View style={styles.boxGroup}>
          <View style={styles.box}>
            <Text style={styles.boxText}>Nhạc sống</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxText}>Sân khấu & nghệ thuật</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 20,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  borderBottomWidth: 2,
  borderColor: '#FF7E42',
  paddingVertical: 6,
  marginBottom: 15,
  },

  input: {
  marginLeft: 8,
  flex: 1,
  paddingVertical: 4,
  fontSize: 16,
  },

  filters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E6E6',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#FFECE6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tagText: {
    color: '#D65A31',
    fontWeight: '500',
    fontSize: 14,
  },
  boxGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  box: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boxText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
