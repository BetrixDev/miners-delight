import { createEntity } from "@/game/entity-registry";
import React from "react";

createEntity({
  name: "Basic Furnace",
  id: "basic-furnace",
  description: "",
  rarity: "common",
  price: 100,
  imagePath:
    "https://static.wikia.nocookie.net/the-miners-haven-project/images/e/e1/Basic_Furnace_HD.png/revision/latest?cb=20200504193958",
  component: () => <BasicFurnace />,
  boundingBox: [2, 1, 2],
  canSell: true,
});

function BasicFurnace(props: JSX.IntrinsicElements["group"]) {
  return (
    <group name="basic-furnace" {...props} dispose={null}>
      <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
    </group>
  );
}
