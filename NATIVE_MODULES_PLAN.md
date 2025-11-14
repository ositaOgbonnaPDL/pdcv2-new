# Native Modules Migration Plan - Phase 8

## Native Modules Identified from Old Project

### ✅ Already Installed (Previous Phases)
- react-native-encrypted-storage v4.0.3
- @react-native-async-storage/async-storage v1.24.0
- react-native-gesture-handler v2.29.1
- react-native-safe-area-context v4.14.1
- react-native-screens v3.37.0

### 📦 Core Native Modules to Install

#### Permissions
- react-native-permissions v4.x (was v3.0.1)

#### Network & Connectivity
- @react-native-community/netinfo v11.x (was unlisted in old)

#### Date & Time
- @react-native-community/datetimepicker v8.x (was unlisted)

#### Media - Image
- react-native-image-picker v7.x (modern alternative)

#### Media - Audio
- react-native-audio-recorder-player v3.6.x (existing)

#### File System
- react-native-fs v2.20.x (existing)

#### Maps & Location
- react-native-maps v1.x (was v0.29.3)
- react-native-geolocation-service v5.3.x (alternative to deprecated @react-native-community/geolocation)

#### Background Processing
- react-native-background-fetch v4.x (was unlisted)
- react-native-background-geolocation-android (HIGH RISK - git dependency v4.4.4)

#### Push Notifications
- react-native-push-notification v8.x
- @react-native-community/push-notification-ios v1.11.x

#### Clipboard
- @react-native-clipboard/clipboard v1.14.x

#### Other
- react-native-vector-icons v10.x (if used for icons)

### 🔴 High Risk / Special Handling
1. **react-native-background-geolocation-android** - Git dependency, needs compatibility check
2. **react-native-shared-element** - Limited maintenance, may skip or find alternative

## Installation Strategy

### Batch 1: Core Permissions & Network
- react-native-permissions
- @react-native-community/netinfo
- @react-native-clipboard/clipboard

### Batch 2: Media & File System
- react-native-image-picker
- react-native-audio-recorder-player
- react-native-fs

### Batch 3: Maps & Location
- react-native-maps
- react-native-geolocation-service

### Batch 4: Background & Notifications
- react-native-background-fetch
- react-native-push-notification
- @react-native-community/push-notification-ios

### Batch 5: Additional
- @react-native-community/datetimepicker
- react-native-vector-icons (if needed)
