# Food Delivery App UI

A short Expo React Native demo app for navigation patterns: auth flow, stack +
bottom-tab nesting, drawer navigation, route params, persisted auth, tab badge,
transitions, and deep linking.

## Navigation Diagram

```text
NavigationContainer
├─ Auth
│  └─ Login
└─ App
   ├─ Onboarding
   └─ Main Drawer
      ├─ FoodTabs
      │  ├─ HomeTab -> RestaurantStack
      │  │   ├─ Home
      │  │   ├─ RestaurantDetail
      │  │   └─ Cart
      │  ├─ Search
      │  ├─ Orders
      │  └─ Profile
      ├─ My Orders
      ├─ Settings
      ├─ Help
      └─ Logout
```

## Features

- Auth flow: unauthenticated users see `Login`, authenticated users see app.
- Mock auth state is persisted with `AsyncStorage`.
- Onboarding screen before entering the main app.
- Home route navigates to `RestaurantDetail` and `Cart`.
- Restaurant route params include `restaurantName` and `price`.
- Bottom tabs for Home, Search, Orders, and Profile with vector icons.
- Orders tab badge appears when cart has items.
- Drawer menu accessible from Profile and the Home drawer button.
- Drawer includes `My Orders`, `Settings`, `Help`, and `Logout`.
- Custom drawer content with user avatar and display name.
- Hide bottom tab bar on `RestaurantDetail` and `Cart` screens.
- Deep link support for `foodapp://restaurant/123`.

## Deep Link

The app scheme is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "foodapp"
  }
}
```

## Run

```bash
npm install
npm start
```
