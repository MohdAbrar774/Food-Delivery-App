import { Ionicons } from "@expo/vector-icons";
import type {
    NativeStackHeaderProps
} from "@react-navigation/native-stack";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

const colors = {
  primary: "#E83F4F",
  primaryDark: "#B91F2C",
  ink: "#161A1F",
  surface: "#FFFFFF",
};

interface CustomStackHeaderProps extends NativeStackHeaderProps {
  backgroundColor?: string;
  titleColor?: string;
  backButtonColor?: string;
}

export function CustomStackHeader({
  navigation,
  back,
  options,
  backgroundColor = colors.surface,
  titleColor = colors.ink,
  backButtonColor = colors.primary,
}: CustomStackHeaderProps) {
  const title =
    options.headerTitle && typeof options.headerTitle === "string"
      ? options.headerTitle
      : options.title;

  const handleBackPress = () => {
    if (back) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        {back ? (
          <Pressable
            onPress={handleBackPress}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color={backButtonColor} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}

        <Text
          style={[styles.title, { color: titleColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        <View style={styles.backButton} />
      </View>
    </SafeAreaView>
  );
}

export const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E9ED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
});

const styles = headerStyles;
