import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useHiringState } from '../../src/state';

export default function TabsLayout() {
  const { t, activeBookings } = useHiringState();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.navHome || 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarBadge: activeBookings.length > 0 ? activeBookings.length : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EA580C', fontSize: 10 },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="workers"
        options={{
          title: t.navWorkers || 'Workers',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>👷‍♂️</Text>,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t.navJobs || 'Jobs',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null, // Hidden from primary bottom bar, accessible via notifs/chat
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.navProfile || 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🏢</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
