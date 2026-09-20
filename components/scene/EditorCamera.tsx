"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export default function EditorCamera() {
  const controls = useRef<OrbitControlsImpl>(null);
  const keys = useRef<Record<string, boolean>>({});
  const { camera } = useThree();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        keys.current[e.code] = true;

        if (e.code === "KeyP") {
        console.log("CAMERA POSITION:", [
            camera.position.x,
            camera.position.y,
            camera.position.z,
        ]);

        console.log("CAMERA ROTATION:", [
            camera.rotation.x,
            camera.rotation.y,
            camera.rotation.z,
        ]);
        }
    };

    const up = (e: KeyboardEvent) => {
        keys.current[e.code] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
    };
    }, [camera]);

  useFrame(({ camera }, delta) => {
    if (!controls.current) return;

    const speed = 3 * delta;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.normalize();

    const right = new THREE.Vector3()
      .crossVectors(forward, camera.up)
      .normalize();

    const movement = new THREE.Vector3();

    // MAJU / MUNDUR
    if (keys.current["KeyW"]) {
      movement.addScaledVector(forward, speed);
    }

    if (keys.current["KeyS"]) {
      movement.addScaledVector(forward, -speed);
    }

    // KIRI / KANAN
    if (keys.current["KeyA"]) {
      movement.addScaledVector(right, -speed);
    }

    if (keys.current["KeyD"]) {
      movement.addScaledVector(right, speed);
    }

    // NAIK / TURUN
    if (keys.current["KeyE"]) {
      movement.y += speed;
    }

    if (keys.current["KeyQ"]) {
      movement.y -= speed;
    }

    // Kamera DAN target ikut pindah
    camera.position.add(movement);
    controls.current.target.add(movement);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}

      enableRotate
      enablePan
      enableZoom

      zoomSpeed={3}
      panSpeed={1.5}

      minDistance={0.001}
      maxDistance={10000}

      mouseButtons={{
        LEFT: undefined,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}