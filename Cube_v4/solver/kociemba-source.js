const { initSolver, solveFaceletsDetailed } = require('./cubejs-patched');

function solveFacelets(facelets, maxDepth = 22) {
  if (typeof facelets !== 'string' || facelets.length !== 54) {
    throw new TypeError('A cube facelet string must contain exactly 54 characters.');
  }
  if (!/^[URFDLB]+$/.test(facelets)) {
    throw new TypeError('Facelet strings may only contain the six cube face letters U, R, F, D, L, and B.');
  }
  const result = solveFaceletsDetailed(facelets, maxDepth);
  if (!result.ok) {
    throw new Error(result.error);
  }
  if (typeof result.solution !== 'string') {
    throw new Error('Solver did not return a valid move string.');
  }
  return result.solution.trim();
}

if (typeof window !== 'undefined') {
  window.KociembaAdapter = { initSolver, solveFacelets, solveFaceletsDetailed };
}

module.exports = { initSolver, solveFacelets, solveFaceletsDetailed };
