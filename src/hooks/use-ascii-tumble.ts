import { useState, useEffect, useRef } from 'react';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Cube {
  size: number;
  center: Vector3;
  rotation: Vector3;
  rotationSpeed: Vector3;
}

const K1 = 40; // Scale factor for projection
const CUBE_DISTANCE = 100;

// Lighting
const lightSource: Vector3 = { x: 0, y: 1, z: -1 };
// Normalize light source vector
const lightSourceMag = Math.sqrt(lightSource.x ** 2 + lightSource.y ** 2 + lightSource.z ** 2);
lightSource.x /= lightSourceMag;
lightSource.y /= lightSourceMag;
lightSource.z /= lightSourceMag;

const luminanceChars = '.,-~:;=!*#$@'.split('');

const createCubes = (numCubes: number, width: number, height: number): Cube[] => {
  const cubes: Cube[] = [];
  for (let i = 0; i < numCubes; i++) {
    cubes.push({
      size: 25,
      center: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation: {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
      },
      rotationSpeed: {
        x: 0.005,
        y: 0.005,
        z: 0.005,
      },
    });
  }
  return cubes;
};

export const useAsciiTumble = (width: number, height: number, numCubes: number): string[] => {
  const [screen, setScreen] = useState<string[]>([]);
  const animationRef = useRef<number>();

  const state = useRef({
    cubes: [] as Cube[],
    zBuffer: new Float32Array(0),
    output: [] as string[],
  }).current;

  useEffect(() => {
    if (width > 0 && height > 0) {
      state.cubes = createCubes(numCubes, width, height);
      state.zBuffer = new Float32Array(width * height);
      state.output = Array(width * height).fill(' ');
      setScreen(Array(width * height).fill(' '));
    }
  }, [width, height, numCubes]);

  const rotatePoint = (p: Vector3, rot: Vector3): Vector3 => {
      const cosA = Math.cos(rot.x), sinA = Math.sin(rot.x);
      const cosB = Math.cos(rot.y), sinB = Math.sin(rot.y);
      const cosC = Math.cos(rot.z), sinC = Math.sin(rot.z);
      
      const x1 = p.x * (cosB * cosC) + p.y * (sinA * sinB * cosC - cosA * sinC) + p.z * (cosA * sinB * cosC + sinA * sinC);
      const y1 = p.x * (cosB * sinC) + p.y * (sinA * sinB * sinC + cosA * cosC) + p.z * (cosA * sinB * sinC - sinA * cosC);
      const z1 = -p.x * sinB + p.y * (sinA * cosB) + p.z * (cosA * cosB);

      return { x: x1, y: y1, z: z1 };
  }

  const calculateForSurface = (
    point: Vector3,
    normal: Vector3,
    rotation: Vector3,
    cubeCenter: Vector3
  ) => {
    // Rotate point and normal
    const rotatedPoint = rotatePoint(point, rotation);
    const rotatedNormal = rotatePoint(normal, rotation);
    
    // Calculate lighting
    const dotProduct = rotatedNormal.x * lightSource.x + rotatedNormal.y * lightSource.y + rotatedNormal.z * lightSource.z;
    const luminanceIndex = Math.floor((dotProduct + 1) * (luminanceChars.length - 1) / 2);
    const char = luminanceChars[Math.max(0, Math.min(luminanceChars.length - 1, luminanceIndex))];

    const finalZ = rotatedPoint.z + cubeCenter.z + CUBE_DISTANCE;
    const ooz = 1 / finalZ;

    const xp = Math.floor(width / 2 + K1 * ooz * (rotatedPoint.x + cubeCenter.x));
    const yp = Math.floor(height / 2 - K1 * ooz * (rotatedPoint.y + cubeCenter.y));

    const idx = xp + yp * width;
    if (idx >= 0 && idx < width * height) {
      if (ooz > state.zBuffer[idx]) {
        state.zBuffer[idx] = ooz;
        state.output[idx] = char;
      }
    }
  };

  useEffect(() => {
    if (width <= 0 || height <= 0) return;

    const animate = () => {
      state.output.fill(' ');
      state.zBuffer.fill(0);

      state.cubes.forEach(cube => {
        cube.rotation.x += cube.rotationSpeed.x;
        cube.rotation.y += cube.rotationSpeed.y;
        cube.rotation.z += cube.rotationSpeed.z;

        const halfSize = cube.size / 2;
        const step = 0.25;

        // Front face
        const frontNormal = {x: 0, y: 0, z: -1};
        for (let x = -halfSize; x <= halfSize; x += step) {
          for (let y = -halfSize; y <= halfSize; y += step) {
            calculateForSurface({x: x, y: y, z: -halfSize}, frontNormal, cube.rotation, cube.center);
          }
        }
        // Back face
        const backNormal = {x: 0, y: 0, z: 1};
        for (let x = -halfSize; x <= halfSize; x += step) {
          for (let y = -halfSize; y <= halfSize; y += step) {
            calculateForSurface({x: x, y: y, z: halfSize}, backNormal, cube.rotation, cube.center);
          }
        }
        // Left face
        const leftNormal = {x: -1, y: 0, z: 0};
        for (let z = -halfSize; z <= halfSize; z += step) {
          for (let y = -halfSize; y <= halfSize; y += step) {
            calculateForSurface({x: -halfSize, y: y, z: z}, leftNormal, cube.rotation, cube.center);
          }
        }
        // Right face
        const rightNormal = {x: 1, y: 0, z: 0};
         for (let z = -halfSize; z <= halfSize; z += step) {
          for (let y = -halfSize; y <= halfSize; y += step) {
            calculateForSurface({x: halfSize, y: y, z: z}, rightNormal, cube.rotation, cube.center);
          }
        }
        // Top face
        const topNormal = {x: 0, y: -1, z: 0};
        for (let x = -halfSize; x <= halfSize; x += step) {
          for (let z = -halfSize; z <= halfSize; z += step) {
            calculateForSurface({x: x, y: -halfSize, z: z}, topNormal, cube.rotation, cube.center);
          }
        }
        // Bottom face
        const bottomNormal = {x: 0, y: 1, z: 0};
        for (let x = -halfSize; x <= halfSize; x += step) {
          for (let z = -halfSize; z <= halfSize; z += step) {
            calculateForSurface({x: x, y: halfSize, z: z}, bottomNormal, cube.rotation, cube.center);
          }
        }
      });

      setScreen([...state.output]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, state]);

  return screen;
};
