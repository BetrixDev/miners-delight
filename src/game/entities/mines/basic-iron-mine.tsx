import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { createEntity } from "@/game/entity-registry";

type GLTFResult = GLTF & {
  nodes: {
    Part1: THREE.Mesh;
    Part2: THREE.Mesh;
    Part3: THREE.Mesh;
    Part4: THREE.Mesh;
    Dropper1: THREE.Mesh;
    Part5: THREE.Mesh;
  };
  materials: {
    Part1Mtl: THREE.MeshStandardMaterial;
    Part4Mtl: THREE.MeshStandardMaterial;
    Dropper1Mtl: THREE.MeshStandardMaterial;
  };
};

createEntity({
  name: "Basic Iron Mine",
  description: "This is a description",
  id: "basic-iron-mine",
  imagePath:
    "https://static.wikia.nocookie.net/the-miners-haven-project/images/b/bb/Basic_Iron_Mine_HD.png",
  price: 50,
  boundingBox: [2, 4, 4],
  rarity: "common",
  component: () => <BasicIronMine />,
  canSell: true,
});

export function BasicIronMine(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/api/models/basic-iron-mine"
  ) as GLTFResult;
  return (
    <group
      {...props}
      dispose={null}
      scale={[0.5, 0.5, 0.5]}
      position={[1, -0.75, 8.65]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Part1.geometry}
        material={materials.Part1Mtl}
        userData={{ name: "Part1" }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Part2.geometry}
        material={materials.Part1Mtl}
        userData={{ name: "Part2" }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Part3.geometry}
        material={materials.Part1Mtl}
        userData={{ name: "Part3" }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Part4.geometry}
        material={materials.Part4Mtl}
        userData={{ name: "Part4" }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Dropper1.geometry}
        material={materials.Dropper1Mtl}
        userData={{ name: "Dropper1" }}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Part5.geometry}
        material={materials.Part4Mtl}
        userData={{ name: "Part5" }}
      />
    </group>
  );
}

useGLTF.preload("/api/models/basic-iron-mine");
