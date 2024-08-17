import { mutateGameStore, useGameStore } from "@/hooks/use-game-store";
import { Button } from "./ui/Button";
import { RARITIES } from "@/game/entity-registry";
import {
  useUserDataStore,
  widthdrawFromWorld,
} from "@/hooks/use-user-data-store";
import { selectItemToBuild } from "@/hooks/use-build-mode-store";
import { useKeyPressListener } from "@/hooks/use-key-press-listener";
import { SELL_VALUE_RATIO } from "@/game/constants";
import { KeyIcon } from "./KeyIcon";
import { useItemTransaction } from "@/hooks/use-item-transaction";

export function SelectedWorldItemPrompt() {
  const { screenSpacePos, selectedWorldItem } = useGameStore((s) => ({
    screenSpacePos: s.screenSpaceSelectedWorldItem,
    selectedWorldItem: s.selectedWorldItem,
  }));

  const { userDollars } = useUserDataStore((s) => ({
    userDollars: s.dollars,
  }));

  const { buyItem, sellItem } = useItemTransaction(selectedWorldItem?.item.id!);

  useKeyPressListener(
    (_, key) => {
      if (key === "r") {
        handleMoveItem();
      } else if (key === "z") {
        handleWidthdrawItem();
      } else if (key === "c") {
        handleSellItem();
      } else if (key === "x") {
        handleBuyItem();
      }
    },
    ["R", "Z", "C", "X"]
  );

  if (!screenSpacePos || !selectedWorldItem) return null;

  const xPos = ((screenSpacePos[0] + 1) * 100) / 2;
  const yPos = ((screenSpacePos[1] + 1) * 100) / 2;

  const item = selectedWorldItem.item;
  const itemRarity = RARITIES[item.rarity];

  const userCanBuyItem = userDollars >= item.price;
  const itemSellPrice = item.canSell
    ? Math.round(item.price * SELL_VALUE_RATIO)
    : undefined;

  function handleWidthdrawItem() {
    if (!selectedWorldItem) return;

    widthdrawFromWorld(selectedWorldItem.item.id, selectedWorldItem.position);
    mutateGameStore("selectedWorldItem", undefined);
  }

  function handleMoveItem() {
    if (!selectedWorldItem) return;

    widthdrawFromWorld(item.id, selectedWorldItem.position);
    mutateGameStore("selectedWorldItem", undefined);
    selectItemToBuild(item);
  }

  function handleSellItem() {
    if (!selectedWorldItem || itemSellPrice === undefined) return;

    sellItem();
  }

  function handleBuyItem() {
    if (!selectedWorldItem || !userCanBuyItem) return;

    buyItem();
  }

  return (
    <div
      style={{ bottom: `${yPos}%`, left: `${xPos}%` }}
      className="absolute flex flex-col bg-background/75 backdrop-blur-lg border border-background/50 rounded-md p-2 w-60 gap-2"
    >
      <div className="flex flex-col">
        <h1 className="font-bold">{item.name}</h1>
        <h2 className="text-xs font-bold" style={{ color: itemRarity.color }}>
          {itemRarity.name}
        </h2>
      </div>
      <div className="flex flex-col gap-2 mx-2">
        <Button
          onClick={handleMoveItem }
          variant="secondary"
          className="w-full h-8"
        >
          <div className="w-full h-full flex items-center justify-between">
            Move Item
            <KeyIcon>R</KeyIcon>
          </div>
        </Button>
        <Button
          onClick={handleWidthdrawItem}
          variant="secondary"
          className="w-full h-8"
        >
          <div className="w-full h-full flex items-center justify-between">
            Widthdraw
            <KeyIcon>Z</KeyIcon>
          </div>
        </Button>
        <Button
          disabled={itemSellPrice === undefined}
          variant="outline"
          className="w-full h-8"
        >
          <div
            className="w-full h-full flex items-center justify-between"
            onClick={handleSellItem}
          >
            {itemSellPrice !== undefined
              ? `Sell Item - $${itemSellPrice}`
              : "Can't Sell"}
            <KeyIcon>C</KeyIcon>
          </div>
        </Button>
        <Button
          disabled={!userCanBuyItem}
          variant="outline"
          className="w-full h-8"
          onClick={handleBuyItem}
        >
          <div className="w-full h-full flex items-center justify-between">
            {userCanBuyItem ? `Buy Item - $${item.price}` : "Can't Buy"}
            <KeyIcon>X</KeyIcon>
          </div>
        </Button>
      </div>
    </div>
  );
}
