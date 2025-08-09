
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

const defaultChars = '.,-~:;=!*#$@';

const createCubes = (numCubes: number): Cube[] => {
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
        x: 0.01,
        y: 0.01,
        z: 0.01,
      },
    });
  }
  return cubes;
};

export const useAsciiTumble = (width: number, height: number, numCubes: number, text: string): string[] => {
  const [screen, setScreen] = useState<string[]>([]);
  const animationRef = useRef<number>();
  const stateRef = useRef({
    cubes: [] as Cube[],
    zBuffer: new Float32Array(0),
    output: [] as string[],
    luminanceChars: defaultChars.split(''),
    step: 0.5,
  });

  // Effect to handle initialization and resizing
  useEffect(() => {
    if (width > 0 && height > 0) {
      stateRef.current.cubes = createCubes(numCubes);
      stateRef.current.zBuffer = new Float32Array(width * height);
      stateRef.current.output = Array(width * height).fill(' ');
      setScreen(Array(width * height).fill(' '));
    }
  }, [width, height, numCubes]);

  // Update luminance characters when text changes
  useEffect(() => {
    const state = stateRef.current;
    if (text && text.length > 0) {
      state.luminanceChars = text.split('');
      state.step = Math.max(0.1, 1 / (text.length / 5 + 1));
    } else {
      state.luminanceChars = defaultChars.split('');
      state.step = 0.5;
    }
  }, [text]);

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
    cubeCenter: Vector3,
    luminanceChars: string[]
  ) => {
    const state = stateRef.current;
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

  // Effect for animation loop
  useEffect(() => {
    if (width <= 0 || height <= 0) return;

    const animate = () => {
      const state = stateRef.current;
      state.output.fill(' ');
      state.zBuffer.fill(0);

      const currentLuminanceChars = state.luminanceChars;

      state.cubes.forEach(cube => {
        cube.rotation.x += cube.rotationSpeed.x;
        cube.rotation.y += cube.rotationSpeed.y;
        cube.rotation.z += cube.rotationSpeed.z;

        const halfSize = cube.size / 2;
        
        const normals = {
          front: {x: 0, y: 0, z: -1},
          back: {x: 0, y: 0, z: 1},
          left: {x: -1, y: 0, z: 0},
          right: {x: 1, y: 0, z: 0},
          top: {x: 0, y: -1, z: 0},
          bottom: {x: 0, y: 1, z: 0},
        };

        for (let x = -halfSize; x <= halfSize; x += state.step) {
          for (let y = -halfSize; y <= halfSize; y += state.step) {
            calculateForSurface({x: x, y: y, z: -halfSize}, normals.front, cube.rotation, cube.center, currentLuminanceChars);
            calculateForSurface({x: x, y: y, z: halfSize}, normals.back, cube.rotation, cube.center, currentLuminanceChars);
          }
        }
        for (let z = -halfSize; z <= halfSize; z += state.step) {
          for (let y = -halfSize; y <= halfSize; y += state.step) {
            calculateForSurface({x: -halfSize, y: y, z: z}, normals.left, cube.rotation, cube.center, currentLuminanceChars);
            calculateForSurface({x: halfSize, y: y, z: z}, normals.right, cube.rotation, cube.center, currentLuminanceChars);
          }
        }
        for (let x = -halfSize; x <= halfSize; x += state.step) {
          for (let z = -halfSize; z <= halfSize; z += state.step) {
            calculateForSurface({x: x, y: -halfSize, z: z}, normals.top, cube.rotation, cube.center, currentLuminanceChars);
            calculateForSurface({x: x, y: halfSize, z: z}, normals.bottom, cube.rotation, cube.center, currentLuminanceChars);
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
  }, [width, height]);

  return screen;
};
