import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_KEY = "dealspot_saved_offers";

interface SavedOffersContextValue {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedOffersContext = createContext<SavedOffersContextValue | null>(null);

export function SavedOffersProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then((data) => {
      if (data) {
        setSavedIds(JSON.parse(data));
      }
    });
  }, []);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  const value = useMemo(
    () => ({ savedIds, toggleSaved, isSaved }),
    [savedIds]
  );

  return (
    <SavedOffersContext.Provider value={value}>
      {children}
    </SavedOffersContext.Provider>
  );
}

export function useSavedOffers() {
  const ctx = useContext(SavedOffersContext);
  if (!ctx) throw new Error("useSavedOffers must be used within SavedOffersProvider");
  return ctx;
}
