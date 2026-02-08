import React from "react";
import { StyleSheet, View, Text, Pressable, useColorScheme, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useLanguage } from "@/lib/language-context";
import { categoryNameMap } from "@/lib/translations";
import type { Category } from "@/shared/schema";

interface CategoryCardProps {
  category: Category;
  onPress: (categoryId: string) => void;
  large?: boolean;
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: "restaurant",
  laptop: "laptop",
  shirt: "shirt",
  airplane: "airplane",
  fitness: "fitness",
  "musical-notes": "musical-notes",
  home: "home",
  sparkles: "sparkles",
};

export default function CategoryCard({ category, onPress, large }: CategoryCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { t, isRTL } = useLanguage();

  const catKey = categoryNameMap[category.id];
  const displayName = catKey ? t(catKey) : category.name;

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(category.id);
  };

  if (large) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.largeCard,
          {
            backgroundColor: category.color + "15",
            borderColor: category.color + "30",
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <View style={[styles.largeIconWrap, { backgroundColor: category.color + "20" }]}>
          <Ionicons name={iconMap[category.icon] || "pricetag"} size={28} color={category.color} />
        </View>
        <Text style={[styles.largeName, { color: theme.text, fontFamily: "DMSans_600SemiBold", textAlign: isRTL ? "right" : "left" }]}>
          {displayName}
        </Text>
        <Text style={[styles.largeCount, { color: theme.textSecondary, fontFamily: "DMSans_400Regular", textAlign: isRTL ? "right" : "left" }]}>
          {t("offersCount", { count: category.offerCount })}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: category.color + "15",
          borderColor: category.color + "30",
          transform: [{ scale: pressed ? 0.95 : 1 }],
          flexDirection: isRTL ? "row-reverse" : "row",
        },
      ]}
    >
      <Ionicons name={iconMap[category.icon] || "pricetag"} size={16} color={category.color} />
      <Text style={[styles.chipText, { color: category.color, fontFamily: "DMSans_500Medium" }]}>
        {displayName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  largeCard: {
    width: "48%",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  largeIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  largeName: {
    fontSize: 15,
  },
  largeCount: {
    fontSize: 12,
  },
});
