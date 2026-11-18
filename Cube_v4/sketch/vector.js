function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function crossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dotProduct(a, b) {
  return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}

function normaliseVector(v) {
  const length = Math.hypot(...v);

  return length === 0 ? [0, 0, 0] : v.map(n => n / length);
}

function directionKey(x, y, z) {
  return `${x},${y},${z}`;
}

export { subtractVectors, crossProduct, dotProduct, normaliseVector, directionKey }