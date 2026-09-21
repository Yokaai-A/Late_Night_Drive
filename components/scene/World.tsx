"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SEGMENT_LENGTH = 200;

// Harus ganjil supaya ada jumlah segment
// yang seimbang di depan dan belakang.
const SEGMENT_COUNT = 7;

const ROAD_WIDTH = 15;

type WorldProps = {
  carRef: React.RefObject<THREE.Group | null>;
};

export default function World({
  carRef,
}: WorldProps) {
  const worldRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!worldRef.current || !carRef.current) {
      return;
    }

    const carZ = carRef.current.position.z;

    const segments = worldRef.current.children;

    if (segments.length === 0) return;

    // Cari segment paling depan dan belakang
    let minZ = Infinity;
    let maxZ = -Infinity;

    segments.forEach((segment) => {
      minZ = Math.min(minZ, segment.position.z);
      maxZ = Math.max(maxZ, segment.position.z);
    });

    const halfWorldLength =
      (SEGMENT_LENGTH * SEGMENT_COUNT) / 2;

    segments.forEach((segment) => {
      // ============================
      // Segment terlalu jauh belakang
      // ============================

      if (
        segment.position.z <
        carZ - halfWorldLength
      ) {
        segment.position.z =
          maxZ + SEGMENT_LENGTH;

        maxZ = segment.position.z;
      }

      // ============================
      // Segment terlalu jauh depan
      // ============================

      else if (
        segment.position.z >
        carZ + halfWorldLength
      ) {
        segment.position.z =
          minZ - SEGMENT_LENGTH;

        minZ = segment.position.z;
      }
    });
  });

  const half = Math.floor(
    SEGMENT_COUNT / 2
  );

  return (
    <group ref={worldRef}>
      {Array.from({
        length: SEGMENT_COUNT,
      }).map((_, i) => {
        const z =
          (i - half) * SEGMENT_LENGTH;

        return (
          <WorldSegment
            key={i}
            z={z}
          />
        );
      })}
    </group>
  );
}

function WorldSegment({
  z,
}: {
  z: number;
}) {
  return (
    <group position={[0, 0, z]}>
      <Road />
      <Ground />
    </group>
  );
}

function Road() {
  const MARK_SPACING = 5;

  const MARK_COUNT = Math.ceil(
    SEGMENT_LENGTH / MARK_SPACING
  );

  return (
    <group position={[0, -1.1, 0]}>
      {/* ASPAL */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[
            ROAD_WIDTH,
            SEGMENT_LENGTH,
          ]}
        />

        <meshStandardMaterial
          color="#161616"
          roughness={0.8}
        />
      </mesh>

      {/* MARKA TENGAH */}

      {Array.from({
        length: MARK_COUNT,
      }).map((_, i) => {
        const markZ =
          -SEGMENT_LENGTH / 2 +
          i * MARK_SPACING;

        return (
          <group key={i}>
            <mesh
              position={[
                -0.12,
                0.011,
                markZ,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[0.08, 2.5]}
              />

              <meshStandardMaterial
                color="#e8d76b"
              />
            </mesh>

            <mesh
              position={[
                0.12,
                0.011,
                markZ,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[0.08, 2.5]}
              />

              <meshStandardMaterial
                color="#e8d76b"
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Ground() {
  const GROUND_WIDTH = 30;

  const roadHalfWidth =
    ROAD_WIDTH / 2;

  return (
    <group position={[0, -1.2, 0]}>
      {/* GRASS KIRI */}

      <mesh
        position={[
          -(roadHalfWidth +
            GROUND_WIDTH / 2),
          0,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            GROUND_WIDTH,
            SEGMENT_LENGTH,
          ]}
        />

        <meshStandardMaterial
          color="#315c2b"
          roughness={1}
        />
      </mesh>

      {/* GRASS KANAN */}

      <mesh
        position={[
          roadHalfWidth +
            GROUND_WIDTH / 2,
          0,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            GROUND_WIDTH,
            SEGMENT_LENGTH,
          ]}
        />

        <meshStandardMaterial
          color="#315c2b"
          roughness={1}
        />
      </mesh>
    </group>
  );
}