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
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import OfferCard from "@/components/OfferCard";
import { useSavedOffers } from "@/lib/saved-context";
import { useLanguage } from "@/lib/language-context";
import type { Offer } from "@/shared/schema";

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { savedIds } = useSavedOffers();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { t, isRTL } = useLanguage();

  const offersQuery = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
    staleTime: 30000,
  });

  const offers = offersQuery.data ?? [];
  const savedOffers = offers.filter((o) => savedIds.includes(o.id));

  if (offersQuery.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

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
          {t("savedOffers")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "DMSans_400Regular", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>
          {savedOffers.length} {savedOffers.length === 1 ? t("offerSaved") : t("offersSaved")}
        </Text>

        {savedOffers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="bookmark-outline" size={40} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: "DMSans_600SemiBold" }]}>
              {t("noSavedYet")}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
              {t("tapBookmark")}
            </Text>
          </View>
        ) : (
          savedOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} compact />
          ))
        )}
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
