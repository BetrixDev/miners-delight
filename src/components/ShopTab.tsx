import {
  EntityCreationSchema,
  fetchEntityRegistry,
} from "@/game/entity-registry";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion } from "framer-motion";
import { mutateGameStore, useGameStore } from "@/hooks/use-game-store";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { SkipBack, SkipForward, StepBack, StepForward, X } from "lucide-react";
import { useItemTransaction } from "@/hooks/use-item-transaction";
import { MAX_BUY_AMOUNT } from "@/game/constants";
import { useUserDataStore } from "@/hooks/use-user-data-store";
import { useStore } from "zustand";

export function ShopTab() {
  const { selectedShopItem } = useGameStore((s) => ({
    selectedShopItem: s.selectedShopItem,
  }));

  const { data: dataEntities } = useQuery({
    queryKey: ["entityRegistry"],
    queryFn: () => fetchEntityRegistry(),
  });

  const shopItems = useMemo(
    () => Object.values(dataEntities ?? {}),
    [dataEntities]
  );

  if (shopItems.length === 0 || !dataEntities) return null;

  return (
    <>
      {selectedShopItem && (
        <SelectedShopItem item={dataEntities[selectedShopItem]} />
      )}
      <div className="grid grid-cols-3 gap-2 h-[calc(100%-100px-1.75rem)] mb-1 overflow-autoe">
        {shopItems.map((item) => (
          <ShopItem key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}

type ShopItemProps = {
  item: EntityCreationSchema;
};

function ShopItem({ item }: ShopItemProps) {
  const { selectedShopItem } = useGameStore((s) => ({
    selectedShopItem: s.selectedShopItem,
  }));

  return (
    <motion.button
      onClick={() => mutateGameStore("selectedShopItem", item.id)}
      className="aspect-square relative rounded-md flex flex-col justify-end shadow-sm"
      animate={selectedShopItem !== undefined ? "background" : "default"}
      transition={{
        duration: 0.15,
      }}
      whileHover={{ translateY: "-2px" }}
      whileTap={{
        translateY: "0px",
      }}
      variants={{
        background: {
          filter: "brightness(50%)",
        },
        default: {},
      }}
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
        ${item.price}
      </div>
    </motion.button>
  );
}

function SelectedShopItem({ item }: ShopItemProps) {
  const [buyAmount, setBuyAmount] = useState(1);
  const [shiftPressed, setShiftPressed] = useState(false);

  const { buyItem } = useItemTransaction(item.id);

  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === "Shift") {
        setShiftPressed(true);
      }
    }
    function keyUp(e: KeyboardEvent) {
      if (e.key === "Shift") {
        setShiftPressed(false);
      }
    }

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    return () => {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
    };
  }, []);

  const { userDollars } = useStore(useUserDataStore, (s) => ({
    userDollars: s.dollars,
  }));

  const totalBuyCost = buyAmount * item.price;
  const canAffordAmount = userDollars >= totalBuyCost;

  function incrementBuyAmount() {
    if (buyAmount >= MAX_BUY_AMOUNT) return;
    setBuyAmount((b) => b + 1);
  }

  function decrementBuyAmount() {
    if (buyAmount <= 1) return;
    setBuyAmount((b) => b - 1);
  }

  return (
    <div className="absolute bottom-32 rounded-md bg-background/90 p-2 backdrop-blur-md w-full z-10 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="aspect-square w-24 relative">
            <Image
              className="rounded-md"
              src={item.imagePath}
              fill
              alt={`${item.name} icon`}
            />
          </div>
          <div className="flex flex-col">
            <p className="mt-2 text-xl font-bold">{item.name}</p>
            <p className="text-sm font-normal">${item.price}</p>
          </div>
        </div>
        <Button
          onClick={() => mutateGameStore("selectedShopItem", undefined)}
          variant="outline"
          size="icon"
        >
          <X />
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex w-48 h-12 gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-full basis-1/3 text-muted-foreground"
            onClick={() => {
              if (shiftPressed) {
                setBuyAmount(1);
              } else {
                decrementBuyAmount();
              }
            }}
          >
            {shiftPressed ? <SkipBack /> : <StepBack />}
          </Button>
          <Input
            className="basis-1/3 h-full z-10 text-center"
            type="number"
            value={buyAmount}
            onChange={(e) => {
              try {
                const value = Number(e.currentTarget.value);

                if (value > MAX_BUY_AMOUNT) {
                  setBuyAmount(MAX_BUY_AMOUNT);
                } else if (value <= 0) {
                  setBuyAmount(1);
                } else {
                  setBuyAmount(value);
                }
              } catch {}
            }}
          />
          <Button
            size="icon"
            variant="outline"
            className="h-full basis-1/3 text-muted-foreground"
            onClick={() => {
              if (shiftPressed) {
                setBuyAmount(MAX_BUY_AMOUNT);
              } else {
                incrementBuyAmount();
              }
            }}
          >
            {shiftPressed ? <SkipForward /> : <StepForward />}
          </Button>
        </div>
        <Button
          size="lg"
          disabled={!canAffordAmount}
          className="bg-green-600 text-foreground font-bold text-lg"
          onClick={() => buyItem(buyAmount)}
        >
          Buy
        </Button>
      </div>
    </div>
  );
}
