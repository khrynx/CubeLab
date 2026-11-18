# Solver patch changelog

- 2026-11-18: Load the vendored CubeJS source, restrict phase-two coordinate merging to the phase-two start state, add search watchdog and bounded shorter-solution refinement, and report unsolved depth limits explicitly.
- 2026-11-17: Added a vendored CubeJS patch that records the real phase-1 boundary during Kociemba's two-phase solve.
- 2026-11-17: Exposed `solveFaceletsDetailed(facelets, maxDepth)` while preserving the original `solveFacelets()` output.
- 2026-11-17: Rebuilt the browser bundle from the local source so the page loads the patched solver without stub code.
