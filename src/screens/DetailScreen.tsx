import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, RiskLevel } from '../types/types';
import { COLORS, RISK_COLORS } from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route }: Props) {
  const { offender } = route.params;

  const callEmergency = () => {
    Alert.alert(
      'Call 911?',
      'This will open your phone dialer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:911') },
      ]
    );
  };

  const openDirections = () => {
    const url = `https://maps.google.com/?q=${offender.latitude},${offender.longitude}`;
    Linking.openURL(url);
  };

  const getRiskInfo = (level: RiskLevel) => {
    const info: Record<RiskLevel, { label: string; description: string }> = {
      low: {
        label: 'Level 1 - Low',
        description: 'Lower likelihood of re-offense. Poses minimal community risk.',
      },
      moderate: {
        label: 'Level 2 - Moderate',
        description: 'Moderate likelihood of re-offense. Requires ongoing monitoring.',
      },
      high: {
        label: 'Level 3 - High',
        description: 'High likelihood of re-offense. Subject to community notification.',
      },
    };
    return info[level];
  };

  const riskInfo = getRiskInfo(offender.riskLevel);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        {offender.photoUrl ? (
          <Image source={{ uri: offender.photoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoPlaceholderText}>
              {offender.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{offender.name}</Text>
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: RISK_COLORS[offender.riskLevel] },
          ]}
        >
          <Text style={styles.riskBadgeText}>{riskInfo.label}</Text>
        </View>
        <Text style={styles.riskDesc}>{riskInfo.description}</Text>
      </View>

      {/* Details Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <DetailRow label="Full Name" value={offender.name} />
        {offender.aliases && offender.aliases.length > 0 && (
          <DetailRow label="Aliases" value={offender.aliases.join(', ')} />
        )}
        {offender.dob && <DetailRow label="Date of Birth" value={offender.dob} />}
        {offender.sex && <DetailRow label="Sex" value={offender.sex} />}
        {offender.race && <DetailRow label="Race" value={offender.race} />}
        {offender.height && <DetailRow label="Height" value={offender.height} />}
        {offender.weight && <DetailRow label="Weight" value={offender.weight} />}
        {offender.eyeColor && <DetailRow label="Eye Color" value={offender.eyeColor} />}
        {offender.hairColor && <DetailRow label="Hair Color" value={offender.hairColor} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address & Location</Text>
        <DetailRow label="Address" value={offender.address} />
        {offender.city && <DetailRow label="City" value={offender.city} />}
        {offender.state && <DetailRow label="State" value={offender.state} />}
        {offender.zipCode && <DetailRow label="Zip Code" value={offender.zipCode} />}
        {offender.distance !== undefined && (
          <DetailRow
            label="Distance"
            value={`${offender.distance.toFixed(1)} miles from your location`}
          />
        )}
        <TouchableOpacity style={styles.dirBtn} onPress={openDirections}>
          <Text style={styles.dirBtnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offense Details</Text>
        <DetailRow label="Offense" value={offender.offenseDescription} />
        {offender.convictionDate && (
          <DetailRow label="Conviction Date" value={offender.convictionDate} />
        )}
        {offender.registrationDate && (
          <DetailRow label="Registered" value={offender.registrationDate} />
        )}
        <DetailRow
          label="Compliance"
          value={
            offender.complianceStatus === 'compliant'
              ? 'In Compliance'
              : 'Non-Compliant / Absconded'
          }
        />
      </View>

      {/* Emergency CTA */}
      <TouchableOpacity style={styles.emergencyBtn} onPress={callEmergency}>
        <Text style={styles.emergencyBtnText}>Call 911</Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This information is derived from public sex offender registries and may
        not be current. Verify all data with your local law enforcement. Using
        this information to harass, intimidate, or threaten any individual is a
        criminal offense in most jurisdictions.
      </Text>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  riskBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  riskDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 13, color: '#6B7280', flex: 1 },
  rowValue: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  dirBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  dirBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emergencyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});