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
  chars: string[];
}

const K1 = 40; // Scale factor for projection
const CUBE_DISTANCE = 100;

const createCubes = (numCubes: number, width: number, height: number): Cube[] => {
  const cubes: Cube[] = [];
  const chars = ['.', ',', '-', '~', ':', ';', '=', '!', '*', '#', '$', '@'];
  for (let i = 0; i < numCubes; i++) {
    cubes.push({
      size: 20,
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
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
      },
      chars: [
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)],
      ],
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

  const calculateForSurface = (
    cubeX: number, cubeY: number, cubeZ: number,
    ch: string,
    rotation: Vector3,
    cubeCenter: Vector3
  ) => {
    const cosA = Math.cos(rotation.x), sinA = Math.sin(rotation.x);
    const cosB = Math.cos(rotation.y), sinB = Math.sin(rotation.y);
    const cosC = Math.cos(rotation.z), sinC = Math.sin(rotation.z);

    // Rotate around Y, then X, then Z
    const x = cubeX * (cosB * cosC) + cubeY * (sinA * sinB * cosC - cosA * sinC) + cubeZ * (cosA * sinB * cosC + sinA * sinC);
    const y = cubeX * (cosB * sinC) + cubeY * (sinA * sinB * sinC + cosA * cosC) + cubeZ * (cosA * sinB * sinC - sinA * cosC);
    const z = -cubeX * sinB + cubeY * (sinA * cosB) + cubeZ * (cosA * cosB);

    const finalZ = z + cubeCenter.z + CUBE_DISTANCE;
    const ooz = 1 / finalZ;

    const xp = Math.floor(width / 2 + K1 * ooz * (x + cubeCenter.x));
    const yp = Math.floor(height / 2 - K1 * ooz * (y + cubeCenter.y));

    const idx = xp + yp * width;
    if (idx >= 0 && idx < width * height) {
      if (ooz > state.zBuffer[idx]) {
        state.zBuffer[idx] = ooz;
        state.output[idx] = ch;
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
        const step = 1; // Density of points on the cube face

        for (let x = -halfSize; x <= halfSize; x += step) {
          for (let y = -halfSize; y <= halfSize; y += step) {
            calculateForSurface(x, y, -halfSize, cube.chars[0], cube.rotation, cube.center); // Front
            calculateForSurface(x, y, halfSize, cube.chars[1], cube.rotation, cube.center);   // Back
            calculateForSurface(-halfSize, x, y, cube.chars[2], cube.rotation, cube.center); // Left
            calculateForSurface(halfSize, x, y, cube.chars[3], cube.rotation, cube.center);  // Right
            calculateForSurface(x, -halfSize, y, cube.chars[4], cube.rotation, cube.center); // Top
            calculateForSurface(x, halfSize, y, cube.chars[5], cube.rotation, cube.center);  // Bottom
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
