import type { Kid } from "@grow-fitness/shared-types";

export interface KidContextType {
  kids: Kid[];

  selectedKidId: string | null;
  selectedKid: Kid | null;

  setKids: (kids: Kid[]) => void;
  setSelectedKidId: (id: string | null) => void;

  isLoading: boolean;
}
