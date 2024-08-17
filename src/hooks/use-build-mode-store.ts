import { EntityCreationSchema } from "@/game/entity-registry";
import { create } from "zustand";
import { appendPlacedItem, useUserDataStore } from "./use-user-data-store";

type BuildModeState = {
  selectedItem?: EntityCreationSchema;
  buildPosition: [number, number];
  canBuildInPos: boolean;
};

export const useBuildModeStore = create<BuildModeState>((set) => ({
  buildPosition: [0, 0],
  canBuildInPos: true,
}));

export function clearBuildMode() {
  useBuildModeStore.setState({
    selectedItem: undefined,
    buildPosition: [0, 0],
  });
}

export function setBuildModePos(vec2: [number, number]) {
  useBuildModeStore.setState({ buildPosition: vec2 });
}

export function selectItemToBuild(item: EntityCreationSchema) {
  useBuildModeStore.setState({ selectedItem: item });
}

export function tryPlaceItem() {
  useBuildModeStore.setState((state) => {
    if (!state.canBuildInPos || !state.selectedItem) return {};

    appendPlacedItem(state.selectedItem.id, state.buildPosition);

    const userDataState = useUserDataStore.getState();

    const stillOwnsSelectedItem =
      userDataState.ownedItems[state.selectedItem.id] !== undefined;

    if (stillOwnsSelectedItem) {
      return {};
    }

    // if the user no longer has any of the item left to build, exit build mode
    return { selectedItem: undefined };
  });
}
