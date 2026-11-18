import { normaliseVector, directionKey } from './vector.js';

class CubeColor {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class CubeRotation {
  constructor(alpha, beta, gamma) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
  }
}

class Cubelet {
  constructor(x, y, z) {
    this.position = [x, y, z];
    this.stickers = {};

    for (let i = 0; i < FACE_DIRECTIONS.length; i++) {
      const [nx, ny, nz] = FACE_DIRECTIONS[i];

      if (
        (nx !== 0 && x === nx) ||
        (ny !== 0 && y === ny) ||
        (nz !== 0 && z === nz)
      ) {
        this.stickers[directionKey(nx, ny, nz)] = FACE_COLORS[i];
      }
    }
  }
}

const DEGTORAD = Math.PI / 180;

const LIGHT_DIR = normaliseVector([-1, -1, -2]);
const AMBIENT_LIGHT = 0.5;
const DIFFUSE_LIGHT = 0.75;

const CUBELET_SIZE = 48;
const CUBELET_GAP = 2;
const CUBE_SIZE = CUBELET_SIZE + CUBELET_GAP;

const TURN_DURATION = 500;
const TURN_INTERVAL = 2000;

const FACE_DIRECTIONS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

const FACE_COLORS = [
  new CubeColor(0, 255, 0),
  new CubeColor(0, 0, 255),
  new CubeColor(255, 255, 255),
  new CubeColor(255, 255, 0),
  new CubeColor(255, 0, 0),
  new CubeColor(255, 128, 0)
];

const FACE_AXES = [
  [1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 0, 1]
];

const FACE_ANGLES = [
  Math.PI / 2,
  -Math.PI / 2,
  Math.PI / 2,
  -Math.PI / 2,
  Math.PI / 2,
  -Math.PI / 2
];

const CUBELET_FACES = [
  { indices: [1, 3, 7, 5], normal: [1, 0, 0] },
  { indices: [0, 4, 6, 2], normal: [-1, 0, 0] },
  { indices: [2, 6, 7, 3], normal: [0, 1, 0] },
  { indices: [0, 1, 5, 4], normal: [0, -1, 0] },
  { indices: [4, 5, 7, 6], normal: [0, 0, 1] },
  { indices: [0, 2, 3, 1], normal: [0, 0, -1] }
];

const CUBELET_CORNERS = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [-0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5]
];

export {
  CubeColor, CubeRotation, Cubelet,
  DEGTORAD, LIGHT_DIR, AMBIENT_LIGHT,
  DIFFUSE_LIGHT, CUBELET_SIZE,
  CUBELET_GAP, CUBE_SIZE, TURN_DURATION,
  TURN_INTERVAL, FACE_DIRECTIONS, FACE_COLORS,
  FACE_AXES, FACE_ANGLES, CUBELET_FACES,
  CUBELET_CORNERS
}