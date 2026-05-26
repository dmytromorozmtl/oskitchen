import { create } from "zustand";

type ProductionUiState = {
  query: string;
  setQuery: (value: string) => void;
};

export const useProductionUiStore = create<ProductionUiState>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));
