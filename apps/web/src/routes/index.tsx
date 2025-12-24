import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { IsometricControls } from "@/components/game/isometric-controls";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <Canvas
      orthographic
      camera={{
        position: [50, 50, 50],
        near: 0.1,
        far: 1000,
      }}
    >
      <ambientLight intensity={1.2} color="orange" />
      <spotLight position={[20, 70, 20]} angle={0.5} penumbra={1} />
      <pointLight position={[-10, 4, -10]} />
      <IsometricControls />
      <mesh>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[10, 2, 10]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[-10, 2, -10]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[10, 2, -10]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="purple" />
      </mesh>
      <mesh position={[-10, 2, 10]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </Canvas>
  );
}
