"use client";

import { forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
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