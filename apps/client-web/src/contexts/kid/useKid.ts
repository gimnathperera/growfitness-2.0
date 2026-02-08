import { useContext } from "react";
import { KidContext } from "./KidContext";
import type { KidContextType } from "./types";

export function useKid(): KidContextType {
  const context = useContext(KidContext);
  if (!context) {
    throw new Error("useKid must be used within KidProvider");
  }
  return context;
}
