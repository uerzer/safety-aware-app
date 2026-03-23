import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../utils/constants';

interface ResourceItem {
  title: string;
  description: string;
  phone?: string;
  url?: string;
}

const EMERGENCY_CONTACTS: ResourceItem[] = [
  {
    title: 'Emergency Services',
    description: 'For immediate danger, call 911',
    phone: '911',
  },
  {
    title: 'National Sexual Assault Hotline',
    description: 'RAINN - Free, confidential, 24/7',
    phone: '18006564673',
  },
  {
    title: 'Childhelp National Child Abuse Hotline',
    description: '24/7 crisis support for children and families',
    phone: '18004224453',
  },
  {
    title: 'National Domestic Violence Hotline',
    description: '24/7 confidential support',
    phone: '18007997233',
  },
  {
    title: 'FBI Tips',
    description: 'Report suspicious activity to the FBI',
    phone: '18002255324',
    url: 'https://tips.fbi.gov',
  },
];

const RESOURCES: ResourceItem[] = [
  {
    title: 'NSOPW.gov',
    description:
      'National Sex Offender Public Website - Official U.S. DOJ registry search',
    url: 'https://www.nsopw.gov',
  },
  {
    title: 'RAINN',
    description:
      'Rape, Abuse & Incest National Network - Support and prevention resources',
    url: 'https://www.rainn.org',
  },
  {
    title: 'National Center for Missing & Exploited Children',
    description: 'Child safety resources, CyberTipline, and prevention tools',
    url: 'https://www.missingkids.org',
  },
  {
    title: 'Megan\'s Law Information',
    description: 'State-by-state sex offender registration and notification laws',
    url: 'https://www.nsopw.gov/en/education/factsmythsresources',
  },
  {
    title: 'SmartPrepared',
    description: 'SMART Office - Sex Offender Sentencing, Monitoring, and Tracking',
    url: 'https://smart.ojp.gov',
  },
];

const SAFETY_TIPS: string[] = [
  'Discuss personal safety and body autonomy with children regularly.',
  'Establish a family code word for emergencies.',
  'Monitor children\'s online activity and social media accounts.',
  'Know the registered offenders in your neighborhood.',
  'Report suspicious behavior to local law enforcement immediately.',
  'Never confront a registered offender -- contact authorities instead.',
  'Teach children to trust their instincts and speak up if uncomfortable.',
  'Keep emergency numbers accessible to all family members.',
];

export default function SafetyHubScreen() {
  const openPhone = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const openUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Safety Hub</Text>
          <Text style={styles.headerSubtitle}>
            Emergency contacts, resources, and safety information
          </Text>
        </View>

        {/* Emergency Contacts */}
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {EMERGENCY_CONTACTS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => {
              if (item.phone) openPhone(item.phone);
              else if (item.url) openUrl(item.url);
            }}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            {item.phone && (
              <View style={styles.callBadge}>
                <Text style={styles.callBadgeText}>CALL</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Resources */}
        <Text style={styles.sectionTitle}>Resources</Text>
        {RESOURCES.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => item.url && openUrl(item.url)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <Text style={styles.linkArrow}>\u2192</Text>
          </TouchableOpacity>
        ))}

        {/* Safety Tips */}
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <View style={styles.tipsCard}>
          {SAFETY_TIPS.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Text style={styles.tipNumber}>{idx + 1}</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>Legal Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            SafeNeighbor provides information sourced from publicly available sex
            offender registries. This data is provided as-is and may contain
            inaccuracies or be outdated.{"\n\n"}
            This app is NOT a substitute for official law enforcement databases.
            Always verify information with your local authorities.{"\n\n"}
            Under federal law (34 U.S.C. 20920) and most state laws, using sex
            offender registry information to commit a crime or to harass,
            intimidate, or threaten any registrant is strictly prohibited and
            punishable by law.{"\n\n"}
            By using this app, you agree to use this information responsibly and
            in accordance with all applicable laws.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B0BEC5',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  callBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  callBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  linkArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 12,
    overflow: 'hidden',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
});