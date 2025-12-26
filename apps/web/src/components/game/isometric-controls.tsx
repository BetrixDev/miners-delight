import { useFrame, useThree } from "@react-three/fiber";
import { animate } from "motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const CAMERA_DISTANCE = 50;
const MOVE_SPEED = 0.5;
const DRAG_SPEED = 0.7;
const ZOOM_SPEED = 0.1;
const MIN_ZOOM = 2;
const MAX_ZOOM = 50;
const ROTATION_DURATION = 0.4;

// Rotate a 2D point (x, z) around origin by angle
function rotateXZ(x: number, z: number, angle: number): [number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - z * sin, x * sin + z * cos];
}

export function IsometricControls() {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const zoom = useRef(10);
  const isRotating = useRef(false);
  const isRecentering = useRef(false);
  const currentAngle = useRef(0);

  useEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = zoom.current;
    ortho.updateProjectionMatrix();

    camera.position.set(
      target.current.x + CAMERA_DISTANCE,
      target.current.y + CAMERA_DISTANCE,
      target.current.z + CAMERA_DISTANCE
    );
    camera.lookAt(target.current);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.current.add(key);

      if (key === "x" && !isRotating.current) {
        isRotating.current = true;
        const startAngle = currentAngle.current;
        const endAngle = startAngle + Math.PI / 2;

        animate(startAngle, endAngle, {
          duration: ROTATION_DURATION,
          ease: [0.4, 0, 0.2, 1],
          onUpdate: (value) => {
            currentAngle.current = value;
          },
          onComplete: () => {
            isRotating.current = false;
          },
        });
      }

      if (key === "c" && !isRecentering.current) {
        isRecentering.current = true;
        const startX = target.current.x;
        const startZ = target.current.z;

        animate(0, 1, {
          duration: ROTATION_DURATION,
          ease: [0.4, 0, 0.2, 1],
          onUpdate: (t) => {
            target.current.x = startX * (1 - t);
            target.current.z = startZ * (1 - t);
          },
          onComplete: () => {
            isRecentering.current = false;
          },
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;

      const zoomFactor = 10 / zoom.current;

      // Base drag movement (at angle 0): screen drag maps to XZ plane movement
      const baseX = (-deltaX - deltaY) * DRAG_SPEED * 0.1 * zoomFactor;
      const baseZ = (deltaX - deltaY) * DRAG_SPEED * 0.1 * zoomFactor;

      // Rotate the movement to match current camera angle
      const [moveX, moveZ] = rotateXZ(baseX, baseZ, currentAngle.current);

      target.current.x += moveX;
      target.current.z += moveZ;

      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      zoom.current = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoom.current * (1 + delta * ZOOM_SPEED))
      );

      const ortho = camera as THREE.OrthographicCamera;
      ortho.zoom = zoom.current;
      ortho.updateProjectionMatrix();
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    gl.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("wheel", handleWheel, { passive: false });
    gl.domElement.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("wheel", handleWheel);
      gl.domElement.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [camera, gl]);

  useFrame(() => {
    // Base WASD directions (at angle 0)
    // W: up-left on screen (-X, -Z), S: down-right (+X, +Z)
    // A: down-left (-X, +Z), D: up-right (+X, -Z)
    let baseX = 0;
    let baseZ = 0;

    if (keys.current.has("w")) {
      baseX -= 1;
      baseZ -= 1;
    }
    if (keys.current.has("s")) {
      baseX += 1;
      baseZ += 1;
    }
    if (keys.current.has("a")) {
      baseX -= 1;
      baseZ += 1;
    }
    if (keys.current.has("d")) {
      baseX += 1;
      baseZ -= 1;
    }

    if (baseX !== 0 || baseZ !== 0) {
      // Normalize and apply speed
      const len = Math.sqrt(baseX * baseX + baseZ * baseZ);
      baseX = (baseX / len) * MOVE_SPEED;
      baseZ = (baseZ / len) * MOVE_SPEED;

      // Rotate movement to match current camera angle
      const [moveX, moveZ] = rotateXZ(baseX, baseZ, currentAngle.current);
      target.current.x += moveX;
      target.current.z += moveZ;
    }

    // Calculate camera position based on current angle
    const [offsetX, offsetZ] = rotateXZ(
      CAMERA_DISTANCE,
      CAMERA_DISTANCE,
      currentAngle.current
    );

    camera.position.set(
      target.current.x + offsetX,
      target.current.y + CAMERA_DISTANCE,
      target.current.z + offsetZ
    );
    camera.lookAt(target.current);
  });

  return null;
}
