import { EntityCreationSchema } from "@/game/entity-registry";
import { create } from "zustand";

type TabValue = "inventory" | "shop" | "settings";

type GameStoreState = {
  currentTab: TabValue;
  buildPlateSize: number;
  selectedShopItem?: string;
  selectedWorldItem?: {
    item: EntityCreationSchema;
    position: [number, number];
  };
  screenSpaceSelectedWorldItem?: [number, number];
};

const gameStoreDefaults: GameStoreState = {
  buildPlateSize: 50,
  currentTab: "inventory",
};

export const useGameStore = create<GameStoreState>((set) => ({
  ...gameStoreDefaults,
}));

export function mutateGameStore<TKey extends keyof GameStoreState>(
  key: TKey,
  value?: GameStoreState[TKey] | "default"
) {
  if (value === undefined && gameStoreDefaults[key] !== undefined) {
    value = gameStoreDefaults[key];
  } else if (value === "default") {
    useGameStore.setState({ [key]: undefined });
  } else {
    useGameStore.setState({ [key]: value });
  }
}
