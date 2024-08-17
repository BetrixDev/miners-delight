import z from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const placedItemSchema = z.object({
  id: z.string(),
  position: z.tuple([z.number(), z.number()]),
});

const localStorageDecodedSchema = z.object({
  dollars: z.number().default(25000),
  lifetimeDollars: z.number().default(0),
  ownedItems: z.record(z.string(), z.number()).default({}),
  placedItems: z.array(placedItemSchema).default([]),
});

const localStorageDecodedDefaults = localStorageDecodedSchema.parse({});

type LocalStorageDecoded = z.infer<typeof localStorageDecodedSchema>;

type UserDataState = LocalStorageDecoded;

type UserDataActions = {
  incrementDollars: (amount: number) => void;
  buyItem: (itemId: string, amount: number, cost: number) => void;
};

export const useUserDataStore = create<UserDataState & UserDataActions>()(
  persist(
    (set) => ({
      ...localStorageDecodedDefaults,
      incrementDollars: (amount) => {
        set((state) => ({
          dollars: state.dollars + amount,
          lifetimeDollars: state.lifetimeDollars + amount,
        }));
      },
      buyItem: (itemId, amount, cost) => {
        const buyCost = amount * cost;

        set((state) => {
          let newOwnedItems = { ...state.ownedItems };

          if (newOwnedItems[itemId] !== undefined) {
            newOwnedItems[itemId] = newOwnedItems[itemId] + amount;
          } else {
            newOwnedItems[itemId] = amount;
          }

          return {
            dollars: state.dollars - buyCost,
            ownedItems: newOwnedItems,
          };
        });
      },
    }),
    {
      name: "user-data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function appendPlacedItem(itemId: string, position: [number, number]) {
  useUserDataStore.setState((state) => {
    const newOwnedItems = { ...state.ownedItems };

    if (newOwnedItems[itemId] === 1) {
      delete newOwnedItems[itemId];
    } else {
      newOwnedItems[itemId] = newOwnedItems[itemId] - 1;
    }

    return {
      placedItems: [...state.placedItems, { id: itemId, position }],
      ownedItems: newOwnedItems,
    };
  });
}

export function widthdrawFromWorld(itemId: string, pos: [number, number]) {
  useUserDataStore.setState((state) => {
    const newPlacedItems = state.placedItems.filter((placedItem) => {
      return (
        placedItem.position[0] !== pos[0] || placedItem.position[1] !== pos[1]
      );
    });

    const newOwnedItems = { ...state.ownedItems };

    if (newOwnedItems[itemId] !== undefined) {
      newOwnedItems[itemId] = newOwnedItems[itemId] + 1;
    } else {
      newOwnedItems[itemId] = 1;
    }

    return {
      placedItems: newPlacedItems,
      ownedItems: newOwnedItems,
    };
  });
}
