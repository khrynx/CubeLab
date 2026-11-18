import { createSearchPath } from './searchPath.js';

const standardScramble = ['R', 'U', 'F'];
const kociembaScramble = ['R2', "F'", "R'", "U'"];
const faceColors = {
  '0,1,0': { name: 'U', color: '#f3f0e8' },
  '0,-1,0': { name: 'D', color: '#f1d747' },
  '0,0,1': { name: 'F', color: '#48bd79' },
  '0,0,-1': { name: 'B', color: '#568be0' },
  '1,0,0': { name: 'R', color: '#ec574d' },
  '-1,0,0': { name: 'L', color: '#f09a49' }
};

const nodes = [
  { id: 'S', x: 65, y: 160, state: 'start' },
  { id: 'A', x: 205, y: 72 },
  { id: 'B', x: 205, y: 248 },
  { id: 'C', x: 370, y: 58 },
  { id: 'D', x: 370, y: 132 },
  { id: 'E', x: 370, y: 238 },
  { id: 'F', x: 535, y: 248 },
  { id: 'T', x: 535, y: 58, state: 'goal' }
];

const edges = [
  { from: 'S', to: 'A', move: "F'" },
  { from: 'S', to: 'B', move: "R'" },
  { from: 'A', to: 'C', move: "U'" },
  { from: 'A', to: 'D', move: "R'" },
  { from: 'B', to: 'E', move: "U'" },
  { from: 'B', to: 'F', move: 'U' },
  { from: 'C', to: 'T', move: "R'" }
];

const algorithms = {
  bfs: {
    title: 'BREADTH-FIRST SEARCH / UNINFORMED',
    caption: 'BFS checks every state 1 move away, then every state 2 moves away, in layers.',
    stateMap: { S: [], A: ["F'"], B: ["R'"], C: ["F'", "U'"], D: ["F'", "R'"], E: ["R'", "U'"], F: ["R'", 'U'], T: ["F'", "U'", "R'"] },
    steps: [
      { phase: 'START WITH A CUBE STATE', title: 'Encode the scramble as the start node S.', description: 'This cube is the result of R U F from solved. The search stores a state and its legal neighboring turns—not a list of sticker pictures.', dataLabel: 'CURRENT CUBE STATE', data: 'Scramble: R U F  ·  distance to goal: 3 turns', cubeMoves: [], queue: ['S'], current: 'S' },
      { phase: 'INITIALIZE THE QUEUE', title: 'Put S in first-in, first-out order.', description: 'The queue is the frontier: states discovered but not expanded yet. A parent map will later remember how each state was reached.', dataLabel: 'QUEUE / FRONT → BACK', data: '[ S ]', cubeMoves: [], queue: ['S'], current: 'S' },
      { phase: 'EXPAND DEPTH 0', title: 'Try each legal next turn from S.', description: 'This teaching graph shows two candidate turns: F′ leads to A, while R′ leads to B. Both become depth-1 candidates and go to the back of the queue.', dataLabel: 'QUEUE AFTER EXPANDING S', data: '[ A: F′ ] → [ B: R′ ]', cubeMoves: [], queue: ['A', 'B'], frontier: ['A', 'B'], visited: ['S'], current: 'S', discoveredEdges: ['S-A', 'S-B'] },
      { phase: 'EXPAND DEPTH 1', title: 'Expand A; keep the next layer behind B.', description: 'A is the state after F′. Its candidates C and D are 2 turns from the start, so they are placed behind B, which is still only 1 turn away.', dataLabel: 'FIFO ORDER', data: '[ B ] → [ C: U′ ] → [ D: R′ ]', cubeMoves: ["F'"], queue: ['B', 'C', 'D'], frontier: ['B', 'C', 'D'], visited: ['S', 'A'], current: 'A', discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D'] },
      { phase: 'FINISH DEPTH 1', title: 'Expand B before any depth-2 state.', description: 'B is still closer to S than C and D. BFS expands B next and adds its unseen neighbors E and F to the queue.', dataLabel: 'QUEUE AFTER EXPANDING B', data: '[ C ] → [ D ] → [ E ] → [ F ]', cubeMoves: ["R'"], queue: ['C', 'D', 'E', 'F'], frontier: ['C', 'D', 'E', 'F'], visited: ['S', 'A', 'B'], current: 'B', discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'B-E', 'B-F'] },
      { phase: 'EXPAND DEPTH 2', title: 'From C, discover the solved cube T.', description: 'C represents applying F′ then U′ to the scramble. A final R′ solves it. Since every shallower layer was considered first, this first goal path is shortest in this teaching graph.', dataLabel: 'NEW GOAL STATE', data: 'C -- R′ --> T  ·  total depth = 3', cubeMoves: ["F'", "U'"], queue: ['D', 'E', 'F', 'T'], frontier: ['D', 'E', 'F', 'T'], visited: ['S', 'A', 'B', 'C'], current: 'C', discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'B-E', 'B-F', 'C-T'] },
      { phase: 'STOP AT THE GOAL', title: 'Remove T from the queue and stop.', description: 'T was queued behind D, E, and F, so BFS expands those depth-2 leaves first. It then dequeues T and stops; parent links give T ← C ← A ← S, the route from this scramble.', dataLabel: 'PARENT LINKS', data: 'T ← C ← A ← S', cubeMoves: ["F'", "U'", "R'"], queue: [], frontier: [], visited: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'T'], path: ['S', 'A', 'C', 'T'], current: 'T', discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'B-E', 'B-F', 'C-T'] },
      { phase: 'RECONSTRUCT THE SOLUTION', title: 'Read the cube turns along the path.', description: 'The sequence F′ U′ R′ exactly reverses the R U F scramble. Apply those turns to the cube net: each sticker returns to its solved face.', dataLabel: 'SHORTEST ROUTE IN THIS EXAMPLE', data: 'F′ → U′ → R′  ·  3 turns', cubeMoves: ["F'", "U'", "R'"], queue: [], visited: ['S', 'A', 'B', 'C', 'T'], path: ['S', 'A', 'C', 'T'], current: 'T', discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'B-E', 'B-F', 'C-T'] },
      { phase: 'WHAT BFS COSTS', title: 'To find a deeper answer, it keeps widening.', description: 'BFS is complete and optimal when every turn has equal cost. But it must retain a huge frontier. For the real cube, broad layers become unaffordable very quickly.', dataLabel: 'CUBE-SCALE TRADE-OFF', data: 'Shortest path guarantee  ·  exponential frontier and memory', cubeMoves: ["F'", "U'", "R'"], queue: [], visited: ['S', 'A', 'B', 'C', 'T'], path: ['S', 'A', 'C', 'T'], current: 'T', discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'B-E', 'B-F', 'C-T'] }
    ]
  },
  astar: {
    title: 'A* SEARCH / HEURISTIC-GUIDED',
    caption: 'A* chooses the open cube state with the lowest f = g + h score.',
    stateMap: { S: [], A: ["F'"], B: ["R'"], C: ["F'", "U'"], D: ["F'", "R'"], E: ["R'", "U'"], F: ["R'", 'U'], T: ["F'", "U'", "R'"] },
    steps: [
      { phase: 'SCORE THE SCRAMBLED CUBE', title: 'For S, add cost-so-far g and estimate h.', description: 'g counts turns already taken. h estimates turns still needed. Here h is a small teaching estimate, not a real Korf pattern database lookup.', dataLabel: 'START STATE SCORE', data: 'S: g=0 + h=2 → f=2', cubeMoves: [], current: 'S', scores: { S: 'g0 h2 f2' }, openSet: [{ id: 'S', g: 0, h: 2, f: 2 }] },
      { phase: 'EXPAND LOWEST f', title: 'Expand S and score its neighboring cube states.', description: 'After F′, state A has g=1 and estimate h=2. After R′, state B has g=1 and estimate h=3. A has the lower total score.', dataLabel: 'OPEN SET / SORTED BY f', data: 'A: 1+2=3  ·  B: 1+3=4', cubeMoves: [], visited: ['S'], current: 'S', scores: { A: 'g1 h2 f3', B: 'g1 h3 f4' }, discoveredEdges: ['S-A', 'S-B'], openSet: [{ id: 'A', g: 1, h: 2, f: 3 }, { id: 'B', g: 1, h: 3, f: 4 }] },
      { phase: 'CHOOSE A', title: 'A* removes A because f=3 is smallest.', description: 'The cube state A is the scramble after F′. Its remaining estimate is lower than B’s, so A comes out of the priority queue first.', dataLabel: 'NEXT STATE TO EXPAND', data: 'A / cube after F′  ·  g=1, h=2, f=3', cubeMoves: ["F'"], queue: ['B'], visited: ['S', 'A'], current: 'A', scores: { B: 'g1 h3 f4' }, discoveredEdges: ['S-A', 'S-B'], openSet: [{ id: 'B', g: 1, h: 3, f: 4 }] },
      { phase: 'UPDATE THE OPEN SET', title: 'Expand A and insert C and D by score.', description: 'U′ from A reaches C: g=2, h=1, f=3. R′ reaches D: g=2, h=3, f=5. The queue re-sorts; C is now next.', dataLabel: 'PRIORITY QUEUE / LOWEST f FIRST', data: 'C: f=3  ·  B: f=4  ·  D: f=5', cubeMoves: ["F'"], queue: ['C', 'B', 'D'], visited: ['S', 'A'], current: 'A', scores: { B: 'g1 h3 f4', C: 'g2 h1 f3', D: 'g2 h3 f5' }, discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D'], openSet: [{ id: 'C', g: 2, h: 1, f: 3 }, { id: 'B', g: 1, h: 3, f: 4 }, { id: 'D', g: 2, h: 3, f: 5 }] },
      { phase: 'FOLLOW THE LOWEST ESTIMATE', title: 'Choose C; it is the cube after F′ U′.', description: 'C has the best estimated total. The actual facelet net is now one turn from solved: R′ restores the final layer.', dataLabel: 'CURRENT BEST CANDIDATE', data: 'C: g=2 + h=1 → f=3', cubeMoves: ["F'", "U'"], queue: ['B', 'D'], visited: ['S', 'A', 'C'], current: 'C', scores: { B: 'g1 h3 f4', D: 'g2 h3 f5' }, discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D'], openSet: [{ id: 'B', g: 1, h: 3, f: 4 }, { id: 'D', g: 2, h: 3, f: 5 }] },
      { phase: 'FIND THE GOAL NEIGHBOR', title: 'Expanding C adds solved state T.', description: 'R′ reaches T. The goal has h=0, so its total score is just the cost already paid: g=3. It moves to the front of the open set.', dataLabel: 'UPDATED PRIORITY QUEUE', data: 'T: f=3  ·  B: f=4  ·  D: f=5', cubeMoves: ["F'", "U'"], queue: ['T', 'B', 'D'], visited: ['S', 'A', 'C'], current: 'C', scores: { T: 'g3 h0 f3', B: 'g1 h3 f4', D: 'g2 h3 f5' }, discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'C-T'], openSet: [{ id: 'T', g: 3, h: 0, f: 3 }, { id: 'B', g: 1, h: 3, f: 4 }, { id: 'D', g: 2, h: 3, f: 5 }] },
      { phase: 'SELECT THE GOAL', title: 'T wins because its f score is lowest.', description: 'A* removes T from the queue. With an admissible heuristic and standard conditions, the route found this way is optimal for the chosen move cost.', dataLabel: 'GOAL SELECTED', data: 'T: g=3 + h=0 → f=3', cubeMoves: ["F'", "U'", "R'"], queue: ['B', 'D'], visited: ['S', 'A', 'C'], path: ['S', 'A', 'C', 'T'], current: 'T', scores: { B: 'g1 h3 f4', D: 'g2 h3 f5' }, discoveredEdges: ['S-A', 'S-B', 'A-C', 'A-D', 'C-T'], openSet: [{ id: 'B', g: 1, h: 3, f: 4 }, { id: 'D', g: 2, h: 3, f: 5 }] },
      { phase: 'READ THE CUBE SOLUTION', title: 'The selected path is three face turns.', description: 'Read the moves on the path, then verify them on the facelet net. The cube is solved because these moves undo R U F.', dataLabel: 'SOLUTION', data: 'F′ → U′ → R′  ·  scramble distance 3', cubeMoves: ["F'", "U'", "R'"], queue: [], visited: ['S', 'A', 'C', 'T'], path: ['S', 'A', 'C', 'T'], current: 'T', openSet: [] },
      { phase: 'WHY THE HEURISTIC MATTERS', title: 'Better lower bounds focus the search.', description: 'If h never overestimates the true remaining cost, A* can keep its optimality guarantee. A stronger h can reduce exploration, but A* still stores its open set.', dataLabel: 'CUBE-SCALE TRADE-OFF', data: 'Spend memory on many candidates  ·  save time with a useful h', cubeMoves: ["F'", "U'", "R'"], queue: [], visited: ['S', 'A', 'C', 'T'], path: ['S', 'A', 'C', 'T'], current: 'T', openSet: [] }
    ]
  },
  idastar: {
    title: 'KORF’S IDA* / PATTERN DATABASES',
    caption: 'IDA* keeps one path, pruning cube states when g+h exceeds the current limit.',
    stateMap: { S: [], A: ["F'"], B: ["R'"], C: ["F'", "U'"], D: ["F'", "R'"], E: ["R'", "U'"], F: ["R'", 'U'], T: ["F'", "U'", "R'"] },
    steps: [
      { phase: 'BUILD A USEFUL h', title: 'Look up a smaller pattern of cube pieces.', description: 'Korf’s pattern database tracks selected pieces in an abstract cube and stores their exact distances to the abstract goal. The lookup is a lower bound for the full cube. The small h values in this walkthrough are illustrative, not computed from a real database.', dataLabel: 'PATTERN DATABASE → HEURISTIC', data: 'abstract piece pattern → stored distance h(S)=2', cubeMoves: [], treeState: 0, threshold: 2, scores: { S: 'h=2' }, current: 'S' },
      { phase: 'FIRST f-LIMIT = 2', title: 'Begin depth-first search at the scramble.', description: 'At S, g=0 moves have been made and h=2 moves are estimated to remain. Since f=g+h=2 fits the limit, this path can be explored.', dataLabel: 'CURRENT PATH', data: 'S  ·  g=0 + h=2 → f=2 ≤ limit 2', cubeMoves: [], treeState: 1, threshold: 2, current: 'S', scores: { S: 'g0 h2 f2' } },
      { phase: 'TRY THE FIRST TURN', title: 'F′ reaches A, but A exceeds the limit.', description: 'The cube after F′ is A. Here g=1 and its illustrative pattern estimate h=2, so f=3. That is above 2: prune this branch and record 3 as an exceeded score.', dataLabel: 'BOUND CHECK AT A', data: 'A: g=1 + h=2 → f=3 > limit 2', cubeMoves: ["F'"], treeState: 2, threshold: 2, current: 'A', pruned: ['A'], scores: { A: 'g1 h2 f3' } },
      { phase: 'BACKTRACK AND TRY R′', title: 'The other first turn also exceeds 2.', description: 'Backtrack to S, then try R′. In this teaching example B has g=1, h=3, f=4, so this branch is cut too. No solution fits under limit 2.', dataLabel: 'SMALLEST EXCEEDED SCORE', data: 'A exceeded by 1  ·  B exceeded by 2  ·  next limit = 3', cubeMoves: ["R'"], treeState: 2, threshold: 2, current: 'B', pruned: ['A', 'B'], scores: { A: 'f=3', B: 'f=4' } },
      { phase: 'RAISE THE LIMIT', title: 'Restart from S with limit 3.', description: 'IDA* does not keep the whole frontier between rounds. It raises the limit to the smallest f that exceeded the previous bound, then starts a fresh depth-first pass.', dataLabel: 'ITERATION CHANGE', data: 'limit 2 → 3  ·  restart at S', cubeMoves: [], treeState: 4, threshold: 3, current: 'S', scores: { S: 'g0 h2 f2' } },
      { phase: 'FOLLOW F′', title: 'A now fits within the new limit.', description: 'On the new pass, A has f=3. It is no longer pruned, so depth-first search continues down this path instead of adding A to a global priority queue.', dataLabel: 'PATH STACK', data: 'S → A  ·  f(A)=3 ≤ limit 3', cubeMoves: ["F'"], treeState: 5, threshold: 3, current: 'A', scores: { A: 'g1 h2 f3' } },
      { phase: 'FOLLOW THE NEXT TURN', title: 'U′ reaches C, still within the bound.', description: 'C is the cube after F′ U′. Its cost is g=2 and estimate h=1, so f=3. The depth-first path stays under the limit.', dataLabel: 'PATH STACK', data: 'S → A → C  ·  g=2 + h=1 = 3', cubeMoves: ["F'", "U'"], treeState: 6, threshold: 3, current: 'C', scores: { A: 'f3', C: 'g2 h1 f3' } },
      { phase: 'REACH THE GOAL', title: 'R′ completes the solve at f=3.', description: 'One more turn reaches T. The threshold admits this solution. Because the estimates are admissible and limits rise in order, IDA* can find an optimal solution.', dataLabel: 'SOLUTION ON THIS PASS', data: 'F′ → U′ → R′  ·  goal reached at limit 3', cubeMoves: ["F'", "U'", "R'"], treeState: 7, threshold: 3, current: 'T', path: ['S', 'A', 'C', 'T'], scores: { T: 'goal' } },
      { phase: 'WHY KORF’S PATTERNS HELP', title: 'Store distances once; use them to prune many paths.', description: 'The pattern lookup and h values here are a teaching model, not a real precomputed cube database. Korf’s cube heuristics combine compatible patterns so stronger bounds can prune more while remaining admissible.', dataLabel: 'THE TRADE-OFF', data: 'precomputed pattern distances  ·  small live search memory', cubeMoves: ["F'", "U'", "R'"], treeState: 8, threshold: 3, current: 'T', path: ['S', 'A', 'C', 'T'] }
    ]
  },
  kociemba: {
    title: 'KOCIEMBA / TWO-PHASE CUBE SOLVER',
    caption: 'Blue explores toward subgroup G₁; pruning-table bounds cut side branches. Purple shows the restricted phase-two route.',
    steps: [
      { phase: 'START WITH A SCRAMBLE', title: 'Encode the cube: R2 F′ R′ U′.', description: 'This chosen example lets us see the two phases separately: phase one uses U R F to reach R2 in subgroup G₁. The cube is not solved yet.', dataLabel: 'CURRENT STATE', data: 'Scramble: R2 → F′ → R′ → U′', cubeMoves: [], phaseIndex: 0 },
      { phase: 'PHASE 1 / SEARCH', title: 'Search for the subgroup, not the solved cube.', description: 'The target conditions are: every corner oriented, every edge oriented, and the four middle-slice edges in their slice. Precomputed coordinates/tables guide phase-one search.', dataLabel: 'PHASE 1 TARGET', data: 'corner orientation = 0  ·  edge orientation = 0  ·  slice edges placed', cubeMoves: [], phaseIndex: 1 },
      { phase: 'PHASE 1 / FIRST TURN', title: 'Try U; the cube remains outside G₁.', description: 'Apply U to the facelet model. The orientation and slice conditions are not all satisfied yet, so search continues for a phase-one path.', dataLabel: 'PHASE 1 PATH SO FAR', data: 'U  ·  phase-one constraints not all met', cubeMoves: ['U'], phaseIndex: 1 },
      { phase: 'PHASE 1 / NEXT TURN', title: 'R still has not satisfied every condition.', description: 'Apply R. The cube is closer to the target subgroup, but a final phase-one turn is needed to meet all orientation and slice constraints.', dataLabel: 'PHASE 1 PATH SO FAR', data: 'U → R  ·  subgroup conditions not all met', cubeMoves: ['U', 'R'], phaseIndex: 1 },
      { phase: 'PHASE 1 / ENTER G₁', title: 'F reaches the subgroup state R2.', description: 'Apply F after U R. The resulting cube is R2: all phase-one constraints hold, but the cube is not solved yet.', dataLabel: 'SUBGROUP CHECK', data: 'U → R → F  ·  state R2  ·  in G₁, not solved', cubeMoves: ['U', 'R', 'F'], phaseIndex: 2 },
      { phase: 'THE G₁ HAND-OFF', title: 'Switch from phase-one moves to phase two.', description: 'G₁ is the set of cube states with the orientation and slice constraints already satisfied. The remaining problem is a permutation inside that subgroup.', dataLabel: 'WHAT CHANGED?', data: 'Orientation + slice: fixed  ·  pieces still need positioning', cubeMoves: ['U', 'R', 'F'], phaseIndex: 2 },
      { phase: 'PHASE 2 / RESTRICTED MOVES', title: 'Only use turns that keep the cube in G₁.', description: 'The phase-two move set uses U and D quarter/half turns plus half turns of R, L, F, and B. The net highlights the remaining R2 turn for this example.', dataLabel: 'PHASE 2 MOVE SET', data: 'U, U2, U′ · D, D2, D′ · R2, L2, F2, B2', cubeMoves: ['U', 'R', 'F'], phaseIndex: 3 },
      { phase: 'PHASE 2 / SOLVE', title: 'R2 solves the remaining cube.', description: 'Apply R2 to the intermediate cube. Because the state was R2, this allowed half-turn returns every piece to its solved position.', dataLabel: 'PHASE 2 PATH', data: 'R2  ·  state is now solved', cubeMoves: ['U', 'R', 'F', 'R2'], phaseIndex: 3 },
      { phase: 'JOIN THE PHASES', title: 'Concatenate both paths into one solution.', description: 'The solver joins phase 1 (U R F) with phase 2 (R2). A two-phase search is practical and fast, but it does not generally promise the globally shortest sequence.', dataLabel: 'SOLUTION FOR THIS EXAMPLE', data: 'U → R → F  |  R2  ·  phase 1 + phase 2', cubeMoves: ['U', 'R', 'F', 'R2'], phaseIndex: 4 },
      { phase: 'THE TRADE-OFF', title: 'Structure makes a huge search manageable.', description: 'Kociemba reduces the problem by choosing a subgroup and then restricting the legal move set. It often finds short solutions quickly, without proving global optimality.', dataLabel: 'WHY TWO PHASES?', data: 'Smaller structured searches  ·  fast practical solution  ·  not generally optimal', cubeMoves: ['U', 'R', 'F', 'R2'], phaseIndex: 4 }
    ]
  }
};

const representationCopy = {
  stickers: {
    kicker: 'FACELET REPRESENTATION',
    title: 'A state can be 54 sticker colours.',
    description: 'Lay the six faces flat. Each little square is a facelet; a state records the colour at all 54 positions. The centre facelets anchor the six faces.',
    readout: '<span>STATE ENCODING / FACELETS</span><code>U[0…8] · R[0…8] · F[0…8]<br>D[0…8] · L[0…8] · B[0…8]</code>'
  },
  pieces: {
    kicker: 'PIECE REPRESENTATION',
    title: 'Or track 20 movable cubies.',
    description: 'A solver can encode the 8 corners and 12 edges by their positions and orientations. A turn permutes pieces and changes their twist or flip.',
    readout: '<span>STATE ENCODING / CUBIES</span><code>8 corner positions + twists<br>12 edge positions + flips</code>'
  }
};

const algorithmInfo = {
  bfs: {
    name: 'Breadth-first search',
    summary: 'Explore every reachable state one move farther from the scramble before starting the next layer.',
    effect: 'It models each legal face turn as an edge to a new sticker/cubie arrangement, then returns the move sequence along the first shortest path to solved.',
    practical: 'Complete and shortest-path optimal when every turn has equal cost. It is useful for shallow examples, but an 18-move face-turn branching set makes the frontier and visited set grow too quickly for deep cube solves.',
    runtime: 'O(b^d), where b is the effective branching factor and d is the solution depth.',
    memory: 'O(b^d) for the frontier and visited/parent records.',
    history: 'Moore used breadth-first exploration to find paths through mazes in 1959; Lee’s 1961 wire-routing algorithm is another classic application. The same unweighted-graph idea became the natural shortest-path baseline for puzzle search.',
    correctness: 'FIFO order processes states by nondecreasing depth. Recording a state when it is first enqueued prevents duplicates; its first parent therefore gives a shortest path when each move has equal cost.',
    implementation: 'A FIFO queue holds the frontier. A visited/parent map both deduplicates cube states and reconstructs the solution; a practical solver hashes a compact cubie encoding rather than comparing pictures.',
    pseudocode: 'queue ← FIFO([start])\nparent[start] ← null\nwhile queue is not empty:\n  state ← queue.dequeue()\n  if isGoal(state):\n    return reconstructPath(parent, state)\n  for move in legalMoves(state):\n    next ← apply(state, move)\n    if next not in parent: // Mark when enqueued, not when removed.\n      parent[next] ← state // First discovery is via a shortest path.\n      queue.enqueue(next)\nreturn noSolution'
  },
  astar: {
    name: 'A* search',
    summary: 'Choose the open state with the smallest f = g + h: the cost already paid plus an estimate of the remaining cost.',
    effect: 'It scores candidate cube states and expands the one with the lowest estimated total solution length, rather than blindly exploring all states at the same depth.',
    practical: 'With an admissible heuristic and standard graph-search conditions, A* can return a shortest path for equal-cost moves. Useful estimates can reduce explored states, but A* still stores its open and explored sets; memory often becomes its limiting resource.',
    runtime: 'O(b^d) worst case; actual work depends strongly on the heuristic’s accuracy.',
    memory: 'O(b^d) worst case for the open and explored sets.',
    history: 'Hart, Nilsson, and Raphael presented A* in 1968. Their key idea combines the cost already paid with a heuristic lower bound on the remaining cost, making the method useful well beyond puzzles.',
    correctness: 'With nonnegative edge costs and an admissible heuristic, stopping when the goal is removed from the priority queue returns an optimal path. Improved paths must be allowed to reopen states if the heuristic is inconsistent.',
    implementation: 'Use a min-priority queue ordered by f, a best-known g score, and parent links. Queue entries made obsolete by a better g score are skipped; pattern databases are one way to compute useful cube heuristics.',
    pseudocode: 'open ← minPriorityQueue()\ng[start] ← 0\npush(open, start, priority=h(start))\nwhile open is not empty:\n  (state, queuedG) ← popMin(open)\n  if queuedG ≠ g[state]: continue // Ignore an obsolete queue entry.\n  if isGoal(state):\n    return reconstructPath(parent, state)\n  for move in legalMoves(state):\n    next ← apply(state, move)\n    tentativeG ← g[state] + cost(move)\n    if tentativeG < g.get(next, ∞):\n      parent[next] ← state\n      g[next] ← tentativeG // A better route can reopen next.\n      push(open, next, priority=tentativeG + h(next))\nreturn noSolution'
  },
  idastar: {
    name: 'Iterative-deepening A* (IDA*)',
    summary: 'Run depth-first searches under a rising f = g + h limit, pruning a path as soon as its score exceeds the current bound.',
    effect: 'It simulates one sequence of turns at a time, backtracks when the estimate is over the limit, and repeats with a larger bound until a solution is found.',
    practical: 'With an admissible heuristic, increasing bounds can find an optimal solution. It trades repeated work for low live-search memory; pattern databases take extra precomputed memory and provide stronger lower bounds.',
    runtime: 'O(b^d) worst case; heuristic quality and repeated iterations determine the practical node count.',
    memory: 'O(d) search stack, plus any pattern-database tables.',
    history: 'Richard Korf introduced IDA* in 1985 as an optimal, memory-bounded alternative to best-first search. His later Rubik’s Cube work showed how pattern databases can make the heuristic strong enough for optimal cube search.',
    correctness: 'Each pass explores every path whose admissible f score fits the bound. Raising the bound to the smallest score that exceeded it cannot skip a cheaper solution; cycle checks prevent revisiting a state already on the current path.',
    implementation: 'A recursive depth-first traversal keeps only the current path and the next bound. It may revisit states in later branches or passes, so strong precomputed pattern tables trade extra fixed memory for fewer expansions.',
    pseudocode: 'bound ← h(start)\nloop:\n  result ← search([start], g=0, bound)\n  if result = FOUND: return path\n  if result = ∞: return noSolution\n  bound ← result // Smallest f score that exceeded the old bound.\n\nsearch(path, g, bound):\n  state ← last(path)\n  f ← g + h(state)\n  if f > bound: return f\n  if isGoal(state): return FOUND\n  nextBound ← ∞\n  for move in legalMoves(state):\n    next ← apply(state, move)\n    if next not in path: // Avoid cycles on this DFS path.\n      path.push(next)\n      result ← search(path, g + cost(move), bound)\n      path.pop()\n      if result = FOUND: return FOUND\n      nextBound ← min(nextBound, result)\n  return nextBound'
  },
  kociemba: {
    name: 'Kociemba two-phase search',
    summary: 'First reach a subgroup where corner orientation, edge orientation, and slice placement are fixed; then solve within that subgroup using a restricted move set.',
    effect: 'Phase one reorients and places selected edge pieces; phase two uses only turns that preserve those conditions to finish the remaining piece permutation.',
    practical: 'Precomputed coordinate and pruning tables make this structure highly effective for fast, short practical solutions. It does not generally prove that its returned sequence is globally shortest.',
    runtime: 'A bounded-depth search is exponential in the phase depths; a loose upper bound is O(b^(d1+d2)), plus table construction and lookup costs.',
    memory: 'O(d1 + d2 + P) with depth-first search, where P is the precomputed table storage.',
    history: 'Herbert Kociemba developed the two-phase approach to exploit the 3×3×3 cube’s subgroup structure. It became a widely used practical solver design because coordinate and pruning tables make the searches fast.',
    correctness: 'A phase-one path must reach G₁; phase-two moves preserve G₁ and finish the solve. The concatenated moves are a valid solution, but finding the first such path does not prove global shortestness.',
    implementation: 'Encode corner/edge orientations and slice placement as coordinates, then use precomputed pruning tables to guide bounded-depth searches. Try phase-two searches from qualifying phase-one endpoints until one succeeds.',
    pseudocode: 'tables ← loadPhase1AndPhase2PruningTables()\nfor limit1 from phase1LowerBound(start) to maxPhase1Depth:\n  if searchPhase1(start, g=0, limit1) = FOUND:\n    return path1 + path2\nreturn noSolution\n\nsearchPhase1(state, g, limit1):\n  if phase1LowerBound(state) > limit1 - g: return PRUNE\n  if inG1(state):\n    for limit2 from phase2LowerBound(state) to maxPhase2Depth:\n      if searchPhase2(state, g=0, limit2) = FOUND: return FOUND\n  if g = limit1: return NOT_FOUND\n  for move in phase1Moves(state):\n    if not redundant(move, previousMove):\n      path1.push(move)\n      if searchPhase1(apply(state, move), g + 1, limit1) = FOUND:\n        return FOUND\n      path1.pop()\n  return NOT_FOUND\n\nsearchPhase2(state, g, limit2):\n  if phase2LowerBound(state) > limit2 - g: return PRUNE\n  if isSolved(state): return FOUND\n  if g = limit2: return NOT_FOUND\n  for move in phase2Moves: // U/D turns; half turns on R/L/F/B.\n    path2.push(move)\n    if searchPhase2(apply(state, move), g + 1, limit2) = FOUND:\n      return FOUND\n    path2.pop()\n  return NOT_FOUND'
  }
};

let selectedAlgorithm = 'bfs';
let stepIndex = 0;
let representationMoveCount = 0;
let playbackTimer = null;
let showingAlgorithmInfo = false;
let representationCubeYaw = -0.55;
let representationCubePitch = 0.45;
let solverCurrentState = solvedFacelets();
let solverInitialState = solvedFacelets();
let solverSolutionMoves = [];
let solverPlaybackTimer = null;
let solverExecutionIndex = 0;
let solverPlaybackSpeed = 1;
let solverPhase1Length = null;
let solverError = null;
let solverInitialized = false;
let solverRequestId = 0;
const solverSearchPath = createSearchPath(document.getElementById('solver-path-panel'));

function roundVector(vector) {
  return vector.map(value => Math.round(value));
}

function rotateQuarter(vector, axis, angle) {
  const [x, y, z] = vector;
  const [ax, ay, az] = axis;
  const cosine = Math.round(Math.cos(angle));
  const sine = Math.round(Math.sin(angle));
  const dot = x * ax + y * ay + z * az;
  const cross = [ay * z - az * y, az * x - ax * z, ax * y - ay * x];
  return roundVector([
    x * cosine + cross[0] * sine + ax * dot * (1 - cosine),
    y * cosine + cross[1] * sine + ay * dot * (1 - cosine),
    z * cosine + cross[2] * sine + az * dot * (1 - cosine)
  ]);
}

function solvedFacelets() {
  const stickers = [];
  for (const [normal, face] of Object.entries(faceColors)) {
    const [nx, ny, nz] = normal.split(',').map(Number);
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        let position;
        if (face.name === 'U') position = [column - 1, 1, row - 1];
        else if (face.name === 'D') position = [column - 1, -1, 1 - row];
        else if (face.name === 'F') position = [column - 1, 1 - row, 1];
        else if (face.name === 'B') position = [1 - column, 1 - row, -1];
        else if (face.name === 'R') position = [1, 1 - row, 1 - column];
        else position = [-1, 1 - row, column - 1];
        stickers.push({ position, cubie: position.join(','), normal: [nx, ny, nz], color: face.color, face: face.name });
      }
    }
  }
  return stickers;
}

function isCubeSolved(state) {
  const solved = solvedFacelets();
  if (!Array.isArray(state) || state.length !== solved.length) return false;
  return cubeStateToFaceletString(state) === cubeStateToFaceletString(solved);
}

function moveParameters(move) {
  const turns = {
    R: { axis: [1, 0, 0], axisIndex: 0, layer: 1, angle: -Math.PI / 2 },
    L: { axis: [1, 0, 0], axisIndex: 0, layer: -1, angle: Math.PI / 2 },
    U: { axis: [0, 1, 0], axisIndex: 1, layer: 1, angle: -Math.PI / 2 },
    D: { axis: [0, 1, 0], axisIndex: 1, layer: -1, angle: Math.PI / 2 },
    F: { axis: [0, 0, 1], axisIndex: 2, layer: 1, angle: -Math.PI / 2 },
    B: { axis: [0, 0, 1], axisIndex: 2, layer: -1, angle: Math.PI / 2 }
  };
  const turn = turns[move[0]];
  const modifier = move.endsWith('2') ? 2 : move.endsWith("'") ? -1 : 1;
  return { ...turn, angle: turn.angle * modifier };
}

function applyCubeMove(stickers, move) {
  const { axis, axisIndex, layer, angle } = moveParameters(move);
  for (const sticker of stickers) {
    sticker.lastTurn = false;
    if (sticker.position[axisIndex] !== layer) continue;
    sticker.lastTurn = true;
    sticker.position = rotateQuarter(sticker.position, axis, angle);
    sticker.normal = rotateQuarter(sticker.normal, axis, angle);
  }
}

function makeCubeState(moves, scramble = standardScramble) {
  const stickers = solvedFacelets();
  [...scramble, ...moves].forEach(move => applyCubeMove(stickers, move));
  return stickers;
}

function faceletCoordinates(sticker) {
  const [x, y, z] = sticker.position;
  const face = faceColors[sticker.normal.join(',')].name;
  if (face === 'U') return { row: z + 1, column: x + 1 };
  if (face === 'D') return { row: 1 - z, column: x + 1 };
  if (face === 'F') return { row: 1 - y, column: x + 1 };
  if (face === 'B') return { row: 1 - y, column: 1 - x };
  if (face === 'R') return { row: 1 - y, column: 1 - z };
  return { row: 1 - y, column: z + 1 };
}

const netOrigins = { U: [3, 0], L: [0, 3], F: [3, 3], R: [6, 3], B: [9, 3], D: [3, 6] };
const netLabels = { U: 'UP', L: 'LEFT', F: 'FRONT', R: 'RIGHT', B: 'BACK', D: 'DOWN' };

function pieceKind(sticker) {
  const outerCoordinates = sticker.position.filter(value => value !== 0).length;
  return outerCoordinates === 3 ? 'C' : outerCoordinates === 2 ? 'E' : '·';
}

function cloneCubeState(stickers) {
  return stickers.map(sticker => ({
    ...sticker,
    position: [...sticker.position],
    normal: [...sticker.normal],
    cubie: sticker.cubie,
    color: sticker.color,
    face: sticker.face,
    lastTurn: sticker.lastTurn
  }));
}

function createCubeNetFromState(stickers, { representation = 'stickers', highlight = null, patternSubset = false } = {}) {
  const trackedCubies = new Set(['1,0,1', '-1,0,1', '0,1,1', '0,1,-1']);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 302 242');
  svg.setAttribute('class', 'cube-net');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${representation === 'stickers' ? '54 facelet' : 'cubie'} cube state`);
  const tile = 22;
  const pitch = 25;
  const padding = 1;
  for (const face of ['U', 'L', 'F', 'R', 'B', 'D']) {
    const [originColumn, originRow] = netOrigins[face];
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('class', 'cube-face-label');
    label.setAttribute('x', String(padding + originColumn * pitch + 35));
    label.setAttribute('y', String(face === 'D'
      ? padding + (originRow + 3) * pitch + 7
      : padding + originRow * pitch - 3));
    label.textContent = netLabels[face];
    svg.appendChild(label);
  }
  for (const sticker of stickers) {
    const { row, column } = faceletCoordinates(sticker);
    const currentFace = faceColors[sticker.normal.join(',')].name;
    const [originColumn, originRow] = netOrigins[currentFace];
    const x = padding + (originColumn + column) * pitch;
    const y = padding + (originRow + row) * pitch;
    const category = pieceKind(sticker);
    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(tile));
    rect.setAttribute('height', String(tile));
    rect.setAttribute('rx', '3');
    rect.setAttribute('fill', sticker.color);
    const patternClass = patternSubset && trackedCubies.has(sticker.cubie) ? ' pattern-piece' : '';
    rect.setAttribute('class', `cube-sticker ${category === 'C' ? 'corner-sticker' : category === 'E' ? 'edge-sticker' : 'center-sticker'}${patternClass}${highlight && sticker.lastTurn && !patternClass ? ' move-highlight' : ''}`);
    svg.appendChild(rect);
    if (representation === 'pieces') {
      const kind = document.createElementNS(svg.namespaceURI, 'text');
      kind.setAttribute('class', `piece-label${category === 'C' ? ' corner-label' : category === 'E' ? ' edge-label' : ' center-label'}`);
      kind.setAttribute('x', String(x + tile / 2));
      kind.setAttribute('y', String(y + tile / 2 + 3));
      kind.textContent = category;
      svg.appendChild(kind);
    } else if (representation === 'stickers') {
      const index = row * 3 + column;
      const indexLabel = document.createElementNS(svg.namespaceURI, 'text');
      indexLabel.setAttribute('class', `facelet-index${category === 'C' ? ' corner-index' : category === 'E' ? ' edge-index' : ' center-index'}`);
      indexLabel.setAttribute('x', String(x + tile / 2));
      indexLabel.setAttribute('y', String(y + tile / 2 + 3));
      indexLabel.textContent = String(index);
      svg.appendChild(indexLabel);
    }
  }
  return svg;
}

function createCubeNet(moves, { representation = 'stickers', scramble = standardScramble, highlight = null, patternSubset = false } = {}) {
  const stickers = makeCubeState(moves, scramble);
  return createCubeNetFromState(stickers, { representation, highlight, patternSubset });
}

function renderRepresentation() {
  const mode = document.querySelector('.representation-tab.active').dataset.representation;
  const copy = representationCopy[mode];
  document.getElementById('representation-kicker').textContent = copy.kicker;
  document.getElementById('representation-title').textContent = copy.title;
  document.getElementById('representation-description').textContent = copy.description;
  document.getElementById('representation-readout').innerHTML = copy.readout;
  const moves = representationMoveCount ? Array(representationMoveCount).fill('R') : [];
  document.getElementById('representation-cube').replaceChildren(createCubeNet(moves, {
    representation: mode,
    scramble: [],
    highlight: moves.length ? 'R' : null
  }));
  renderInteractiveCube(moves);
  renderRepresentationStateGraph();
  document.getElementById('representation-move-label').textContent = moves.length
    ? `Moves applied: ${moves.join(' ')}`
    : 'Solved state';
}

function viewVector([x, y, z]) {
  const cosineYaw = Math.cos(representationCubeYaw);
  const sineYaw = Math.sin(representationCubeYaw);
  const cosinePitch = Math.cos(representationCubePitch);
  const sinePitch = Math.sin(representationCubePitch);
  const rotatedX = x * cosineYaw + z * sineYaw;
  const rotatedZ = -x * sineYaw + z * cosineYaw;
  return [
    rotatedX,
    y * cosinePitch - rotatedZ * sinePitch,
    y * sinePitch + rotatedZ * cosinePitch
  ];
}

function projectCubePoint(point) {
  const [x, y, z] = viewVector(point);
  const perspective = 220 / (5 - z);
  return [140 + x * perspective, 126 - y * perspective, z];
}

function renderInteractiveCube(moves) {
  const holder = document.getElementById('representation-cube-3d');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 280 252');
  svg.setAttribute('class', 'interactive-cube-svg');
  svg.setAttribute('aria-hidden', 'true');
  const faceFrame = {
    U: { right: [1, 0, 0], down: [0, 0, 1] },
    D: { right: [1, 0, 0], down: [0, 0, -1] },
    F: { right: [1, 0, 0], down: [0, -1, 0] },
    B: { right: [-1, 0, 0], down: [0, -1, 0] },
    R: { right: [0, 0, -1], down: [0, -1, 0] },
    L: { right: [0, 0, 1], down: [0, -1, 0] }
  };
  const visibleFaces = Object.entries(faceColors).flatMap(([normalKey, faceInfo]) => {
    const faceNormal = normalKey.split(',').map(Number);
    if (viewVector(faceNormal)[2] <= 0.01) return [];
    const { right, down } = faceFrame[faceInfo.name];
    const center = faceNormal.map(value => value * 1.5);
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([horizontal, vertical]) => (
      center.map((value, index) => value + right[index] * horizontal * 1.5 + down[index] * vertical * 1.5)
    ));
    return [{
      name: faceInfo.name,
      depth: viewVector(faceNormal)[2],
      points: corners.map(projectCubePoint).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
    }];
  }).sort((a, b) => a.depth - b.depth);
  const stickersByFace = new Map(Object.values(faceColors).map(face => [face.name, []]));
  for (const sticker of makeCubeState(moves, [])) {
    const normal = viewVector(sticker.normal);
    if (normal[2] <= 0.01) continue;
    const face = faceColors[sticker.normal.join(',')].name;
    const { right, down } = faceFrame[face];
    const center = sticker.position.map((value, index) => value + sticker.normal[index] * 0.5);
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([horizontal, vertical]) => (
      center.map((value, index) => value + right[index] * horizontal * 0.44 + down[index] * vertical * 0.44)
    ));
    const projected = corners.map(projectCubePoint);
    stickersByFace.get(face).push({
      color: sticker.color,
      moved: sticker.lastTurn,
      depth: projected.reduce((sum, point) => sum + point[2], 0) / projected.length,
      points: projected.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
    });
  }
  for (const face of visibleFaces) {
    const body = document.createElementNS(svg.namespaceURI, 'polygon');
    body.setAttribute('points', face.points);
    body.setAttribute('class', 'interactive-cube-body');
    svg.appendChild(body);
    for (const sticker of stickersByFace.get(face.name).sort((a, b) => a.depth - b.depth)) {
      const polygon = document.createElementNS(svg.namespaceURI, 'polygon');
      polygon.setAttribute('points', sticker.points);
      polygon.setAttribute('fill', sticker.color);
      polygon.setAttribute('class', 'interactive-cube-sticker');
      if (sticker.moved) polygon.setAttribute('stroke', '#fff');
      svg.appendChild(polygon);
    }
  }
  holder.setAttribute('aria-label', `Interactive three-dimensional Rubik's cube${moves.length ? ` after ${moves.join(' ')}` : ' in the solved state'}. Drag to rotate; use the arrow keys to change the view.`);
  holder.replaceChildren(svg);
}

function renderRepresentationStateGraph() {
  const holder = document.getElementById('representation-state-graph-svg');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 380 140');
  svg.setAttribute('class', 'representation-graph-svg');
  svg.setAttribute('role', 'img');
  const stateNames = ['SOLVED', 'AFTER R', 'AFTER R2', 'AFTER R3'];
  const currentState = representationMoveCount % 4;
  svg.setAttribute('aria-label', `Repeated R turns form a four-state cycle; current state is ${stateNames[currentState]}.`);
  const marker = document.createElementNS(svg.namespaceURI, 'marker');
  marker.setAttribute('id', 'representation-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '8');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '5');
  marker.setAttribute('markerHeight', '5');
  marker.setAttribute('orient', 'auto-start-reverse');
  const arrowHead = document.createElementNS(svg.namespaceURI, 'path');
  arrowHead.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrowHead.setAttribute('fill', '#c3f36b');
  marker.appendChild(arrowHead);
  const definitions = document.createElementNS(svg.namespaceURI, 'defs');
  definitions.appendChild(marker);
  svg.appendChild(definitions);

  const nodes = [
    { id: 'S', x: 42, y: 62 },
    { id: 'A', x: 137, y: 27 },
    { id: 'B', x: 243, y: 27 },
    { id: 'C', x: 338, y: 62 }
  ];
  const edgePaths = [
    'M 59 56 L 119 34',
    'M 155 27 L 225 27',
    'M 260 34 L 321 56',
    'M 322 71 Q 190 139 58 71'
  ];
  edgePaths.forEach((path, index) => {
    const edge = document.createElementNS(svg.namespaceURI, 'path');
    edge.setAttribute('d', path);
    edge.setAttribute('class', `representation-graph-edge${index < representationMoveCount ? ' active' : ''}`);
    svg.appendChild(edge);
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('class', `representation-graph-move${index < representationMoveCount ? ' active' : ''}`);
    label.setAttribute('x', String([88, 190, 290, 190][index]));
    label.setAttribute('y', String([38, 17, 38, 123][index]));
    label.textContent = 'R';
    svg.appendChild(label);
  });

  nodes.forEach((node, index) => {
    const group = document.createElementNS(svg.namespaceURI, 'g');
    const classes = ['representation-graph-node'];
    if (index === currentState) classes.push('current');
    else if (index < representationMoveCount) classes.push('passed');
    group.setAttribute('class', classes.join(' '));
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', String(node.x));
    circle.setAttribute('cy', String(node.y));
    circle.setAttribute('r', '17');
    group.appendChild(circle);
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('x', String(node.x));
    label.setAttribute('y', String(node.y + 4));
    label.textContent = node.id;
    group.appendChild(label);
    svg.appendChild(group);
  });
  document.getElementById('representation-state-label').textContent = stateNames[currentState];
  holder.replaceChildren(svg);
}

function parseMoveExpression(expression) {
  if (typeof expression !== 'string') {
    return [];
  }
  const tokens = expression.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return [];
  }
  const parsed = [];
  for (const token of tokens) {
    const match = token.match(/^([URFDLB])([2']?)$/i);
    if (!match) {
      throw new Error(`Invalid move token: "${token}". Use standard notation such as R U R' U2.`);
    }
    parsed.push(`${match[1].toUpperCase()}${match[2] || ''}`);
  }
  return parsed;
}

function faceLetterFromColor(color) {
  const entry = Object.values(faceColors).find(face => face.color === color);
  return entry ? entry.name : 'U';
}

function cubeStateToFaceletString(stickers) {
  const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
  const output = {};
  for (const face of faceOrder) {
    output[face] = [];
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        let match = null;
        for (const sticker of stickers) {
          if (faceColors[sticker.normal.join(',')].name !== face) continue;
          const coords = faceletCoordinates(sticker);
          if (coords.row === row && coords.column === column) {
            match = sticker;
            break;
          }
        }
        output[face].push(match ? faceLetterFromColor(match.color) : face);
      }
    }
  }
  return faceOrder.map(face => output[face].join('')).join('');
}

function setSolverMessage(message, tone = 'info') {
  const node = document.getElementById('solver-message');
  if (!node) return;
  node.textContent = message;
  node.dataset.tone = tone;
}

function resetSolverPlayback() {
  if (solverPlaybackTimer !== null) {
    window.clearInterval(solverPlaybackTimer);
    solverPlaybackTimer = null;
  }
  const playButton = document.getElementById('solver-play-solution');
  if (playButton) {
    playButton.textContent = 'Play';
    playButton.setAttribute('aria-pressed', 'false');
  }
}

function renderSolutionText() {
  renderSolutionMoves(solverSolutionMoves, solverPhase1Length);
}

function renderSolutionMoves(moves, phase1Length) {
  const solutionNode = document.getElementById('solver-solution-text');
  if (!solutionNode) return;
  solutionNode.replaceChildren();

  if (!Array.isArray(moves) || !moves.length) {
    const empty = document.createElement('span');
    empty.className = 'sol-empty';
    empty.textContent = solverError || (isCubeSolved(solverCurrentState) ? 'Solved already.' : 'No solution yet.');
    solutionNode.appendChild(empty);
    return;
  }

  const split = Number.isInteger(phase1Length) && phase1Length >= 0
    ? Math.min(phase1Length, moves.length)
    : null;

  if (split !== null) {
    const stage1Label = document.createElement('span');
    stage1Label.className = 'sol-group-label sol-group-p1';
    stage1Label.textContent = `Stage 1 · ${split} moves`;
    solutionNode.appendChild(stage1Label);

    for (let index = 0; index < split; index += 1) {
      solutionNode.appendChild(createSolutionChip(moves[index], 'p1', index));
    }

    const divider = document.createElement('span');
    divider.className = 'sol-divider';
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = '| G1 |';
    solutionNode.appendChild(divider);

    const stage2Label = document.createElement('span');
    stage2Label.className = 'sol-group-label sol-group-p2';
    stage2Label.textContent = `Stage 2 · ${moves.length - split} moves`;
    solutionNode.appendChild(stage2Label);

    for (let index = split; index < moves.length; index += 1) {
      solutionNode.appendChild(createSolutionChip(moves[index], 'p2', index));
    }
  } else {
    moves.forEach((move, index) => solutionNode.appendChild(createSolutionChip(move, 'neutral', index)));
  }

  updateSolutionChipStates();
}

function createSolutionChip(move, phase, index) {
  const chip = document.createElement('span');
  chip.className = `sol-move ${phase}`;
  chip.dataset.i = String(index);
  chip.textContent = move;
  return chip;
}

function updateSolutionChipStates() {
  const solutionNode = document.getElementById('solver-solution-text');
  if (!solutionNode) return;
  solutionNode.querySelectorAll('.sol-move').forEach(chip => {
    const index = Number(chip.dataset.i);
    chip.classList.toggle('played', index < solverExecutionIndex);
    chip.classList.toggle('upcoming', index >= solverExecutionIndex);
    const current = index === solverExecutionIndex - 1;
    chip.classList.toggle('current', current);
    if (current) chip.setAttribute('aria-current', 'step');
    else chip.removeAttribute('aria-current');
  });
}

function renderSolverCube() {
  const holder = document.getElementById('solver-cube-display');
  if (!holder) return;
  const lastMove = solverSolutionMoves[solverExecutionIndex - 1] || null;
  const svg = createCubeNetFromState(solverCurrentState, { representation: 'stickers', highlight: lastMove || null });
  holder.replaceChildren(svg);

  if (solverSearchPath && typeof solverSearchPath.render === 'function') {
    solverSearchPath.render({
      moves: solverSolutionMoves,
      initialState: solverInitialState,
      startFacelets: cubeStateToFaceletString(solverInitialState),
      solvedFacelets: cubeStateToFaceletString(solvedFacelets()),
      phase1Length: solverPhase1Length,
      index: solverExecutionIndex,
      status: solverError ? 'error' : solverSolutionMoves.length ? 'active' : isCubeSolved(solverCurrentState) ? 'already-solved' : 'idle',
      error: solverError
    });
  }

  renderSolutionText();
}

function renderSolverStats() {
  const total = document.getElementById('solver-stat-total');
  const phase1 = document.getElementById('solver-stat-phase1');
  const phase2 = document.getElementById('solver-stat-phase2');
  const time = document.getElementById('solver-stat-time');
  if (!total || !phase1 || !phase2 || !time) return;

  const totalMoves = solverSolutionMoves.length;
  if (!totalMoves) {
    total.textContent = '—';
    phase1.textContent = '—';
    phase2.textContent = '—';
    time.textContent = '—';
    return;
  }

  const phase1Value = Number.isInteger(solverPhase1Length) && solverPhase1Length >= 0 ? solverPhase1Length : null;
  total.textContent = String(totalMoves);
  phase1.textContent = phase1Value === null ? '—' : String(phase1Value);
  phase2.textContent = phase1Value === null ? '—' : String(Math.max(0, totalMoves - phase1Value));
  time.textContent = '—';
}

function syncSolverFromCurrentState() {
  solverError = null;
  solverRequestId += 1;
  solverInitialState = cloneCubeState(solverCurrentState);
  solverExecutionIndex = 0;
  solverSolutionMoves = [];
  solverPhase1Length = null;
  renderSolverCube();
  renderSolverStats();
  const statusLabel = document.getElementById('solver-status-label');
  if (statusLabel) statusLabel.textContent = 'READY';
  const phaseText = document.getElementById('solver-phase-text');
  if (phaseText) phaseText.textContent = 'Waiting';
}

function applySolverMove(move) {
  solverRequestId += 1;
  solverError = null;
  resetSolverPlayback();
  const next = cloneCubeState(solverCurrentState);
  applyCubeMove(next, move);
  solverCurrentState = next;
  solverInitialState = cloneCubeState(solverCurrentState);
  solverExecutionIndex = 0;
  solverSolutionMoves = [];
  solverPhase1Length = null;
  renderSolverCube();
  updateSolverInputFromState();
}

function updateSolverInputFromState() {
  const input = document.getElementById('solver-scramble-input');
  if (!input) return;
  input.value = 'Custom state';
}

function setCubeStateFromScramble(text) {
  solverRequestId += 1;
  solverError = null;
  try {
    const moves = parseMoveExpression(text);
    const solved = solvedFacelets();
    for (const move of moves) {
      applyCubeMove(solved, move);
    }
    solverCurrentState = solved;
    solverInitialState = cloneCubeState(solved);
    solverSolutionMoves = [];
    solverExecutionIndex = 0;
    solverPhase1Length = null;
    solverError = null;
    resetSolverPlayback();
    renderSolverCube();
    setSolverMessage('Current cube is ready for solving.', 'info');
    const input = document.getElementById('solver-scramble-input');
    if (input && text.trim()) input.value = text.trim();
    const phaseText = document.getElementById('solver-phase-text');
    if (phaseText) phaseText.textContent = 'Waiting';
    const statusLabel = document.getElementById('solver-status-label');
    if (statusLabel) statusLabel.textContent = 'READY';
    renderSolverStats();
  } catch (error) {
    setSolverMessage(error.message, 'error');
  }
}

function randomSolverScramble() {
  const faces = ['R', 'U', 'F', 'D', 'L', 'B'];
  const modifiers = ['', "'", '2'];
  const scrambleMoves = [];
  for (let index = 0; index < 20; index++) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scrambleMoves.push(`${face}${modifier}`);
  }
  const text = scrambleMoves.join(' ');
  const input = document.getElementById('solver-scramble-input');
  if (input) input.value = text;
  setCubeStateFromScramble(text);
}

function renderSolutionPlaybackFrame(index) {
  const base = cloneCubeState(solverInitialState);
  for (let moveIndex = 0; moveIndex < index; moveIndex++) {
    const move = solverSolutionMoves[moveIndex];
    if (move) {
      applyCubeMove(base, move);
    }
  }
  solverCurrentState = base;
  solverExecutionIndex = index;
  renderSolverCube();
}

function stopSolverPlayback() {
  if (solverPlaybackTimer !== null) {
    window.clearInterval(solverPlaybackTimer);
    solverPlaybackTimer = null;
  }
  const playButton = document.getElementById('solver-play-solution');
  if (playButton) {
    playButton.textContent = 'Play';
    playButton.setAttribute('aria-pressed', 'false');
  }
}

function playSolverSequence() {
  if (!solverSolutionMoves.length) {
    setSolverMessage('Solve the cube first before replaying the move sequence.', 'info');
    return;
  }
  const playButton = document.getElementById('solver-play-solution');
  if (!playButton) return;
  if (solverPlaybackTimer !== null) {
    stopSolverPlayback();
    return;
  }
  const speedSelector = document.getElementById('solver-speed-select');
  const speed = Number(speedSelector?.value || 1);
  playButton.textContent = 'Pause';
  playButton.setAttribute('aria-pressed', 'true');
  solverPlaybackTimer = window.setInterval(() => {
    if (solverExecutionIndex >= solverSolutionMoves.length) {
      stopSolverPlayback();
      return;
    }
    renderSolutionPlaybackFrame(solverExecutionIndex + 1);
    if (solverExecutionIndex >= solverSolutionMoves.length) {
      stopSolverPlayback();
      const phaseText = document.getElementById('solver-phase-text');
      if (phaseText) phaseText.textContent = 'Solved';
      const statusLabel = document.getElementById('solver-status-label');
      if (statusLabel) statusLabel.textContent = 'SOLVED';
    }
  }, Math.max(80, 1200 / speed));
}

function solveCurrentCube() {
  if (!window.KociembaAdapter || typeof window.KociembaAdapter.solveFaceletsDetailed !== 'function') {
    setSolverMessage('The Kociemba solver bundle is not available in this page.', 'error');
    return;
  }
  const requestId = ++solverRequestId;
  solverError = null;
  solverSolutionMoves = [];
  solverPhase1Length = null;
  solverExecutionIndex = 0;
  solverInitialState = cloneCubeState(solverCurrentState);
  const statusLabel = document.getElementById('solver-status-label');
  if (statusLabel) statusLabel.textContent = 'SEARCHING';
  const phaseText = document.getElementById('solver-phase-text');
  if (phaseText) phaseText.textContent = 'Kociemba search';
  setSolverMessage('Searching for a valid Kociemba solution…', 'info');
  resetSolverPlayback();
  renderSolverCube();
  renderSolverStats();

  window.requestAnimationFrame(() => window.setTimeout(() => {
    if (requestId !== solverRequestId) return;
    try {
      const faceletString = cubeStateToFaceletString(solverCurrentState);
      if (!solverInitialized) {
        window.KociembaAdapter.initSolver();
        solverInitialized = true;
      }
      const start = performance.now();
      const detailed = window.KociembaAdapter.solveFaceletsDetailed(faceletString, 22);
      const elapsedMs = performance.now() - start;
      if (!detailed.ok) {
        solverError = detailed.error || 'Solver did not find a solution within the depth limit.';
        solverSolutionMoves = [];
        solverPhase1Length = null;
        if (statusLabel) statusLabel.textContent = 'ERROR';
        if (phaseText) phaseText.textContent = 'No solution found';
        setSolverMessage(solverError, 'error');
        renderSolverStats();
        renderSolverCube();
        return;
      }
      if (typeof detailed.solution !== 'string'
        || !Number.isInteger(detailed.totalMoves)
        || !Number.isInteger(detailed.phase1Length)
        || detailed.totalMoves < 0
        || detailed.phase1Length < 0
        || detailed.phase1Length > detailed.totalMoves) {
        throw new Error('Solver returned an invalid detailed result.');
      }
      const parsedMoves = parseMoveExpression(detailed.solution);
      if (parsedMoves.length !== detailed.totalMoves) {
        throw new Error('Solver result move count does not match its solution.');
      }
      solverSolutionMoves = parsedMoves;
      solverInitialState = cloneCubeState(solverCurrentState);
      solverExecutionIndex = 0;
      solverPhase1Length = Number.isInteger(detailed.phase1Length) ? detailed.phase1Length : null;
      solverError = null;
      renderSolverStats();
      const time = document.getElementById('solver-stat-time');
      if (time) time.textContent = `${elapsedMs.toFixed(1)} ms`;
      if (statusLabel) statusLabel.textContent = parsedMoves.length ? 'FOUND' : 'SOLVED';
      if (phaseText) phaseText.textContent = parsedMoves.length ? 'Solution found' : 'Solved';
      setSolverMessage(parsedMoves.length ? 'Kociemba returned a valid solution. Replay it to watch the actual cube moves execute.' : 'The cube is already solved.', 'success');
      renderSolverCube();
    } catch (error) {
      solverPhase1Length = null;
      solverError = error instanceof Error ? error.message : String(error);
      if (statusLabel) statusLabel.textContent = 'ERROR';
      if (phaseText) phaseText.textContent = 'Solver failed';
      setSolverMessage(solverError || 'Solver failed.', 'error');
      renderSolverStats();
      renderSolverCube();
      console.error(error);
    }
  }, 0));
}

function updateSolverFromInput() {
  const text = document.getElementById('solver-scramble-input')?.value || '';
  setCubeStateFromScramble(text);
}

function setupSolverControls() {
  const scrambleInput = document.getElementById('solver-scramble-input');
  if (scrambleInput) {
    scrambleInput.addEventListener('change', updateSolverFromInput);
    scrambleInput.addEventListener('blur', updateSolverFromInput);
  }

  document.getElementById('solver-scramble-random')?.addEventListener('click', randomSolverScramble);
  document.getElementById('solver-reset')?.addEventListener('click', () => {
    solverRequestId += 1;
    solverError = null;
    solverCurrentState = solvedFacelets();
    solverInitialState = cloneCubeState(solverCurrentState);
    solverSolutionMoves = [];
    solverExecutionIndex = 0;
    solverPhase1Length = null;
    resetSolverPlayback();
    renderSolverCube();
    if (scrambleInput) scrambleInput.value = 'Solved';
    const phaseText = document.getElementById('solver-phase-text');
    const statusLabel = document.getElementById('solver-status-label');
    if (phaseText) phaseText.textContent = 'Solved';
    if (statusLabel) statusLabel.textContent = 'READY';
    renderSolverStats();
    setSolverMessage('The cube has been reset to the solved state.', 'info');
  });

  document.getElementById('solver-solve')?.addEventListener('click', solveCurrentCube);
  document.getElementById('solver-copy-solution')?.addEventListener('click', async () => {
    if (!solverSolutionMoves.length) return;
    const solutionText = solverSolutionMoves.join(' ');
    try {
      await navigator.clipboard.writeText(solutionText);
      setSolverMessage('Solution copied to the clipboard.', 'success');
    } catch (error) {
      setSolverMessage('Copy failed: your browser blocked the clipboard API.', 'error');
    }
  });

  document.getElementById('solver-prev-move')?.addEventListener('click', () => {
    if (!solverSolutionMoves.length) return;
    if (solverExecutionIndex > 0) {
      renderSolutionPlaybackFrame(solverExecutionIndex - 1);
    }
  });
  document.getElementById('solver-next-move')?.addEventListener('click', () => {
    if (!solverSolutionMoves.length) return;
    if (solverExecutionIndex < solverSolutionMoves.length) {
      renderSolutionPlaybackFrame(solverExecutionIndex + 1);
    }
  });
  document.getElementById('solver-play-solution')?.addEventListener('click', playSolverSequence);
  document.getElementById('solver-speed-select')?.addEventListener('change', event => {
    solverPlaybackSpeed = Number(event.target.value || 1);
    if (solverPlaybackTimer !== null) {
      stopSolverPlayback();
      playSolverSequence();
    }
  });

  document.querySelectorAll('.solver-face-button').forEach(button => {
    button.addEventListener('click', () => {
      const move = button.dataset.move;
      if (!move) return;
      try {
        const moves = parseMoveExpression(move);
        for (const step of moves) {
          applySolverMove(step);
        }
        const input = document.getElementById('solver-scramble-input');
        if (input) input.value = `${(input.value || '').trim()} ${move}`.trim();
        setSolverMessage(`Applied ${move} to the live cube.`, 'info');
      } catch (error) {
        setSolverMessage(error.message, 'error');
      }
    });
  });

  setCubeStateFromScramble(scrambleInput?.value || 'R U R\' U\'');
}

function setupInteractiveCube() {
  const holder = document.getElementById('representation-cube-3d');
  let dragStart = null;
  holder.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragStart = { x: event.clientX, y: event.clientY, yaw: representationCubeYaw, pitch: representationCubePitch };
    holder.setPointerCapture(event.pointerId);
  });
  holder.addEventListener('pointermove', event => {
    if (!dragStart) return;
    representationCubeYaw = dragStart.yaw + (event.clientX - dragStart.x) * 0.01;
    representationCubePitch = Math.max(-1.25, Math.min(1.25, dragStart.pitch - (event.clientY - dragStart.y) * 0.01));
    renderInteractiveCube(representationMoveCount ? Array(representationMoveCount).fill('R') : []);
  });
  const stopDragging = event => {
    dragStart = null;
    if (holder.hasPointerCapture(event.pointerId)) holder.releasePointerCapture(event.pointerId);
  };
  holder.addEventListener('pointerup', stopDragging);
  holder.addEventListener('pointercancel', stopDragging);
  holder.addEventListener('keydown', event => {
    const step = 0.12;
    if (event.key === 'ArrowLeft') representationCubeYaw -= step;
    else if (event.key === 'ArrowRight') representationCubeYaw += step;
    else if (event.key === 'ArrowUp') representationCubePitch = Math.min(1.25, representationCubePitch + step);
    else if (event.key === 'ArrowDown') representationCubePitch = Math.max(-1.25, representationCubePitch - step);
    else return;
    event.preventDefault();
    event.stopPropagation();
    renderInteractiveCube(representationMoveCount ? Array(representationMoveCount).fill('R') : []);
  });
}

function renderCubeContext(algorithm, step) {
  const holder = document.getElementById('cube-context');
  const scramble = algorithm === 'kociemba' ? kociembaScramble : standardScramble;
  const moves = step.cubeMoves || [];
  const lastMove = moves.length ? moves[moves.length - 1] : null;
  const heading = document.createElement('div');
  heading.className = 'cube-context-heading';
  const patternSubset = selectedAlgorithm === 'idastar' && [0, 8].includes(step.treeState);
  heading.innerHTML = `<span>THE ACTUAL CUBE STATE</span><span>${patternSubset ? 'PATTERN DATABASE / TRACKED EDGES' : moves.length ? `${moves.length} TURN${moves.length === 1 ? '' : 'S'} APPLIED` : 'SCRAMBLED START'}</span>`;
  const body = document.createElement('div');
  body.className = 'cube-context-body';
  body.appendChild(createCubeNet(moves, { scramble, highlight: lastMove ? lastMove[0] : null, patternSubset }));
  const detail = document.createElement('div');
  detail.className = 'cube-state-detail';
  const scrambleRow = document.createElement('div');
  scrambleRow.innerHTML = `<span>START SCRAMBLE</span><code>${scramble.join(' ')}</code>`;
  const pathRow = document.createElement('div');
  pathRow.innerHTML = `<span>${selectedAlgorithm === 'kociemba' ? 'PHASE MOVES SO FAR' : 'MOVES FROM START'}</span><code>${moves.length ? moves.join(' ') : '—'}</code>`;
  const currentRow = document.createElement('div');
  currentRow.className = 'current-turn';
  currentRow.innerHTML = patternSubset
    ? '<span>PATTERN DATABASE ABSTRACTION</span><strong>4 tracked edges</strong><small>Outlined cubies are kept in the pattern; the other pieces are abstracted away.</small>'
    : lastMove
    ? `<span>LAST TURN APPLIED</span><strong>${lastMove}</strong><small>Outlined stickers mark cubies moved by this turn.</small>`
    : `<span>STARTING POSITION</span><strong>${scramble.join(' ')}</strong><small>Every facelet color below comes from applying these turns to solved.</small>`;
  const pieces = document.createElement('div');
  pieces.className = 'cube-pieces-key';
  pieces.innerHTML = '<span><i class="piece-key-corner">C</i>Corner cubie</span><span><i class="piece-key-edge">E</i>Edge cubie</span><span><i class="piece-key-center">·</i>Fixed center</span>';
  detail.append(scrambleRow, pathRow, currentRow, pieces);
  body.appendChild(detail);
  holder.replaceChildren(heading, body);
}

function renderGraph(algorithm, step) {
  const container = document.getElementById('graph-container');
  if (algorithm === 'kociemba') {
    renderPhases(container, step.phaseIndex, stepIndex);
    return;
  }
  if (algorithm === 'idastar') {
    renderIdaTree(container, step.treeState);
    return;
  }

  const pathEdges = new Set();
  if (step.path) {
    for (let index = 0; index < step.path.length - 1; index++) pathEdges.add(edgeKey(step.path[index], step.path[index + 1]));
  }
  const discoveredEdges = new Set(step.discoveredEdges || []);
  const visited = new Set(step.visited || []);
  const frontier = new Set(step.frontier || (algorithm === 'astar'
    ? (step.openSet || []).map(entry => entry.id)
    : step.queue || []));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 700 320');
  svg.setAttribute('class', 'graph-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${algorithm} search graph, step ${stepIndex + 1}`);

  for (const edge of edges) {
    const fromNode = nodes.find(node => node.id === edge.from);
    const toNode = nodes.find(node => node.id === edge.to);
    const key = edgeKey(edge.from, edge.to);
    const isBToF = key === edgeKey('B', 'F');
    const line = document.createElementNS(svg.namespaceURI, isBToF ? 'path' : 'line');
    if (isBToF) {
      line.setAttribute('d', 'M226 254 C290 304 450 304 514 254');
      line.setAttribute('fill', 'none');
    } else {
      line.setAttribute('x1', String(fromNode.x));
      line.setAttribute('y1', String(fromNode.y));
      line.setAttribute('x2', String(toNode.x));
      line.setAttribute('y2', String(toNode.y));
    }
    line.setAttribute('class', `graph-edge${discoveredEdges.has(key) ? ' edge-discovered' : ''}${pathEdges.has(key) ? ' edge-path' : ''}`);
    svg.appendChild(line);
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('class', `edge-move${pathEdges.has(key) ? ' edge-move-path' : ''}`);
    label.setAttribute('x', String((fromNode.x + toNode.x) / 2));
    label.setAttribute('y', String(isBToF
      ? 310
      : (fromNode.y + toNode.y) / 2 - 7));
    label.textContent = edge.move;
    svg.appendChild(label);
  }

  for (const node of nodes) {
    const group = document.createElementNS(svg.namespaceURI, 'g');
    const classes = ['graph-node'];
    if (node.state === 'start') classes.push('node-start');
    if (node.state === 'goal') classes.push('node-goal');
    if (visited.has(node.id)) classes.push('node-visited');
    if (frontier.has(node.id)) classes.push('node-frontier');
    if ((step.pruned || []).includes(node.id)) classes.push('node-pruned');
    if (step.current === node.id) classes.push('node-current');
    if (step.path && step.path.includes(node.id)) classes.push('node-path');
    group.setAttribute('class', classes.join(' '));
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', String(node.x));
    circle.setAttribute('cy', String(node.y));
    circle.setAttribute('r', '21');
    group.appendChild(circle);
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('x', String(node.x));
    label.setAttribute('y', String(node.y + 4));
    label.textContent = node.id;
    group.appendChild(label);
    const statePath = algorithms[algorithm].stateMap[node.id];
    if (statePath && (node.id === 'S' || visited.has(node.id) || frontier.has(node.id) || step.path?.includes(node.id))) {
      const stateLabel = document.createElementNS(svg.namespaceURI, 'text');
      stateLabel.setAttribute('class', 'node-state');
      stateLabel.setAttribute('x', String(node.x));
      stateLabel.setAttribute('y', String(node.y + 34));
      stateLabel.textContent = statePath.length ? statePath.join(' ') : 'scramble';
      group.appendChild(stateLabel);
    }
    if (step.scores && step.scores[node.id]) {
      const score = document.createElementNS(svg.namespaceURI, 'text');
      score.setAttribute('class', 'node-score');
      score.setAttribute('x', String(node.x));
      score.setAttribute('y', String(node.y + 47));
      score.textContent = step.scores[node.id];
      group.appendChild(score);
    }
    svg.appendChild(group);
  }
  container.replaceChildren(svg);
  if (algorithm === 'astar') renderPriorityQueue(container, step.openSet || []);
}

function renderPriorityQueue(container, entries) {
  const queue = document.createElement('div');
  queue.className = 'priority-queue';
  queue.setAttribute('aria-label', 'A star open set, sorted by lowest f score');
  const heading = document.createElement('div');
  heading.className = 'queue-heading';
  heading.innerHTML = '<span>OPEN SET / PRIORITY QUEUE</span><span>LOWEST f SELECTED FIRST</span>';
  queue.appendChild(heading);
  const columns = document.createElement('div');
  columns.className = 'queue-columns';
  columns.innerHTML = '<span>STATE</span><span>g · SO FAR</span><span>h · TO GO</span><span>f TOTAL</span>';
  queue.appendChild(columns);
  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'queue-empty';
    empty.textContent = 'The goal is selected; search ends.';
    queue.appendChild(empty);
  }
  for (const [index, entry] of entries.entries()) {
    const row = document.createElement('div');
    row.className = `queue-entry${index === 0 ? ' queue-next' : ''}`;
    row.innerHTML = `<strong>${escapeHtml(entry.id)}${index === 0 ? '<small>NEXT</small>' : ''}</strong><span>${entry.g}</span><span>${entry.h}</span><b>${entry.f}</b>`;
    queue.appendChild(row);
  }
  container.appendChild(queue);
}

function renderIdaTree(container, state) {
  const treeNodes = [
    { id: 'S', x: 350, y: 43, score: 'g=0, h=2' },
    { id: 'A', x: 205, y: 112, score: state >= 2 ? 'f=3' : '' },
    { id: 'B', x: 495, y: 112, score: state >= 3 ? 'f=4' : '' },
    { id: 'C', x: 125, y: 187, score: state >= 6 ? 'f=3' : '' },
    { id: 'D', x: 285, y: 187, score: '' },
    { id: 'E', x: 415, y: 187, score: '' },
    { id: 'F', x: 575, y: 187, score: '' },
    { id: 'T', x: 125, y: 258, score: state >= 7 ? 'goal' : '' }
  ];
  const treeEdges = [['S', 'A'], ['S', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['B', 'F'], ['C', 'T']];
  const activePath = state >= 5 && state <= 6 ? ['S', 'A', ...(state === 6 ? ['C'] : [])] : state >= 7 ? ['S', 'A', 'C', 'T'] : [1, 4].includes(state) ? ['S'] : [];
  const cutNodes = state === 2 ? ['A'] : state === 3 ? ['A', 'B'] : [];
  const activeEdges = new Set(activePath.slice(1).map((id, index) => edgeKey(activePath[index], id)));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 700 290');
  svg.setAttribute('class', 'graph-svg ida-tree-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Depth-first IDA star search tree with its active cube-state path and threshold cutoffs');

  for (const [from, to] of treeEdges) {
    const a = treeNodes.find(node => node.id === from);
    const b = treeNodes.find(node => node.id === to);
    const line = document.createElementNS(svg.namespaceURI, 'line');
    line.setAttribute('x1', String(a.x));
    line.setAttribute('y1', String(a.y + 19));
    line.setAttribute('x2', String(b.x));
    line.setAttribute('y2', String(b.y - 19));
    line.setAttribute('class', `graph-edge${activeEdges.has(edgeKey(from, to)) ? ' edge-path' : ''}${cutNodes.includes(to) ? ' edge-cutoff' : ''}`);
    svg.appendChild(line);
  }
  for (const node of treeNodes) {
    const group = document.createElementNS(svg.namespaceURI, 'g');
    let className = 'graph-node';
    if (node.id === 'S') className += ' node-start';
    if (node.id === 'T') className += ' node-goal';
    if (activePath.includes(node.id)) className += [1, 4].includes(state) && node.id === 'S' ? ' node-current' : ' node-path';
    if (cutNodes.includes(node.id)) className += ' node-pruned';
    group.setAttribute('class', className);
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', String(node.x));
    circle.setAttribute('cy', String(node.y));
    circle.setAttribute('r', '19');
    group.appendChild(circle);
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('x', String(node.x));
    label.setAttribute('y', String(node.y + 4));
    label.textContent = node.id;
    group.appendChild(label);
    if (node.score) {
      const score = document.createElementNS(svg.namespaceURI, 'text');
      score.setAttribute('class', 'node-score');
      score.setAttribute('x', String(node.x));
      score.setAttribute('y', String(node.y + 32));
      score.textContent = node.score;
      group.appendChild(score);
    }
    if (cutNodes.includes(node.id)) {
      const cutoff = document.createElementNS(svg.namespaceURI, 'text');
      cutoff.setAttribute('class', 'cutoff-label');
      cutoff.setAttribute('x', String(node.x));
      cutoff.setAttribute('y', String(node.y - 27));
      cutoff.textContent = 'CUT: f>LIMIT';
      group.appendChild(cutoff);
    }
    svg.appendChild(group);
  }
  const board = document.createElement('div');
  board.className = 'ida-board';
  const limit = document.createElement('div');
  limit.className = `ida-limit${state === 2 || state === 3 ? ' limit-cutoff' : state >= 4 ? ' limit-raised' : ''}`;
  limit.innerHTML = `<span>f = g + h LIMIT</span><strong>${state >= 4 ? '3' : '2'}</strong><small>${state === 2 || state === 3 ? 'red branches exceed it' : state >= 4 ? 'new depth-first pass' : 'path score must fit'}</small>`;
  const stack = document.createElement('div');
  stack.className = 'ida-stack';
  const pathText = state >= 7 ? 'S → A → C → T' : state === 6 ? 'S → A → C' : state === 5 ? 'S → A' : state === 2 ? 'S → A  ·  f=3 exceeds limit' : state === 3 ? 'S → B  ·  f=4 exceeds limit' : 'S';
  stack.innerHTML = `<span>${state === 0 || state === 8 ? 'PATTERN DATABASE' : 'DEPTH-FIRST PATH / STACK'}</span><strong>${state === 0 ? 'Abstract pieces → stored distance → h lower bound' : state === 8 ? 'Precomputed h guides the path; no global frontier is stored.' : pathText}</strong>`;
  if (state === 0 || state === 8) {
    const pattern = document.createElement('div');
    pattern.className = 'pattern-lookup';
    pattern.innerHTML = '<div class="pattern-step"><span>1 / ABSTRACT</span><strong>Track selected cubies</strong><small>Ignore the others</small></div><b aria-hidden="true">→</b><div class="pattern-step"><span>2 / LOOK UP</span><strong>Read exact pattern distance</strong><small>Stored before the search</small></div><b aria-hidden="true">→</b><div class="pattern-result"><span>3 / BOUND</span><strong>Use distance as h</strong><small>Never more than real moves left</small></div>';
    board.append(limit, pattern, svg, stack);
  } else {
    board.append(limit, svg, stack);
  }
  container.replaceChildren(board);
}

function renderPhases(container, phaseIndex, activeStep) {
  const wrapper = document.createElement('div');
  wrapper.className = 'kociemba-visual';
  const graph = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  graph.setAttribute('viewBox', '0 0 700 300');
  graph.setAttribute('class', 'kociemba-search-svg');
  graph.setAttribute('role', 'img');
  graph.setAttribute('aria-label', `Illustrative Kociemba search tree. Phase one follows U, R, F to subgroup G1; table-bound side branches are pruned. Phase two follows R2 to solved. Step ${activeStep + 1}.`);

  const searchNodes = [
    { id: 'S', x: 55, y: 155, label: 'SCRAMBLE' },
    { id: 'U', x: 190, y: 155, label: 'AFTER U' },
    { id: 'UR', x: 325, y: 155, label: 'AFTER U R' },
    { id: 'G1', x: 460, y: 155, label: 'IN G₁' },
    { id: 'T', x: 625, y: 155, label: 'SOLVED' }
  ];
  const phaseOneEdges = [['S', 'U', 'U'], ['U', 'UR', 'R'], ['UR', 'G1', 'F']];
  const phaseTwoEdge = ['G1', 'T', 'R2'];
  const searchBranches = [
    { from: 'S', x: 125, y: 63 }, { from: 'S', x: 125, y: 247 },
    { from: 'U', x: 260, y: 63 }, { from: 'U', x: 260, y: 247 },
    { from: 'UR', x: 395, y: 63 }, { from: 'UR', x: 395, y: 247 }
  ];
  const nodeById = Object.fromEntries(searchNodes.map(node => [node.id, node]));
  const phaseOnePathLength = Math.max(0, Math.min(3, activeStep - 1));
  const markerPath = ['S', 'S', 'U', 'UR', 'G1', 'G1', 'G1', 'T', 'T', 'T'];
  const markerFrom = nodeById[markerPath[Math.max(0, activeStep - 1)]];
  const markerTo = nodeById[markerPath[Math.min(activeStep, markerPath.length - 1)]];
  const markerColor = phaseIndex >= 3 ? '#c08aff' : '#8db8ff';
  const stageLabels = [
    { x: 255, text: 'PHASE 1 / ORIENT + PLACE SLICE', className: 'k-phase-one-label' },
    { x: 575, text: 'PHASE 2 / RESTRICTED MOVES', className: 'k-phase-two-label' }
  ];
  for (const stage of stageLabels) {
    const label = document.createElementNS(graph.namespaceURI, 'text');
    label.setAttribute('class', `k-stage-label ${stage.className}`);
    label.setAttribute('x', String(stage.x));
    label.setAttribute('y', '20');
    label.textContent = stage.text;
    graph.appendChild(label);
  }
  const phaseDivider = document.createElementNS(graph.namespaceURI, 'line');
  phaseDivider.setAttribute('x1', '550');
  phaseDivider.setAttribute('x2', '550');
  phaseDivider.setAttribute('y1', '31');
  phaseDivider.setAttribute('y2', '276');
  phaseDivider.setAttribute('class', 'k-phase-divider');
  graph.appendChild(phaseDivider);

  for (const [edgeIndex, [from, to, move]] of [...phaseOneEdges, phaseTwoEdge].entries()) {
    const start = nodeById[from];
    const end = nodeById[to];
    const isPhaseTwo = from === 'G1';
    const isActive = isPhaseTwo ? phaseIndex >= 3 : edgeIndex < phaseOnePathLength;
    const line = document.createElementNS(graph.namespaceURI, 'line');
    line.setAttribute('x1', String(start.x + 22));
    line.setAttribute('y1', String(start.y));
    line.setAttribute('x2', String(end.x - 22));
    line.setAttribute('y2', String(end.y));
    line.setAttribute('class', `k-search-edge${isActive ? (isPhaseTwo ? ' k-solution-edge' : ' k-phase-one-edge') : ''}`);
    graph.appendChild(line);
    const moveLabel = document.createElementNS(graph.namespaceURI, 'text');
    moveLabel.setAttribute('class', `k-search-move${isActive ? (isPhaseTwo ? ' k-solution-move' : ' k-phase-one-move') : ''}`);
    moveLabel.setAttribute('x', String((start.x + end.x) / 2));
    moveLabel.setAttribute('y', String(start.y - 12));
    moveLabel.textContent = move;
    graph.appendChild(moveLabel);
  }
  for (const branch of searchBranches) {
    const parent = nodeById[branch.from];
    const line = document.createElementNS(graph.namespaceURI, 'line');
    line.setAttribute('x1', String(parent.x));
    line.setAttribute('y1', String(parent.y + (branch.y < parent.y ? -18 : 18)));
    line.setAttribute('x2', String(branch.x));
    line.setAttribute('y2', String(branch.y));
    line.setAttribute('class', 'k-pruned-edge');
    graph.appendChild(line);
    const branchNode = document.createElementNS(graph.namespaceURI, 'circle');
    branchNode.setAttribute('cx', String(branch.x));
    branchNode.setAttribute('cy', String(branch.y));
    branchNode.setAttribute('r', '12');
    branchNode.setAttribute('class', 'k-pruned-node');
    graph.appendChild(branchNode);
    const cross = document.createElementNS(graph.namespaceURI, 'text');
    cross.setAttribute('class', 'k-pruned-cross');
    cross.setAttribute('x', String(branch.x));
    cross.setAttribute('y', String(branch.y + 4));
    cross.textContent = '×';
    graph.appendChild(cross);
    const boundLabel = document.createElementNS(graph.namespaceURI, 'text');
    boundLabel.setAttribute('class', 'k-pruned-label');
    boundLabel.setAttribute('x', String(branch.x));
    boundLabel.setAttribute('y', String(branch.y + (branch.y < parent.y ? -17 : 24)));
    boundLabel.textContent = 'BOUND';
    graph.appendChild(boundLabel);
  }
  searchNodes.forEach(node => {
    const group = document.createElementNS(graph.namespaceURI, 'g');
    const currentNode = markerTo.id === node.id;
    group.setAttribute('class', `k-search-node${currentNode ? ' k-search-current' : ''}${node.id === 'G1' && phaseIndex >= 2 ? ' k-subgroup-reached' : ''}${node.id === 'T' && phaseIndex >= 4 ? ' k-goal-reached' : ''}`);
    const circle = document.createElementNS(graph.namespaceURI, 'circle');
    circle.setAttribute('cx', String(node.x));
    circle.setAttribute('cy', String(node.y));
    circle.setAttribute('r', '21');
    group.appendChild(circle);
    const id = document.createElementNS(graph.namespaceURI, 'text');
    id.setAttribute('x', String(node.x));
    id.setAttribute('y', String(node.y + 4));
    id.textContent = node.id;
    group.appendChild(id);
    const label = document.createElementNS(graph.namespaceURI, 'text');
    label.setAttribute('class', 'k-search-node-label');
    label.setAttribute('x', String(node.x));
    label.setAttribute('y', String(node.y + 39));
    label.textContent = node.label;
    group.appendChild(label);
    graph.appendChild(group);
  });
  const marker = document.createElementNS(graph.namespaceURI, 'circle');
  marker.setAttribute('class', 'k-search-marker');
  marker.setAttribute('r', '27');
  marker.setAttribute('cx', String(markerFrom.x));
  marker.setAttribute('cy', String(markerFrom.y));
  marker.setAttribute('stroke', markerColor);
  const animateX = document.createElementNS(graph.namespaceURI, 'animate');
  animateX.setAttribute('attributeName', 'cx');
  animateX.setAttribute('from', String(markerFrom.x));
  animateX.setAttribute('to', String(markerTo.x));
  animateX.setAttribute('dur', '0.8s');
  animateX.setAttribute('fill', 'freeze');
  const animateY = document.createElementNS(graph.namespaceURI, 'animate');
  animateY.setAttribute('attributeName', 'cy');
  animateY.setAttribute('from', String(markerFrom.y));
  animateY.setAttribute('to', String(markerTo.y));
  animateY.setAttribute('dur', '0.8s');
  animateY.setAttribute('fill', 'freeze');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animateX.setAttribute('dur', '0s');
    animateY.setAttribute('dur', '0s');
  }
  marker.append(animateX, animateY);
  graph.appendChild(marker);
  wrapper.appendChild(graph);

  const details = document.createElement('div');
  details.className = 'kociemba-details';
  details.innerHTML = `
    <section class="k-detail phase-one-detail${phaseIndex >= 1 && phaseIndex <= 2 ? ' detail-current' : ''}">
      <span class="k-detail-number">PHASE 1 / REACH G₁</span>
      <strong>What must be true before phase 2?</strong>
      <div class="constraint-row"><i class="constraint-icon orientation-icon">↻</i><span><b>Corner + edge orientation</b><small>No piece is twisted or flipped</small></span><em class="${phaseIndex >= 2 ? 'constraint-done' : ''}">${phaseIndex >= 2 ? '✓' : '1'}</em></div>
      <div class="constraint-row"><i class="constraint-icon slice-icon">▥</i><span><b>4 middle-slice edges</b><small>All four are in the E slice</small></span><em class="${phaseIndex >= 2 ? 'constraint-done' : ''}">${phaseIndex >= 2 ? '✓' : '2'}</em></div>
    </section>
    <div class="subgroup-gate${phaseIndex >= 2 ? ' gate-open' : ''}"><span>G₁</span><small>${phaseIndex >= 2 ? 'REACHED' : 'TARGET'}</small></div>
    <section class="k-detail phase-two-detail${phaseIndex >= 3 ? ' detail-current' : ''}">
      <span class="k-detail-number">PHASE 2 / STAY IN G₁</span>
      <strong>Allowed moves preserve the constraints</strong>
      <div class="move-set">${['U', 'U2', 'U′', 'D', 'D2', 'D′', 'R2', 'L2', 'F2', 'B2'].map(move => `<span${phaseIndex === 3 && move === 'R2' ? ' class="move-active"' : ''}>${move}</span>`).join('')}</div>
      <small class="move-set-note">For this example, R2 takes the intermediate state to solved.</small>
    </section>`;
  wrapper.appendChild(details);
  const note = document.createElement('p');
  note.className = 'phase-explainer';
  note.textContent = phaseIndex < 2
    ? 'The goal of phase 1 is a specific kind of cube state—not necessarily the solved cube.'
    : phaseIndex === 2
      ? 'This example has reached R2: its phase-one constraints hold, but pieces still need a phase-two turn.'
      : phaseIndex < 4
        ? 'The phase-two move set preserves G₁ while finishing the remaining piece arrangement.'
        : 'The cube solution is the phase-one path U R F followed by phase-two move R2.';
  wrapper.appendChild(note);
  container.replaceChildren(wrapper);
}

function edgeKey(a, b) {
  return [a, b].sort().join('-');
}

function metricText(algorithm, step) {
  if (algorithm === 'idastar') return `f = g + h  ·  LIMIT: ${step.threshold}`;
  if (algorithm === 'astar') return `g = cost so far  ·  h = estimate  ·  f = g + h`;
  if (algorithm === 'kociemba') return step.phaseIndex < 2
    ? 'PHASE 1 · PRUNING TABLES'
    : step.phaseIndex === 2 ? 'SUBGROUP G₁ REACHED'
      : step.phaseIndex < 4 ? 'PHASE 2 · RESTRICTED MOVES' : 'SOLUTION FOUND';
  if (algorithm === 'bfs') return `FRONTIER: ${(step.frontier || step.queue || []).length}`;
  return `DEPTH: ${(step.visited || []).length ? Math.max(...(step.visited || []).map(id => (algorithms[algorithm].stateMap[id] || []).length)) : 0}  ·  QUEUE: ${(step.queue || []).length}`;
}

function renderStep() {
  const algorithm = algorithms[selectedAlgorithm];
  const step = algorithm.steps[stepIndex];
  const graphTitle = document.getElementById('graph-title');
  const graphLegend = document.getElementById('graph-legend');
  document.getElementById('algorithm-kicker').textContent = algorithm.title;
  document.getElementById('graph-caption').textContent = algorithm.caption;
  graphTitle.textContent = selectedAlgorithm === 'astar' ? 'STATE GRAPH + PRIORITY QUEUE'
    : selectedAlgorithm === 'idastar' ? 'DEPTH-FIRST SEARCH TREE'
      : selectedAlgorithm === 'kociemba' ? 'TWO-PHASE SUBGROUP SEARCH'
        : 'BREADTH-FIRST STATE GRAPH';
  graphLegend.hidden = selectedAlgorithm === 'idastar';
  if (selectedAlgorithm === 'astar') {
    graphLegend.innerHTML = '<span class="a-star-key"><i>g</i> cost so far</span><span class="a-star-key"><i>h</i> estimated moves left</span><span class="a-star-key"><i>f</i> total score</span>';
  } else if (selectedAlgorithm === 'bfs') {
    graphLegend.innerHTML = '<i class="legend-dot start"></i>Start <i class="legend-dot frontier"></i>Frontier <i class="legend-dot visited"></i>Visited <i class="legend-dot goal"></i>Goal';
  } else if (selectedAlgorithm === 'kociemba') {
    graphLegend.innerHTML = '<i class="legend-dot k-phase-one"></i>Phase 1 <i class="legend-dot k-phase-two"></i>Phase 2 solution <i class="legend-dot k-pruned"></i>Pruned';
  }
  document.getElementById('step-count').textContent = `${String(stepIndex + 1).padStart(2, '0')} / ${String(algorithm.steps.length).padStart(2, '0')}`;
  document.getElementById('step-phase').textContent = step.phase;
  document.getElementById('step-title').textContent = step.title;
  document.getElementById('step-description').textContent = step.description;
  document.getElementById('metric-caption').textContent = metricText(selectedAlgorithm, step);
  document.getElementById('data-card').innerHTML = `<span class="data-label">${step.dataLabel}</span><code>${escapeHtml(step.data)}</code>`;
  const progress = document.getElementById('step-progress');
  progress.replaceChildren(...algorithm.steps.map((_, index) => {
    const marker = document.createElement('i');
    if (index <= stepIndex) marker.className = 'done';
    return marker;
  }));
  document.getElementById('previous-step').disabled = stepIndex === 0;
  const next = document.getElementById('next-step');
  const complete = stepIndex === algorithm.steps.length - 1;
  next.classList.toggle('is-complete', complete);
  next.querySelector('span').textContent = complete ? 'Start again' : 'Next step';
  next.querySelector('b').textContent = complete ? '↺' : '→';
  renderGraph(selectedAlgorithm, step);
  renderCubeContext(selectedAlgorithm, step);
}

function renderAlgorithmInfo() {
  const info = algorithmInfo[selectedAlgorithm];
  const panel = document.getElementById('algorithm-info-panel');
  const heading = document.createElement('div');
  heading.className = 'algorithm-info-heading';
  const kicker = document.createElement('p');
  kicker.className = 'eyebrow';
  kicker.textContent = 'ALGORITHM FIELD GUIDE';
  const title = document.createElement('h2');
  title.textContent = info.name;
  const summary = document.createElement('p');
  summary.className = 'algorithm-info-summary';
  summary.textContent = info.summary;
  const closeButton = document.createElement('button');
  closeButton.className = 'more-info-button';
  closeButton.type = 'button';
  closeButton.dataset.flipToggle = '';
  closeButton.setAttribute('aria-expanded', String(showingAlgorithmInfo));
  closeButton.setAttribute('aria-controls', 'algorithm-info-panel');
  closeButton.innerHTML = 'Back to walkthrough <span aria-hidden="true">↻</span>';
  heading.append(kicker, title, summary, closeButton);

  const facts = document.createElement('div');
  facts.className = 'algorithm-info-facts';
  const factGroups = [
    { title: 'What it does to the cube', text: info.effect },
    { title: 'Practicality & feasibility', text: info.practical },
    { title: 'History', text: info.history },
    { title: 'Correctness', text: info.correctness },
    { title: 'Implementation notes', text: info.implementation },
    { title: 'Runtime & memory', text: `Runtime: ${info.runtime}\nMemory: ${info.memory}` }
  ];
  for (const fact of factGroups) {
    const article = document.createElement('article');
    const factTitle = document.createElement('h3');
    factTitle.textContent = fact.title;
    const text = document.createElement('p');
    text.textContent = fact.text;
    article.append(factTitle, text);
    facts.appendChild(article);
  }

  const pseudocode = document.createElement('div');
  pseudocode.className = 'pseudocode';
  const pseudoTitle = document.createElement('h3');
  pseudoTitle.textContent = 'Pseudocode';
  const code = document.createElement('pre');
  code.textContent = info.pseudocode;
  pseudocode.append(pseudoTitle, code);
  panel.replaceChildren(heading, facts, pseudocode);
}

function setAlgorithmInfoVisible(visible) {
  showingAlgorithmInfo = visible;
  document.getElementById('walkthrough-flip-inner').classList.toggle('is-flipped', visible);
  const front = document.querySelector('.walkthrough-front');
  const panel = document.getElementById('algorithm-info-panel');
  front.inert = visible;
  front.setAttribute('aria-hidden', String(visible));
  panel.inert = !visible;
  panel.setAttribute('aria-hidden', String(!visible));
  document.getElementById('more-info-button').setAttribute('aria-expanded', String(visible));
  document.querySelectorAll('[data-flip-toggle]').forEach(button => {
    button.setAttribute('aria-expanded', String(visible));
  });
}

function stopPlayback() {
  if (playbackTimer !== null) {
    window.clearInterval(playbackTimer);
    playbackTimer = null;
  }
  const button = document.getElementById('play-steps');
  button.innerHTML = '<span aria-hidden="true">▶</span> Play';
  button.setAttribute('aria-pressed', 'false');
}

function startPlayback() {
  const button = document.getElementById('play-steps');
  button.innerHTML = '<span aria-hidden="true">Ⅱ</span> Pause';
  button.setAttribute('aria-pressed', 'true');
  playbackTimer = window.setInterval(() => {
    if (stepIndex >= algorithms[selectedAlgorithm].steps.length - 1) {
      stopPlayback();
      return;
    }
    stepIndex++;
    renderStep();
  }, selectedAlgorithm === 'kociemba' ? 3200 : 2200);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

document.querySelectorAll('.algorithm-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    stopPlayback();
    selectedAlgorithm = tab.dataset.algorithm;
    stepIndex = 0;
    document.querySelectorAll('.algorithm-tab').forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    renderStep();
    renderAlgorithmInfo();
    setAlgorithmInfoVisible(showingAlgorithmInfo);
  });
});

document.querySelectorAll('.representation-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.representation-tab').forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    renderRepresentation();
  });
});

document.getElementById('representation-turn').addEventListener('click', () => {
  representationMoveCount = Math.min(4, representationMoveCount + 1);
  renderRepresentation();
});

document.getElementById('representation-reset').addEventListener('click', () => {
  representationMoveCount = 0;
  renderRepresentation();
});

document.getElementById('play-steps').addEventListener('click', () => {
  if (playbackTimer !== null) {
    stopPlayback();
    return;
  }
  if (stepIndex === algorithms[selectedAlgorithm].steps.length - 1) stepIndex = 0;
  renderStep();
  startPlayback();
});

document.getElementById('previous-step').addEventListener('click', () => {
  stopPlayback();
  if (stepIndex > 0) {
    stepIndex--;
    renderStep();
  }
});

document.getElementById('next-step').addEventListener('click', () => {
  stopPlayback();
  stepIndex = stepIndex === algorithms[selectedAlgorithm].steps.length - 1 ? 0 : stepIndex + 1;
  renderStep();
});

document.getElementById('restart-algorithm').addEventListener('click', () => {
  stopPlayback();
  stepIndex = 0;
  renderStep();
});

document.getElementById('more-info-button').addEventListener('click', () => {
  renderAlgorithmInfo();
  setAlgorithmInfoVisible(!showingAlgorithmInfo);
});

document.getElementById('algorithm-info-panel').addEventListener('click', event => {
  if (event.target.closest('[data-flip-toggle]')) setAlgorithmInfoVisible(false);
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName)) return;
  if (event.key === 'ArrowRight') document.getElementById('next-step').click();
  if (event.key === 'ArrowLeft') document.getElementById('previous-step').click();
});

setupSolverControls();
setupInteractiveCube();
renderRepresentation();
renderStep();
renderAlgorithmInfo();
setAlgorithmInfoVisible(showingAlgorithmInfo);
renderSolverCube();
renderSolverStats();
