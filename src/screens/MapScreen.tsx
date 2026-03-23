import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocation } from '../hooks/useLocation';
import { useOffenderSearch } from '../hooks/useOffenderSearch';
import type { RootStackParamList, Offender, RiskLevel } from '../types/types';
import { COLORS, RISK_COLORS, DEFAULT_REGION, RADIUS_OPTIONS } from '../utils/constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function MapScreen() {
  const navigation = useNavigation<Nav>();
  const mapRef = useRef<MapView>(null);
  const { location, loading: locLoading, requestLocation } = useLocation();
  const { results, loading, searchByCoords } = useOffenderSearch();

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [radiusIdx, setRadiusIdx] = useState(1); // default 1 mile
  const radiusMiles = RADIUS_OPTIONS[radiusIdx];

  useEffect(() => {
    (async () => {
      const loc = await requestLocation();
      if (loc) {
        const newRegion: Region = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: radiusMiles * 0.03,
          longitudeDelta: radiusMiles * 0.03,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
        await searchByCoords(loc.latitude, loc.longitude, radiusMiles);
      }
    })();
  }, []);

  const handleRadiusChange = async () => {
    const nextIdx = (radiusIdx + 1) % RADIUS_OPTIONS.length;
    setRadiusIdx(nextIdx);
    const r = RADIUS_OPTIONS[nextIdx];
    if (location) {
      const newRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: r * 0.03,
        longitudeDelta: r * 0.03,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
      await searchByCoords(location.latitude, location.longitude, r);
    }
  };

  const getMarkerColor = (level: RiskLevel): string => RISK_COLORS[level];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Search radius circle */}
        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={radiusMiles * 1609.34}
            strokeColor="rgba(230, 57, 70, 0.3)"
            fillColor="rgba(230, 57, 70, 0.08)"
            strokeWidth={2}
          />
        )}

        {/* Offender pins */}
        {results.map((offender) => (
          <Marker
            key={offender.id}
            coordinate={{
              latitude: offender.latitude,
              longitude: offender.longitude,
            }}
            pinColor={getMarkerColor(offender.riskLevel)}
            title={offender.name}
            description={offender.offenseDescription}
            onCalloutPress={() =>
              navigation.navigate('Detail', { offender })
            }
          />
        ))}
      </MapView>

      {/* Controls overlay */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.radiusBtn}
          onPress={handleRadiusChange}
        >
          <Text style={styles.radiusBtnText}>{radiusMiles} mi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locateBtn}
          onPress={async () => {
            const loc = await requestLocation();
            if (loc) {
              const newRegion: Region = {
                latitude: loc.latitude,
                longitude: loc.longitude,
                latitudeDelta: radiusMiles * 0.03,
                longitudeDelta: radiusMiles * 0.03,
              };
              setRegion(newRegion);
              mapRef.current?.animateToRegion(newRegion, 500);
              await searchByCoords(loc.latitude, loc.longitude, radiusMiles);
            }
          }}
        >
          <Text style={styles.locateBtnText}>My Location</Text>
        </TouchableOpacity>
      </View>

      {/* Result count */}
      <View style={styles.countBadge}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.accent} />
        ) : (
          <Text style={styles.countText}>
            {results.length} offender{results.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {(['low', 'moderate', 'high'] as RiskLevel[]).map((level) => (
          <View key={level} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: RISK_COLORS[level] },
              ]}
            />
            <Text style={styles.legendText}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  radiusBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  radiusBtnText: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 14,
  },
  locateBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  locateBtnText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 13,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
});