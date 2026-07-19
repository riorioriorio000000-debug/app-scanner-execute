# App Scanner Execute

A mobile app for scanning, inspecting, and testing Android applications. Built with Expo / React Native.

## Features

- **Apps Tab** — Browse and select installed apps as targets
- **Editor Tab** — JavaScript code editor with runtime API access to interact with selected apps
- **Permissions Tab** — Manage and request required Android permissions

## Language Support

English and Arabic (RTL-aware).

## Building the APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

## Development

```bash
npm install
npx expo start
```
