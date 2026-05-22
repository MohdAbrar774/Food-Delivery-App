# 🍔 Food Delivery App UI — React Native Navigation System

A modern Food Delivery mobile application built using **React Native + Expo** focused on implementing advanced **React Navigation patterns** including nested navigators, authentication flow, deep linking, navigation state persistence, and smooth screen transitions.

This project is not just a UI clone — it is designed to demonstrate a complete real-world mobile navigation architecture.

---

## 🚀 Features

* ✅ React Native + Expo setup
* ✅ Onboarding flow
* ✅ Authentication flow with conditional navigation
* ✅ Stack Navigator implementation
* ✅ Bottom Tab Navigator
* ✅ Nested navigators
* ✅ Drawer Navigator integration
* ✅ Dynamic route params
* ✅ Deep linking support
* ✅ Navigation state persistence
* ✅ Custom headers and transitions
* ✅ Tab badge handling
* ✅ Programmatic navigation methods

---

## ⚙️ Tech Stack

### Mobile Framework

* React Native
* Expo

### Navigation

* React Navigation v6

### Packages

* `@react-navigation/native`
* `@react-navigation/native-stack`
* `@react-navigation/bottom-tabs`
* `@react-navigation/drawer`
* `react-native-screens`
* `react-native-safe-area-context`
* `react-native-gesture-handler`
* `react-native-reanimated`
* `@expo/vector-icons`

### Storage

* AsyncStorage

---

## 🏗️ Navigation Architecture

```id="8z80za"
Auth Flow
│
├── Login Stack
│    ├── Login
│    └── Register
│
└── Main App
     │
     ├── Bottom Tabs
     │    ├── Home Stack
     │    │    ├── Home
     │    │    ├── Restaurant Detail
     │    │    └── Cart
     │    │
     │    ├── Search
     │    ├── Orders
     │    └── Profile
     │
     └── Drawer Navigator
          ├── My Orders
          ├── Settings
          ├── Help
          └── Logout
```

---

## 📱 Screens Included

### 🔐 Authentication Flow

* Login Screen
* Register Screen

### 🚀 Onboarding

* Intro screen
* Get Started button

### 🍔 Main App

* Home Screen
* Restaurant Detail Screen
* Cart Screen
* Search Screen
* Orders Screen
* Profile Screen

### 📂 Drawer Screens

* My Orders
* Settings
* Help
* Logout

---

## 🧭 Navigation Features

### Stack Navigation

Flow:

```id="vml8jc"
Onboarding → Home → Restaurant Detail → Cart
```

### Params Passing

Restaurant data passed dynamically:

```js id="d1ucm2"
navigation.navigate("RestaurantDetail", {
  restaurantName: "Burger House",
  price: 499
});
```

---

### Custom Stack Header

Includes:

* Title
* Back label
* Header background color

Example:

```js id="a0mk4f"
headerStyle: {
  backgroundColor: "#ff6347"
}
```

---

## 📌 Bottom Tab Navigator

Tabs:

* Home
* Search
* Orders
* Profile

### Features

* Vector icons
* Active tab highlighting
* Badge on Orders tab when cart contains items

Example:

```js id="1mjlwm"
tabBarBadge: cartItems.length ? cartItems.length : null
```

---

## 🧩 Nested Navigation

The `Home` tab contains its own stack navigator:

```id="5v3l7u"
Home Tab
 └── Restaurant Stack
      ├── Home
      ├── Restaurant Detail
      └── Cart
```

---

## 👁️ Hide Bottom Tab Bar

Tab bar is hidden on:

* Restaurant Detail
* Cart

Example:

```js id="bpb0j6"
tabBarStyle: { display: "none" }
```

---

## 📂 Drawer Navigator

Accessible from Profile screen.

### Drawer Items

* My Orders
* Settings
* Help
* Logout

### Custom Drawer Content

Includes:

* User avatar
* Username
* Navigation links

---

## 🔐 Conditional Auth Flow

### Unauthenticated Users

See:

```id="iqlkmo"
Login Stack
```

### Authenticated Users

See:

```id="lbmzt7"
Main Application
```

### Persisted Auth State

Auth state stored using AsyncStorage.

Example:

```js id="ywqq12"
await AsyncStorage.setItem("isAuthenticated", "true");
```

---

## 🔄 Programmatic Navigation

### navigate

```js id="vjlwm7"
navigation.navigate("Cart");
```

### goBack

```js id="w4m0p7"
navigation.goBack();
```

### replace

```js id="f3kvdn"
navigation.replace("Home");
```

### reset

```js id="nyg7o9"
navigation.reset({
  index: 0,
  routes: [{ name: "Home" }]
});
```

---

## 🔗 Deep Linking Support

Supported deep link:

```id="dltlk5"
foodapp://restaurant/123
```

### Opens:

```id="vqjlwm"
Restaurant Detail Screen
```

Example linking config:

```js id="gmpffx"
const linking = {
  prefixes: ["foodapp://"],
  config: {
    screens: {
      RestaurantDetail: "restaurant/:id"
    }
  }
};
```

---

## 🎨 UI Features

* Responsive layouts
* Modern food delivery interface
* Smooth screen transitions
* Clean spacing and typography
* Mobile-friendly navigation patterns

---

## ⚡ Getting Started

### 1. Create Expo project

```bash id="bz6y4g"
npx create-expo-app food-delivery-app
```

---

### 2. Install dependencies

```bash id="7v13z8"
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
npm install @react-navigation/drawer
npm install react-native-screens
npm install react-native-safe-area-context
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install @react-native-async-storage/async-storage
```

---

### 3. Start Expo

```bash id="2p4n0o"
npx expo start
```

---

## 🗂️ Project Structure

```id="s2g1wu"
.
├── assets/
├── src/
│   ├── navigation/
│   │   ├── AuthNavigator.js
│   │   ├── TabNavigator.js
│   │   ├── DrawerNavigator.js
│   │   └── HomeStack.js
│   │
│   ├── screens/
│   │   ├── OnboardingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── RestaurantDetailScreen.js
│   │   ├── CartScreen.js
│   │   ├── LoginScreen.js
│   │   └── ProfileScreen.js
│   │
│   ├── components/
│   └── context/
│
├── App.js
└── README.md
```

---

## 🎥 Demo Requirements

Your demo video should show:

* Navigation flow
* Nested navigators
* Authentication flow
* Params passing
* Drawer navigation
* Deep linking
* Tab badges
* Transition animations
* App reload persistence

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Built as a React Native navigation architecture project to practice:

* Nested navigators
* Mobile routing systems
* Authentication flows
* Deep linking
* Navigation persistence
* Real-world mobile app structures

---

## ⭐ Learning Outcomes

By building this project, you learn:

* React Navigation architecture
* Stack, Tab, and Drawer navigators
* Nested navigation systems
* Route params handling
* Deep linking setup
* Authentication flow management
* Persistent navigation state
* Mobile app routing patterns
