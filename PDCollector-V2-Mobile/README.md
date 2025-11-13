# Polaris Data Collector (PDC)
PDCv2 is a mobile data collection tool

## Table of contents

- [Folder structure](#folder-structure)
- [Libraries](#libraries)
- [Running](#running)
- [Work arounds](#work-arounds)
- 
- 

## Folder structure

```
.
└── pdcv2/
    ├── assets/
    │   ├── svg
    │   └── png
    ├── contexts/
    │   ├── TaskManager
    │   ├── TrackManager
    │   └── NetworkState
    ├── modules/
    │   ├── Form/
    │   │   └── screens/
    │   │       ├── Map
    │   │       └── index.tsx
    │   ├── Home/
    │   │   └── modules/
    │   │       ├── Assigned
    │   │       └── Projects
    │   ├── Map/
    │   │   └── screens/
    │   │       ├── Details.tsx
    │   │       └── Map.tsx
    │   ├── Project
    │   ├── Settings
    │   ├── Login.tsx
    │   ├── PasswordChange.tsx
    │   ├── ProjectViewer.tsx
    │   └── Tracker.tsx
    └── shared/
        ├── components
        ├── hooks
        ├── services
        ├── stores
        ├── types
        ├── utils
        ├── http.ts
        └── query.ts
```

---

## Tools/Libraries

- [Typescript](https://www.typescriptlang.org/)
- [xstate](https://xstate.js.org/) (For structured local or global state management)
- [zustand](https://github.com/pmndrs/zustand) (For global state management)
- [react-native-background-geolocation](https://github.com/transistorsoft/react-native-background-geolocation-android) (For background tracking feature)
- [react-query](https://react-query.tanstack.com/overview) (For data fetching)

---

## Running

For every ios build/run, run below command

```bash
npm run bundle:ios
```

Then add/replace existing `main.jsbundle` file with generated file to PDCv2 project in xcode, then run on device.

```
npm start
```

### ios
```
npm run ios
```

### android
```
npm run android
```

---

### Work arounds

- [Unable to connect to development server](https://github.com/facebook/react-native/issues/29587#issuecomment-1035552875)

- [Date picker styling](https://stackoverflow.com/a/56963465/6220015)

### Icons

[San francisco symbols](https://www.figma.com/file/HL9wTNV7DNkmsBH3iAp08d/SF-Symbols-3-(v4.2)----6000-icons-(svg%2Ffont)-(Community)?node-id=0%3A1)

### API Documentation

[Swagger Document](https://35.239.236.136/swagger-ui.html#/mobile-controller/agentSubmitDataUsingPOST)