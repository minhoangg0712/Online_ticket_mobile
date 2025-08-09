import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/HomeScreen';
import Ticket from '../screens/TicketScreen';
import Profile from '../screens/ProfileScreen';
import ChatBot from '../screens/ChatBotScreen'; 
import SearchScreen from '../screens/SearchScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SelectTicketPage from '../screens/SelectTicketPage';
import DetailEventScreen from '../screens/DetailEventScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator cho luồng Home -> Chi tiết sự kiện -> Chọn vé -> Thanh toán
const HomeStack = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Chi tiết sự kiện" component={DetailEventScreen} />
      <Stack.Screen name="Chọn vé" component={SelectTicketPage} />
      <Stack.Screen name="Thanh toán" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

// Stack Navigator cho Vé của tôi (nếu cần thêm screens khác)
const TicketStack = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TicketMain" component={Ticket} />
      {/* Có thể thêm chi tiết vé, lịch sử vé, etc. */}
    </Stack.Navigator>
  );
};

// Stack Navigator cho Profile (nếu cần thêm screens khác)
const ProfileStack = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} />
      {/* Có thể thêm edit profile, settings, etc. */}
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      id={undefined}
      initialRouteName="Trang chủ"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';
          
          if (route.name === 'Trang chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vé của tôi') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'Trợ lý ảo') {
            iconName = focused ? 'person' : 'chatbubble-outline';
          } else if (route.name === 'Tài khoản') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF7E42',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {
          backgroundColor: '#D9D9D9',
        },
      })}
    >
      {/* Sử dụng Stack thay vì component trực tiếp */}
      <Tab.Screen name="Trang chủ" component={HomeStack} />
      <Tab.Screen name="Vé của tôi" component={TicketStack} />
      <Tab.Screen name="Trợ lý ảo" component={ChatBot} />
      <Tab.Screen name="Tài khoản" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default TabNavigator;