import {
  CubeRotation, Cubelet,
  DEGTORAD, LIGHT_DIR, AMBIENT_LIGHT,
  DIFFUSE_LIGHT, CUBELET_SIZE, CUBE_SIZE,
  FACE_DIRECTIONS, FACE_COLORS, CUBELET_FACES, CUBELET_CORNERS
} from './dataStore.js';

import { subtractVectors, crossProduct, dotProduct, normaliseVector, directionKey } from './vector.js';

let cubelets = [];
let activeTurn = null;
let moveQueue = [];
let moveHistory = [];
let initialized = false;

const TURN_DURATION = 240;
const MOVE_TURNS = {
  R: { axis: [1, 0, 0], axisIndex: 0, layer: 1, angle: -Math.PI / 2 },
  L: { axis: [1, 0, 0], axisIndex: 0, layer: -1, angle: Math.PI / 2 },
  U: { axis: [0, 1, 0], axisIndex: 1, layer: 1, angle: -Math.PI / 2 },
  D: { axis: [0, 1, 0], axisIndex: 1, layer: -1, angle: Math.PI / 2 },
  F: { axis: [0, 0, 1], axisIndex: 2, layer: 1, angle: -Math.PI / 2 },
  B: { axis: [0, 0, 1], axisIndex: 2, layer: -1, angle: Math.PI / 2 }
};

function initializeCube() {
  cubelets = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubelets.push(new Cubelet(x, y, z));
      }
    }
  }
  activeTurn = null;
  initialized = true;
}

function drawAll() {
  if (!initialized) initializeCube();
  const t = frameCount * 0.8;
  drawCube(new CubeRotation(t, t * 0.7, t * 0.4));
  updateCubeStatus();
}

function drawCube(rotation) {
  const turnAngle = animateQueuedTurn();
  push();
  rotateX(rotation.alpha * DEGTORAD);
  rotateY(rotation.beta * DEGTORAD);
  rotateZ(rotation.gamma * DEGTORAD);

  for (const cubelet of cubelets) {
    const turning = activeTurn && cubelet.position[activeTurn.axisIndex] === activeTurn.layer;
    drawCubelet(cubelet, turning ? turnAngle : 0, activeTurn ? activeTurn.axis : [0, 0, 0]);
  }
  pop();
}

function animateQueuedTurn() {
  const now = millis();
  if (!activeTurn && moveQueue.length) {
    const move = moveQueue.shift();
    const turn = MOVE_TURNS[move[0]];
    const modifier = move.endsWith('2') ? 2 : move.endsWith("'") ? -1 : 1;
    activeTurn = {
      ...turn,
      angle: turn.angle * modifier,
      startTime: now
    };
  }

  if (!activeTurn) return 0;
  const progress = Math.min(1, (now - activeTurn.startTime) / TURN_DURATION);
  const eased = progress * progress * (3 - 2 * progress);
  const turnAngle = activeTurn.angle * eased;
  if (progress >= 1) {
    completeTurn();
    activeTurn = null;
    return 0;
  }
  return turnAngle;
}

function completeTurn() {
  const { axis, layer, angle, axisIndex } = activeTurn;
  for (const cubelet of cubelets) {
    if (cubelet.position[axisIndex] !== layer) continue;
    cubelet.position = rotateQuarter(cubelet.position, axis, angle);
    const rotatedStickers = {};
    for (const [key, color] of Object.entries(cubelet.stickers)) {
      const direction = key.split(',').map(Number);
      const rotatedDirection = rotateQuarter(direction, axis, angle);
      rotatedStickers[directionKey(...rotatedDirection)] = color;
    }
    cubelet.stickers = rotatedStickers;
  }
}

function drawCubelet(cubelet, turnAngle, turnAxis) {
  const center = cubelet.position.map(n => n * CUBE_SIZE);
  const corners = CUBELET_CORNERS.map(([x, y, z]) => {
    let point = [
      center[0] + x * CUBELET_SIZE,
      center[1] + y * CUBELET_SIZE,
      center[2] + z * CUBELET_SIZE
    ];
    if (turnAngle !== 0) point = rotateAroundAxis(point, turnAxis, turnAngle);
    return point;
  });

  noStroke();
  for (const face of CUBELET_FACES) {
    const [nx, ny, nz] = face.normal;
    const color = cubelet.stickers[directionKey(nx, ny, nz)];
    if (!color) continue;
    const v0 = corners[face.indices[0]];
    const v1 = corners[face.indices[1]];
    const v2 = corners[face.indices[2]];
    const normal = normaliseVector(crossProduct(subtractVectors(v1, v0), subtractVectors(v2, v0)));
    const diffuse = Math.max(0, dotProduct(normal, LIGHT_DIR));
    const intensity = Math.min(1, AMBIENT_LIGHT + DIFFUSE_LIGHT * diffuse);
    fill(color.r * intensity, color.g * intensity, color.b * intensity);
    beginShape();
    for (const index of face.indices) vertex(...corners[index]);
    endShape(CLOSE);
  }
}

function rotateQuarter(vector, axis, angle) {
  return rotateAroundAxis(vector, axis, angle).map(n => Math.round(n));
}

function rotateAroundAxis([x, y, z], [ax, ay, az], angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const dot = x * ax + y * ay + z * az;
  const cross = [ay * z - az * y, az * x - ax * z, ax * y - ay * x];
  return [
    x * c + cross[0] * s + ax * dot * (1 - c),
    y * c + cross[1] * s + ay * dot * (1 - c),
    z * c + cross[2] * s + az * dot * (1 - c)
  ];
}

function enqueueMoves(moves) {
  moveQueue.push(...moves);
  moveHistory.push(...moves);
}

function resetCube() {
  initializeCube();
  moveQueue = [];
  moveHistory = [];
  updateCubeStatus();
}

function scrambleCube() {
  resetCube();
  const faces = Object.keys(MOVE_TURNS);
  const scramble = [];
  while (scramble.length < 20) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    if (scramble.length && scramble[scramble.length - 1][0] === face) continue;
    const suffix = ['', "'", '2'][Math.floor(Math.random() * 3)];
    scramble.push(`${face}${suffix}`);
  }
  enqueueMoves(scramble);
  return scramble;
}

function solveByReversingHistory() {
  const solution = moveHistory.slice().reverse().map(invertMove);
  moveHistory = [];
  enqueueMoves(solution);
  return solution;
}

function invertMove(move) {
  if (move.endsWith('2')) return move;
  return move.endsWith("'") ? move[0] : `${move[0]}'`;
}

function isSolved() {
  return cubelets.every(cubelet => Object.entries(cubelet.stickers).every(([key, color]) => {
    const faceIndex = FACE_DIRECTIONS.findIndex(direction => directionKey(...direction) === key);
    const expected = FACE_COLORS[faceIndex];
    return expected && color.r === expected.r && color.g === expected.g && color.b === expected.b;
  }));
}

function updateCubeStatus() {
  const count = document.getElementById('move-count');
  const status = document.getElementById('cube-status');
  const solveButton = document.getElementById('solve-cube');
  if (count) count.textContent = String(moveHistory.length);
  if (status) status.textContent = activeTurn || moveQueue.length ? 'IN MOTION' : isSolved() ? 'SOLVED' : 'SCRAMBLED';
  if (solveButton) solveButton.disabled = moveHistory.length === 0 || Boolean(activeTurn || moveQueue.length);
}

function parseMoveSequence(sequence) {
  const moves = sequence.trim().split(/\s+/).filter(Boolean);
  if (!moves.length || moves.some(move => !/^[RLUDFB](?:2|')?$/.test(move))) {
    throw new Error("Enter moves like R U R' U' F2, using only R L U D F B.");
  }
  return moves;
}

export { drawAll, enqueueMoves, resetCube, scrambleCube, solveByReversingHistory, parseMoveSequence };
