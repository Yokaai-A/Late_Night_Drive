"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SEGMENT_LENGTH = 200;
const SEGMENT_COUNT = 3;

type EnvironmentProps = {
  speed: number;
};

export default function Environment({
  speed,
}: EnvironmentProps) {
  const environmentRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!environmentRef.current) return;

    environmentRef.current.children.forEach((segment) => {
      segment.position.z -= speed * delta;

      if (segment.position.z < -SEGMENT_LENGTH) {
        segment.position.z +=
          SEGMENT_LENGTH * SEGMENT_COUNT;
      }
    });
  });

  return (
    <group ref={environmentRef}>
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
        <GroundSegment
          key={i}
          z={i * SEGMENT_LENGTH}
        />
      ))}
    </group>
  );
}

function GroundSegment({ z }: { z: number }) {
  return (
    <group position={[0, -1.20, z]}>

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