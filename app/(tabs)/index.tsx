import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  useColorScheme,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import OfferCard from "@/components/OfferCard";
import CategoryCard from "@/components/CategoryCard";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/lib/language-context";
import type { Offer, Category } from "@/shared/schema";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t, isRTL, language, toggleLanguage } = useLanguage();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const offersQuery = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
    staleTime: 30000,
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 60000,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await offersQuery.refetch();
    setRefreshing(false);
  }, []);

  const offers = offersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredOffers = offers.filter((o) => {
    const matchesCategory = !selectedCategory || o.category === selectedCategory;
    const matchesSearch =
      !search ||
      o.companyName.toLowerCase().includes(search.toLowerCase()) ||
      o.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredOffers = offers.filter((o) => o.featured);

  const handleCategoryPress = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? null : catId);
  };

  if (offersQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  const renderFeaturedItem = ({ item }: { item: Offer }) => (
    <View style={styles.featuredItemWrap}>
      <OfferCard offer={item} />
    </View>
  );

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint}
          />
        }
      >
        <View style={styles.headerSection}>
          <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
              <Text style={[styles.greeting, { color: theme.textSecondary, fontFamily: "DMSans_400Regular", writingDirection: isRTL ? "rtl" : "ltr" }]}>
                {t("findTheBest")}
              </Text>
              <Text style={[styles.title, { color: theme.text, fontFamily: "DMSans_700Bold", writingDirection: isRTL ? "rtl" : "ltr" }]}>
                {t("dealsAndOffers")}
              </Text>
            </View>
            <View style={[styles.headerButtons, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Pressable
                style={[styles.langButton, { backgroundColor: theme.tint }]}
                onPress={toggleLanguage}
              >
                <Text style={[styles.langButtonText, { color: isDark ? "#1E293B" : "#FFFFFF", fontFamily: "DMSans_700Bold" }]}>
                  {language === "en" ? "AR" : "EN"}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.notifButton, { backgroundColor: theme.inputBg }]}
                onPress={() => {}}
              >
                <Ionicons name="notifications-outline" size={22} color={theme.text} />
              </Pressable>
            </View>
          </View>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {!search && (
          <View style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              <Pressable
                onPress={() => setSelectedCategory(null)}
                style={[
                  styles.allChip,
                  {
                    backgroundColor: !selectedCategory ? theme.tint : theme.inputBg,
                    borderColor: !selectedCategory ? theme.tint : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.allChipText,
                    {
                      color: !selectedCategory ? (isDark ? "#1E293B" : "#FFFFFF") : theme.textSecondary,
                      fontFamily: "DMSans_500Medium",
                    },
                  ]}
                >
                  {t("all")}
                </Text>
              </Pressable>
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={handleCategoryPress}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {!search && !selectedCategory && featuredOffers.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: "DMSans_700Bold" }]}>
                {t("featuredDeals")}
              </Text>
              <Ionicons name="flame" size={18} color={theme.accent} />
            </View>
            <FlatList
              data={featuredOffers}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              scrollEnabled={featuredOffers.length > 1}
              inverted={isRTL}
            />
          </View>
        )}

        <View style={styles.section}>
          {(search || selectedCategory) && (
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: "DMSans_700Bold" }]}>
                {filteredOffers.length} {filteredOffers.length === 1 ? t("result") : t("results")}
              </Text>
            </View>
          )}
          {!search && !selectedCategory && (
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: "DMSans_700Bold" }]}>
                {t("allOffers")}
              </Text>
            </View>
          )}
          {filteredOffers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: "DMSans_500Medium" }]}>
                {t("noOffersFound")}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
                {t("tryDifferent")}
              </Text>
            </View>
          ) : (
            filteredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} compact />
            ))
          )}
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
  headerSection: {
    gap: 16,
    marginBottom: 20,
  },
  titleRow: {
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerButtons: {
    gap: 8,
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
  },
  langButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  langButtonText: {
    fontSize: 13,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
  },
  categoriesRow: {
    paddingRight: 20,
    gap: 0,
  },
  allChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  allChipText: {
    fontSize: 13,
  },
  featuredList: {
    paddingRight: 20,
  },
  featuredItemWrap: {
    width: 300,
    marginRight: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 17,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 13,
  },
});
