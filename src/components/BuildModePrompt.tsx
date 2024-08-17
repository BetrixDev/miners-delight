import { clearBuildMode } from "@/hooks/use-build-mode-store";
import { useKeyPressListener } from "@/hooks/use-key-press-listener";

export function BuildModePrompt() {
  useKeyPressListener(() => {
    clearBuildMode();
  }, ["Q"]);

  return <div></div>;
}
