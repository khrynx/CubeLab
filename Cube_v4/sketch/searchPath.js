// render({ status: 'idle'|'active'|'already-solved'|'error', moves, phase1Length, index, startFacelets, solvedFacelets, error })

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, String(value));
  }
  return element;
}

function createSearchPath(containerEl) {
  const visual = containerEl?.querySelector('[data-role="visual"]');
  const stageTag = containerEl?.querySelector('[data-role="stage-tag"]');
  const statusText = containerEl?.querySelector('[data-role="status"]');
  let cachedKey = null;
  let svg = null;
  let nodes = [];
  let stage1Trail = null;
  let stage2Trail = null;
  let marker = null;
  let stage1Label = null;
  let stage2Label = null;
  let previousIndex = -1;

  function setStage(text, isStage2 = false) {
    if (!stageTag) return;
    stageTag.textContent = text;
    stageTag.className = `solver-path-stage${isStage2 ? ' stage-2-lit' : ''}`;
  }

  function emptyView(status, error) {
    visual.replaceChildren();
    svg = svgElement('svg', {
      viewBox: '0 0 640 220',
      class: 'solver-path-svg',
      role: 'img',
      'aria-label': status === 'error' ? 'Solver error' : 'Search path is idle'
    });
    const message = svgElement('text', {
      x: 320,
      y: 112,
      'text-anchor': 'middle',
      class: 'solver-path-empty-text'
    });
    message.textContent = status === 'error' ? (error || 'Solver failed.') : 'Press Solve to see the path';
    svg.appendChild(message);
    visual.replaceChildren(svg);
    setStage(status === 'error' ? 'ERROR' : 'STAGE 1');
    if (statusText) statusText.textContent = message.textContent;
    cachedKey = status === 'error' ? `error:${message.textContent}` : 'idle';
    previousIndex = -1;
  }

  function buildTree(solutionKey, moves, phase1Length) {
    const total = moves.length;
    const gate = Math.max(0, Math.min(total, Number.isInteger(phase1Length) ? phase1Length : Math.ceil(total / 2)));
    const left = 28;
    const right = 612;
    const centerY = 112;
    const random = seededRandom(hashString(solutionKey));
    nodes = Array.from({ length: total + 1 }, (_, index) => {
      const ratio = total === 0 ? 0 : index / total;
      return {
        x: left + (right - left) * ratio,
        y: centerY + Math.sin(index * 1.31 + hashString(solutionKey) % 17) * 23
      };
    });

    visual.replaceChildren();
    svg = svgElement('svg', {
      viewBox: '0 0 640 220',
      class: 'solver-path-svg',
      role: 'img',
      'aria-label': 'Two-phase search tree'
    });

    const branches = svgElement('g', { 'data-layer': 'branches', 'aria-hidden': 'true' });
    for (let index = 0; index < total; index += 1) {
      const start = nodes[index];
      const next = nodes[index + 1];
      for (let branch = 0; branch < 2; branch += 1) {
        const branchX = Math.min(start.x + 28 + random() * 38, next.x - 6);
        const branchY = start.y + (random() < 0.5 ? -1 : 1) * (30 + random() * 27);
        const controlX = (start.x + branchX) / 2;
        const path = svgElement('path', {
          d: `M ${start.x} ${start.y} Q ${controlX} ${branchY} ${branchX} ${branchY}`,
          class: index < gate ? 'solver-path-decoy stage1' : 'solver-path-decoy stage2'
        });
        const leaf = svgElement('text', {
          x: Math.min(630, branchX + 8),
          y: branchY + 4,
          class: 'solver-path-decoy-end',
          'text-anchor': 'middle'
        });
        leaf.textContent = '×';
        branches.append(path, leaf);
      }
    }
    svg.appendChild(branches);

    const gateNode = nodes[gate];
    svg.appendChild(svgElement('line', {
      x1: gateNode.x,
      x2: gateNode.x,
      y1: 24,
      y2: 194,
      class: 'solver-path-divider',
      'data-role': 'gate'
    }));

    stage1Label = svgElement('text', {
      x: gate === 0 ? 54 : Math.max(56, gateNode.x / 2),
      y: 20,
      class: 'solver-path-stage-label solver-path-stage-label-left',
      'text-anchor': 'middle'
    });
    stage1Label.textContent = 'Stage 1';
    stage2Label = svgElement('text', {
      x: gate === total ? 586 : (gateNode.x + right) / 2,
      y: 20,
      class: 'solver-path-stage-label solver-path-stage-label-right',
      'text-anchor': 'middle'
    });
    stage2Label.textContent = 'Stage 2';
    svg.append(stage1Label, stage2Label);

    const stage1Points = nodes.slice(0, gate + 1);
    const stage2Points = nodes.slice(gate);
    if (stage1Points.length > 1) {
      svg.appendChild(svgElement('polyline', {
        points: stage1Points.map(point => `${point.x},${point.y}`).join(' '),
        class: 'solver-path-spine stage1'
      }));
    }
    if (stage2Points.length > 1) {
      svg.appendChild(svgElement('polyline', {
        points: stage2Points.map(point => `${point.x},${point.y}`).join(' '),
        class: 'solver-path-spine stage2'
      }));
    }

    nodes.forEach((point, index) => {
      const isGate = index === gate;
      const stage2 = gate === 0 || index > gate;
      svg.appendChild(svgElement('circle', {
        cx: point.x,
        cy: point.y,
        r: isGate ? 6 : 4.5,
        class: `solver-path-node${isGate ? ' gate' : ''}${stage2 ? ' stage2' : ' stage1'}`,
        'data-index': index
      }));
    });

    stage1Trail = svgElement('polyline', { class: 'solver-path-trail stage1', points: '' });
    stage2Trail = svgElement('polyline', { class: 'solver-path-trail stage2', points: '' });
    marker = svgElement('circle', { r: 7, class: 'solver-path-marker', 'data-role': 'marker' });
    svg.append(stage1Trail, stage2Trail, marker);
    visual.replaceChildren(svg);
  }

  function updateTree(status, moves, phase1Length, index) {
    const total = moves.length;
    const gate = Math.max(0, Math.min(total, Number.isInteger(phase1Length) ? phase1Length : Math.ceil(total / 2)));
    const safeIndex = Math.max(0, Math.min(total, Number.isFinite(index) ? index : 0));
    const stage2 = gate === 0 || safeIndex > gate;
    const position = nodes[safeIndex] || nodes[0];
    const stage1Played = nodes.slice(0, Math.min(safeIndex, gate) + 1);
    const stage2Played = safeIndex >= gate ? nodes.slice(gate, safeIndex + 1) : [];

    stage1Trail.setAttribute('points', stage1Played.map(point => `${point.x},${point.y}`).join(' '));
    stage2Trail.setAttribute('points', stage2Played.map(point => `${point.x},${point.y}`).join(' '));
    marker.setAttribute('cx', String(position.x));
    marker.setAttribute('cy', String(position.y));
    marker.setAttribute('class', `solver-path-marker${stage2 ? ' stage2' : ' stage1'}`);
    stage1Label.classList.toggle('active', !stage2);
    stage2Label.classList.toggle('active', stage2);

    if (status === 'already-solved') {
      setStage('SOLVED');
      if (statusText) statusText.textContent = 'Already solved, nothing to trace';
    } else {
      setStage(stage2 ? 'STAGE 2' : 'STAGE 1', stage2);
      if (statusText) statusText.textContent = `Move ${safeIndex} / ${total} · ${stage2 ? 'Stage 2' : 'Stage 1'}`;
    }

    if (phase1Length > 0 && phase1Length < total && previousIndex === gate && safeIndex === gate + 1
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const gateLine = svg.querySelector('[data-role="gate"]');
      if (gateLine) gateLine.animate([
        { opacity: 0.45, filter: 'brightness(1)' },
        { opacity: 1, filter: 'brightness(1.8)' },
        { opacity: 1, filter: 'brightness(1)' }
      ], { duration: 600, easing: 'ease-out' });
    }
    previousIndex = safeIndex;
  }

  function render({
    status = 'idle',
    moves = [],
    phase1Length = null,
    index = 0,
    startFacelets = '',
    solvedFacelets = '',
    error = ''
  } = {}) {
    if (!visual) return;
    if (status === 'idle' || status === 'error') {
      const key = status === 'error' ? `error:${error}` : 'idle';
      if (key !== cachedKey) emptyView(status, error);
      return;
    }

    const solutionKey = `${moves.join(' ')}|${startFacelets}|${solvedFacelets}|${phase1Length}`;
    if (solutionKey !== cachedKey) {
      cachedKey = solutionKey;
      previousIndex = -1;
      buildTree(solutionKey, moves, phase1Length);
    }
    updateTree(status, moves, phase1Length, index);
  }

  render({ status: 'idle' });
  return { render };
}

export { createSearchPath };
