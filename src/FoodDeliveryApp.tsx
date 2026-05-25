import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import {
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import type {
  LinkingOptions,
  NavigatorScreenParams,
} from "@react-navigation/native";
import {
  DrawerActions,
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ImageStyle, StyleProp } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type AuthStackParamList = {
  Login: undefined;
};

type HomeStackParamList = {
  Home: undefined;
  RestaurantDetail: {
    restaurantId: string;
    restaurantName?: string;
    price?: number;
  };
  Cart: undefined;
};

type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  Search: undefined;
  Orders: undefined;
  Profile: undefined;
};

type DrawerParamList = {
  FoodTabs: NavigatorScreenParams<TabParamList> | undefined;
  "My Orders": undefined;
  Settings: undefined;
  Help: undefined;
};

type AppStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<DrawerParamList> | undefined;
};

type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  App: NavigatorScreenParams<AppStackParamList> | undefined;
};

type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: string;
  veg: boolean;
  spice: "Mild" | "Medium" | "Hot";
  bestseller?: boolean;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  deliveryTime: string;
  price: number;
  rating: string;
  votes: string;
  tag: string;
  offer: string;
  accent: string;
  image: string;
  deliveryFee: number;
  promoted?: boolean;
  menu: Dish[];
};

type FoodCategory = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  accent: string;
};

type Offer = {
  id: string;
  title: string;
  copy: string;
  icon: IconName;
  color: string;
};

type RecentOrder = {
  id: string;
  restaurant: string;
  items: string;
  deliveredAt: string;
  total: number;
  status: string;
  image: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName?: string;
  image?: string;
};

type AppContextValue = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  clearCart: () => void;
};

type IconName = keyof typeof Ionicons.glyphMap;

const AUTH_STORAGE_KEY = "foodapp.authenticated";
const ONBOARDING_STORAGE_KEY = "foodapp.onboardingComplete";

const colors = {
  primary: "#E83F4F",
  primaryDark: "#B91F2C",
  orange: "#FC8019",
  ink: "#161A1F",
  muted: "#68707D",
  line: "#E7E9ED",
  background: "#FAF7F2",
  surface: "#FFFFFF",
  smoke: "#F3F5F7",
  cream: "#FFF1E8",
  success: "#1F8A5B",
  gold: "#F4B942",
  blue: "#2457C5",
};

const categories: FoodCategory[] = [
  {
    id: "biryani",
    name: "Biryani",
    subtitle: "Royal bowls",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d4a9?auto=format&fit=crop&w=500&q=80",
    accent: "#FFF1D9",
  },
  {
    id: "pizza",
    name: "Pizza",
    subtitle: "Cheesy fixes",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
    accent: "#FFE4E8",
  },
  {
    id: "burger",
    name: "Burgers",
    subtitle: "Loaded bites",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
    accent: "#E9F7EF",
  },
  {
    id: "south",
    name: "South Indian",
    subtitle: "Crisp comfort",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80",
    accent: "#EDF2FF",
  },
  {
    id: "rolls",
    name: "Rolls",
    subtitle: "Grab and go",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
    accent: "#FFF6DD",
  },
  {
    id: "dessert",
    name: "Desserts",
    subtitle: "Sweet finish",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80",
    accent: "#FDEAF4",
  },
  {
    id: "healthy",
    name: "Healthy",
    subtitle: "Fresh plates",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
    accent: "#E8F7ED",
  },
  {
    id: "coffee",
    name: "Coffee",
    subtitle: "Cafe runs",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80",
    accent: "#F1E7DD",
  },
];

const restaurants: Restaurant[] = [
  {
    id: "nawaabi-biryani",
    name: "Nawaabi Biryani House",
    cuisine: "Biryani, Mughlai, Kebabs",
    distance: "1.6 km",
    deliveryTime: "23-28 min",
    price: 289,
    rating: "4.7",
    votes: "9.8k",
    tag: "Most ordered",
    offer: "Flat 50% off up to Rs 120",
    accent: "#FFF0D9",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d4a9?auto=format&fit=crop&w=900&q=80",
    deliveryFee: 19,
    promoted: true,
    menu: [
      {
        id: "hyderabadi-chicken-biryani",
        name: "Hyderabadi Chicken Biryani",
        description:
          "Dum cooked basmati rice, saffron, mint, and tender chicken.",
        price: 329,
        image:
          "https://images.unsplash.com/photo-1563379091339-03246963d4a9?auto=format&fit=crop&w=700&q=80",
        rating: "4.8",
        veg: false,
        spice: "Hot",
        bestseller: true,
      },
      {
        id: "paneer-tikka-biryani",
        name: "Paneer Tikka Biryani",
        description:
          "Smoky paneer cubes layered with fragrant rice and onions.",
        price: 289,
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80",
        rating: "4.6",
        veg: true,
        spice: "Medium",
      },
      {
        id: "galouti-kebab",
        name: "Galouti Kebab Platter",
        description:
          "Soft kebabs, roomali roti, pickled onions, and mint chutney.",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=700&q=80",
        rating: "4.7",
        veg: false,
        spice: "Medium",
        bestseller: true,
      },
    ],
  },
  {
    id: "firecrust-pizzeria",
    name: "FireCrust Pizzeria",
    cuisine: "Pizza, Pasta, Italian",
    distance: "2.1 km",
    deliveryTime: "27-34 min",
    price: 399,
    rating: "4.5",
    votes: "6.4k",
    tag: "Wood fired",
    offer: "Buy 1 get 1 on selected pizzas",
    accent: "#FFE5E8",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    deliveryFee: 25,
    menu: [
      {
        id: "smoked-margherita",
        name: "Smoked Margherita",
        description:
          "San Marzano sauce, basil, mozzarella, and smoked olive oil.",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
        rating: "4.6",
        veg: true,
        spice: "Mild",
        bestseller: true,
      },
      {
        id: "pepperoni-storm",
        name: "Pepperoni Storm",
        description: "Crisp pepperoni, chilli honey, mozzarella, and parmesan.",
        price: 429,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80",
        rating: "4.7",
        veg: false,
        spice: "Medium",
      },
      {
        id: "truffle-mac",
        name: "Truffle Mac Pasta",
        description: "Creamy macaroni, truffle oil, herbs, and toasted crumbs.",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
        rating: "4.4",
        veg: true,
        spice: "Mild",
      },
    ],
  },
  {
    id: "dosa-junction",
    name: "Dosa Junction",
    cuisine: "South Indian, Filter Coffee",
    distance: "1.1 km",
    deliveryTime: "18-24 min",
    price: 199,
    rating: "4.6",
    votes: "11k",
    tag: "Fastest",
    offer: "Rs 80 off above Rs 299",
    accent: "#EDF2FF",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80",
    deliveryFee: 0,
    menu: [
      {
        id: "ghee-masala-dosa",
        name: "Ghee Masala Dosa",
        description:
          "Crisp dosa with potato masala, sambar, and three chutneys.",
        price: 179,
        image:
          "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80",
        rating: "4.8",
        veg: true,
        spice: "Medium",
        bestseller: true,
      },
      {
        id: "idli-vada-combo",
        name: "Idli Vada Combo",
        description:
          "Soft idlis, crunchy vada, coconut chutney, and hot sambar.",
        price: 149,
        image:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
        rating: "4.5",
        veg: true,
        spice: "Mild",
      },
      {
        id: "filter-coffee",
        name: "Degree Filter Coffee",
        description:
          "Strong, frothy coffee served the classic South Indian way.",
        price: 79,
        image:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80",
        rating: "4.7",
        veg: true,
        spice: "Mild",
      },
    ],
  },
  {
    id: "burger-borough",
    name: "Burger Borough",
    cuisine: "Burgers, Fries, Shakes",
    distance: "2.8 km",
    deliveryTime: "31-38 min",
    price: 249,
    rating: "4.4",
    votes: "4.3k",
    tag: "Loaded deals",
    offer: "Free fries on orders above Rs 349",
    accent: "#E9F7EF",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    deliveryFee: 29,
    menu: [
      {
        id: "smash-cheese-burger",
        name: "Double Smash Cheese Burger",
        description:
          "Two seared patties, cheese, house sauce, lettuce, and pickles.",
        price: 289,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
        rating: "4.6",
        veg: false,
        spice: "Medium",
        bestseller: true,
      },
      {
        id: "peri-peri-fries",
        name: "Peri Peri Fries",
        description: "Crispy fries tossed in peri peri dust with cheese dip.",
        price: 139,
        image:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80",
        rating: "4.5",
        veg: true,
        spice: "Hot",
      },
      {
        id: "oreo-shake",
        name: "Oreo Fudge Shake",
        description:
          "Thick shake blended with cookies, fudge, and vanilla cream.",
        price: 189,
        image:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=80",
        rating: "4.3",
        veg: true,
        spice: "Mild",
      },
    ],
  },
  {
    id: "mandarin-bowl",
    name: "Mandarin Bowl Co.",
    cuisine: "Asian, Noodles, Momos",
    distance: "3.0 km",
    deliveryTime: "35-42 min",
    price: 319,
    rating: "4.3",
    votes: "3.9k",
    tag: "New tastes",
    offer: "20% off with wallet pay",
    accent: "#FFF6DD",
    image:
      "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80",
    deliveryFee: 35,
    menu: [
      {
        id: "chilli-garlic-noodles",
        name: "Chilli Garlic Noodles",
        description:
          "Wok tossed noodles with garlic, vegetables, chilli oil, and herbs.",
        price: 249,
        image:
          "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=700&q=80",
        rating: "4.4",
        veg: true,
        spice: "Hot",
        bestseller: true,
      },
      {
        id: "korean-fried-chicken",
        name: "Korean Fried Chicken",
        description: "Crisp chicken tossed with gochujang glaze and sesame.",
        price: 369,
        image:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=700&q=80",
        rating: "4.5",
        veg: false,
        spice: "Hot",
      },
      {
        id: "momo-platter",
        name: "Steamed Momo Platter",
        description: "Assorted momos with chilli chutney and clear soup.",
        price: 229,
        image:
          "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=700&q=80",
        rating: "4.2",
        veg: false,
        spice: "Medium",
      },
    ],
  },
  {
    id: "green-table",
    name: "The Green Table",
    cuisine: "Healthy, Salads, Smoothies",
    distance: "1.9 km",
    deliveryTime: "22-30 min",
    price: 279,
    rating: "4.8",
    votes: "5.1k",
    tag: "Fresh today",
    offer: "Free smoothie above Rs 499",
    accent: "#E8F7ED",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    deliveryFee: 15,
    menu: [
      {
        id: "rainbow-quinoa-bowl",
        name: "Rainbow Quinoa Bowl",
        description:
          "Quinoa, greens, hummus, roasted veggies, and lemon dressing.",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
        rating: "4.8",
        veg: true,
        spice: "Mild",
        bestseller: true,
      },
      {
        id: "avocado-toast",
        name: "Avocado Toast Stack",
        description: "Sourdough, avocado mash, cherry tomato, feta, and seeds.",
        price: 269,
        image:
          "https://images.unsplash.com/photo-1603046891744-76e6300f82ef?auto=format&fit=crop&w=700&q=80",
        rating: "4.6",
        veg: true,
        spice: "Mild",
      },
      {
        id: "berry-smoothie",
        name: "Berry Protein Smoothie",
        description: "Mixed berries, banana, yoghurt, protein, and chia.",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=80",
        rating: "4.5",
        veg: true,
        spice: "Mild",
      },
    ],
  },
];

const offers: Offer[] = [
  {
    id: "flash",
    title: "Flash Feast",
    copy: "Up to 60% off before 9 PM",
    icon: "flash",
    color: colors.primary,
  },
  {
    id: "free-delivery",
    title: "Free Delivery",
    copy: "On 18 nearby kitchens",
    icon: "bicycle",
    color: colors.orange,
  },
  {
    id: "wallet",
    title: "Wallet Boost",
    copy: "Extra Rs 75 cashback",
    icon: "wallet",
    color: colors.blue,
  },
];

const recentOrders: RecentOrder[] = [
  {
    id: "cd-1148",
    restaurant: "Nawaabi Biryani House",
    items: "Hyderabadi Chicken Biryani, Galouti Kebab",
    deliveredAt: "Delivered yesterday",
    total: 678,
    status: "Delivered",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d4a9?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "cd-1139",
    restaurant: "The Green Table",
    items: "Rainbow Quinoa Bowl, Berry Protein Smoothie",
    deliveredAt: "Delivered on Sunday",
    total: 498,
    status: "Delivered",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "cd-1127",
    restaurant: "Dosa Junction",
    items: "Ghee Masala Dosa, Degree Filter Coffee",
    deliveredAt: "Delivered last week",
    total: 258,
    status: "Delivered",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80",
  },
];

const menuFilters = ["Recommended", "Veg", "Bestseller"] as const;
type MenuFilter = (typeof menuFilters)[number];

const searchCategories = [
  "All",
  ...categories.map((category) => category.name),
];

const topPicks = restaurants.flatMap((restaurant) =>
  restaurant.menu.slice(0, 1).map((dish) => ({ dish, restaurant })),
);

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const AppContext = createContext<AppContextValue | undefined>(undefined);

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["foodapp://"],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
        },
      },
      App: {
        screens: {
          Onboarding: "onboarding",
          Main: {
            screens: {
              FoodTabs: {
                screens: {
                  HomeTab: {
                    screens: {
                      Home: "home",
                      RestaurantDetail: "restaurant/:restaurantId",
                      Cart: "cart",
                    },
                  },
                  Search: "search",
                  Orders: "orders",
                  Profile: "profile",
                },
              },
              "My Orders": "my-orders",
              Settings: "settings",
              Help: "help",
            },
          },
        },
      },
    },
  },
};

function useFoodApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useFoodApp must be used inside AppProvider");
  }

  return context;
}

function formatPrice(price: number) {
  return `Rs ${price}`;
}

function AppProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    async function restoreState() {
      try {
        const [savedAuth, savedOnboarding] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
        ]);

        setIsAuthenticated(savedAuth === "true");
        setHasCompletedOnboarding(savedOnboarding === "true");
      } finally {
        setIsLoading(false);
      }
    }

    void restoreState();
  }, []);

  const signIn = useCallback(async () => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setCartItems([]);
    setIsAuthenticated(false);
  }, []);

  const finishOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setHasCompletedOnboarding(true);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      isAuthenticated,
      hasCompletedOnboarding,
      isLoading,
      cartItems,
      cartCount,
      cartTotal,
      signIn,
      signOut,
      finishOnboarding,
      addToCart,
      clearCart,
    };
  }, [
    addToCart,
    cartItems,
    clearCart,
    finishOnboarding,
    hasCompletedOnboarding,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useFoodApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking} fallback={<LoadingScreen />}>
      <RootStack.Navigator
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        {isAuthenticated ? (
          <RootStack.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { hasCompletedOnboarding } = useFoodApp();

  return (
    <AppStack.Navigator
      initialRouteName={hasCompletedOnboarding ? "Main" : "Onboarding"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <AppStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AppStack.Screen name="Main" component={MainDrawerNavigator} />
    </AppStack.Navigator>
  );
}

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <FoodDrawerContent {...props} />}
      screenOptions={{
        drawerActiveBackgroundColor: "#FFF0F1",
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.ink,
        drawerItemStyle: styles.drawerItem,
        drawerLabelStyle: styles.drawerLabel,
        drawerStyle: styles.drawer,
        headerShadowVisible: false,
        headerStyle: styles.drawerHeader,
        headerTintColor: colors.ink,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Drawer.Screen
        name="FoodTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="My Orders"
        component={MyOrdersScreen}
        options={{
          title: "My Orders",
          drawerIcon: drawerIcon("receipt-outline"),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: drawerIcon("settings-outline"),
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerIcon: drawerIcon("help-circle-outline"),
        }}
      />
    </Drawer.Navigator>
  );
}

function TabNavigator() {
  const { cartCount } = useFoodApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = getTabIcon(route.name, focused);

          return <Ionicons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={RestaurantStackNavigator}
        options={({ route }) => ({
          title: "Home",
          tabBarStyle: shouldHideTabBar(route)
            ? styles.hiddenTabBar
            : styles.tabBar,
        })}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: styles.tabBadge,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RestaurantStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: styles.screenContent,
        animation: "ios_from_right",
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ animation: "slide_from_right" }}
      />
      <HomeStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </HomeStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <View style={styles.loadingLogo}>
        <Ionicons name="fast-food" size={34} color={colors.surface} />
      </View>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Preparing fresh picks</Text>
    </View>
  );
}

function LoginScreen() {
  const { signIn } = useFoodApp();
  const [phone, setPhone] = useState("98765 43210");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setIsSubmitting(true);
    await signIn();
    setIsSubmitting(false);
  }

  return (
    <SafeAreaView style={styles.authScreen}>
      <View style={styles.authHero}>
        <FoodImage
          source="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
          style={styles.authHeroImage}
          alt="Assorted dishes on a table"
        />
        <View style={styles.authHeroShade} />
        <View style={styles.authBrandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="fast-food" size={25} color={colors.surface} />
          </View>
          <Text style={styles.brandName}>CraveDash</Text>
        </View>
        <Text style={styles.authTitle}>Food you crave, delivered fast.</Text>
        <Text style={styles.authCopy}>
          Discover local restaurants, track your cart, and reorder your
          favorites without friction.
        </Text>
      </View>

      <View style={styles.authPanel}>
        <Text style={styles.inputLabel}>Mobile number</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.authInput}
            keyboardType="phone-pad"
            placeholder="Enter mobile number"
            placeholderTextColor={colors.muted}
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressedButton,
            isSubmitting && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Ionicons name="log-in-outline" size={19} color={colors.surface} />
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Signing in" : "Continue"}
          </Text>
        </Pressable>
        <View style={styles.authTrustRow}>
          <InfoChip icon="shield-checkmark-outline" label="Secure login" />
          <InfoChip icon="flash-outline" label="10 sec setup" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function OnboardingScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, "Onboarding">) {
  const { finishOnboarding } = useFoodApp();

  async function handleGetStarted() {
    await finishOnboarding();
    navigation.replace("Main");
  }

  return (
    <SafeAreaView style={styles.onboardingScreen}>
      <View style={styles.onboardingImageWrap}>
        <FoodImage
          source="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80"
          style={styles.onboardingImage}
          alt="Fresh lunch bowls"
        />
        <View style={styles.onboardingBadge}>
          <Ionicons name="bicycle" size={18} color={colors.primary} />
          <Text style={styles.onboardingBadgeText}>
            25 min average delivery
          </Text>
        </View>
      </View>

      <View style={styles.onboardingCopyBlock}>
        <Text style={styles.eyebrow}>Taste-first delivery</Text>
        <Text style={styles.onboardingTitle}>
          Zomato energy, Swiggy speed, one fresh identity.
        </Text>
        <Text style={styles.onboardingCopy}>
          Browse food categories, detailed restaurant pages, offer-led
          discovery, and a cart that stays easy to read.
        </Text>
      </View>

      <View style={styles.featureGrid}>
        <FeaturePill icon="restaurant-outline" title="Curated menus" />
        <FeaturePill icon="pricetag-outline" title="Live offers" />
        <FeaturePill icon="bag-check-outline" title="Quick checkout" />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressedButton,
        ]}
        onPress={handleGetStarted}
      >
        <Ionicons name="arrow-forward" size={19} color={colors.surface} />
        <Text style={styles.primaryButtonText}>Start Ordering</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function HomeScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "Home">) {
  const { cartCount } = useFoodApp();

  function openSearch() {
    navigation
      .getParent<BottomTabScreenProps<TabParamList>["navigation"]>()
      ?.navigate("Search");
  }

  return (
    <SafeAreaView style={styles.appScreen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeTopBar}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={22} color={colors.ink} />
          </Pressable>
          <View style={styles.locationBlock}>
            <Text style={styles.kicker}>Delivering to</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={15} color={colors.primary} />
              <Text style={styles.locationTitle} numberOfLines={1}>
                Sector 18, Noida
              </Text>
              <Ionicons name="chevron-down" size={15} color={colors.muted} />
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.searchLauncher,
            pressed && styles.searchLauncherPressed,
          ]}
          onPress={openSearch}
        >
          <Ionicons name="search" size={20} color={colors.muted} />
          <Text style={styles.searchLauncherText}>
            Search biryani, pizza, burgers, restaurants
          </Text>
        </Pressable>

        <View style={styles.heroPanel}>
          <View style={styles.heroCopyBlock}>
            <Text style={styles.heroEyebrow}>Tonight special</Text>
            <Text style={styles.heroTitle}>Cravings under 30 minutes</Text>
            <Text style={styles.heroCopy}>
              Handpicked kitchens with hot deals, quick riders, and top-rated
              dishes.
            </Text>
            <View style={styles.heroMetricRow}>
              <MetricPill icon="star" label="4.6+ rated" />
              <MetricPill icon="flash" label="Fast lanes" />
            </View>
          </View>
          <FoodImage
            source="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80"
            style={styles.heroImage}
            alt="Grilled dinner platter"
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Food categories</Text>
            <Text style={styles.sectionCopy}>Tap into your next craving</Text>
          </View>
          <Text style={styles.sectionMeta}>{categories.length} picks</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {categories.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top restaurants</Text>
            <Text style={styles.sectionCopy}>
              Zomato-style discovery, cleaner cards
            </Text>
          </View>
          <Text style={styles.sectionMeta}>{restaurants.length} open</Text>
        </View>

        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() =>
              navigation.navigate("RestaurantDetail", {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                price: restaurant.price,
              })
            }
          />
        ))}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Dish picks for you</Text>
            <Text style={styles.sectionCopy}>
              Fast adds from trusted kitchens
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {topPicks.map(({ dish, restaurant }) => (
            <DishMiniCard
              key={`${restaurant.id}-${dish.id}`}
              dish={dish}
              restaurant={restaurant}
              onPress={() =>
                navigation.navigate("RestaurantDetail", {
                  restaurantId: restaurant.id,
                  restaurantName: restaurant.name,
                  price: dish.price,
                })
              }
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function RestaurantDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "RestaurantDetail">) {
  const { addToCart, cartCount, cartTotal } = useFoodApp();
  const [selectedFilter, setSelectedFilter] =
    useState<MenuFilter>("Recommended");
  const restaurant =
    restaurants.find((item) => item.id === route.params.restaurantId) ??
    restaurants[0];
  const visibleMenu = restaurant.menu.filter((dish) => {
    if (selectedFilter === "Veg") {
      return dish.veg;
    }

    if (selectedFilter === "Bestseller") {
      return dish.bestseller;
    }

    return true;
  });

  function handleAddToCart(dish: Dish) {
    addToCart({
      id: `${restaurant.id}-${dish.id}`,
      name: dish.name,
      price: dish.price,
      restaurantName: restaurant.name,
      image: dish.image,
    });
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailHero}>
          <FoodImage
            source={restaurant.image}
            style={styles.detailHeroImage}
            alt={restaurant.name}
          />
          <View style={styles.detailShade} />
          <SafeAreaView style={styles.detailTopOverlay} edges={["top"]}>
            <Pressable
              style={({ pressed }) => [
                styles.overlayIconButton,
                pressed && styles.overlayIconPressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={21} color={colors.surface} />
            </Pressable>
            <View style={styles.overlayActionRow}>
              <Pressable style={styles.overlayIconButton}>
                <Ionicons
                  name="heart-outline"
                  size={21}
                  color={colors.surface}
                />
              </Pressable>
              <Pressable
                style={styles.overlayIconButton}
                onPress={() => navigation.navigate("Cart")}
              >
                <Ionicons
                  name="bag-handle-outline"
                  size={21}
                  color={colors.surface}
                />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.detailHeroText}>
            <Text style={styles.detailTag}>{restaurant.tag}</Text>
            <Text style={styles.detailTitle}>{restaurant.name}</Text>
            <Text style={styles.detailSubtitle}>{restaurant.cuisine}</Text>
          </View>
        </View>

        <View style={styles.detailBody}>
          <View style={styles.detailStats}>
            <InfoChip
              icon="star"
              label={`${restaurant.rating} (${restaurant.votes})`}
            />
            <InfoChip icon="time-outline" label={restaurant.deliveryTime} />
            <InfoChip
              icon="bicycle-outline"
              label={`${restaurant.distance} away`}
            />
          </View>

          <View style={styles.offerStrip}>
            <Ionicons name="pricetag" size={18} color={colors.primary} />
            <View style={styles.offerTextBlock}>
              <Text style={styles.offerStripTitle}>{restaurant.offer}</Text>
              <Text style={styles.offerStripCopy}>
                More bank and wallet offers are applied at checkout.
              </Text>
            </View>
          </View>

          <View style={styles.menuHeader}>
            <View>
              <Text style={styles.sectionTitle}>Menu</Text>
              <Text style={styles.sectionCopy}>
                {restaurant.menu.length} dishes from{" "}
                {formatPrice(restaurant.price)}
              </Text>
            </View>
            <View style={styles.vegLegend}>
              <View style={styles.vegDot} />
              <Text style={styles.vegLegendText}>Veg</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {menuFilters.map((filter) => {
              const isActive = filter === selectedFilter;

              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {visibleMenu.map((dish) => (
            <MenuDishCard
              key={dish.id}
              dish={dish}
              restaurantName={restaurant.name}
              onAdd={() => handleAddToCart(dish)}
            />
          ))}
        </View>
      </ScrollView>

      {cartCount > 0 ? (
        <Pressable
          style={({ pressed }) => [
            styles.floatingCart,
            pressed && styles.floatingCartPressed,
          ]}
          onPress={() => navigation.navigate("Cart")}
        >
          <View>
            <Text style={styles.floatingCartTitle}>
              {cartCount} item{cartCount > 1 ? "s" : ""} in cart
            </Text>
            <Text style={styles.floatingCartCopy}>
              {formatPrice(cartTotal)}
            </Text>
          </View>
          <View style={styles.floatingCartAction}>
            <Text style={styles.floatingCartActionText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={17} color={colors.surface} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function CartScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "Cart">) {
  const { cartItems, cartTotal, clearCart } = useFoodApp();
  const deliveryFee = cartItems.length > 0 ? 29 : 0;
  const platformFee = cartItems.length > 0 ? 6 : 0;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  function handleCheckout() {
    clearCart();
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }

  return (
    <SafeAreaView style={styles.appScreen} edges={["top", "left", "right"]}>
      <View style={styles.cartHeader}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.cartTitleBlock}>
          <Text style={styles.cartHeaderTitle}>Cart</Text>
          <Text style={styles.cartHeaderCopy}>Delivering to Sector 18</Text>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.cartContent}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <FoodImage
              source="https://images.unsplash.com/photo-1498579397066-22750a3cb424?auto=format&fit=crop&w=700&q=80"
              style={styles.emptyImage}
              alt="Empty dining table"
            />
            <Text style={styles.emptyTitle}>Your cart is waiting</Text>
            <Text style={styles.emptyCopy}>
              Add biryani, pizza, dosa, salads, or any dish that looks too good
              to ignore.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryPressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={18} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Continue shopping</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.addressCard}>
              <Ionicons name="location" size={22} color={colors.primary} />
              <View style={styles.addressTextBlock}>
                <Text style={styles.addressTitle}>Home</Text>
                <Text style={styles.addressCopy} numberOfLines={2}>
                  Sector 18, Noida. Leave at reception if unavailable.
                </Text>
              </View>
              <Text style={styles.changeText}>Change</Text>
            </View>

            <Text style={styles.sectionTitle}>Order items</Text>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartRow}>
                {item.image ? (
                  <FoodImage
                    source={item.image}
                    style={styles.cartItemImage}
                    alt={item.name}
                  />
                ) : (
                  <View style={styles.cartItemFallback}>
                    <Ionicons
                      name="restaurant"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                )}
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cartItemMeta} numberOfLines={1}>
                    {item.restaurantName ?? "CraveDash kitchen"}
                  </Text>
                  <Text style={styles.cartItemQty}>Qty {item.quantity}</Text>
                </View>
                <Text style={styles.cartItemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            ))}

            <View style={styles.billCard}>
              <BillRow label="Item total" value={formatPrice(cartTotal)} />
              <BillRow
                label="Delivery partner fee"
                value={formatPrice(deliveryFee)}
              />
              <BillRow label="Platform fee" value={formatPrice(platformFee)} />
              <View style={styles.billDivider} />
              <BillRow
                label="To pay"
                value={formatPrice(grandTotal)}
                emphasized
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressedButton,
              ]}
              onPress={handleCheckout}
            >
              <Ionicons
                name="bag-check-outline"
                size={19}
                color={colors.surface}
              />
              <Text style={styles.primaryButtonText}>Place Order</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, "Search">) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const normalizedQuery = query.toLowerCase();
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const haystack = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.tag,
      ...restaurant.menu.map((dish) => dish.name),
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = haystack.includes(normalizedQuery);
    const matchesCategory =
      activeCategory === "All" ||
      haystack.includes(activeCategory.toLowerCase().split(" ")[0]);

    return matchesQuery && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.appScreen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.searchContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Search</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Restaurant, cuisine, or dish"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {searchCategories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Matching restaurants</Text>
            <Text style={styles.sectionCopy}>
              {filteredRestaurants.length} result
              {filteredRestaurants.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() =>
              navigation.navigate("HomeTab", {
                screen: "RestaurantDetail",
                params: {
                  restaurantId: restaurant.id,
                  restaurantName: restaurant.name,
                  price: restaurant.price,
                },
              })
            }
          />
        ))}

        {filteredRestaurants.length === 0 ? (
          <View style={styles.noResults}>
            <Ionicons name="search" size={32} color={colors.primary} />
            <Text style={styles.noResultsTitle}>No exact match</Text>
            <Text style={styles.noResultsCopy}>
              Try pizza, biryani, dosa, burger, healthy, or coffee.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrdersScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, "Orders">) {
  const { cartCount, cartTotal } = useFoodApp();

  return (
    <SafeAreaView style={styles.appScreen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.ordersContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Orders</Text>
        <View style={styles.liveOrderCard}>
          <View style={styles.liveOrderIcon}>
            <Ionicons name="receipt-outline" size={26} color={colors.surface} />
          </View>
          <View style={styles.liveOrderInfo}>
            <Text style={styles.liveOrderTitle}>Current cart</Text>
            <Text style={styles.liveOrderCopy}>
              {cartCount > 0
                ? `${cartCount} item(s), ${formatPrice(cartTotal)} before fees`
                : "No active order yet"}
            </Text>
          </View>
          {cartCount > 0 ? (
            <Pressable
              style={styles.smallPrimaryButton}
              onPress={() =>
                navigation.navigate("HomeTab", {
                  screen: "Cart",
                })
              }
            >
              <Text style={styles.smallPrimaryButtonText}>View</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Recent orders</Text>
        {recentOrders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, "Profile">) {
  const { signOut } = useFoodApp();

  return (
    <SafeAreaView style={styles.appScreen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Aarav Kapoor</Text>
            <Text style={styles.profileMeta}>
              Gold member | 1260 reward points
            </Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={22} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.membershipCard}>
          <View>
            <Text style={styles.membershipTitle}>CraveDash Gold</Text>
            <Text style={styles.membershipCopy}>
              Free delivery, priority support, and extra weekend offers.
            </Text>
          </View>
          <Ionicons name="sparkles" size={30} color={colors.gold} />
        </View>

        <View style={styles.profileStatGrid}>
          <ProfileStat value="18" label="Orders" />
          <ProfileStat value="8" label="Favorites" />
          <ProfileStat value="3" label="Addresses" />
        </View>

        <View style={styles.profilePanel}>
          <ProfileRow
            icon="location-outline"
            label="Saved addresses"
            value="3"
          />
          <ProfileRow icon="card-outline" label="Payment methods" value="2" />
          <ProfileRow
            icon="heart-outline"
            label="Favorite kitchens"
            value="8"
          />
          <ProfileRow icon="gift-outline" label="Coupons" value="12" />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryPressed,
          ]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MyOrdersScreen() {
  return (
    <SafeAreaView style={styles.drawerScreen} edges={["left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.drawerScreenContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>My Orders</Text>
        {recentOrders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  return (
    <SafeAreaView style={styles.drawerScreen} edges={["left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.drawerScreenContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>
        <View style={styles.profilePanel}>
          <ProfileRow
            icon="notifications-outline"
            label="Push alerts"
            value="On"
          />
          <ProfileRow
            icon="leaf-outline"
            label="Veg preference"
            value="Mixed"
          />
          <ProfileRow
            icon="language-outline"
            label="Language"
            value="English"
          />
          <ProfileRow
            icon="shield-checkmark-outline"
            label="Privacy"
            value="Ready"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HelpScreen() {
  return (
    <SafeAreaView style={styles.drawerScreen} edges={["left", "right"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.drawerScreenContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Help</Text>
        <View style={styles.supportCard}>
          <Ionicons
            name="chatbubbles-outline"
            size={27}
            color={colors.primary}
          />
          <View style={styles.supportTextBlock}>
            <Text style={styles.supportTitle}>24x7 chat support</Text>
            <Text style={styles.supportCopy}>
              Get help with refunds, missing items, payments, or delivery
              updates.
            </Text>
          </View>
        </View>
        <View style={styles.profilePanel}>
          <ProfileRow icon="call-outline" label="Call support" value="Open" />
          <ProfileRow icon="mail-outline" label="Email" value="help" />
          <ProfileRow icon="document-text-outline" label="FAQs" value="View" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FoodDrawerContent(props: DrawerContentComponentProps) {
  const { signOut } = useFoodApp();
  const focusedRoute = props.state.routeNames[props.state.index];

  async function handleLogout() {
    props.navigation.reset({
      index: 0,
      routes: [{ name: "FoodTabs" }],
    });
    await signOut();
  }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={styles.drawerProfile}>
        <View style={styles.drawerBrandRow}>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarText}>AK</Text>
          </View>
          <View style={styles.drawerBrandText}>
            <Text style={styles.drawerName}>Aarav Kapoor</Text>
            <Text style={styles.drawerEmail}>aarav@cravedash.dev</Text>
          </View>
        </View>
        <View style={styles.drawerRewardCard}>
          <Ionicons name="trophy-outline" size={18} color={colors.gold} />
          <Text style={styles.drawerRewardText}>
            1260 reward points available
          </Text>
        </View>
      </View>

      <DrawerItem
        label="My Orders"
        focused={focusedRoute === "My Orders"}
        icon={drawerIcon("receipt-outline")}
        onPress={() => props.navigation.navigate("My Orders")}
      />
      <DrawerItem
        label="Settings"
        focused={focusedRoute === "Settings"}
        icon={drawerIcon("settings-outline")}
        onPress={() => props.navigation.navigate("Settings")}
      />
      <DrawerItem
        label="Help"
        focused={focusedRoute === "Help"}
        icon={drawerIcon("help-circle-outline")}
        onPress={() => props.navigation.navigate("Help")}
      />
      <View style={styles.drawerDivider} />
      <DrawerItem
        label="Logout"
        icon={drawerIcon("log-out-outline")}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

function FoodImage({
  source,
  style,
  alt,
}: {
  source: string;
  style: StyleProp<ImageStyle>;
  alt: string;
}) {
  return (
    <Image
      style={style}
      source={source}
      placeholderContentFit="cover"
      contentFit="cover"
      transition={260}
      cachePolicy="disk"
      alt={alt}
    />
  );
}

function CategoryTile({ category }: { category: FoodCategory }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryTile,
        { backgroundColor: category.accent },
        pressed && styles.cardPressed,
      ]}
    >
      <FoodImage
        source={category.image}
        style={styles.categoryImage}
        alt={category.name}
      />
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.name}
      </Text>
      <Text style={styles.categorySubtitle} numberOfLines={1}>
        {category.subtitle}
      </Text>
    </Pressable>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <View style={styles.offerCard}>
      <View style={[styles.offerIcon, { backgroundColor: offer.color }]}>
        <Ionicons name={offer.icon} size={18} color={colors.surface} />
      </View>
      <View style={styles.offerCardText}>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerCopy}>{offer.copy}</Text>
      </View>
    </View>
  );
}

function RestaurantCard({
  restaurant,
  onPress,
}: {
  restaurant: Restaurant;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.restaurantCard,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.restaurantImageWrap}>
        <FoodImage
          source={restaurant.image}
          style={styles.restaurantImage}
          alt={restaurant.name}
        />
        <View style={styles.restaurantOfferBadge}>
          <Text style={styles.restaurantOfferText}>{restaurant.offer}</Text>
        </View>
      </View>
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantTitleRow}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color={colors.surface} />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
        </View>
        <Text style={styles.restaurantCuisine} numberOfLines={1}>
          {restaurant.cuisine}
        </Text>
        <View style={styles.restaurantMetaRow}>
          <Text style={styles.restaurantMeta}>{restaurant.deliveryTime}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.restaurantMeta}>{restaurant.distance}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.restaurantMeta}>
            from {formatPrice(restaurant.price)}
          </Text>
        </View>
        <View style={styles.restaurantFooter}>
          <Text style={styles.restaurantTag}>{restaurant.tag}</Text>
          <Text style={styles.deliveryFee}>
            {restaurant.deliveryFee === 0
              ? "Free delivery"
              : `${formatPrice(restaurant.deliveryFee)} delivery`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function DishMiniCard({
  dish,
  restaurant,
  onPress,
}: {
  dish: Dish;
  restaurant: Restaurant;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.dishMiniCard,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <FoodImage
        source={dish.image}
        style={styles.dishMiniImage}
        alt={dish.name}
      />
      {dish.bestseller ? (
        <View style={styles.bestSellerBadge}>
          <Text style={styles.bestSellerText}>Best</Text>
        </View>
      ) : null}
      <Text style={styles.dishMiniName} numberOfLines={1}>
        {dish.name}
      </Text>
      <Text style={styles.dishMiniRestaurant} numberOfLines={1}>
        {restaurant.name}
      </Text>
      <Text style={styles.dishMiniPrice}>{formatPrice(dish.price)}</Text>
    </Pressable>
  );
}

function MenuDishCard({
  dish,
  restaurantName,
  onAdd,
}: {
  dish: Dish;
  restaurantName: string;
  onAdd: () => void;
}) {
  return (
    <View style={styles.menuDishCard}>
      <View style={styles.menuDishText}>
        <View style={styles.dishFlagRow}>
          <View
            style={[
              styles.foodTypeMark,
              dish.veg ? styles.vegMark : styles.nonVegMark,
            ]}
          >
            <View
              style={[
                styles.foodTypeDot,
                dish.veg ? styles.vegDot : styles.nonVegDot,
              ]}
            />
          </View>
          {dish.bestseller ? (
            <Text style={styles.bestsellerLabel}>Bestseller</Text>
          ) : null}
        </View>
        <Text style={styles.menuDishName}>{dish.name}</Text>
        <Text style={styles.menuDishPrice}>{formatPrice(dish.price)}</Text>
        <Text style={styles.menuDishCopy} numberOfLines={2}>
          {dish.description}
        </Text>
        <View style={styles.dishMetaRow}>
          <InfoChip icon="star-outline" label={dish.rating} />
          <InfoChip icon="flame-outline" label={dish.spice} />
        </View>
      </View>
      <View style={styles.menuDishImageWrap}>
        <FoodImage
          source={dish.image}
          style={styles.menuDishImage}
          alt={`${dish.name} from ${restaurantName}`}
        />
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={17} color={colors.primary} />
          <Text style={styles.addButtonText}>ADD</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OrderHistoryCard({ order }: { order: RecentOrder }) {
  return (
    <View style={styles.orderHistoryCard}>
      <FoodImage
        source={order.image}
        style={styles.orderImage}
        alt={order.restaurant}
      />
      <View style={styles.orderTextBlock}>
        <View style={styles.orderTitleRow}>
          <Text style={styles.orderRestaurant} numberOfLines={1}>
            {order.restaurant}
          </Text>
          <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
        </View>
        <Text style={styles.orderItems} numberOfLines={2}>
          {order.items}
        </Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderStatus}>{order.status}</Text>
          <Text style={styles.orderDate}>{order.deliveredAt}</Text>
        </View>
      </View>
    </View>
  );
}

function FeaturePill({ icon, title }: { icon: IconName; title: string }) {
  return (
    <View style={styles.featurePill}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <Text style={styles.featurePillText}>{title}</Text>
    </View>
  );
}

function MetricPill({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.metricPill}>
      <Ionicons name={icon} size={13} color={colors.gold} />
      <Text style={styles.metricPillText}>{label}</Text>
    </View>
  );
}

function InfoChip({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.infoChip}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={styles.infoChipLabel}>{label}</Text>
    </View>
  );
}

function BillRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, emphasized && styles.billLabelStrong]}>
        {label}
      </Text>
      <Text style={[styles.billValue, emphasized && styles.billValueStrong]}>
        {value}
      </Text>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileRow}>
      <View style={styles.profileRowLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.profileRowLabel}>{label}</Text>
      </View>
      <Text style={styles.profileRowValue}>{value}</Text>
    </View>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

function drawerIcon(iconName: IconName) {
  return function DrawerIconRenderer({
    color,
    size,
  }: {
    color: string;
    size: number;
  }) {
    return <Ionicons name={iconName} color={color} size={size} />;
  };
}

function getTabIcon(routeName: keyof TabParamList, focused: boolean): IconName {
  const icons: Record<keyof TabParamList, [IconName, IconName]> = {
    HomeTab: ["home-outline", "home"],
    Search: ["search-outline", "search"],
    Orders: ["bag-handle-outline", "bag-handle"],
    Profile: ["person-outline", "person"],
  };
  const [outlineIcon, filledIcon] = icons[routeName];

  return focused ? filledIcon : outlineIcon;
}

function shouldHideTabBar(route: BottomTabScreenProps<TabParamList>["route"]) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";

  return routeName === "RestaurantDetail" || routeName === "Cart";
}

export default function FoodDeliveryApp() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screenContent: {
    backgroundColor: colors.background,
  },
  appScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: colors.background,
  },
  loadingLogo: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800",
  },
  authScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authHero: {
    minHeight: 410,
    justifyContent: "flex-end",
    padding: 22,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  authHeroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  authHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 12, 16, 0.48)",
  },
  authBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 54,
  },
  brandMark: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  brandName: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: "900",
  },
  authTitle: {
    color: colors.surface,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
  },
  authCopy: {
    color: "#F5DDE0",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  authPanel: {
    padding: 20,
    gap: 14,
  },
  inputLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  inputWrap: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 10,
    backgroundColor: colors.surface,
  },
  countryCode: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  authInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  authTrustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  onboardingScreen: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    gap: 18,
    backgroundColor: colors.background,
  },
  onboardingImageWrap: {
    minHeight: 310,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.smoke,
  },
  onboardingImage: {
    flex: 1,
    width: "100%",
  },
  onboardingBadge: {
    position: "absolute",
    left: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 7,
    backgroundColor: colors.surface,
  },
  onboardingBadgeText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  onboardingCopyBlock: {
    gap: 10,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  onboardingTitle: {
    color: colors.ink,
    fontSize: 33,
    lineHeight: 39,
    fontWeight: "900",
  },
  onboardingCopy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  featureGrid: {
    flexDirection: "row",
    gap: 8,
  },
  featurePill: {
    flex: 1,
    minHeight: 62,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 10,
    gap: 7,
    backgroundColor: colors.surface,
  },
  featurePillText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 18,
    gap: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900",
  },
  pressedButton: {
    backgroundColor: colors.primaryDark,
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2B2BA",
    paddingHorizontal: 18,
    gap: 8,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryPressed: {
    backgroundColor: "#FFF0F1",
  },
  drawerHeader: {
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  homeContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 16,
  },
  homeTopBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  iconButtonPressed: {
    backgroundColor: colors.smoke,
  },
  locationBlock: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationTitle: {
    maxWidth: "82%",
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 19,
    height: 19,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
  },
  cartBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "900",
  },
  searchLauncher: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 9,
    backgroundColor: colors.surface,
  },
  searchLauncherPressed: {
    borderColor: "#F2B2BA",
  },
  searchLauncherText: {
    flex: 1,
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  heroPanel: {
    minHeight: 210,
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  heroCopyBlock: {
    flex: 1.05,
    justifyContent: "center",
    padding: 18,
  },
  heroEyebrow: {
    color: "#FFD4D8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    marginTop: 7,
  },
  heroCopy: {
    color: "#DDE1E7",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  heroMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  metricPillText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
  heroImage: {
    flex: 0.95,
    minHeight: 210,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionCopy: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  sectionMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  horizontalList: {
    gap: 12,
    paddingRight: 4,
  },
  categoryTile: {
    width: 104,
    borderRadius: 8,
    padding: 9,
    gap: 6,
  },
  categoryImage: {
    width: "100%",
    height: 78,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  categoryName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  categorySubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  offerCard: {
    width: 238,
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 12,
    gap: 11,
    backgroundColor: colors.surface,
  },
  offerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  offerCardText: {
    flex: 1,
  },
  offerTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  offerCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  restaurantCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surface,
    boxShadow: "0px 8px 14px rgba(22, 26, 31, 0.06)",
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  restaurantImageWrap: {
    height: 156,
    backgroundColor: colors.smoke,
  },
  restaurantImage: {
    flex: 1,
    width: "100%",
  },
  restaurantOfferBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    maxWidth: "76%",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.primary,
  },
  restaurantOfferText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
  },
  restaurantInfo: {
    padding: 12,
    gap: 6,
  },
  restaurantTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  restaurantName: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  restaurantCuisine: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  restaurantMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },
  restaurantMeta: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  restaurantFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  restaurantTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  deliveryFee: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 3,
    backgroundColor: colors.success,
  },
  ratingText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
  },
  dishMiniCard: {
    width: 154,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 8,
    backgroundColor: colors.surface,
  },
  dishMiniImage: {
    width: "100%",
    height: 104,
    borderRadius: 8,
    backgroundColor: colors.smoke,
  },
  bestSellerBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.orange,
  },
  bestSellerText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "900",
  },
  dishMiniName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 8,
  },
  dishMiniRestaurant: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  dishMiniPrice: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 6,
  },
  detailContent: {
    paddingBottom: 96,
    backgroundColor: colors.background,
  },
  detailHero: {
    height: 330,
    justifyContent: "flex-end",
    backgroundColor: colors.ink,
  },
  detailHeroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  detailShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 12, 16, 0.36)",
  },
  detailTopOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  overlayActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  overlayIconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  overlayIconPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  detailHeroText: {
    padding: 18,
    gap: 5,
  },
  detailTag: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
    backgroundColor: colors.primary,
  },
  detailTitle: {
    color: colors.surface,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
  },
  detailSubtitle: {
    color: "#EEF1F5",
    fontSize: 14,
    fontWeight: "700",
  },
  detailBody: {
    padding: 16,
    gap: 14,
  },
  detailStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3D4D8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
    backgroundColor: colors.surface,
  },
  infoChipLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  offerStrip: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F3D4D8",
    borderRadius: 8,
    padding: 13,
    gap: 10,
    backgroundColor: "#FFF4F5",
  },
  offerTextBlock: {
    flex: 1,
  },
  offerStripTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  offerStripCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  vegLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vegLegendText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  filterList: {
    gap: 9,
    paddingRight: 4,
  },
  filterChip: {
    minHeight: 38,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: "#FFF0F1",
  },
  filterChipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  menuDishCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 12,
    gap: 12,
    backgroundColor: colors.surface,
  },
  menuDishText: {
    flex: 1,
    minHeight: 148,
  },
  dishFlagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  foodTypeMark: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  vegMark: {
    borderColor: colors.success,
  },
  nonVegMark: {
    borderColor: colors.primary,
  },
  foodTypeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  nonVegDot: {
    backgroundColor: colors.primary,
  },
  bestsellerLabel: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  menuDishName: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 9,
  },
  menuDishPrice: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  menuDishCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  dishMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  menuDishImageWrap: {
    width: 112,
    alignItems: "center",
  },
  menuDishImage: {
    width: 112,
    height: 112,
    borderRadius: 8,
    backgroundColor: colors.smoke,
  },
  addButton: {
    minWidth: 82,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F2B2BA",
    borderRadius: 8,
    paddingHorizontal: 9,
    gap: 2,
    backgroundColor: colors.surface,
    transform: [{ translateY: -18 }],
  },
  addButtonPressed: {
    backgroundColor: "#FFF0F1",
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  floatingCart: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.success,
    boxShadow: "0px 8px 18px rgba(22, 26, 31, 0.16)",
    elevation: 8,
  },
  floatingCartPressed: {
    opacity: 0.92,
  },
  floatingCartTitle: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900",
  },
  floatingCartCopy: {
    color: "#DFF6E9",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  floatingCartAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  floatingCartActionText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "900",
  },
  cartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  cartTitleBlock: {
    flex: 1,
  },
  cartHeaderTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900",
  },
  cartHeaderCopy: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  cartContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 14,
  },
  emptyState: {
    minHeight: 610,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  emptyImage: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    backgroundColor: colors.smoke,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "900",
  },
  emptyCopy: {
    maxWidth: 310,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 13,
    gap: 10,
    backgroundColor: colors.surface,
  },
  addressTextBlock: {
    flex: 1,
  },
  addressTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  addressCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  changeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    backgroundColor: colors.surface,
  },
  cartItemImage: {
    width: 62,
    height: 62,
    borderRadius: 8,
    backgroundColor: colors.smoke,
  },
  cartItemFallback: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FFF0F1",
  },
  cartItemInfo: {
    flex: 1,
    gap: 3,
  },
  cartItemName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  cartItemMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  cartItemQty: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  cartItemPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  billCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 14,
    gap: 10,
    backgroundColor: colors.surface,
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  billLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  billValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  billLabelStrong: {
    color: colors.ink,
    fontSize: 16,
  },
  billValueStrong: {
    color: colors.primary,
    fontSize: 18,
  },
  billDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  searchContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 14,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
  },
  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  noResults: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 24,
    gap: 8,
    backgroundColor: colors.surface,
  },
  noResultsTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  noResultsCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  ordersContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 14,
  },
  liveOrderCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 14,
    gap: 12,
    backgroundColor: colors.ink,
  },
  liveOrderIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  liveOrderInfo: {
    flex: 1,
  },
  liveOrderTitle: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900",
  },
  liveOrderCopy: {
    color: "#DDE1E7",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  smallPrimaryButton: {
    minHeight: 36,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  smallPrimaryButtonText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  orderHistoryCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    backgroundColor: colors.surface,
  },
  orderImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.smoke,
  },
  orderTextBlock: {
    flex: 1,
    gap: 4,
  },
  orderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  orderRestaurant: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  orderTotal: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  orderItems: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderStatus: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  orderDate: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  profileContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 14,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 33,
    backgroundColor: colors.ink,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: "900",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900",
  },
  profileMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  membershipCard: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    padding: 16,
    gap: 14,
    backgroundColor: colors.ink,
  },
  membershipTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "900",
  },
  membershipCopy: {
    maxWidth: 260,
    color: "#DDE1E7",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  profileStatGrid: {
    flexDirection: "row",
    gap: 10,
  },
  profileStat: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 13,
    backgroundColor: colors.surface,
  },
  profileStatValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  profileStatLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  profilePanel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  profileRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    paddingHorizontal: 14,
    gap: 10,
  },
  profileRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileRowLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  profileRowValue: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  drawer: {
    width: 300,
    backgroundColor: colors.background,
  },
  drawerContent: {
    paddingTop: 18,
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 10,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  drawerProfile: {
    padding: 16,
    paddingBottom: 18,
  },
  drawerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  drawerAvatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: colors.primary,
  },
  drawerAvatarText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "900",
  },
  drawerBrandText: {
    flex: 1,
  },
  drawerName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  drawerEmail: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  drawerRewardCard: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 14,
    backgroundColor: colors.ink,
  },
  drawerRewardText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
    marginHorizontal: 18,
  },
  drawerScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawerScreenContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 14,
  },
  supportCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: colors.surface,
  },
  supportTextBlock: {
    flex: 1,
  },
  supportTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  supportCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  tabBar: {
    minHeight: 66,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  hiddenTabBar: {
    display: "none",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  tabBadge: {
    backgroundColor: colors.primary,
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
});
