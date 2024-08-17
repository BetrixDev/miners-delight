import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { clamp, cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Inter } from "next/font/google";
import Head from "next/head";
import {
  AccumulativeShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  RandomizedLight,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { mutateGameStore, useGameStore } from "@/hooks/use-game-store";
import { mutateCameraStore, useCameraStore } from "@/hooks/use-camera-store";
import { BuildingGrid } from "@/components/BuildingGrid";
import { motion } from "framer-motion";
import { ShopTab } from "@/components/ShopTab";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";
import { InventoryTab } from "@/components/InventoryTab";
import { BuildItemGhost } from "@/components/BuildItemGhost";
import { BuildModePrompt } from "@/components/BuildModePrompt";
import { useKeyPressListener } from "@/hooks/use-key-press-listener";
import {
  setBuildModePos,
  tryPlaceItem,
  useBuildModeStore,
} from "@/hooks/use-build-mode-store";
import { useUserDataStore } from "@/hooks/use-user-data-store";
import { PlacedItem } from "@/components/PlacedItem";
import { fetchEntityRegistry } from "@/game/entity-registry";
import { useQuery } from "@tanstack/react-query";
import { SelectedWorldItemPrompt } from "@/components/SelectedWorldItemPrompt";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const { currentTab, selectedWorldItem } = useGameStore((s) => ({
    currentTab: s.currentTab,
    selectedWorldItem: s.selectedWorldItem,
  }));

  const selectedItem = useBuildModeStore((s) => s.selectedItem);

  useKeyPressListener(
    (e, key) => {
      if (selectedWorldItem !== undefined) return;

      if (key === "e") {
        mutateGameStore("currentTab", "inventory");
      } else if (key === "f") {
        mutateGameStore("currentTab", "shop");
      } else if (key === "c") {
        mutateGameStore("currentTab", "settings");
      } else if (key === "Tab") {
        e.preventDefault();
        setIsMenuOpen((o) => !o);
      }
    },
    ["E", "F", "C", "TAB"]
  );

  return (
    <>
      <Head>
        <title>{"Miner's Delight"}</title>
      </Head>
      <main
        className={cn(
          "h-screen text-foreground bg-background",
          inter.className
        )}
      >
        <motion.div
          className="absolute h-screen w-96 z-10"
          initial={isMenuOpen ? "open" : "closed"}
          animate={isMenuOpen ? "open" : "closed"}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.25,
          }}
          variants={{
            open: {
              x: 0,
            },
            closed: {
              x: "-100%",
            },
          }}
        >
          <Button
            className="absolute left-[100%] h-16 p-0"
            variant="secondary"
            onClick={() => setIsMenuOpen((o) => !o)}
          >
            <motion.div
              className="w-full h-full flex items-center justify-center"
              initial={isMenuOpen ? "open" : "closed"}
              animate={isMenuOpen ? "open" : "closed"}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 25,
              }}
              variants={{
                open: {
                  rotate: "0",
                },
                closed: {
                  rotate: "180deg",
                },
              }}
            >
              <ChevronLeft width="32" />
            </motion.div>
          </Button>
          <Card className="absolute h-screen w-full z-10 backdrop-blur-sm bg-background/50">
            <CardHeader>
              <CardTitle>{"Miner's Delight"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full w-full">
              <Tabs
                defaultValue="inventory"
                value={currentTab}
                className="flex flex-col h-full"
              >
                <TabsList className="w-full flex">
                  <TabsTrigger
                    className="basis-full"
                    value="inventory"
                    onClick={() => mutateGameStore("currentTab", "inventory")}
                  >
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger
                    className="basis-full"
                    value="shop"
                    onClick={() => mutateGameStore("currentTab", "shop")}
                  >
                    Shop
                  </TabsTrigger>
                  <TabsTrigger
                    className="basis-full"
                    value="settings"
                    onClick={() => mutateGameStore("currentTab", "settings")}
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  className="relative flex flex-col h-full"
                  value="inventory"
                >
                  <InventoryTab />
                </TabsContent>
                <TabsContent
                  className="relative flex flex-col h-full"
                  value="shop"
                >
                  <ShopTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <div className="w-full h-screen">
          <Canvas
            shadows
            onMouseDown={() => mutateCameraStore("shouldOrbit", false)}
            onMouseUp={() => mutateCameraStore("shouldOrbit", true)}
            onMouseLeave={() => mutateCameraStore("shouldOrbit", true)}
          >
            <Scene />
          </Canvas>
        </div>

        {selectedWorldItem !== undefined && <SelectedWorldItemPrompt />}

        {selectedItem !== undefined && <BuildModePrompt />}
      </main>
    </>
  );
}

function Scene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const { orbitDistance, orbitHeight, orbitAngle } = useCameraStore();

  const { buildPlateSize, selectedWorldItem } = useGameStore((s) => ({
    buildPlateSize: s.buildPlateSize,
    selectedWorldItem: s.selectedWorldItem,
  }));

  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const mouse = useThree((s) => s.mouse);

  const selectedItem = useBuildModeStore((s) => s.selectedItem);

  useFrame(({ camera, scene }) => {
    if (selectedItem === undefined) return;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects([scene], true);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      setBuildModePos([
        clamp(
          Math.round(intersection.point.x),
          buildPlateSize / -2,
          buildPlateSize / 2
        ),
        clamp(
          Math.round(intersection.point.z),
          buildPlateSize / -2,
          buildPlateSize / 2
        ),
      ]);
    }
  });

  const { data: dataEntities } = useQuery({
    queryKey: ["entityRegistry"],
    queryFn: () => fetchEntityRegistry(),
    refetchOnWindowFocus: false,
  });

  useFrame(({ camera }) => {
    if (!selectedWorldItem) return;

    const worldPoint = new THREE.Vector3(
      selectedWorldItem.position[0],
      0,
      selectedWorldItem.position[1]
    );

    const screenSpaceCoords = worldPoint.project(camera);

    mutateGameStore("screenSpaceSelectedWorldItem", [
      screenSpaceCoords.x,
      screenSpaceCoords.y,
    ]);
  });

  const { placedItems } = useUserDataStore((s) => ({
    placedItems: s.placedItems,
  }));

  const placedItemComponents = useMemo(() => {
    if (!dataEntities) return [];

    return placedItems.map(({ id, position }, index) => {
      const item = dataEntities[id];

      return <PlacedItem key={index} item={item} pos={position} />;
    });
  }, [dataEntities, placedItems]);

  useEffect(() => {
    if (!cameraRef.current) return;

    cameraRef.current.position.y = orbitHeight;
    cameraRef.current.position.x = Math.cos(orbitAngle) * orbitDistance;
    cameraRef.current.position.z = Math.sin(orbitAngle) * orbitDistance;

    cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
  }, [cameraRef, orbitHeight, orbitAngle, orbitDistance]);

  if (!dataEntities) return null;

  function handleBuildPlateClick() {
    // if (selectedWorldItem !== undefined) {
    //   mutateGameStore("selectedWorldItem", undefined);
    //   return;
    // }

    if (selectedItem !== undefined) {
      tryPlaceItem();
      return;
    }
  }

  return (
    <>
      <Environment preset="sunset" blur={0.5} background={true} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={5}
        saturation={255}
        fade
        speed={1}
      />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={75}
        position={[0, 0, 5]}
      />
      <OrbitControls makeDefault />

      <group name="build-plate" position={[0, -1, 0]}>
        <mesh onPointerDown={() => handleBuildPlateClick()}>
          <boxGeometry args={[buildPlateSize, 1, buildPlateSize]} />
          <meshStandardMaterial />
        </mesh>
      </group>

      <group name="placed-items">{placedItemComponents}</group>

      {selectedItem !== undefined && (
        <>
          <BuildItemGhost item={selectedItem} />
          <BuildingGrid />
        </>
      )}
    </>
  );
}

const Shadows = memo(() => (
  <AccumulativeShadows
    temporal
    frames={100}
    color="#d08049"
    colorBlend={1}
    alphaTest={0.9}
    scale={3}
    opacity={0.6}
  >
    <RandomizedLight amount={10} radius={1} position={[5, 5, 5]} />
  </AccumulativeShadows>
));

Shadows.displayName = "Shadows";
