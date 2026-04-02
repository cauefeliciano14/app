import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { Die3D } from './Die3D';
import { getTheme } from './DiceThemes';
import type { DieType } from './diceGeometries';
import type { Mesh } from 'three';

interface DiceTrayProps {
  dice: Array<{ type: DieType; id: string }>;
  results: number[];
  themeId: string;
  onAllSettled?: () => void;
}

function Floor() {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1, 0],
    material: { restitution: 0.2, friction: 1 },
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} />
    </mesh>
  );
}

function Wall({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const [ref] = useBox<Mesh>(() => ({
    position,
    rotation,
    args: [10, 4, 0.2],
    type: 'Static',
    material: { restitution: 0.5, friction: 0.5 },
  }));
  return <mesh ref={ref}><boxGeometry args={[10, 4, 0.2]} /><meshStandardMaterial visible={false} /></mesh>;
}

export function DiceTray({ dice, results, themeId, onAllSettled }: DiceTrayProps) {
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const settledCount = useMemo(() => ({ current: 0 }), [dice]);

  const handleSettle = () => {
    settledCount.current++;
    if (settledCount.current >= dice.length) {
      onAllSettled?.();
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 3], fov: 45, near: 0.1, far: 50 }}
      style={{ width: '100%', height: '100%', borderRadius: '12px' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-2, 4, -2]} intensity={0.4} color="#f97316" />

      <Suspense fallback={null}>
        <Physics gravity={[0, -15, 0]} defaultContactMaterial={{ restitution: 0.3, friction: 0.8 }}>
          <Floor />
          {/* Walls */}
          <Wall position={[0, 1, -2.5]} rotation={[0, 0, 0]} />
          <Wall position={[0, 1, 2.5]} rotation={[0, Math.PI, 0]} />
          <Wall position={[-3, 1, 0]} rotation={[0, Math.PI / 2, 0]} />
          <Wall position={[3, 1, 0]} rotation={[0, -Math.PI / 2, 0]} />

          {dice.map((die, i) => (
            <Die3D
              key={die.id}
              type={die.type}
              theme={theme}
              targetFace={results[i] ?? 1}
              position={[
                (Math.random() - 0.5) * 2,
                3 + i * 0.5,
                (Math.random() - 0.5) * 2,
              ]}
              onSettle={handleSettle}
            />
          ))}
        </Physics>
      </Suspense>
    </Canvas>
  );
}
