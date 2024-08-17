import { EntityCreationSchema } from "@/game/entity-registry";
import { motion } from "framer-motion-3d";
import { useBuildModeStore } from "@/hooks/use-build-mode-store";
import { Color } from "three";
import { Edges } from "@react-three/drei";

type BuildItemGhostProps = {
  item: EntityCreationSchema;
};

export function BuildItemGhost({ item }: BuildItemGhostProps) {
  const buildPosition = useBuildModeStore((s) => s.buildPosition);

  const itemMesh = item.component();

  return (
    <motion.group position={[buildPosition[0], 0, buildPosition[1]]}>
      {itemMesh}
      <BoundingBox size={item.boundingBox} />
    </motion.group>
  );
}

type BoundingBoxProps = {
  size: [x: number, y: number, z: number];
};

export function BoundingBox(props: BoundingBoxProps) {
  const canBuildInPos = useBuildModeStore((s) => s.canBuildInPos);

  const color = canBuildInPos ? Color.NAMES.black : Color.NAMES.red;

  return (
    <mesh position={[0, props.size[1] / 2 - 0.5, 0]}>
      <meshStandardMaterial transparent={true} opacity={0} />
      <boxGeometry args={props.size} />
      <Edges scale={1} color={color} />
    </mesh>
  );
}
