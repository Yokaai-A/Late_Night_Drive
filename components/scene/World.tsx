"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const SEGMENT_LENGTH = 200;

// Harus ganjil supaya ada jumlah segment
// yang seimbang di depan dan belakang.
const SEGMENT_COUNT = 7;

const ROAD_WIDTH = 28;

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
      <GrassField />
      <TreeField />
    </group>
  );
}

function Road() {
  const asphaltTexture = useTexture(
    "/textures/ground/asphalt-texture.jpg"
  );

  useMemo(() => {
    asphaltTexture.wrapS = THREE.RepeatWrapping;
    asphaltTexture.wrapT = THREE.RepeatWrapping;

    asphaltTexture.repeat.set(
      2,
      SEGMENT_LENGTH / 15
    );

    asphaltTexture.colorSpace =
      THREE.SRGBColorSpace;

    asphaltTexture.needsUpdate = true;
  }, [asphaltTexture]);

  const roadHalfWidth = ROAD_WIDTH / 2;

  // Posisi pembagi lane
  const laneDividerLeft = -7;
  const laneDividerRight = 7;

  const DASH_LENGTH = 4;
  const DASH_GAP = 5;
  const DASH_SPACING =
    DASH_LENGTH + DASH_GAP;

  const dashCount = Math.ceil(
    SEGMENT_LENGTH / DASH_SPACING
  );

  return (
    <group position={[0, -1.1, 0]}>
      {/* ASPHALT */}
      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            ROAD_WIDTH,
            SEGMENT_LENGTH,
          ]}
        />

        <meshStandardMaterial
          map={asphaltTexture}
          color="#666666"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* ========================= */}
      {/* EDGE LINES */}
      {/* ========================= */}

      <RoadLine
        x={-roadHalfWidth + 0.5}
        color="#eeeeee"
      />

      <RoadLine
        x={roadHalfWidth - 0.5}
        color="#eeeeee"
      />

      {/* ========================= */}
      {/* DOUBLE CENTER LINE */}
      {/* ========================= */}

      <RoadLine
        x={-0.18}
        color="#d8c34f"
        width={0.12}
      />

      <RoadLine
        x={0.18}
        color="#d8c34f"
        width={0.12}
      />

      {/* ========================= */}
      {/* LANE DIVIDERS */}
      {/* ========================= */}

      {Array.from({
        length: dashCount,
      }).map((_, i) => {
        const z =
          -SEGMENT_LENGTH / 2 +
          i * DASH_SPACING +
          DASH_LENGTH / 2;

        return (
          <group key={i}>
            {/* LEFT DIRECTION */}
            <mesh
              position={[
                laneDividerLeft,
                0.012,
                z,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  0.12,
                  DASH_LENGTH,
                ]}
              />

              <meshStandardMaterial
                color="#dddddd"
              />
            </mesh>

            {/* RIGHT DIRECTION */}
            <mesh
              position={[
                laneDividerRight,
                0.012,
                z,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  0.12,
                  DASH_LENGTH,
                ]}
              />

              <meshStandardMaterial
                color="#dddddd"
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function RoadLine({
  x,
  color,
  width = 0.15,
}: {
  x: number;
  color: string;
  width?: number;
}) {
  return (
    <mesh
      position={[x, 0.012, 0]}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
    >
      <planeGeometry
        args={[
          width,
          SEGMENT_LENGTH,
        ]}
      />

      <meshStandardMaterial
        color={color}
      />
    </mesh>
  );
}

function Ground() {
  const GROUND_WIDTH = 150;
  const SLOPE_WIDTH = 8;

  const roadHalfWidth = ROAD_WIDTH / 2;

  const [
    baseColor,
    normalMap,
    roughnessMap,
    aoMap,
  ] = useTexture([
    "/textures/ground/Poliigon_GrassPatchyGround_4585_BaseColor.jpg",
    "/textures/ground/Poliigon_GrassPatchyGround_4585_Normal.png",
    "/textures/ground/Poliigon_GrassPatchyGround_4585_Roughness.jpg",
    "/textures/ground/Poliigon_GrassPatchyGround_4585_AmbientOcclusion.jpg",
  ]);

  useMemo(() => {
    [baseColor, normalMap, roughnessMap, aoMap].forEach(
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(
          5,
          SEGMENT_LENGTH / 30
        );
        texture.needsUpdate = true;
      }
    );

    baseColor.colorSpace = THREE.SRGBColorSpace;
  }, [baseColor, normalMap, roughnessMap, aoMap]);

  const material = (
    <meshStandardMaterial
      map={baseColor}
      normalMap={normalMap}
      roughnessMap={roughnessMap}
      aoMap={aoMap}
      roughness={1}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group>
      {/* LEFT FLAT GROUND */}
      <mesh
        position={[
          -(roadHalfWidth +
            SLOPE_WIDTH +
            GROUND_WIDTH / 2),
          -2.3,
          0,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[GROUND_WIDTH, SEGMENT_LENGTH]}
        />
        {material}
      </mesh>

      {/* RIGHT FLAT GROUND */}
      <mesh
        position={[
          roadHalfWidth +
            SLOPE_WIDTH +
            GROUND_WIDTH / 2,
          -2.3,
          0,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[GROUND_WIDTH, SEGMENT_LENGTH]}
        />
        {material}
      </mesh>

      {/* LEFT SLOPE */}
      <Slope
        side="left"
        roadHalfWidth={roadHalfWidth}
        width={SLOPE_WIDTH}
        material={material}
      />

      {/* RIGHT SLOPE */}
      <Slope
        side="right"
        roadHalfWidth={roadHalfWidth}
        width={SLOPE_WIDTH}
        material={material}
      />
    </group>
  );
}

function Slope({
  side,
  roadHalfWidth,
  width,
  material,
}: {
  side: "left" | "right";
  roadHalfWidth: number;
  width: number;
  material: React.ReactNode;
}) {
  const direction = side === "left" ? -1 : 1;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    const innerX =
      direction * roadHalfWidth;

    const outerX =
      direction * (roadHalfWidth + width);

    const roadY = -1.12;
    const groundY = -2.3;

    const halfLength = SEGMENT_LENGTH / 2;

    const vertices = new Float32Array([
      innerX, roadY, -halfLength,
      outerX, groundY, -halfLength,
      innerX, roadY, halfLength,

      innerX, roadY, halfLength,
      outerX, groundY, -halfLength,
      outerX, groundY, halfLength,
    ]);

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );

    geo.computeVertexNormals();

    return geo;
  }, [direction, roadHalfWidth, width]);

  return (
    <mesh geometry={geometry}>
      {material}
    </mesh>
  );
}

type GrassData = {
  x: number;
  z: number;
  rotation: number;
  scale: number;
  type: "lowPoly" | "variation";
  variant: number;
};

function GrassField() {
  // Grass kecil → butuh scale besar
  const lowPolyGrass = useGLTF(
    "/models/environment/grass/low_poly_stylized_2d_grass.glb"
  );

  // File yang berisi banyak variasi grass
  const grassVariations = useGLTF(
    "/models/environment/grass/grass_variations.glb"
  );

  // Ambil setiap object grass dari grass_variations
  const variationObjects = useMemo(() => {
    const objects: THREE.Object3D[] = [];

    grassVariations.scene.traverse((child) => {
      // Hanya ambil object Mesh
      if (child instanceof THREE.Mesh) {
        objects.push(child);
      }
    });

    return objects;
  }, [grassVariations]);

  const grasses = useMemo<GrassData[]>(() => {
    const result: GrassData[] = [];

    const GRASS_COUNT = 200;
    const roadHalfWidth = ROAD_WIDTH / 2;
    const GRASS_SAFE_GAP = 8;
    const GRASS_DEPTH = 125;

    for (let i = 0; i < GRASS_COUNT; i++) {
      // Kiri atau kanan jalan
      const side =
        Math.random() < 0.5 ? -1 : 1;

      const distanceFromRoad =
        roadHalfWidth +
        GRASS_SAFE_GAP +
        Math.random() * GRASS_DEPTH;

      const x =
        side * distanceFromRoad;

      const z =
        -SEGMENT_LENGTH / 2 +
        Math.random() * SEGMENT_LENGTH;

      const rotation =
        Math.random() * Math.PI * 2;

      // 50% low poly
      // 50% grass variations
      const type =
        Math.random() < 0.5
          ? "lowPoly"
          : "variation";

      let scale: number;
      let variant = 0;

      if (type === "lowPoly") {
        // Model ini sangat kecil
        // Random 50 - 70
        scale =
          50 + Math.random() * 20;
      } else {
        // grass_variations sangat besar,
        // jadi untuk sekarang test scale 0.1
        scale = 0.015;

        // Pilih satu grass secara random
        if (variationObjects.length > 0) {
          variant = Math.floor(
            Math.random() *
              variationObjects.length
          );
        }
      }

      result.push({
        x,
        z,
        rotation,
        scale,
        type,
        variant,
      });
    }

    return result;
  }, [variationObjects]);

  return (
    <group>
      {grasses.map((grass, i) => {
        // =========================
        // LOW POLY GRASS
        // =========================

        if (grass.type === "lowPoly") {
          return (
            <primitive
              key={i}
              object={lowPolyGrass.scene.clone()}
              position={[
                grass.x,
                -2.28,
                grass.z,
              ]}
              rotation={[
                0,
                grass.rotation,
                0,
              ]}
              scale={[
                grass.scale,
                grass.scale,
                grass.scale,
              ]}
            />
          );
        }

        // =========================
        // GRASS VARIATIONS
        // =========================

        const selectedGrass =
          variationObjects[grass.variant];

        if (!selectedGrass) {
          return null;
        }

        return (
          <primitive
            key={i}
            object={selectedGrass.clone()}
            position={[
              grass.x,
              -2.28,
              grass.z,
            ]}
            rotation={[
              0,
              grass.rotation,
              0,
            ]}
            scale={[
              grass.scale,
              grass.scale,
              grass.scale,
            ]}
          />
        );
      })}
    </group>
  );
} 

type TreeData = {
  x: number;
  z: number;
  rotation: number;
  scale: number;
};

function TreeField() {
  const treeModel = useGLTF(
    "/models/environment/trees/tree_animate.glb"
  );

  const leafTexture = useTexture(
    "/textures/trees/leafs.png"
  );

  const barkTexture = useTexture(
    "/textures/trees/bark.jpg"
  );

  leafTexture.colorSpace = THREE.SRGBColorSpace;
  barkTexture.colorSpace = THREE.SRGBColorSpace;

useMemo(() => {
  treeModel.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material, index) => {
        if (
          material instanceof THREE.MeshStandardMaterial
        ) {
          console.log(
            "TREE MATERIAL",
            {
              mesh: child.name,
              materialIndex: index,
              materialName: material.name,
              color: material.color.getHexString(),
              map: material.map,
              transparent: material.transparent,
              opacity: material.opacity,
              alphaTest: material.alphaTest,
            }
          );
        }
      });
    }
  });
}, [treeModel]);

    const texturedTree = useMemo(() => {
  const model = treeModel.scene.clone(true);

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const originalMaterial =
      child.material as THREE.MeshStandardMaterial;

    // Hilangkan Branch bawaan
    if (originalMaterial.name === "Branch") {
      child.visible = false;
      return;
    }

    const material = originalMaterial.clone();

    // Leaf
    if (material.name === "Leaf") {
      material.map = leafTexture;
      material.alphaTest = 0.4;
      material.transparent = false;
      material.side = THREE.DoubleSide;
    }

    // Bark
    if (material.name === "Bark") {
      material.map = barkTexture;
    }

    material.needsUpdate = true;
    child.material = material;
  });

  return model;
}, [treeModel, leafTexture, barkTexture]);

  const treeCenter = useMemo(() => {
    const box = new THREE.Box3().setFromObject(
      treeModel.scene
    );

    const center = new THREE.Vector3();
    box.getCenter(center);

    return center;
  }, [treeModel]);

  const trees = useMemo<TreeData[]>(() => {
    const result: TreeData[] = [];

    // Ingat: 1 spawn = 3 pohon
    const TREE_CLUSTER_COUNT = 12;

    const roadHalfWidth =
      ROAD_WIDTH / 2;

    const TREE_SIZE_X = 237.565;

    const EXTRA_GAP = 5;
    const TREE_DEPTH = 40;

    for (let i = 0; i < TREE_CLUSTER_COUNT; i++) {
      const side =
        Math.random() < 0.5 ? -1 : 1;

      const scale =
        0.4 + Math.random() * 0.3;

      // Setengah lebar cluster setelah scale
      const clusterHalfWidth =
        (TREE_SIZE_X / 2) * scale;

      const randomDistance =
        Math.random() ** 1.5 * TREE_DEPTH;

      const distanceFromCenter =
        roadHalfWidth +
        clusterHalfWidth +
        EXTRA_GAP +
        randomDistance;

      const x =
        side * distanceFromCenter;

      const z =
        -SEGMENT_LENGTH / 2 +
        Math.random() * SEGMENT_LENGTH;

      result.push({
        x,
        z,
        rotation: 0,
        scale,
      });
    }

    return result;
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <group
          key={i}
          position={[
            tree.x,
            -2.3,
            tree.z,
          ]}
          rotation={[0, 0, 0]}
          scale={[
            tree.scale,
            tree.scale,
            tree.scale,
          ]}
        >
          <primitive
            object={texturedTree.clone(true)}
            position={[
              -treeCenter.x,
              0,
              -treeCenter.z,
            ]}
          />
        </group>
      ))}
    </group>
  );
}