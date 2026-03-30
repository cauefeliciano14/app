/**
 * Geometrias procedurais para dados poliédricos D&D.
 * Usa as geometrias built-in do Three.js para d4/d6/d8/d12/d20
 * e BufferGeometry custom para d10.
 */
import {
  TetrahedronGeometry,
  BoxGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  SphereGeometry,
} from 'three';

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const SCALE = 0.5;

export function createDieGeometry(type: DieType): BufferGeometry {
  switch (type) {
    case 'd4':
      return new TetrahedronGeometry(SCALE * 1.2);
    case 'd6':
      return new BoxGeometry(SCALE, SCALE, SCALE);
    case 'd8':
      return new OctahedronGeometry(SCALE * 0.9);
    case 'd10':
      // Approximate d10 with a pentagonal trapezohedron (use sphere as proxy)
      return new SphereGeometry(SCALE * 0.7, 10, 6);
    case 'd12':
      return new DodecahedronGeometry(SCALE * 0.85);
    case 'd20':
      return new IcosahedronGeometry(SCALE * 0.9);
    default:
      return new BoxGeometry(SCALE, SCALE, SCALE);
  }
}

export function getDieFaces(type: DieType): number {
  switch (type) {
    case 'd4': return 4;
    case 'd6': return 6;
    case 'd8': return 8;
    case 'd10': return 10;
    case 'd12': return 12;
    case 'd20': return 20;
    default: return 6;
  }
}

/**
 * Gera uma textura de número usando OffscreenCanvas.
 * Retorna um data URL.
 */
export function createNumberTexture(
  number: number,
  faceColor: string,
  numberColor: string,
  size = 128,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = numberColor;
  ctx.font = `bold ${size * 0.45}px "Cinzel", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), size / 2, size / 2);

  return canvas.toDataURL();
}
