import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from '../screens/HomeScreen';
import Ticket from '../screens/TicketScreen';
import Profile from '../screens/ProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SelectTicketPage from '../screens/SelectTicketPage';
import DetailEventScreen from '../screens/DetailEventScreen';
const Tab = createBottomTabNavigator();

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
          } else if (route.name === 'Tài khoản') {
            iconName = focused ? 'person' : 'person-outline';
          }else if (route.name === 'Thanh toán') {
            iconName = focused ? 'card' : 'card-outline';
          }else if (route.name === 'Chọn vé') {
            iconName = focused ? 'list' : 'list-outline';
          }else if (route.name === 'Chi tiết sự kiện') {
            iconName = focused ? 'info' : 'info-outline';
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
      <Tab.Screen name="Trang chủ" component={Home} />
      <Tab.Screen name="Vé của tôi" component={Ticket} />
      <Tab.Screen name="Tài khoản" component={Profile} />
      <Tab.Screen name="Thanh toán" component={PaymentScreen} />
      <Tab.Screen name="Chọn vé" component={SelectTicketPage} />
      <Tab.Screen name="Chi tiết sự kiện" component={DetailEventScreen} />
    </Tab.Navigator>
    
  );
};

export default TabNavigator;
