import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import CategoryCard from "@/components/CategoryCard";
import { useLanguage } from "@/lib/language-context";
import type { Category, Offer } from "@/shared/schema";

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { t, isRTL } = useLanguage();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 60000,
  });

  const offersQuery = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
    staleTime: 30000,
  });

  const categories = categoriesQuery.data ?? [];
  const offers = offersQuery.data ?? [];

  const handleCategoryPress = (catId: string) => {
    router.push({ pathname: "/(tabs)", params: {} });
  };

  if (categoriesQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  const totalOffers = offers.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: (Platform.OS === "web" ? webTopInset : insets.top) + 16,
            paddingBottom: Platform.OS === "web" ? 34 : 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text, fontFamily: "DMSans_700Bold", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>
          {t("categories")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "DMSans_400Regular", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>
          {t("browseOffers", { total: totalOffers, count: categories.length })}
        </Text>

        <View style={styles.grid}>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onPress={handleCategoryPress} large />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
