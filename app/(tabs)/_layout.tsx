import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#444444',
        tabBarLabelStyle: { fontSize: 10, marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.apps,
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: t.tabs.editor,
          tabBarIcon: ({ color, size }) => <Feather name="code" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="permissions"
        options={{
          title: t.tabs.permissions,
          tabBarIcon: ({ color, size }) => <Feather name="shield" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
