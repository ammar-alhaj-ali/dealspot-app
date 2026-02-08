import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useSavedOffers } from "@/lib/saved-context";
import { useLanguage } from "@/lib/language-context";
import { offerTranslations, categoryNameMap } from "@/lib/translations";
import type { Offer } from "@/shared/schema";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSaved } = useSavedOffers();
  const { t, isRTL, language } = useLanguage();
  const [codeCopied, setCodeCopied] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const offerQuery = useQuery<Offer>({
    queryKey: ["/api/offers", id],
    staleTime: 30000,
  });

  const offer = offerQuery.data;
  const saved = offer ? isSaved(offer.id) : false;

  const arOffer = offer ? offerTranslations[offer.id] : undefined;
  const offerTitle = language === "ar" && arOffer ? arOffer.title : offer?.title;
  const offerDesc = language === "ar" && arOffer ? arOffer.description : offer?.description;
  const offerTerms = language === "ar" && arOffer ? arOffer.terms : offer?.terms;

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSave = () => {
    if (!offer) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSaved(offer.id);
  };

  const handleCopyCode = () => {
    if (!offer) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (!offer) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <View style={styles.loadingInner}>
          <Text style={[styles.loadingText, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
            {t("loadingOffer")}
          </Text>
        </View>
      </View>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(offer.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const catKey = categoryNameMap[offer.category];
  const categoryDisplay = catKey ? t(catKey) : offer.category.charAt(0).toUpperCase() + offer.category.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
      >
        <View style={styles.imageSection}>
          <Image source={{ uri: offer.imageUrl }} style={styles.heroImage} contentFit="cover" />
          <View style={[styles.imageOverlay]} />
          <View style={[styles.navBar, { top: Platform.OS === "web" ? webTopInset + 10 : insets.top + 6, flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Pressable onPress={handleBack} style={styles.navButton}>
              <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={handleSave} style={styles.navButton}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={saved ? theme.tint : "#FFFFFF"}
              />
            </Pressable>
          </View>
          <View style={[styles.discountTag, { backgroundColor: theme.badge, left: isRTL ? undefined : 20, right: isRTL ? 20 : undefined }]}>
            <Text style={[styles.discountTagText, { color: theme.badgeText, fontFamily: "DMSans_700Bold" }]}>
              {offer.discount}
            </Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.detailSection}>
          <View style={[styles.companyRow, { borderBottomColor: theme.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Image source={{ uri: offer.companyLogo }} style={styles.companyLogo} />
            <View style={[styles.companyInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <Text style={[styles.companyName, { color: theme.text, fontFamily: "DMSans_600SemiBold" }]}>
                {offer.companyName}
              </Text>
              <View style={[styles.ratingRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={[styles.ratingText, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
                  {offer.rating} ({offer.reviewCount} {t("reviews")})
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.offerTitle, { color: theme.text, fontFamily: "DMSans_700Bold", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>
            {offerTitle}
          </Text>

          <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.metaChip, { backgroundColor: daysLeft <= 7 ? "#FEE2E2" : theme.inputBg, flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons
                name="time-outline"
                size={14}
                color={daysLeft <= 7 ? "#EF4444" : theme.textSecondary}
              />
              <Text
                style={[
                  styles.metaText,
                  {
                    color: daysLeft <= 7 ? "#EF4444" : theme.textSecondary,
                    fontFamily: "DMSans_500Medium",
                  },
                ]}
              >
                {t("daysLeft", { days: daysLeft })}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: theme.inputBg, flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="pricetag-outline" size={14} color={theme.accent} />
              <Text style={[styles.metaText, { color: theme.accent, fontFamily: "DMSans_500Medium" }]}>
                {categoryDisplay}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: theme.text, fontFamily: "DMSans_400Regular", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>
            {offerDesc}
          </Text>

          <View style={[styles.codeSection, { backgroundColor: theme.inputBg, borderColor: theme.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
              <Text style={[styles.codeLabel, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
                {t("promoCode")}
              </Text>
              <Text style={[styles.codeValue, { color: theme.text, fontFamily: "DMSans_700Bold" }]}>
                {offer.code}
              </Text>
            </View>
            <Pressable
              onPress={handleCopyCode}
              style={({ pressed }) => [
                styles.copyButton,
                {
                  backgroundColor: codeCopied ? theme.success : theme.tint,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Ionicons name={codeCopied ? "checkmark" : "copy-outline"} size={16} color={isDark ? "#1E293B" : "#FFFFFF"} />
              <Text style={[styles.copyText, { color: isDark ? "#1E293B" : "#FFFFFF", fontFamily: "DMSans_600SemiBold" }]}>
                {codeCopied ? t("copied") : t("copy")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.termsSection}>
            <Text style={[styles.termsTitle, { color: theme.text, fontFamily: "DMSans_600SemiBold", textAlign: isRTL ? "right" : "left" }]}>
              {t("termsConditions")}
            </Text>
            <Text style={[styles.termsText, { color: theme.textSecondary, fontFamily: "DMSans_400Regular", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>
              {offerTerms}
            </Text>
          </View>

          <View style={[styles.expiryNotice, { backgroundColor: theme.inputBg, flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.expiryText, { color: theme.textSecondary, fontFamily: "DMSans_400Regular" }]}>
              {t("expiresOn")} {new Date(offer.expiryDate).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeIn.duration(400).delay(300)}
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
            borderTopColor: theme.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Pressable
          onPress={handleSave}
          style={[styles.bottomSaveBtn, { borderColor: theme.border }]}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? theme.tint : theme.text}
          />
        </Pressable>
        <Pressable
          onPress={handleCopyCode}
          style={({ pressed }) => [
            styles.redeemButton,
            {
              backgroundColor: theme.tint,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.redeemText, { color: isDark ? "#1E293B" : "#FFFFFF", fontFamily: "DMSans_700Bold" }]}>
            {t("getThisDeal")}
          </Text>
        </Pressable>
      </Animated.View>
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
  loadingInner: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  imageSection: {
    position: "relative",
    height: 280,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  navBar: {
    position: "absolute",
    left: 16,
    right: 16,
    justifyContent: "space-between",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  discountTag: {
    position: "absolute",
    bottom: -14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  discountTagText: {
    fontSize: 16,
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 16,
  },
  companyRow: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  companyInfo: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: 17,
  },
  ratingRow: {
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
  },
  offerTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  metaRow: {
    gap: 8,
  },
  metaChip: {
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
  codeSection: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  codeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 20,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyText: {
    fontSize: 13,
  },
  termsSection: {
    gap: 8,
  },
  termsTitle: {
    fontSize: 16,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  expiryNotice: {
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  expiryText: {
    fontSize: 13,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  bottomSaveBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemText: {
    fontSize: 16,
  },
});
