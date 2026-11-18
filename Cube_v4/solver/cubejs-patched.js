const Cube = require('./cubejs/cube');
require('./cubejs/solve');

let solverInitialized = false;

function permutationParity(permutation) {
  let parity = 0;
  for (let i = 0; i < permutation.length; i += 1) {
    for (let j = i + 1; j < permutation.length; j += 1) {
      if (permutation[i] > permutation[j]) parity ^= 1;
    }
  }
  return parity;
}

function validateCube(facelets, cube) {
  if (cube.asString() !== facelets) {
    throw new Error('Invalid cube facelet state: the facelets do not form recognizable cubies.');
  }
  const counts = new Map(Array.from('URFDLB', face => [face, 0]));
  for (const face of facelets) counts.set(face, counts.get(face) + 1);
  if ([...counts.values()].some(count => count !== 9)) {
    throw new Error('Invalid cube facelet state: each face color must appear exactly nine times.');
  }
  if (!cube.center.every((center, index) => center === index)) {
    throw new Error('Invalid cube facelet state: face centers must remain in standard order.');
  }
  const validPermutation = (values, size) => values.length === size
    && values.every(value => Number.isInteger(value) && value >= 0 && value < size)
    && new Set(values).size === size;
  if (!validPermutation(cube.cp, 8) || !validPermutation(cube.ep, 12)) {
    throw new Error('Invalid cube facelet state: cubies must form a complete permutation.');
  }
  if (cube.co.some(value => value < 0 || value > 2) || cube.co.reduce((sum, value) => sum + value, 0) % 3 !== 0) {
    throw new Error('Invalid cube facelet state: corner orientations are not reachable.');
  }
  if (cube.eo.some(value => value < 0 || value > 1) || cube.eo.reduce((sum, value) => sum + value, 0) % 2 !== 0) {
    throw new Error('Invalid cube facelet state: edge orientations are not reachable.');
  }
  if (permutationParity(cube.cp) !== permutationParity(cube.ep)) {
    throw new Error('Invalid cube facelet state: corner and edge permutation parity must match.');
  }
}

function initSolver() {
  if (solverInitialized) return;
  Cube.initSolver();
  solverInitialized = true;
}

function solveFaceletsDetailed(facelets, maxDepth = 22) {
  if (typeof facelets !== 'string' || facelets.length !== 54) {
    throw new TypeError('A cube facelet string must contain exactly 54 characters.');
  }
  if (!Number.isInteger(maxDepth) || maxDepth < 0) {
    throw new RangeError('The solver depth limit must be a non-negative integer.');
  }
  if (!/^[URFDLB]+$/.test(facelets)) {
    throw new TypeError('Facelet strings may only contain the six cube face letters U, R, F, D, L, and B.');
  }

  const parsed = Cube.fromString(facelets);
  validateCube(facelets, parsed);
  if (parsed.isSolved()) {
    return { ok: true, solution: '', phase1Length: 0, phase2Length: 0, totalMoves: 0 };
  }

  const detail = { solution: '', phase1Length: null, phase2Length: 0, totalMoves: 0 };
  const solution = parsed.solveUpright(maxDepth, detail);
  const finalSolution = typeof solution === 'string' ? solution.trim() : '';

  detail.totalMoves = finalSolution ? finalSolution.split(/\s+/).filter(Boolean).length : 0;
  detail.phase2Length = Math.max(0, detail.totalMoves - (detail.phase1Length ?? 0));

  if (!finalSolution) {
    return {
      ok: false,
      solution: '',
      error: `No solution within depth ${maxDepth}`,
      phase1Length: null,
      phase2Length: 0,
      totalMoves: 0
    };
  }

  return {
    ok: true,
    solution: finalSolution,
    phase1Length: detail.phase1Length ?? 0,
    phase2Length: detail.phase2Length,
    totalMoves: detail.totalMoves
  };
}

module.exports = { Cube, initSolver, solveFaceletsDetailed };
