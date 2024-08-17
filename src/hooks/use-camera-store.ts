import z from "zod";
import { create } from "zustand";

const cameraStoreSchema = z.object({
  shouldOrbit: z.boolean().default(true),
  orbitDistance: z.number().default(15),
  orbitHeight: z.number().default(15),
  orbitAngle: z.number().default(0),
  orbitSpeed: z.number().default(0.1),
  orbitOriginX: z.number().default(0),
  orbitOriginY: z.number().default(0),
});

const cameraStoreDefaults = cameraStoreSchema.parse({});

type CameraStoreState = z.infer<typeof cameraStoreSchema>;

export const useCameraStore = create<CameraStoreState>(() => ({
  ...cameraStoreDefaults,
}));

export function mutateCameraStore<TKey extends keyof CameraStoreState>(
  key: TKey,
  value?: CameraStoreState[TKey] | "default"
) {
  if (value === undefined && cameraStoreDefaults[key] !== undefined) {
    value = cameraStoreDefaults[key];
  } else if (value === "default") {
    useCameraStore.setState({ [key]: undefined });
  } else {
    useCameraStore.setState({ [key]: value });
  }
}
