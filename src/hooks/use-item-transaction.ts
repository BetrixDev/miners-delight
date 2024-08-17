import { fetchEntityRegistry } from "@/game/entity-registry";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUserDataStore } from "./use-user-data-store";
import { useStore } from "zustand";
import { SELL_VALUE_RATIO } from "@/game/constants";

export function useItemTransaction(itemId: string) {
  const { userDollars, handleBuyItem, userOwnedItems, incrementDollars } =
    useStore(useUserDataStore, (s) => ({
      userDollars: s.dollars,
      handleBuyItem: s.buyItem,
      userOwnedItems: s.ownedItems,
      incrementDollars: s.incrementDollars,
    }));

  const { data: dataEntities } = useQuery({
    queryKey: ["entityRegistry"],
    queryFn: () => fetchEntityRegistry(),
  });

  const itemData = useMemo(() => {
    if (!dataEntities || !dataEntities[itemId]) return;

    return dataEntities[itemId];
  }, [dataEntities, itemId]);

  function buyItem(amount: number = 1) {
    if (!itemData) return;

    const buyCost = itemData.price * amount;

    if (userDollars < buyCost) return;

    handleBuyItem(itemId, amount, itemData.price);
  }

  function sellItem(amount: number = 1) {
    if (!itemData) return;

    const ownedAmount = userOwnedItems[itemId];

    if (ownedAmount === undefined || ownedAmount < amount) return;

    const sellPriceTotal = Math.round(
      itemData.price * amount * SELL_VALUE_RATIO
    );

    incrementDollars(sellPriceTotal);

    useUserDataStore.setState((s) => {
      const newOwnedItems = { ...s.ownedItems };

      if (newOwnedItems[itemId] === amount) {
        delete newOwnedItems[itemId];
      } else {
        newOwnedItems[itemId] = newOwnedItems[itemId] - amount;
      }

      return { ownedItems: newOwnedItems };
    });
  }

  return {
    buyItem,
    sellItem,
  };
}
