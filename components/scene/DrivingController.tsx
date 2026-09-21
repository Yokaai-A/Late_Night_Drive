"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type DrivingControllerProps = {
  speedRef: { current: number };
  carRef: React.RefObject<THREE.Group | null>;
};

export default function DrivingController({
  speedRef,
  carRef,
}: DrivingControllerProps) {
  const keys = useRef({
    forward: false,
    brake: false,
    left: false,
    right: false,
  });

  const heading = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyW") {
        keys.current.forward = true;
      }
      if (event.code === "KeyA") {
        keys.current.left = true;
      }
      if (event.code === "KeyD") {
        keys.current.right = true;
      }
      if (event.code === "KeyS") {
        keys.current.brake = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyW") {
        keys.current.forward = false;
      }
      if (event.code === "KeyA") {
        keys.current.left = false;
      }
      if (event.code === "KeyD") {
        keys.current.right = false;
      }
      if (event.code === "KeyS") {
        keys.current.brake = false;
      }
    };
    

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

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

  useFrame((_, delta) => {
    const MAX_FORWARD_SPEED = 30;
    const MAX_REVERSE_SPEED = -10;

    const ACCELERATION = 10;
    const BRAKE_POWER = 20;
    const REVERSE_ACCELERATION = 6;
    const DRAG = 3;

    // ==============================
    // W
    // ==============================

    if (keys.current.forward) {
        // Kalau sedang mundur, W menjadi rem dulu
        if (speedRef.current < 0) {
        speedRef.current += BRAKE_POWER * delta;
        } else {
        // Kalau sudah maju / diam, gas
        speedRef.current += ACCELERATION * delta;
        }
    }

    // ==============================
    // S
    // ==============================

    if (keys.current.brake) {
        // Kalau sedang maju, S menjadi rem
        if (speedRef.current > 0) {
        speedRef.current -= BRAKE_POWER * delta;
        } else {
        // Kalau sudah berhenti / mundur,
        // S menjadi reverse
        speedRef.current -= REVERSE_ACCELERATION * delta;
        }
    }

    const TURN_SPEED = THREE.MathUtils.degToRad(25);

    // Hanya bisa mengubah arah ketika bergerak
    if (Math.abs(speedRef.current) > 0.1) {
        const speedFactor = Math.min(
            Math.abs(speedRef.current) / 10,
            1
        );

        const direction =
        speedRef.current >= 0 ? 1 : -1;

        if (keys.current.left) {
            heading.current +=
            TURN_SPEED *
            speedFactor *
            direction *
            delta;
        }

        if (keys.current.right) {
            heading.current -=
            TURN_SPEED *
            speedFactor *
            direction *
            delta;
        }
    }

    if (carRef.current) {
        // Rotasi mobil mengikuti heading
        carRef.current.rotation.y =
            THREE.MathUtils.damp(
            carRef.current.rotation.y,
            heading.current,
            5,
            delta
            );

        // Gerakan mobil mengikuti heading
        const moveX =
            Math.sin(heading.current) *
            speedRef.current *
            delta;

        const moveZ =
            Math.cos(heading.current) *
            speedRef.current *
            delta;

        carRef.current.position.x += moveX;
        carRef.current.position.z += moveZ;
    }

    // ==============================
    // Tidak tekan W/S
    // ==============================

    if (
        !keys.current.forward &&
        !keys.current.brake
    ) {
        // Kalau sedang maju
        if (speedRef.current > 0) {
        speedRef.current = Math.max(
            0,
            speedRef.current - DRAG * delta
        );
        }

        // Kalau sedang mundur
        else if (speedRef.current < 0) {
        speedRef.current = Math.min(
            0,
            speedRef.current + DRAG * delta
        );
        }
    }

    // ==============================
    // Batasi speed
    // ==============================

    speedRef.current = Math.max(
        MAX_REVERSE_SPEED,
        Math.min(
        speedRef.current,
        MAX_FORWARD_SPEED
        )
    );
    });

  return null;
}