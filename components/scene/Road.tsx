"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SEGMENT_LENGTH = 200;
const SEGMENT_COUNT = 5;

type RoadProps = {
  carRef: React.RefObject<THREE.Group | null>;
};

export default function Road({
  carRef,
}: RoadProps) {
  const roadRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!roadRef.current) return;
    if (!carRef.current) return;

    const carZ = carRef.current.position.z;

    roadRef.current.children.forEach(
      (segment) => {
        // Kalau segment sudah terlalu jauh
        // di belakang mobil
        if (
          segment.position.z <
          carZ - SEGMENT_LENGTH
        ) {
          segment.position.z +=
            SEGMENT_LENGTH * SEGMENT_COUNT;
        }
      }
    );
  });

  return (
    <group ref={roadRef}>
      {Array.from({
        length: SEGMENT_COUNT,
      }).map((_, i) => (
        <RoadSegment
          key={i}
          z={i * SEGMENT_LENGTH}
        />
      ))}
    </group>
  );
}

function RoadSegment({
  z,
}: {
  z: number;
}) {
  const MARK_SPACING = 5;

  const MARK_COUNT = Math.ceil(
    SEGMENT_LENGTH / MARK_SPACING
  );

  return (
    <group position={[0, -1.1, z]}>
      {/* ASPAL */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            15,
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
            {/* Garis kiri */}
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

            {/* Garis kanan */}
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