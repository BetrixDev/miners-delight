import { create } from "zustand";

type CameraStore = {
  /** When true, the camera automatically rotates around the scene */
  isRotating: boolean;
  setIsRotating: (isRotating: boolean) => void;
};

export const useCameraStore = create<CameraStore>()((set) => ({
  isRotating: false,
  setIsRotating: (isRotating: boolean) => set({ isRotating }),
}));
