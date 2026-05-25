# Food Delivery App UI

An Expo React Native app focused on React Navigation patterns: auth flow,
stack navigation, nested tabs, drawer navigation, params, persisted mock auth,
tab badges, transitions, programmatic navigation, and deep linking.

## Navigation Structure

```text
Root NavigationContainer
|
|-- Auth flow when logged out
|   `-- LoginStack
|       `-- Login
|
`-- App flow when logged in
    `-- AppStack
        |-- Onboarding
        `-- Main Drawer
            |-- FoodTabs (hidden drawer item)
            |   |-- HomeTab
            |   |   `-- RestaurantStack
            |   |       |-- Home
            |   |       |-- RestaurantDetail
            |   |       `-- Cart
            |   |-- Search
            |   |-- Orders
            |   `-- Profile
            |-- My Orders
            |-- Settings
            |-- Help
            `-- Logout (custom drawer action)
```

## What Is Implemented

- Login stack for unauthenticated users.
- Mock auth persisted with AsyncStorage.
- Onboarding screen with `Get Started`, then `replace("Main")`.
- Home stack flow: Home -> Restaurant Detail -> Cart.
- Home passes `restaurantName` and `price` route params into Restaurant Detail.
- Custom native stack header with title, `Back` label, and orange header color.
- Bottom tabs for Home, Search, Orders, and Profile using vector icons.
- Orders tab badge appears when the cart has items.
- Restaurant stack is nested inside the Home tab.
- Tab bar hides on Restaurant Detail and Cart.
- Profile opens the drawer with My Orders, Settings, Help, and Logout.
- Drawer content includes a user avatar and name.
- Screen animations are configured on stack navigators.
- Programmatic navigation examples: `navigate`, `goBack`, `replace`, and `reset`.
- Deep link: `foodapp://restaurant/123`.

## Deep Link

The app scheme is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "foodapp"
  }
}
```

Opening `foodapp://restaurant/123` routes directly to the Restaurant Detail
screen when the user is authenticated.

## Run

```bash
npm install
npm start
```
