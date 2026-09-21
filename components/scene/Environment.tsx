"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SEGMENT_LENGTH = 200;
const SEGMENT_COUNT = 5;

type EnvironmentProps = {
  carRef: React.RefObject<THREE.Group | null>;
};

export default function Environment({
  carRef,
}: EnvironmentProps) {
  const environmentRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!environmentRef.current) return;
    if (!carRef.current) return;

    const carZ = carRef.current.position.z;

    environmentRef.current.children.forEach(
      (segment) => {
        // Kalau tanah sudah jauh di belakang mobil,
        // pindahkan ke depan.
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
    <group ref={environmentRef}>
      {Array.from({
        length: SEGMENT_COUNT,
      }).map((_, i) => (
        <GroundSegment
          key={i}
          z={i * SEGMENT_LENGTH}
        />
      ))}
    </group>
  );
}

function GroundSegment({
  z,
}: {
  z: number;
}) {
  return (
    <group position={[0, -1.2, z]}>
      {/* Tanah kiri */}
      <mesh
        position={[-14, -0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[20, SEGMENT_LENGTH]} />

        <meshStandardMaterial
          color="#315c2b"
          roughness={1}
        />
      </mesh>

      {/* Tanah kanan */}
      <mesh
        position={[14, -0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[20, SEGMENT_LENGTH]} />

        <meshStandardMaterial
          color="#315c2b"
          roughness={1}
        />
      </mesh>
    </group>
  );
}