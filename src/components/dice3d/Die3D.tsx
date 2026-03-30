import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { MeshStandardMaterial, TextureLoader, type Mesh } from 'three';
import { createDieGeometry, createNumberTexture, getDieFaces, type DieType } from './diceGeometries';
import type { DiceTheme } from './DiceThemes';

interface Die3DProps {
  type: DieType;
  theme: DiceTheme;
  position: [number, number, number];
  onSettle?: (faceValue: number) => void;
}

export function Die3D({ type, theme, position, onSettle }: Die3DProps) {
  const settledRef = useRef(false);
  const frameCountRef = useRef(0);
  const faces = getDieFaces(type);

  // Physics body
  const [ref, api] = useBox<Mesh>(() => ({
    mass: 1,
    position,
    rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
    velocity: [
      (Math.random() - 0.5) * 6,
      Math.random() * 3 + 2,
      (Math.random() - 0.5) * 6,
    ],
    angularVelocity: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ],
    args: [0.5, 0.5, 0.5],
    material: { restitution: 0.3, friction: 0.8 },
  }));

  const geometry = useMemo(() => createDieGeometry(type), [type]);

  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: theme.faceColor,
      emissive: theme.emissive,
      roughness: 0.4,
      metalness: 0.3,
    });
  }, [theme]);

  // Detect when die has settled
  useFrame(() => {
    if (settledRef.current || !ref.current) return;
    frameCountRef.current++;

    // Wait at least 60 frames (~1 second) before checking
    if (frameCountRef.current < 60) return;

    // Check velocity via position delta approximation
    // After enough frames, assume settled and return random face
    if (frameCountRef.current > 120) {
      settledRef.current = true;
      // The actual result is determined by diceRoller.ts
      // We just need to signal that the animation is done
      const faceValue = Math.floor(Math.random() * faces) + 1;
      onSettle?.(faceValue);
    }
  });

  return (
    <mesh ref={ref} geometry={geometry} material={material} castShadow receiveShadow />
  );
}
