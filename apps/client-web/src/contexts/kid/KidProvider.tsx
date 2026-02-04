import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { KidContextType } from "./types";
import { KidContext } from "./KidContext";
import type { Kid } from "@grow-fitness/shared-types";

export function KidProvider({ children }: { children: ReactNode }) {
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(() => {
    try {
      const saved = localStorage.getItem("selectedKid");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("selectedKid");
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // 🔹 persist selection
  useEffect(() => {
    if (selectedKid) {
      localStorage.setItem("selectedKid", JSON.stringify(selectedKid));
    } else {
      localStorage.removeItem("selectedKid");
    }
  }, [selectedKid]);

  const value: KidContextType = {
    kids,
    setKids,
    selectedKid,
    setSelectedKid,
    isLoading,
    setIsLoading,
    selectedKidId: null,
    setSelectedKidId: function (): void {
      throw new Error("Function not implemented.");
    }
  };

  return (
    <KidContext.Provider value={value}>
      {children}
    </KidContext.Provider>
  );
}
