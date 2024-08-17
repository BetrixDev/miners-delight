import { EntityCreationSchema } from "@/game/entity-registry";
import { mutateGameStore } from "@/hooks/use-game-store";
import { Edges } from "@react-three/drei";
import { useState } from "react";
import { Color } from "three";

type PlacedItemProps = {
  item: EntityCreationSchema;
  pos: [number, number];
};

export function PlacedItem({ item, pos }: PlacedItemProps) {
  const itemMesh = item.component();

  function handleMeshClick() {
    mutateGameStore("selectedWorldItem", { item, position: pos });
  }

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <PlacedItemBoundingBox
        size={item.boundingBox}
        handleMeshClick={handleMeshClick}
      />
      {itemMesh}
    </group>
  );
}

type PlacedItemBoundingBoxProps = {
  size: [number, number, number];
  handleMeshClick: () => void;
};

function PlacedItemBoundingBox({
  size,
  handleMeshClick,
}: PlacedItemBoundingBoxProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <mesh
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={() => handleMeshClick()}
      position={[0, size[1] / 2 - 0.5, 0]}
    >
      <meshStandardMaterial transparent={true} opacity={0} />
      <boxGeometry args={size} />
      <Edges visible={isHovered} scale={1} color={Color.NAMES.black} />
    </mesh>
  );
}
