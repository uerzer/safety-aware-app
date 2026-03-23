import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOffenderSearch } from '../hooks/useOffenderSearch';
import { useLocation } from '../hooks/useLocation';
import type { RootStackParamList, Offender, RiskLevel } from '../types/types';
import { COLORS, RISK_COLORS } from '../utils/constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { location, loading: locLoading, requestLocation } = useLocation();
  const { results, loading, error, search, searchByCoords } = useOffenderSearch();

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'address' | 'gps'>('address');

  const handleSearch = useCallback(async () => {
    if (searchMode === 'gps') {
      const loc = await requestLocation();
      if (loc) {
        await searchByCoords(loc.latitude, loc.longitude);
      }
    } else if (query.trim()) {
      await search(query.trim());
    }
  }, [searchMode, query, requestLocation, searchByCoords, search]);

  const getRiskBadge = (level: RiskLevel) => (
    <View style={[styles.badge, { backgroundColor: RISK_COLORS[level] }]}>
      <Text style={styles.badgeText}>{level.toUpperCase()}</Text>
    </View>
  );

  const renderOffender = ({ item }: { item: Offender }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { offender: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>
            {item.address}
          </Text>
          <Text style={styles.cardOffense} numberOfLines={1}>
            {item.offenseDescription}
          </Text>
        </View>
        {getRiskBadge(item.riskLevel)}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.distance}>
          {item.distance ? `${item.distance.toFixed(1)} mi` : '--'}
        </Text>
        <Text style={styles.status}>
          {item.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Search Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Find Registered Offenders</Text>
          <Text style={styles.subtitle}>
            Search by address, zip code, or current location
          </Text>

          {/* Toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                searchMode === 'address' && styles.toggleActive,
              ]}
              onPress={() => setSearchMode('address')}
            >
              <Text
                style={[
                  styles.toggleText,
                  searchMode === 'address' && styles.toggleTextActive,
                ]}
              >
                Address / Zip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                searchMode === 'gps' && styles.toggleActive,
              ]}
              onPress={() => setSearchMode('gps')}
            >
              <Text
                style={[
                  styles.toggleText,
                  searchMode === 'gps' && styles.toggleTextActive,
                ]}
              >
                My Location
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          {searchMode === 'address' && (
            <TextInput
              style={styles.input}
              placeholder="Enter address, city, or zip code..."
              placeholderTextColor="#8E9AAF"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          )}

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            disabled={loading || locLoading}
          >
            {loading || locLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.searchBtnText}>
                {searchMode === 'gps' ? 'Search Nearby' : 'Search'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderOffender}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {error ? '' : 'Search to view results'}
                </Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#B0BEC5',
    marginBottom: 16,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.accent,
  },
  toggleText: {
    color: '#B0BEC5',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1A2A44',
    marginBottom: 12,
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardAddress: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardOffense: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  distance: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  status: { fontSize: 12, color: '#6B7280' },
  errorBox: {
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: { color: '#DC2626', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});