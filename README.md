# SafeNeighbor

A mobile application that repackages public sex offender registry data into a user-friendly, location-based search and safety tool.

**Platform:** React Native / Expo SDK 50  
**Language:** TypeScript  
**Revenue Model:** Freemium ($4.99/mo for proximity alerts and push notifications)

---

## Features

### Free Tier
- **Location Search** — Search by GPS, address, or zip code
- **Interactive Map** — Color-coded risk level pins (green/amber/red)
- **Offender Profiles** — Photos, offense history, compliance status, physical descriptors
- **Safety Hub** — Emergency contacts (911, RAINN, Childhelp), resources, and safety tips

### Premium ($4.99/month)
- **Proximity Alerts** — Radius-based notifications (0.5–5 miles)
- **Push Notifications** — New registrants, compliance changes, nearby activity
- **Unlimited Search History**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 50 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation v6 (bottom tabs + native stack) |
| Maps | react-native-maps (Google Maps) |
| Location | expo-location (foreground + background) |
| Notifications | expo-notifications |
| Storage | @react-native-async-storage/async-storage |
| Subscriptions | react-native-purchases (RevenueCat) |
| Build | Expo EAS Build |

---

## Project Structure

```
SafeNeighbor/
├── App.tsx                          # Root: tab navigator + stack navigator
├── app.json                         # Expo config (permissions, API keys)
├── eas.json                         # EAS Build profiles
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── babel.config.js                  # Babel preset
├── assets/                          # App icons, splash screen
└── src/
    ├── screens/
    │   ├── HomeScreen.tsx           # Main search interface
    │   ├── MapScreen.tsx            # Interactive map with offender pins
    │   ├── DetailScreen.tsx         # Individual offender profile
    │   ├── AlertsScreen.tsx         # Premium subscription + alert config
    │   └── SafetyHubScreen.tsx      # Emergency contacts + resources
    ├── services/
    │   ├── api.ts                   # Multi-source registry API integration
    │   └── location.ts              # Geolocation, distance, geocoding
    ├── hooks/
    │   ├── useOffenderSearch.ts     # Search state management
    │   └── useLocation.ts           # Reactive GPS state
    ├── types/
    │   └── types.ts                 # All TypeScript interfaces
    └── utils/
        ├── constants.ts             # Colors, config, storage keys
        └── storage.ts               # AsyncStorage wrapper with TTL cache
```

---

## Setup

### Prerequisites
- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS: Xcode 15+ (for local builds)
- Android: Android Studio (for local builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/ue-z/safety-aware-app.git
cd safety-aware-app

# Install dependencies
npm install

# Start development server
npx expo start
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Data Sources
EXPO_PUBLIC_OFFENDERS_IO_KEY=your_offenders_io_api_key
EXPO_PUBLIC_CRIMEOMETER_KEY=your_crimeometer_api_key

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key

# RevenueCat (subscriptions)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_revenuecat_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_revenuecat_android_key
```

### API Key Setup

| Service | Signup URL | Notes |
|---------|-----------|-------|
| Offenders.io | https://offenders.io | Primary data source, 900K+ records. Paid API. |
| CrimeoMeter | https://crimeometer.com | Secondary crime data. Free tier available. |
| Google Maps | https://console.cloud.google.com | Required for map tiles. Enable Maps SDK for iOS/Android. |
| RevenueCat | https://revenuecat.com | Subscription management. Free tier available. |

The Iowa Sex Offender Registry API and Nominatim geocoder are free and require no API key.

---

## Build & Deploy

### Development Build

```bash
# Build for iOS simulator
eas build --profile development --platform ios

# Build for Android emulator
eas build --profile development --platform android
```

### Production Build

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

### App Store Submission

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### CI/CD Pipeline

For automated builds, add this to your GitHub Actions workflow:

```yaml
name: Build & Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --profile production --platform all --non-interactive
```

---

## Data Sources

| Source | Type | Coverage | Cost |
|--------|------|----------|------|
| **Offenders.io** | REST API | 900K+ records, 50 states | Paid (primary) |
| **Iowa SOR** | REST API | Iowa state only | Free |
| **NSOPW.gov** | Search portal | All states (federal) | Free (no API, scraping limited) |
| **CrimeoMeter** | REST API | Location-based crime data | Freemium |
| **FamilyWatchdog** | Web scraping | Community-level data | Free (secondary) |

### Data Flow
1. User searches by location, address, or zip code
2. App fans out to all available APIs in parallel
3. Results are normalized to a common `Offender` schema
4. Deduplicated by name + address
5. Sorted by risk level (high first), then distance
6. Cached locally for 15 minutes via AsyncStorage

---

## Legal Disclaimer

**IMPORTANT: Read before use or deployment.**

This application displays information sourced from publicly available sex offender registries maintained by federal and state governments. The data is provided "as-is" and may contain inaccuracies, be outdated, or be incomplete.

### Compliance Requirements

- **Federal Law (34 U.S.C. Section 20920):** Using sex offender registry information to commit a crime or to harass, intimidate, or threaten any registrant is a federal offense.
- **State Laws:** Most states have additional restrictions on the use of registry data. Consult an attorney for state-specific compliance requirements before deployment.
- **Megan's Law:** This app must include the legal disclaimer that registry information shall not be used to unlawfully injure, harass, or commit a crime against any person named in the registry.

### App Store Compliance

- **Apple App Store:** Review Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) regarding safety-related content. Apps that facilitate harassment or feature overly graphic descriptions may be rejected under Guideline 1.1.
- **Google Play:** Review Google's [Inappropriate Content Policy](https://support.google.com/googleplay/android-developer/answer/9878810). Ensure the app does not encourage vigilantism or harassment.

### Data Privacy

- The app collects user location data for search functionality
- Location data is stored locally on device only (via AsyncStorage)
- No personal user data is transmitted to third-party servers beyond API queries
- Background location (premium) is used solely for proximity alerts
- Users must opt in to location services and push notifications

### Limitation of Liability

The developers of SafeNeighbor make no warranties regarding the accuracy, completeness, or timeliness of the data presented. This application is NOT a substitute for official law enforcement databases. Always verify information with local authorities.

Users assume all responsibility for the use of information provided by this application. The developers shall not be held liable for any damages resulting from the use or misuse of this data.

---

## License

Proprietary. All rights reserved.

---

## Support

For questions or issues, open an issue on the [GitHub repository](https://github.com/ue-z/safety-aware-app/issues).