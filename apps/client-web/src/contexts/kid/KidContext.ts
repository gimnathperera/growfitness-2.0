import { createContext } from "react";
import type { KidContextType } from "./types";

export const KidContext = createContext<KidContextType | null>(null);
