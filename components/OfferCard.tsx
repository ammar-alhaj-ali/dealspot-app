import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useSavedOffers } from "@/lib/saved-context";
import { useLanguage } from "@/lib/language-context";
import { offerTranslations } from "@/lib/translations";
import type { Offer } from "@/shared/schema";

interface OfferCardProps {
  offer: Offer;
  compact?: boolean;
}

export default function OfferCard({ offer, compact }: OfferCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { isSaved, toggleSaved } = useSavedOffers();
  const { language, isRTL } = useLanguage();
  const saved = isSaved(offer.id);

  const arOffer = offerTranslations[offer.id];
  const title = language === "ar" && arOffer ? arOffer.title : offer.title;
  const description = language === "ar" && arOffer ? arOffer.description : offer.description;

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/offer/[id]", params: { id: offer.id } });
  };

  const handleSave = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSaved(offer.id);
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: theme.surface, opacity: pressed ? 0.95 : 1, flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Image source={{ uri: offer.imageUrl }} style={styles.compactImage} contentFit="cover" />
        <View style={styles.compactContent}>
          <View style={[styles.compactHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Image source={{ uri: offer.companyLogo }} style={styles.compactLogo} />
            <Text style={[styles.compactCompany, { color: theme.textSecondary, fontFamily: "DMSans_500Medium" }]}>
              {offer.companyName}
            </Text>
          </View>
          <Text style={[styles.compactTitle, { color: theme.text, fontFamily: "DMSans_600SemiBold", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]} numberOfLines={2}>
            {title}
          </Text>
          <View style={[styles.compactFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.discountBadge, { backgroundColor: theme.badge }]}>
              <Text style={[styles.discountText, { color: theme.badgeText, fontFamily: "DMSans_700Bold" }]}>
                {offer.discount}
              </Text>
            </View>
            <Pressable onPress={handleSave} hitSlop={10}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={saved ? theme.tint : theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          shadowColor: theme.cardShadow,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: offer.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={[styles.discountOverlay, { backgroundColor: theme.badge, left: isRTL ? undefined : 12, right: isRTL ? 12 : undefined }]}>
          <Text style={[styles.discountOverlayText, { color: theme.badgeText, fontFamily: "DMSans_700Bold" }]}>
            {offer.discount}
          </Text>
        </View>
        <Pressable onPress={handleSave} style={[styles.saveButton, { left: isRTL ? 12 : undefined, right: isRTL ? undefined : 12 }]} hitSlop={10}>
          <View style={styles.saveButtonBg}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={saved ? theme.tint : "#FFFFFF"}
            />
          </View>
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Image source={{ uri: offer.companyLogo }} style={styles.logo} />
          <View style={[styles.headerText, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
            <Text style={[styles.companyName, { color: theme.textSecondary, fontFamily: "DMSans_500Medium" }]}>
              {offer.companyName}
            </Text>
            <View style={[styles.ratingRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
                {offer.rating} ({offer.reviewCount})
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.title, { color: theme.text, fontFamily: "DMSans_600SemiBold", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary, fontFamily: "DMSans_400Regular", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountOverlay: {
    position: "absolute",
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountOverlayText: {
    fontSize: 13,
  },
  saveButton: {
    position: "absolute",
    top: 12,
  },
  saveButtonBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 14,
    gap: 8,
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontSize: 13,
  },
  ratingRow: {
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  compactCard: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    height: 110,
  },
  compactImage: {
    width: 110,
    height: "100%",
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  compactHeader: {
    alignItems: "center",
    gap: 6,
  },
  compactLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  compactCompany: {
    fontSize: 11,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  compactFooter: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
  },
});
