import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { MeshStandardMaterial, type Mesh } from 'three';
import { createDieGeometry, type DieType } from './diceGeometries';
import type { DiceTheme } from './DiceThemes';

interface Die3DProps {
  type: DieType;
  theme: DiceTheme;
  position: [number, number, number];
  targetFace: number;
  onSettle?: (faceValue: number) => void;
}

export function Die3D({ type, theme, position, targetFace, onSettle }: Die3DProps) {
  const settledRef = useRef(false);
  const frameCountRef = useRef(0);
  const lowVelFrames = useRef(0);
  const velocityRef = useRef([0, 0, 0]);
  const angVelRef = useRef([0, 0, 0]);

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

  // Monitorar velocidade via cannon subscriptions
  useEffect(() => {
    const unsubV = api.velocity.subscribe(v => { velocityRef.current = v; });
    const unsubA = api.angularVelocity.subscribe(v => { angVelRef.current = v; });
    return () => { unsubV(); unsubA(); };
  }, [api]);

  const geometry = useMemo(() => createDieGeometry(type), [type]);

  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: theme.faceColor,
      emissive: theme.emissive,
      roughness: 0.4,
      metalness: 0.3,
    });
  }, [theme]);

  useFrame(() => {
    if (settledRef.current || !ref.current) return;
    frameCountRef.current++;

    // Esperar no mínimo 40 frames (~0.67s) antes de checar velocidade
    if (frameCountRef.current < 40) return;

    const [vx, vy, vz] = velocityRef.current;
    const [ax, ay, az] = angVelRef.current;
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const angSpeed = Math.sqrt(ax * ax + ay * ay + az * az);

    if (speed < 0.3 && angSpeed < 0.5) {
      lowVelFrames.current++;
    } else {
      lowVelFrames.current = 0;
    }

    // Settled: velocidade baixa por 10+ frames consecutivos, ou hard cutoff 180 frames
    if (lowVelFrames.current >= 10 || frameCountRef.current > 180) {
      settledRef.current = true;
      // Resultado determinístico: retorna o valor pré-calculado, não aleatório
      onSettle?.(targetFace);
    }
  });

  return (
    <mesh ref={ref} geometry={geometry} material={material} castShadow receiveShadow />
  );
}
