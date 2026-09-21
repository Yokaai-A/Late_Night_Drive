"use client";

import { forwardRef, useEffect } from "react";
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

    useEffect(() => {
      // Tampilkan semua mesh yang namanya mengandung "circle"
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh &&
          object.name.toLowerCase().includes("circle")
        ) {
          console.log("CIRCLE:", object.name);
        }
      });

      // GANTI nama ini untuk mengetes object
      const testObject = scene.getObjectByName("Circle002");

      if (testObject instanceof THREE.Mesh) {
        console.log("TEST OBJECT:", testObject);

        testObject.material = new THREE.MeshBasicMaterial({
          color: "red",
        });
      }
    }, [scene]);

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