"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SEGMENT_LENGTH = 200;
const SEGMENT_COUNT = 3;

type RoadProps = {
  speed: number;
};

export default function Road({ speed }: RoadProps) {
  const roadRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!roadRef.current) return;

    roadRef.current.children.forEach((segment) => {
        segment.position.z -= speed * delta;

        while (segment.position.z < -SEGMENT_LENGTH) {
        segment.position.z +=
            SEGMENT_LENGTH * SEGMENT_COUNT;
        }
    });
  });

  return (
    <group ref={roadRef}>
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
        <RoadSegment
          key={i}
          z={i * SEGMENT_LENGTH}
        />
      ))}
    </group>
  );
}

function RoadSegment({ z }: { z: number }) {
  const MARK_SPACING = 5;
const MARK_COUNT = Math.ceil(SEGMENT_LENGTH / MARK_SPACING);

  return (
    <group position={[0, -1.10, z]}>
      {/* Aspal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, SEGMENT_LENGTH]} />

        <meshStandardMaterial
          color="#161616"
          roughness={0.8}
        />
      </mesh>

      {/* Marka tengah */}
      {Array.from({ length: MARK_COUNT }).map((_, i) => (
        <mesh
          key={i}
          position={[
            0,                         // X
            0.011,                     // sedikit di atas aspal
            -SEGMENT_LENGTH / 2 + i * 5,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.12, 2.5]} />

          <meshStandardMaterial color="#eeeeee" />
        </mesh>
      ))}
    </group>
  );
}