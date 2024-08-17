import { BUILD_GRID_LINE_THICKNESS } from "@/game/constants";
import { useGameStore } from "@/hooks/use-game-store";
import { useMemo } from "react";
import { Color } from "three";

export function BuildingGrid() {
  const { buildPlateSize } = useGameStore((s) => ({
    buildPlateSize: s.buildPlateSize,
  }));

  const meshes = useMemo(() => {
    const meshes: JSX.Element[] = [];

    const origin = 0 - buildPlateSize / 2;

    for (let x = 0; x <= buildPlateSize; x++) {
      // Horizontal line
      meshes.push(
        <BuildLineMesh
          key={`${x}/h`}
          position={[0, 0, origin + x]}
          dimensions={[
            buildPlateSize,
            BUILD_GRID_LINE_THICKNESS,
            BUILD_GRID_LINE_THICKNESS,
          ]}
        />
      );

      // Vertical line
      meshes.push(
        <BuildLineMesh
          key={`${x}/v`}
          position={[origin + x, 0, 0]}
          dimensions={[
            BUILD_GRID_LINE_THICKNESS,
            BUILD_GRID_LINE_THICKNESS,
            buildPlateSize,
          ]}
        />
      );
    }

    return meshes;
  }, [buildPlateSize]);

  return (
    <group name="building-grid" position={[0, -0.5, 0]}>
      {...meshes}
    </group>
  );
}

type BuildLineMeshProps = {
  dimensions: [x: number, y: number, z: number];
  position: [x: number, y: number, z: number];
};

function BuildLineMesh(props: BuildLineMeshProps) {
  return (
    <mesh position={props.position}>
      <boxGeometry args={props.dimensions} />
      <meshStandardMaterial color={Color.NAMES.aqua} />
    </mesh>
  );
}
