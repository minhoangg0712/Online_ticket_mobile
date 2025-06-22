import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'home') iconName = 'home';
          else if (route.name === 'ticket') iconName = 'ticket';
          else if (route.name === 'profile') iconName = 'person';
          else if (route.name === 'login') iconName = 'log-in';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    />
  );
}
