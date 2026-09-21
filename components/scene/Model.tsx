"use client";

import {
  forwardRef,
  useEffect,
  useRef,
} from "react";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ModelProps = {
  path: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

const Model = forwardRef<THREE.Group, ModelProps>(
  (
    {
      path,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = 1,
    },
    ref
  ) => {
    const { scene } = useGLTF(path);

    // Reference ke object SteeringWheel
    const steeringRef =
      useRef<THREE.Object3D | null>(null);

    // Rotasi awal steering wheel
    const initialSteeringZ = useRef(0);

    // Status keyboard
    const keys = useRef({
      left: false,
      right: false,
    });

    // ========================================
    // CARI STEERING WHEEL
    // ========================================

    useEffect(() => {
      // Hanya dilakukan untuk model mobil
      if (!path.includes("car_steering.glb")) {
        return;
      }

      const steering =
        scene.getObjectByName("SteeringWheel");

      if (!steering) {
        console.warn(
          "SteeringWheel tidak ditemukan!"
        );
        return;
      }

      steeringRef.current = steering;

      // Simpan rotasi awal
      initialSteeringZ.current =
        steering.rotation.z;

      console.log(
        "STEERING FOUND:",
        steering
      );
    }, [scene, path]);

    // ========================================
    // KEYBOARD A / D
    // ========================================

    useEffect(() => {
      const handleKeyDown = (
        event: KeyboardEvent
      ) => {
        if (event.code === "KeyA") {
          keys.current.left = true;
        }

        if (event.code === "KeyD") {
          keys.current.right = true;
        }
      };

      const handleKeyUp = (
        event: KeyboardEvent
      ) => {
        if (event.code === "KeyA") {
          keys.current.left = false;
        }

        if (event.code === "KeyD") {
          keys.current.right = false;
        }
      };

      window.addEventListener(
        "keydown",
        handleKeyDown
      );

      window.addEventListener(
        "keyup",
        handleKeyUp
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown
        );

        window.removeEventListener(
          "keyup",
          handleKeyUp
        );
      };
    }, []);

    // ========================================
    // ANIMASI STEERING
    // ========================================

    useFrame((_, delta) => {
      const steering = steeringRef.current;

      if (!steering) return;

      // Maksimal putaran setir
      const MAX_TURN =
        THREE.MathUtils.degToRad(70);

      // Default = posisi tengah
      let targetRotation =
        initialSteeringZ.current;

      // A = kiri
      if (keys.current.left) {
        targetRotation =
          initialSteeringZ.current -
          MAX_TURN;
      }

      // D = kanan
      if (keys.current.right) {
        targetRotation =
          initialSteeringZ.current +
          MAX_TURN;
        
      }

      // Bergerak secara smooth menuju target
      steering.rotation.z =
        THREE.MathUtils.damp(
          steering.rotation.z,
          targetRotation,
          8,
          delta
        );
    });

    // ========================================
    // MODEL
    // ========================================

    return (
      <group
        ref={ref}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        <primitive object={scene} />
      </group>
    );
  }
);

Model.displayName = "Model";

export default Model;