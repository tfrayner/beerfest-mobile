# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-06-03

### Added

#### Current Festival
- Current festival is now taken directly from the BeerFestDB JSON API rather than 
being baked-in to the app. The app can therefore be used across multiple festivals 
without updates.

## [1.0.1] - 2026-05-22

### Added

#### Cask Detail screen
- Cask graveyard details now included, where set in the database

## [1.0.0] - 2026-05-17

### Added

#### Authentication
- Login screen with username/password authentication against BeerFestDB
- Session cookie stored securely via `expo-secure-store` and restored on app launch
- Automatic logout and redirect to login on session expiry (403 response)

#### Stillage Browser (Home tab)
- Lists all stillage locations for the configured current festival
- Tap a location to browse the casks assigned to it

#### Cask Search tab
- Browse casks across any festival filtered by product category
- Festival and category selectors with smart defaults (most-recent festival, "Beer" category)
- Results displayed as scrollable `CaskCard` list items

#### Cask Detail screen
- View full cask metadata: product name, brewery, order batch, container size, and stillage position
- Edit cask comment, internal cellaring order reference, and external brewery reference
- Toggle status flags (vented, tapped, ready, condemned) via `StatusFlagsEditor`
- Save changes submitted back to BeerFestDB; read-only mode enforced for non-current festivals

#### Cask Measurements screen
- List all volume dip measurements recorded for a cask with timestamps and batch names
- Add new measurements via a modal form (`MeasurementForm`) with measurement-batch selection
- Edit or delete existing measurements inline
- FAB to add new measurements; hidden in read-only mode for non-current festivals

#### Navigation
- Expo Router file-based navigation with nested routes: Festival → Stillage → Cask → Measurements
- Tab bar with Stillage and Search tabs; protected by authentication guard
