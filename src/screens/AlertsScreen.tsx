import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { COLORS, RADIUS_OPTIONS } from '../utils/constants';
import { storage } from '../utils/storage';

interface AlertConfig {
  enabled: boolean;
  radiusMiles: number;
  newRegistrants: boolean;
  complianceChanges: boolean;
  nearbyActivity: boolean;
}

interface AlertHistoryItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'new_registrant' | 'compliance_change' | 'proximity';
}

const DEFAULT_CONFIG: AlertConfig = {
  enabled: false,
  radiusMiles: 1,
  newRegistrants: true,
  complianceChanges: true,
  nearbyActivity: false,
};

export default function AlertsScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  const loadConfig = async () => {
    const saved = await storage.get<AlertConfig>('alert_config');
    if (saved) setConfig(saved);
    const premium = await storage.get<boolean>('is_premium');
    setIsPremium(!!premium);
  };

  const loadHistory = async () => {
    const items = await storage.get<AlertHistoryItem[]>('alert_history');
    if (items) setHistory(items);
  };

  const updateConfig = useCallback(
    async (updates: Partial<AlertConfig>) => {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      await storage.set('alert_config', newConfig);
    },
    [config]
  );

  const handleSubscribe = () => {
    // In production, integrate RevenueCat / react-native-purchases here
    Alert.alert(
      'Premium Subscription',
      'Proximity alerts and push notifications require a premium subscription ($4.99/month).\n\nThis will be handled via your app store subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            // Placeholder for RevenueCat purchase flow
            setIsPremium(true);
            await storage.set('is_premium', true);
            await updateConfig({ enabled: true });
          },
        },
      ]
    );
  };

  const cycleRadius = () => {
    const currentIdx = RADIUS_OPTIONS.indexOf(config.radiusMiles);
    const nextIdx = (currentIdx + 1) % RADIUS_OPTIONS.length;
    updateConfig({ radiusMiles: RADIUS_OPTIONS[nextIdx] });
  };

  const renderHistoryItem = ({ item }: { item: AlertHistoryItem }) => {
    const typeColors: Record<string, string> = {
      new_registrant: COLORS.accent,
      compliance_change: '#F59E0B',
      proximity: '#3B82F6',
    };
    return (
      <View style={styles.historyItem}>
        <View
          style={[
            styles.historyDot,
            { backgroundColor: typeColors[item.type] || '#9CA3AF' },
          ]}
        />
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>{item.title}</Text>
          <Text style={styles.historyBody}>{item.body}</Text>
          <Text style={styles.historyTime}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.paywallContainer}>
          <Text style={styles.paywallIcon}>\uD83D\uDD14</Text>
          <Text style={styles.paywallTitle}>Proximity Alerts</Text>
          <Text style={styles.paywallSubtitle}>
            Get notified when new sex offenders register near your home, school,
            or workplace.
          </Text>

          <View style={styles.featureList}>
            {[
              'Real-time push notifications',
              'Customizable radius (0.5 - 5 miles)',
              'New registrant alerts',
              'Compliance status changes',
              'Unlimited search history',
            ].map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Text style={styles.featureCheck}>\u2713</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe}>
            <Text style={styles.subscribeBtnText}>Subscribe - $4.99/mo</Text>
          </TouchableOpacity>
          <Text style={styles.paywallDisclaimer}>
            Cancel anytime. Managed through your app store.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Config Section */}
      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Alert Settings</Text>

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Alerts Enabled</Text>
          <Switch
            value={config.enabled}
            onValueChange={(v) => updateConfig({ enabled: v })}
            trackColor={{ true: COLORS.accent, false: '#D1D5DB' }}
          />
        </View>

        <TouchableOpacity style={styles.configRow} onPress={cycleRadius}>
          <Text style={styles.configLabel}>Alert Radius</Text>
          <Text style={styles.configValue}>{config.radiusMiles} miles</Text>
        </TouchableOpacity>

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>New Registrants</Text>
          <Switch
            value={config.newRegistrants}
            onValueChange={(v) => updateConfig({ newRegistrants: v })}
            trackColor={{ true: COLORS.accent, false: '#D1D5DB' }}
          />
        </View>

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Compliance Changes</Text>
          <Switch
            value={config.complianceChanges}
            onValueChange={(v) => updateConfig({ complianceChanges: v })}
            trackColor={{ true: COLORS.accent, false: '#D1D5DB' }}
          />
        </View>

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Nearby Activity</Text>
          <Switch
            value={config.nearbyActivity}
            onValueChange={(v) => updateConfig({ nearbyActivity: v })}
            trackColor={{ true: COLORS.accent, false: '#D1D5DB' }}
          />
        </View>
      </View>

      {/* History */}
      <Text style={styles.historyTitle2}>Notification History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyText}>No alerts yet</Text>
            <Text style={styles.emptySubtext}>
              You'll see notifications here when there's activity in your area.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Paywall
  paywallContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    alignItems: 'center',
  },
  paywallIcon: { fontSize: 48, marginBottom: 16 },
  paywallTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: { width: '100%', marginBottom: 24 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureCheck: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 12,
  },
  featureText: { fontSize: 15, color: COLORS.primary },
  subscribeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  paywallDisclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Config
  configSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  configLabel: { fontSize: 15, color: COLORS.primary },
  configValue: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '700',
  },
  // History
  historyTitle2: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  historyList: { paddingHorizontal: 16, paddingBottom: 32 },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
  },
  historyContent: { flex: 1 },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyBody: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  historyTime: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  emptyHistory: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  emptySubtext: {
    fontSize: 13,
    color: '#D1D5DB',
    marginTop: 4,
    textAlign: 'center',
  },
});