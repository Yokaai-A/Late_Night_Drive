"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import EditorCamera from "./EditorCamera";
import Road from "./Road";
import Environment from "./Environment";


import Model from "./Model";

function DriverCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(
      0.8896958669814655,
      1.4718028313774438,
      -0.8606792031650015
    );

    camera.rotation.set(
      -3.0961825693925342,
      -0.019445198465330542,
      -3.1407090939597087
    );

    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function Scene() {
  const [isDragging, setIsDragging] = useState(false);
  const instrumentRef = useRef<THREE.Group>(null);
  const radioRef = useRef<THREE.Group>(null);
  const mirrorRef = useRef<THREE.Group>(null);
  const speed = 10;

  return (
    <>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={3} />

        {/* Semua bagian mobil */}
        <group position={[0, 0, 0]}>
        
        {/* Mobil */}
        <Model path="/models/car.glb" />

        {/* Instrument cluster - JANGAN UBAH */}
        <group
            ref={instrumentRef}
            position={[0.92, 0.90, 1.44]}
            rotation={[0, Math.PI, 0]}
            scale={[0.2, 0.2, 0.2]}
        >
            <Center>
                <Model path="/models/instrument_cluster.glb" />
            </Center>
        </group>

        {/* Radio */}
        <group
            ref={radioRef}
            position={[-0.10, 0.65, 1.63]}
            rotation={[0, Math.PI, 0]}
            scale={[0.2, 0.2, 0.2]}
        >
            <Center>
                <Model path="/models/radio.glb" />
            </Center>
        </group>

        {/* Rear View Mirror */}
        <group
            ref={mirrorRef}
            position={[0, 1.979, 1.157]}
            rotation={[0.1, -Math.PI / 2, 0]}
            scale={[3, 3, 3]}
        >
            <Center>
                <Model path="/models/rear_view_mirror.glb" />
            </Center>
        </group>
      </group>
    <Road speed={speed} />
    <Environment speed={speed} />
      {/* <DriverCamera/> */}
      <EditorCamera />
    </>
  );
}

export default function GameScene() {
  return (
    <Canvas
      camera={{
        position: [0, 2, 5],
        fov: 60,
      }}
    >
      <Scene />
    </Canvas>
  );
}