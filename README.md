# BeerFestMobile

A React Native / Expo mobile app for managing casks and cask measurements against a [BeerFestDB](https://github.com/tfrayner/beerfestdb) server.

## Features

- Log in to a BeerFestDB instance using your existing account credentials
- Browse festivals → stillage locations → casks via drill-down navigation
- Search casks by festival and product category
- Edit cask metadata and status flags (vented, tapped, ready, condemned)
- View, add, and edit cask volume measurements (dips)
- Session cookie persisted securely across app restarts

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20 LTS (Node 18 works with warnings)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Android Studio](https://developer.android.com/studio) (for Android emulator) and/or Xcode (for iOS simulator)
- Or the **Expo Go** app on a physical device
- A running BeerFestDB server accessible from your device/emulator

## Installation

```bash
git clone https://github.com/tfrayner/beerfest-mobile.git
cd beerfest-mobile
npm install
```

## Configuration

Copy the example environment file and set your server URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_API_BASE_URL=https://your-beerfestdb-host.example.com
```

The `EXPO_PUBLIC_API_BASE_URL` value is baked in at build time. For development
builds pointing at a local server, you can use your machine's LAN IP address,
e.g. `http://192.168.1.100:8000`.

## Running the App

```bash
# Start the Expo dev server (shows a QR code for Expo Go)
npm start

# Open directly on a connected Android device / emulator
npm run android

# Open directly on an iOS simulator
npm run ios
```

Scan the QR code with the **Expo Go** app (Android/iOS) or press `a` / `i` in
the terminal to open the relevant emulator.

## Building for Production

Use [EAS Build](https://docs.expo.dev/build/introduction/) for production APK/IPA:

```bash
npm test
npm install -g eas-cli
eas login
eas build --platform android   # or ios / all
```

Remember to set `EXPO_PUBLIC_API_BASE_URL` as an EAS secret or in your
`eas.json` `env` block so it is available at build time.

## Usage

1. **Login** — Enter your BeerFestDB username and password on the login screen.
2. **Festivals tab** — Lists all festivals on the server. Tap a festival to see
   its stillage locations, then tap a stillage to see its casks.
3. **Search tab** — Pick a festival and product category to list casks directly.
   The festival list auto-selects the most recent entry; the category list
   defaults to "Beer".
4. **Cask detail** — Tap any cask card to open the detail/edit screen. Edit
   reference numbers, the free-text comment, and the four status flags. Tap
   **Save** to submit changes.
5. **Measurements** — From the cask detail screen, tap the chart icon in the
   toolbar to manage dip measurements. Tap the **+** FAB to add a new reading,
   or tap an existing entry to edit it. Set the volume to blank to delete a
   measurement.
6. **Logout** — Tap the logout icon in the festivals toolbar.

## Project Structure

```
app/                    Expo Router screens (file-based routing)
  (auth)/               Login screen
  (tabs)/               Bottom tab screens (festivals, search)
  festival/             Drill-down screens (stillage → cask → measurements)
src/
  api/                  Axios API calls (festivals, casks, measurements, …)
  components/           Shared UI components (CaskCard, MeasurementForm, …)
  hooks/                React Query hooks
  store/                Zustand auth store
  types/                TypeScript interfaces for the BeerFestDB API
```

## License

BeerFestMobile is released under the [GNU General Public License v3.0](LICENSE).
