import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DetailScreen from './src/screens/DetailScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import SafetyHubScreen from './src/screens/SafetyHubScreen';

import type { RootStackParamList, TabParamList } from './src/types/types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const COLORS = {
  primary: '#1A2A44',
  accent: '#E63946',
  tabActive: '#E63946',
  tabInactive: '#8E9AAF',
  background: '#F8F9FA',
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Search: '🔍',
    Map: '📍',
    Alerts: '🔔',
    Safety: '🛡️',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{icons[label] || '•'}</Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? COLORS.tabActive : COLORS.tabInactive,
          fontWeight: focused ? '700' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E8E8',
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Search" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Safety" component={SafetyHubScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={HomeTabs}
          options={{ title: 'SafeNeighbor' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'Offender Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}