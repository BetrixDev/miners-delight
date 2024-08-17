import {
  EntityCreationSchema,
  fetchEntityRegistry,
} from "@/game/entity-registry";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useUserDataStore } from "@/hooks/use-user-data-store";
import { useStore } from "zustand";
import { selectItemToBuild } from "@/hooks/use-build-mode-store";

export function InventoryTab() {
  const { data: dataEntities } = useQuery({
    queryKey: ["entityRegistry"],
    queryFn: () => fetchEntityRegistry(),
    refetchOnWindowFocus: false,
  });

  const { userItems } = useStore(useUserDataStore, (s) => ({
    userItems: s.ownedItems,
  }));

  const ownedItems = useMemo(() => {
    if (!dataEntities) return [];

    return Object.entries(userItems).map(([id, amount]) => {
      return {
        amount: amount,
        itemData: dataEntities[id],
      };
    });
  }, [userItems, dataEntities]);

  return (
    <div className="grid grid-cols-3 gap-2 h-[calc(100%-100px-1.75rem)] mb-1 overflow-auto">
      {ownedItems.map((ownedItem) => (
        <InventoryItem
          key={ownedItem.itemData.id}
          item={ownedItem.itemData}
          amount={ownedItem.amount}
        />
      ))}
    </div>
  );
}

type InventoryItemProps = {
  item: EntityCreationSchema;
  amount: number;
};

function InventoryItem({ item, amount }: InventoryItemProps) {
  function enterBuildingMode() {
    selectItemToBuild(item);
  }

  return (
    <motion.button
      className="aspect-square relative rounded-md flex flex-col justify-end shadow-sm"
      transition={{
        duration: 0.15,
      }}
      whileHover={{ translateY: "-2px" }}
      whileTap={{
        translateY: "0px",
      }}
      onClick={() => enterBuildingMode()}
    >
      <div className="w-full h-full absolute -z-10">
        <Image
          className="rounded-md"
          src={item.imagePath}
          fill
          alt={`${item.name} icon`}
        />
      </div>
      <div className="w-full text-center font-black bg-background/75 backdrop-blur-md rounded-sm">
        {amount}
      </div>
    </motion.button>
  );
}
