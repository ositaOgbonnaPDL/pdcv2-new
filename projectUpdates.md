# PDCollector V2 Migration Guide
## React Native 0.63.4 → 0.81.5 Upgrade

**Last Updated:** 2025-11-13
**Status:** In Progress
**Current Phase:** Phase 4 - UI Components & Theming ✅ COMPLETE

---

## Executive Summary

This document tracks the migration of PDCollector-V2-Mobile from React Native 0.63.4 to 0.81.5. The application is a sophisticated data collection platform with:
- Complex form engine with dynamic validation
- Background location tracking
- Offline-first architecture with upload queue
- XState-driven state machines
- Multi-layered state management (Zustand, React Query, XState)

---

## Project Overview

### Old Project (Source)
- **Location:** `/PDCollector-V2-Mobile/`
- **React Native:** 0.63.4
- **React:** 16.13.1
- **TypeScript:** 3.8.3
- **Navigation:** React Navigation v5
- **Key Libraries:** XState, Zustand, React Query v3

### New Project (Target)
- **Location:** Root directory
- **React Native:** 0.81.5
- **React:** 19.1.0
- **TypeScript:** 5.8.3
- **Status:** Fresh template, ready for migration

---

## Architecture Analysis

### Key Modules
1. **Login** - Authentication with encrypted storage
2. **Home** - Tab navigation (Projects/Assigned Data)
3. **Form** - Dynamic form engine with XState actors
4. **Project** - Project details and tracking control
5. **Map** - Location visualization with react-native-maps
6. **Tracker** - Real-time background tracking
7. **Settings** - Theme, media quality, tracking preferences

### State Management Stack
- **Zustand:** Auth, Settings (with encrypted storage persistence)
- **React Query v3:** Server state, polling
- **XState v4:** Complex workflows (Form, TaskManager, Tracker)
- **React Context:** NetworkState, TaskManager, TrackManager

### Critical Native Dependencies
- Background Geolocation (Git dependency)
- Audio Recording
- Image Picker
- Maps
- Background Fetch
- Push Notifications
- Encrypted Storage

---

## Dependency Migration Analysis

### 🔴 Critical Updates Required

| Package | Old Version | New Version | Breaking Changes | Notes |
|---------|-------------|-------------|------------------|-------|
| **react** | 16.13.1 | 19.1.0 | ✅ YES | Major: Concurrent features, automatic batching |
| **react-native** | 0.63.4 | 0.81.5 | ✅ YES | Major: New Architecture support, many API changes |
| **@react-navigation/native** | 5.9.8 | 6.x | ✅ YES | API changes, types updates |
| **@react-navigation/stack** | 5.14.3 | 6.x | ✅ YES | Config changes |
| **@react-navigation/bottom-tabs** | 5.11.11 | 6.x | ✅ YES | API updates |
| **react-native-reanimated** | 2.0.0 | 3.x | ✅ YES | API improvements, better performance |
| **react-native-gesture-handler** | 1.10.3 | 2.x | ✅ YES | New gesture system |
| **react-query** | 3.12.1 | TanStack Query 5.x | ✅ YES | Renamed, API changes |
| **react-native-paper** | 4.7.2 | 5.x | ✅ YES | Material Design 3, theme changes |

### 🟡 Moderate Updates Required

| Package | Old Version | New Version | Notes |
|---------|-------------|-------------|-------|
| **xstate** | 4.31.0 | 5.x (optional) | Consider staying on v4 for stability |
| **zustand** | 3.3.3 | 4.x | Middleware API changes |
| **@react-native-async-storage/async-storage** | 1.14.1 | 1.23.x | Minor updates |
| **react-native-permissions** | 3.0.1 | 4.x | Permission API updates |
| **react-native-maps** | 0.29.3 | 1.x | Major version but mostly compatible |
| **react-native-svg** | 12.1.1 | 15.x | Performance improvements |
| **react-native-safe-area-context** | 3.4.1 | 4.x → 5.x | Already in new project |

### 🟢 Deprecated/Replacement Needed

| Old Package | Replacement | Reason |
|-------------|-------------|--------|
| **react-native-splash-screen** | react-native-bootsplash | More maintained, better RN 0.70+ support |
| **@react-native-community/datetimepicker** | Keep, update to 8.x | Still official |
| **@react-native-community/netinfo** | Keep, update to 11.x | Still official |
| **hermes-engine** | Bundled in RN 0.81 | No longer separate dependency |
| **react-native-shared-element** | May need fork/alternative | Limited maintenance |

### ⚠️ High Risk Dependencies

| Package | Issue | Strategy |
|---------|-------|----------|
| **react-native-background-geolocation-android** | Git dependency, v4.4.4 | Test compatibility, may need update |
| **react-native-background-fetch** | Native module | Verify RN 0.81 compatibility |
| **react-native-background-actions** | Native module | May need alternative or update |
| **react-native-audio-recorder-player** | Native module | Test thoroughly |
| **react-native-encrypted-storage** | Critical for auth | Must maintain compatibility |

### 📦 New Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| **@react-native/metro-config** | 0.81.5 | Already in new project |
| **@tanstack/react-query** | 5.x | Replacement for react-query |
| **react-native-bootsplash** | Latest | Better splash screen |

---

## Migration Strategy

### Phase-by-Phase Approach

We'll migrate in careful phases, testing after each one before proceeding.

---

## ✅ PHASE 0: Analysis & Planning
**Status:** ✅ COMPLETE
**Duration:** Complete

### Completed Tasks
- [x] Analyzed old project architecture
- [x] Reviewed new project structure
- [x] Compared dependencies
- [x] Identified breaking changes
- [x] Created migration plan
- [x] Created tracking document

---

## 📋 PHASE 1: Foundation & Build Configuration
**Status:** ✅ COMPLETE
**Completed:** 2025-11-13
**Duration:** ~1 hour
**Goal:** Set up base infrastructure and build configuration

### Completed Tasks
- [x] Disable New Architecture in android/gradle.properties (already set to false)
- [x] Disable New Architecture in ios/Podfile (fixed syntax: `:fabric_enabled => false`)
- [x] Update Android SDK versions in build.gradle:
  - compileSdkVersion: 36
  - targetSdkVersion: 36
  - minSdkVersion: 24
  - buildToolsVersion: 36.0.0
- [x] Update ios/Podfile platform to iOS 14.0
- [x] Copy app name configuration ("PDC") from old project
- [x] Update bundle identifiers (com.pdcv2 - already configured)
- [x] Copy Android app icons from old project (all mipmap densities)
- [x] Copy iOS app icons and splash assets from old project (AppIcon.appiconset, BootSplashLogo.imageset, splash_logo.imageset)
- [x] Copy google-services.json from old project
- [x] Verify GoogleService-Info.plist (not present in old project)
- [x] Update app display name in:
  - app.json
  - android/app/src/main/res/values/strings.xml
  - ios/pdcv2/Info.plist

### Build Configuration Summary
All build configuration files have been properly set up:
- **Android:** SDK 36, minSdk 24, New Architecture disabled
- **iOS:** Platform 14.0, New Architecture disabled
- **App Name:** "PDC"
- **Bundle ID:** com.pdcv2
- **Assets:** App icons and splash screens copied from old project
- **Firebase:** google-services.json copied

### Next Phase
Ready to proceed with Phase 2: State Management Core

---

## 📋 PHASE 2: State Management Core
**Status:** ✅ COMPLETE
**Completed:** 2025-11-13
**Duration:** ~1.5 hours
**Goal:** Migrate state management without UI

### Completed Tasks
- [x] Install dependencies:
  - zustand@^4.5.0
  - @tanstack/react-query@^5.17.0
  - axios@^1.6.0
  - @react-native-async-storage/async-storage@^1.23.0
  - react-native-encrypted-storage@^4.0.3
- [x] Migrate Zustand stores from v3 to v4:
  - authStore with EncryptedStorage persistence
  - settingsStore with AsyncStorage persistence
- [x] Update middleware for Zustand v4 API
- [x] Migrate to TanStack Query v5
- [x] Set up query client with default options
- [x] Migrate HTTP client (axios with interceptors)
- [x] Implement token refresh logic
- [x] Migrate authentication service
- [x] Update AsyncStorage utilities
- [x] Connect auth store to navigation
- [x] Add QueryClientProvider to App
- [x] Implement state restoration on app start

### State Management Stack Implemented

**Zustand v4 Stores:**
1. **authStore** - Authentication state management
   - Credentials storage with EncryptedStorage
   - Auto-save on authentication changes
   - Token and refresh token management
   - First-time login detection
   - Logout functionality with storage cleanup

2. **settingsStore** - App settings management
   - Theme preferences (light/dark/system)
   - Media quality settings (LOW/MEDIUM/HIGH)
   - Location tracking accuracy toggle
   - AsyncStorage persistence

**TanStack Query v5:**
- QueryClient configured with default options
- Retry policies (2 retries for queries, 1 for mutations)
- Stale time: 5 minutes
- Query keys defined (PROJECTS, ASSIGNED, TRACKS)

**HTTP Client (Axios):**
- Base URL configuration
- Request interceptor (adds Bearer token)
- Response interceptor (handles 401 with token refresh)
- Automatic re-login on refresh token expiration
- Helper methods (get, post, put, del)

**Authentication Service:**
- Login with role validation (ROLE_FIELDWORKER only)
- Token refresh endpoint
- Error handling with user-friendly messages

### Files Created
**Stores:**
- `src/stores/authStore.ts` - Authentication Zustand store
- `src/stores/settingsStore.ts` - Settings Zustand store
- `src/stores/index.ts` - Store exports

**API:**
- `src/api/httpClient.ts` - Axios instance with interceptors
- `src/api/queryClient.ts` - TanStack Query client
- `src/api/index.ts` - API exports

**Services:**
- `src/services/authService.ts` - Authentication service
- `src/services/index.ts` - Service exports

**Types:**
- `src/types/index.ts` - Shared type definitions

**Updated Files:**
- `src/utils/storage.ts` - Implemented AsyncStorage utilities
- `src/navigation/index.tsx` - Connected to auth store, state restoration
- `App.tsx` - Added QueryClientProvider

### Migration Notes (Zustand v3 → v4)
**Key API Changes:**
1. Middleware signature changed - different parameter structure
2. Custom middleware created for encrypted storage (auth)
3. Custom middleware created for AsyncStorage (settings)
4. Store selectors simplified
5. Type safety improved

### Migration Notes (React Query v3 → TanStack Query v5)
**Key API Changes:**
1. Package renamed: `react-query` → `@tanstack/react-query`
2. Import paths updated
3. QueryClient configuration updated with new options structure
4. Default configurations improved

### State Restoration Flow
On app start:
1. Load preferences from AsyncStorage → restore settingsStore
2. Load credentials from EncryptedStorage → restore authStore
3. Load navigation state from AsyncStorage → restore navigation
4. Show app when ready

### Testing Results
- [x] TypeScript compilation successful (no errors)
- [x] Auth store properly typed
- [x] Settings store properly typed
- [x] HTTP client with full auth flow
- [x] QueryClient configured and accessible
- [x] Storage utilities functional
- [x] Navigation connected to auth state
- [ ] Runtime testing pending (requires device/emulator)

### Deferred to Later Phases
- XState v4 migration - Deferred to Phase 13 (Task Manager & Upload Queue)
- Context providers (NetworkState, TaskManager, TrackManager) - Phase 13
- RxJS observables - Phase 13

### Next Phase
Ready to proceed with Phase 4: Storage & Utilities (or continue with remaining modules)

---

## 📋 PHASE 3: Navigation & Routing
**Status:** ✅ COMPLETE
**Completed:** 2025-11-13
**Duration:** ~1 hour
**Goal:** Set up navigation structure

### Completed Tasks
- [x] Install React Navigation v6 and dependencies
  - @react-navigation/native@^6.1.9
  - @react-navigation/native-stack@^6.9.17
  - @react-navigation/bottom-tabs@^6.5.11
  - react-native-screens@^3.29.0
  - react-native-safe-area-context@^4.8.2
  - react-native-gesture-handler@^2.14.1
- [x] Configure NavigationContainer with state persistence
- [x] Migrate Stack Navigator using createNativeStackNavigator
- [x] Migrate Tab Navigator for Home screen (Projects/Assigned tabs)
- [x] Create placeholder screens for all routes:
  - LoginScreen
  - PasswordChangeScreen
  - ProjectsScreen (Home tab)
  - AssignedScreen (Home tab)
  - MapScreen
  - FormScreen
  - ProjectScreen
  - TrackerScreen
  - SettingsScreen
  - ProjectViewerScreen
- [x] Set up authentication flow routing (conditional navigation)
- [x] Create navigation types (RootStackParamList, HomeTabParamList)
- [x] Update tsconfig.json to exclude old project
- [x] Copy navigation utilities (constants, storage helpers, colors)
- [x] Configure gesture handler (index.js)

### Navigation Structure Implemented
**Main Stack (RootNavigator):**
- Unauthenticated: Login
- First-time login: PasswordChange
- Authenticated:
  - Home (Tab Navigator)
  - Map
  - Form (with dynamic title from params)
  - Project (with dynamic title from params)
  - Tracker (transparent header)
  - Settings
  - ProjectViewer

**Home Tab Navigator:**
- Projects tab (Home)
- Assigned Data tab (with badge support)

### Files Created
- `src/types/navigation.ts` - Navigation type definitions
- `src/screens/` - All placeholder screen components
- `src/navigation/RootNavigator.tsx` - Main stack navigator
- `src/navigation/HomeTabNavigator.tsx` - Bottom tab navigator
- `src/navigation/index.tsx` - NavigationContainer with state persistence
- `src/utils/constants.ts` - App constants
- `src/utils/storage.ts` - AsyncStorage helpers (placeholders)
- `src/theme/colors.ts` - Color palette

### Migration Notes
- Using `createNativeStackNavigator` (React Navigation 6) instead of `createStackNavigator` (v5)
- Navigation state persistence implemented (will work when AsyncStorage is added in Phase 2)
- Auth state hooks are placeholders - will be replaced with Zustand stores in Phase 2
- Shared element transitions deferred - not compatible with Native Stack
- Deep linking configuration deferred to later phase

### Testing Results
- [x] TypeScript compilation successful (no errors)
- [x] Navigation structure properly typed
- [x] All imports resolve correctly
- [x] tsconfig excludes old project
- [ ] Runtime testing pending (requires physical device or emulator)

### Next Steps
**Note:** Phase 2 (State Management) should be completed before full testing:
- Need to implement actual auth stores (Zustand)
- Need to install AsyncStorage for navigation state persistence
- After Phase 2, navigation will be fully functional with auth flow

### Next Phase
Ready to proceed with Phase 2: State Management Core (or Phase 4 if following original order)

---

## 📋 PHASE 4: Storage & Utilities
**Status:** 🟡 NOT STARTED
**Goal:** Migrate shared utilities and services

### Tasks
- [ ] Migrate shared types
- [ ] Migrate shared utilities (index.ts, map.ts, permission.ts, task.ts)
- [ ] Migrate HTTP client (axios with interceptors)
- [ ] Migrate authentication service
- [ ] Set up encrypted storage utilities
- [ ] Migrate permission utilities
- [ ] Create constants file

### Testing Checklist
- [ ] HTTP client works
- [ ] Token refresh works
- [ ] Encrypted storage works
- [ ] Utility functions work
- [ ] Type definitions compile

---

## 📋 PHASE 5: UI Foundation & Theme
**Status:** ✅ COMPLETE
**Completed:** 2025-11-13
**Duration:** ~1 hour
**Goal:** Set up UI library and shared components

### Completed Tasks
- [x] Install and configure React Native Paper v5.11.3
- [x] Set up theme configuration (light/dark modes)
- [x] Install animation libraries:
  - react-native-reanimated@^3.6.1
  - moti@^0.27.2
  - react-native-svg@^15.0.0
- [x] Configure Babel for Reanimated
- [x] Migrate basic shared components:
  - [x] Box - Simple View wrapper
  - [x] Button - Paper Button with Touchable wrapper
  - [x] TextInput - Custom input with label and error handling
  - [x] PasswordInput - TextInput with show/hide toggle
  - [x] Touchable - Animated touchable with Moti
  - [x] Spacer - Spacing utility component
  - [x] Screen - SafeAreaView wrapper
  - [x] ErrorLabel - Error message display
- [x] Configure color scheme with settings store integration
- [x] Set up PaperProvider with theme
- [x] Integrate theme switching with system preferences

### UI Library Stack Implemented

**React Native Paper v5:**
- MD3 (Material Design 3) theme system
- Light and dark theme configurations
- Custom color palette (primary, primaryDark, accent)
- Theme roundness: 8px
- PaperProvider wrapping entire app

**Animation Libraries:**
- **react-native-reanimated v3** - Core animation engine
- **moti** - Declarative animations for React Native
- Configured Babel plugin for Reanimated

**Theme Configuration:**
- Light theme with accent background
- Dark theme with primaryDark background
- System color scheme tracking
- Automatic theme updates based on settings store
- StatusBar color matches theme

### Components Created

**Layout Components:**
1. **Box** (`src/components/Box.tsx`)
   - Simple View wrapper accepting ViewStyle props
   - Flexible styling with style prop merging

2. **Screen** (`src/components/Screen.tsx`)
   - SafeAreaView wrapper for screens
   - Consistent padding (20px)
   - Relative positioning

3. **Spacer** (`src/components/Spacer.tsx`)
   - Adds spacing between children
   - Horizontal and vertical modes
   - Configurable gap (default: 10)

**Input Components:**
4. **TextInput** (`src/components/TextInput.tsx`)
   - Custom label above input
   - Focus state with border color changes
   - Error state with ErrorLabel
   - Dark/light mode support
   - Render prop pattern for custom content

5. **PasswordInput** (`src/components/PasswordInput.tsx`)
   - Extends TextInput
   - Show/hide password toggle
   - Eye icon from Paper IconButton
   - Respects theme colors

**Interactive Components:**
6. **Button** (`src/components/Button.tsx`)
   - Wraps Paper Button
   - Touchable wrapper for animations
   - Custom padding and roundness
   - Supports all Paper Button modes

7. **Touchable** (`src/components/Touchable.tsx`)
   - Animated press feedback using Moti
   - Scale and opacity transitions
   - 150ms timing animation
   - Disabled state support

**Utility Components:**
8. **ErrorLabel** (`src/components/ErrorLabel.tsx`)
   - Displays error messages
   - Red text color (#C62828)
   - Uses Spacer for layout

### Theme Integration

**App.tsx Updates:**
- PaperProvider wrapping NavigationContainer
- Theme selection based on settings store
- System color scheme tracking with useEffect
- StatusBar color matches theme background
- Automatic theme updates

**Settings Store Integration:**
- colorScheme selector
- system preference toggle
- Auto-update on system changes
- Theme persistence

### Files Created
- `src/theme/paperTheme.ts` - Paper v5 theme configs
- `src/components/Box.tsx`
- `src/components/Button.tsx`
- `src/components/ErrorLabel.tsx`
- `src/components/PasswordInput.tsx`
- `src/components/Screen.tsx`
- `src/components/Spacer.tsx`
- `src/components/TextInput.tsx`
- `src/components/Touchable.tsx`
- `src/components/index.ts` - Component exports

**Updated Files:**
- `src/theme/index.ts` - Added paperTheme exports and radius constant
- `App.tsx` - Added PaperProvider and theme integration
- `babel.config.js` - Added Reanimated plugin

### Migration Notes (Paper v4 → v5)

**Key Changes:**
1. **Theme System:** MD2 → MD3
   - New color system with more variants
   - Updated theme structure
   - Better dark mode support

2. **Component API:** Minor updates
   - IconButton uses `iconColor` instead of `color` prop
   - Text uses `variant` instead of component types (Caption, etc.)
   - Button API mostly compatible

3. **Type Definitions:** Improved
   - Better TypeScript support
   - Theme type extensions working correctly

### Testing Results
- [x] TypeScript compilation successful (no errors)
- [x] All components properly typed
- [x] Theme configuration correct
- [x] Babel plugin configured for Reanimated
- [x] Component exports working
- [ ] Visual testing pending (requires device/emulator)
- [ ] Theme switching pending runtime test
- [ ] Animations pending runtime test
- [ ] Dark mode pending runtime test

### Next Phase
Ready to proceed with Phase 6: Authentication Module (or continue with other modules)

---

## 📋 PHASE 6: Authentication Module
**Status:** 🟡 NOT STARTED
**Goal:** Migrate login and auth flow

### Tasks
- [ ] Migrate Login screen
- [ ] Migrate PasswordChange screen
- [ ] Connect to auth store
- [ ] Connect to auth service
- [ ] Test credential persistence
- [ ] Test remember me functionality
- [ ] Test first-time login flow

### Testing Checklist
- [ ] Login works
- [ ] Password change works
- [ ] Credentials persist
- [ ] Remember me works
- [ ] Token storage works
- [ ] First-time login detection works

---

## 📋 PHASE 7: Media & Permissions
**Status:** 🟡 NOT STARTED
**Goal:** Set up native modules for media and permissions

### Tasks
- [ ] Install react-native-permissions v4
- [ ] Configure iOS permissions in Podfile
- [ ] Configure Android permissions
- [ ] Install react-native-image-picker v5+
- [ ] Install react-native-audio-recorder-player
- [ ] Install react-native-fs
- [ ] Migrate permission utilities
- [ ] Test camera permissions
- [ ] Test microphone permissions
- [ ] Test storage permissions

### Dependencies
```json
{
  "dependencies": {
    "react-native-permissions": "^4.1.0",
    "react-native-image-picker": "^7.0.0",
    "react-native-audio-recorder-player": "^3.6.4",
    "react-native-fs": "^2.20.0",
    "react-native-encrypted-storage": "^4.0.3"
  }
}
```

### Testing Checklist
- [ ] Permissions request works
- [ ] Image picker works
- [ ] Audio recording works
- [ ] File system access works
- [ ] Permission errors handled

---

## 📋 PHASE 8: Maps & Location
**Status:** 🟡 NOT STARTED
**Goal:** Migrate map functionality

### Tasks
- [ ] Install react-native-maps
- [ ] Configure iOS (Podfile)
- [ ] Configure Android (build.gradle)
- [ ] Install react-native-geolocation-service
- [ ] Migrate Map components
- [ ] Migrate map utilities
- [ ] Set up location permissions
- [ ] Test basic map rendering
- [ ] Test markers and polygons

### Dependencies
```json
{
  "dependencies": {
    "react-native-maps": "^1.10.0",
    "react-native-geolocation-service": "^5.3.1"
  }
}
```

### Testing Checklist
- [ ] Map renders
- [ ] Markers display
- [ ] Polygons display
- [ ] User location works
- [ ] Map interactions work

---

## 📋 PHASE 9: Background Location Tracking
**Status:** 🟡 NOT STARTED
**Goal:** Set up background geolocation
**Risk Level:** 🔴 HIGH

### Tasks
- [ ] Research RN 0.81 compatibility for react-native-background-geolocation-android
- [ ] Install/update to compatible version
- [ ] Configure iOS background modes
- [ ] Configure Android services
- [ ] Migrate TrackManager context
- [ ] Migrate tracker XState machine
- [ ] Migrate Tracker screen
- [ ] Test foreground tracking
- [ ] Test background tracking
- [ ] Test app state transitions

### Dependencies
```json
{
  "dependencies": {
    "react-native-background-geolocation-android": "TBD",
    "react-native-background-fetch": "^4.2.0"
  }
}
```

### Testing Checklist
- [ ] Foreground tracking works
- [ ] Background tracking works
- [ ] Location updates received
- [ ] Battery optimization handled
- [ ] Permissions handled
- [ ] Error states work

---

## 📋 PHASE 10: Form Engine Core
**Status:** 🟡 NOT STARTED
**Goal:** Migrate dynamic form engine
**Complexity:** 🔴 VERY HIGH

### Tasks
- [ ] Migrate form types (Field, Dependency, etc.)
- [ ] Migrate form XState machine
- [ ] Migrate field actor pattern
- [ ] Migrate dependency resolution logic
- [ ] Migrate form validation logic
- [ ] Test with simple form
- [ ] Test with complex dependencies
- [ ] Test conditional fields
- [ ] Test field ordering

### Components to Migrate
- [ ] Form/machine.ts
- [ ] Form/actor.ts
- [ ] Form/utils.ts
- [ ] Form/components/TextField
- [ ] Form/components/DatePicker
- [ ] Form/components/Card

### Testing Checklist
- [ ] Simple form works
- [ ] Field validation works
- [ ] Dependencies work (HIDE, JUMP, VALIDATE, MATH)
- [ ] Conditional logic works
- [ ] Field ordering correct
- [ ] Error handling works

---

## 📋 PHASE 11: Form Media Components
**Status:** 🟡 NOT STARTED
**Goal:** Migrate image and audio capture

### Tasks
- [ ] Migrate ImageView component
- [ ] Migrate Recorder component and machine
- [ ] Connect to image picker
- [ ] Connect to audio recorder
- [ ] Test image capture
- [ ] Test audio recording
- [ ] Test file storage
- [ ] Test file size limits

### Testing Checklist
- [ ] Image capture works
- [ ] Image preview works
- [ ] Audio recording works
- [ ] Audio playback works
- [ ] File size validation works
- [ ] Multiple files work

---

## 📋 PHASE 12: Form Map Integration
**Status:** 🟡 NOT STARTED
**Goal:** Migrate geometry collection

### Tasks
- [ ] Migrate Form/screens/Map component
- [ ] Migrate map machine
- [ ] Migrate map utilities
- [ ] Support Point collection
- [ ] Support Polygon collection
- [ ] Support LineString collection
- [ ] Test geometry validation

### Testing Checklist
- [ ] Point collection works
- [ ] Polygon collection works
- [ ] LineString collection works
- [ ] Geometry validation works
- [ ] Map interaction smooth

---

## 📋 PHASE 13: Task Manager & Upload Queue
**Status:** 🟡 NOT STARTED
**Goal:** Migrate offline-first upload system
**Complexity:** 🔴 VERY HIGH

### Tasks
- [ ] Migrate TaskManager context
- [ ] Migrate manager XState machine
- [ ] Migrate task XState machine
- [ ] Migrate uploader XState machine
- [ ] Migrate process machine
- [ ] Set up AsyncStorage persistence
- [ ] Test task creation
- [ ] Test parallel uploads
- [ ] Test retry logic
- [ ] Test error handling

### Testing Checklist
- [ ] Tasks persist to storage
- [ ] Tasks upload in background
- [ ] Parallel uploads work
- [ ] Retry logic works (exponential backoff)
- [ ] Error states handled
- [ ] Progress tracking works
- [ ] Task cleanup works

---

## 📋 PHASE 14: Background Tasks & Notifications
**Status:** 🟡 NOT STARTED
**Goal:** Set up background processing

### Tasks
- [ ] Install react-native-background-actions or alternative
- [ ] Install react-native-push-notification
- [ ] Configure iOS push notifications
- [ ] Configure Android push notifications
- [ ] Migrate notification utilities
- [ ] Connect to TaskManager
- [ ] Test background uploads
- [ ] Test notifications

### Dependencies
```json
{
  "dependencies": {
    "react-native-push-notification": "^8.1.1",
    "@react-native-community/push-notification-ios": "^1.11.0"
  }
}
```

### Testing Checklist
- [ ] Background tasks work
- [ ] Notifications display
- [ ] Upload notifications work
- [ ] App state handling works

---

## 📋 PHASE 15: Home Module
**Status:** 🟡 NOT STARTED
**Goal:** Migrate home screens

### Tasks
- [ ] Migrate Home tab navigator
- [ ] Migrate Projects screen
- [ ] Migrate Assigned screen
- [ ] Migrate project list item components
- [ ] Connect to React Query
- [ ] Set up polling for assigned data
- [ ] Migrate project popup
- [ ] Test navigation

### Testing Checklist
- [ ] Tab navigation works
- [ ] Project list loads
- [ ] Assigned data loads
- [ ] Polling works (10s interval)
- [ ] Navigation to project works
- [ ] Pull to refresh works

---

## 📋 PHASE 16: Project Module
**Status:** 🟡 NOT STARTED
**Goal:** Migrate project details

### Tasks
- [ ] Migrate Project screen
- [ ] Migrate project machine
- [ ] Migrate DataCard component
- [ ] Connect to tracking toggle
- [ ] Test navigation to form
- [ ] Test navigation to map
- [ ] Test collected data list

### Testing Checklist
- [ ] Project loads
- [ ] Collected data displays
- [ ] Tracking toggle works
- [ ] Navigation to form works
- [ ] Navigation to map works
- [ ] DataCard renders correctly

---

## 📋 PHASE 17: Map Module
**Status:** 🟡 NOT STARTED
**Goal:** Migrate map viewing

### Tasks
- [ ] Migrate Map screen
- [ ] Migrate Details screen
- [ ] Connect to collected data
- [ ] Display markers
- [ ] Display geofences
- [ ] Test navigation between points

### Testing Checklist
- [ ] Map loads collected data
- [ ] Markers display correctly
- [ ] Geofences display
- [ ] Details sheet works
- [ ] Navigation works

---

## 📋 PHASE 18: Settings Module
**Status:** 🟡 NOT STARTED
**Goal:** Migrate settings

### Tasks
- [ ] Migrate Settings screen
- [ ] Migrate Card component
- [ ] Migrate Switch component
- [ ] Connect to settings store
- [ ] Test theme switching
- [ ] Test media quality settings
- [ ] Test accuracy toggle
- [ ] Test logout

### Testing Checklist
- [ ] Settings load
- [ ] Theme switching works
- [ ] Settings persist
- [ ] Logout works

---

## 📋 PHASE 19: Asset Viewer
**Status:** 🟡 NOT STARTED
**Goal:** Migrate asset viewing

### Tasks
- [ ] Migrate AssetsViewer component
- [ ] Migrate Asset component
- [ ] Migrate Progress component
- [ ] Install react-native-fast-image or alternative
- [ ] Test image viewing
- [ ] Test audio playback

### Dependencies
```json
{
  "dependencies": {
    "react-native-fast-image": "^8.6.3"
  }
}
```

### Testing Checklist
- [ ] Images load and display
- [ ] Audio plays
- [ ] Gallery navigation works
- [ ] Progress indicators work

---

## 📋 PHASE 20: Polish & Additional Features
**Status:** 🟡 NOT STARTED
**Goal:** Final touches

### Tasks
- [ ] Migrate splash screen (use react-native-bootsplash)
- [ ] Configure app icons
- [ ] Configure launch screens
- [ ] Migrate network status indicator
- [ ] Test all transitions
- [ ] Performance optimization
- [ ] Memory leak checks

### Testing Checklist
- [ ] Splash screen works
- [ ] App icons correct
- [ ] Network indicator works
- [ ] No memory leaks
- [ ] Performance acceptable

---

## 📋 PHASE 21: Testing & Bug Fixes
**Status:** 🟡 NOT STARTED
**Goal:** Comprehensive testing

### Testing Areas
- [ ] End-to-end user flows
- [ ] Form submission with all field types
- [ ] Offline mode
- [ ] Background tracking
- [ ] Upload queue
- [ ] Error scenarios
- [ ] Memory usage
- [ ] Battery usage
- [ ] iOS specific features
- [ ] Android specific features

### Bug Tracking
*Bugs will be tracked here as they are discovered*

---

## 📋 PHASE 22: Build & Release Preparation
**Status:** 🟡 NOT STARTED
**Goal:** Prepare for store submission

### Tasks
- [ ] Update version numbers
- [ ] Update iOS build settings
- [ ] Update Android build settings
- [ ] Configure code signing
- [ ] Generate release builds
- [ ] Test release builds
- [ ] Prepare store listings
- [ ] Update privacy policies
- [ ] Create release notes

### Platform Checklists

#### iOS
- [ ] Update version in Info.plist
- [ ] Update bundle ID if needed
- [ ] Configure provisioning profiles
- [ ] Test on physical devices
- [ ] Archive and validate
- [ ] Upload to TestFlight

#### Android
- [ ] Update version code and name
- [ ] Configure signing key
- [ ] Generate AAB
- [ ] Test on physical devices
- [ ] Upload to Play Console (internal testing)

---

## Known Issues & Risks

### High Priority Risks
1. **Background Geolocation** - Git dependency may have compatibility issues
2. **XState Actors** - Complex pattern, need careful migration
3. **Form Engine** - Most complex part, high risk of bugs
4. **Background Tasks** - May need alternative solution for RN 0.81
5. **Shared Element Transitions** - May not be compatible with RN 0.81

### Mitigation Strategies
- Test each phase thoroughly before proceeding
- Keep old project as reference
- Use feature flags if needed
- Have rollback plan for each phase

---

## Testing Strategy

### Per-Phase Testing
- Unit tests for utilities
- Component tests for UI
- Integration tests for flows
- Manual testing checklist

### Regression Testing
After each phase, verify:
- Previous phases still work
- No performance degradation
- No memory leaks introduced

---

## Rollback Plan

If major issues arise in any phase:
1. Document the issue
2. Revert to last working commit
3. Analyze root cause
4. Adjust approach
5. Retry with fixes

---

## Success Criteria

### Phase Completion
- All tasks checked off
- All tests passing
- No critical bugs
- Performance acceptable

### Final Success Criteria
- App builds successfully on iOS and Android
- All features from old app working
- No critical bugs
- Performance equal or better than old app
- Passes Play Store/App Store requirements
- Ready for user acceptance testing

---

## Timeline Estimate

- **Phase 1-5 (Foundation):** 1-2 weeks
- **Phase 6-9 (Core Features):** 1-2 weeks
- **Phase 10-14 (Complex Features):** 2-3 weeks
- **Phase 15-20 (Modules & Polish):** 2-3 weeks
- **Phase 21-22 (Testing & Release):** 1-2 weeks

**Total Estimated Time:** 7-12 weeks (with testing buffer)

---

## Notes & Decisions

### Architecture Decisions
- Keep XState v4 (defer v5 migration for stability)
- Upgrade to TanStack Query v5 (straightforward migration)
- Use react-native-bootsplash instead of splash-screen
- Stay with React Navigation v6 (stable, well-supported)

### Dependency Decisions
- Research alternatives for background geolocation before proceeding
- May need to fork/update unmaintained packages
- Prefer official packages over community when available

---

## Resources

### Documentation
- [React Native 0.81 Docs](https://reactnative.dev/)
- [React Navigation v6 Docs](https://reactnavigation.org/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [XState Docs](https://xstate.js.org/)

### Breaking Changes References
- React 16 → 19: Concurrent features, automatic batching
- React Navigation 5 → 6: API changes
- React Query 3 → TanStack Query 5: Rename, API updates
- Reanimated 2 → 3: Performance improvements

---

## Change Log

| Date | Phase | Changes | Notes |
|------|-------|---------|-------|
| 2025-11-13 | 1 | Completed build configuration | New Architecture disabled, SDK versions updated, app assets copied |
| 2025-11-13 | 0 | Created migration plan | Initial analysis complete |

---

**Next Steps:**
1. Review this plan with stakeholders
2. Get approval to proceed
3. Begin Phase 1: Foundation & Core Dependencies
4. Test thoroughly after Phase 1 before proceeding to Phase 2
