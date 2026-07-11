# Cinematic Session Spin Wheel Redesign Walkthrough

The **Session Spin Wheel system** has been completely redesigned to deliver a premium, high-stakes cinematic experience. The interface no longer behaves like a simple flat UI widget; instead, it behaves like an immersive gameplay event inside **THE PHANTOM** world. 

All timing details, particle effects, audio triggers, state machine transitions, and dynamic token-to-HUD flights are fully implemented and integrated.

---

## 1. Summary of Changes

### Timing & Configuration Centralization
*   **Centralized Config**: Added the centralized layout config to [spinConfig.ts](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/config/spinConfig.ts) defining `SPIN_TIMINGS`, `OUTCOME_CONFIG` (colors, shake intensities, sounds), `WHEEL_CONFIG` (5-segment layout, scale, order), and `EASING` curves.
*   **Clean 5-Segment Wheel Geometry**: The wheel now has exactly 5 segments (occupied at exactly $72^\circ$ per slice) arranged clockwise starting from top: **ADVANCE → ACQUIRE → STEAL → VOID → DISCOVER**.

### Modular Component Architecture
We refactored the spin wheel implementation into modular subcomponents located under the `/src/components/gameplay/premium-wheel/` directory:
1.  [SpinWheel](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/PremiumSpinWheel.tsx) — Main orchestrator managing the `SpinStateMachine` transitions and state updates.
2.  [SpinAnimator](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/SpinAnimator.tsx) — Renders the rotating SVG wheel slices (using mathematically aligned segment clipping and upright text rotations) with tick sounds, decelerations, and needle bounce locks.
3.  [RevealSequence](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/RevealSequence.tsx) — Coordinates full-screen ambient dimming, center energy sparks, expanding light bursts, white screen flashes, and heavy viewport camera shakes.
4.  [OutcomeCard](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/OutcomeCard.tsx) — A 3D floating reward card displaying the Category Pill, Big Value, and Narrative Subtitle with ambient flowing ember particles.
5.  [TokenCollectionAnimator](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/TokenCollectionAnimator.tsx) — Spawns separate token particles that fly along dynamically calculated Bezier paths from the center of the screen to the player's HUD token counter, fanning out in a scatter spray and updating the counter incrementally on arrival.
6.  [ParticleController](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/ParticleController.tsx) — Emits GPU-friendly celebration particle bursts (gold shards/rays, green crystals, blue sparks, red smoke, gray desaturated dust).
7.  [SpinAudioController](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/components/gameplay/premium-wheel/SpinAudioController.ts) — Safe audio wrapper for mechanical launch sounds, ticking rotations, lock clicks, success/failure chimes, and token tick impacts.

### State-Synchronization Re-Architecture
*   **Visual & Server Sync**: Previously, when clicking the Spin button, the server's response would immediately update client tokens and open the Steal Picker, causing visual desynchronization while the wheel was still rotating.
*   **The Fix**: Refactored [page.tsx](file:///c:/Users/hp/Documents/ThePhantomNetwork/src/app/%28player%29/play/%5BsessionId%5D/page.tsx) to store the server's spin response in a `pendingSpinData` ref.
    *   **Tokens**: Awarded one-by-one by the `TokenCollectionAnimator` as each particle physically lands in the HUD. A final hard-sync updates the store to the server's exact value when the sequence fully resolves.
    *   **Steals**: The Steal Target Picker is only fetched and rendered *after* the reveal sequence finishes (transitioning automatically to target selection).

---

## 2. Timing Sequence Verification

| Phase | Timeline | Action / Effect | State Machine State |
| :--- | :--- | :--- | :--- |
| **Impulse** | `0.0s - 0.3s` | Spin tap triggers powerful launch, camera zooms in, ambient darkens. | `SPIN_START` |
| **Spin** | `0.3s - 4.8s` | High-speed spinning, wiggling needle, rapid loop ticks. | `SPINNING` |
| **Slowdown** | `4.8s - 5.6s` | Progressive slowdown, ticking frequency decays. | `DECELERATING` |
| **Lock** | `5.6s - 6.0s` | Precise needle stop, lock click sound, wheel locks. | `LOCKED` |
| **Pause** | `0.0s - 0.3s` (Reveal) | Brief suspenseful pause, wheel frozen, sound dims. | `REVEAL_START` |
| **Energy** | `0.3s - 0.8s` (Reveal) | Colored energy starts forming at the center of the wheel. | `REVEAL_START` |
| **Burst** | `0.8s - 1.1s` (Reveal) | Expands into a large burst of light. | `REVEAL_START` |
| **Flash** | `1.1s - 1.3s` (Reveal) | Full-screen white flash, camera shake impact. | `REVEAL_START` |
| **Explode** | `1.3s - 1.5s` (Reveal) | Outcome card explodes into view. | `OUTCOME_REVEAL` |
| **Animate** | `1.5s - 3.0s` (Reveal) | Burst particles, floating embers, and fanned token flights. | `TOKEN_COLLECTION` or `STEAL_SELECTION` |

---

## 3. Verification Plan & Test Outputs

### Automated Tests
*   All unit and integration tests successfully verified the system behavior:
    ```bash
    npm test
    ```
    *   **Result**: `22 tests passed` (including real-time gameplay integration flow, stores, and schema validations).

### Manual Verification Steps
1.  **Launch Dev Server**: Start with `npm run dev`.
2.  **Trigger Spin**: Press the central **SPIN** button.
3.  **Validate Timeline**:
    *   Confirm that the wheel spins for exactly 6 seconds.
    *   Verify that the screen dims and the camera zooms during the spin.
    *   Ensure the needle has a realistic lock-bounce on landing.
4.  **Confirm Reveal Sequence**:
    *   Confirm the 3-second delay sequence (pause -> energy -> burst -> flash -> card).
    *   Verify the full-screen flash and physical camera shake on card emergence.
5.  **Check Token Arrivals**:
    *   When landing on **ADVANCE (+3)**, confirm that 3 tokens fly along distinct bezier trajectories to the token counter.
    *   Ensure the HUD token number ticks up (+1 for each particle) only *after* the token hits the counter.
6.  **Verify Steal Transition**:
    *   Validate that landing on **STEAL** turns the screen dark red with smoke, and immediately displays the Victim/Target Picker once the card fades.
