# Cinematic Wheel — Rive State Machine Contract

Production wheel animations must be authored in [Rive Editor](https://rive.app) and exported to `public/animations/wheel.riv`.

## State Machine: `WheelSM`

| Cinematic State | Input / Trigger | Visual intent |
|-----------------|-----------------|---------------|
| `Idle` | `idle` | Slow rotation, breathing glow, orbiting particles |
| `SpinStart` | `spin_start` | Acceleration, energy gather, outer ring glow |
| `Spinning` | `spinning` | Full-speed rotation, glow pulses, particle trail |
| `SpinSlowdown` | `spin_slowdown` | Gradual deceleration, narrowing glow |
| `RewardReveal` | `reward_reveal` | Card expand, shockwave, particles |
| `Advance` | `advance` | Golden explosion, victory rays |
| `Acquire` | `acquire` | Coin pulse, crystal fragments |
| `Discover` | `discover` | Blue ripple, runes, mystic glow |
| `Steal` | `steal` | Shadow slash, dark energy pull |
| `Void` | `void` | Glow collapse, smoke fade |

## Integration

- Registry: [`src/lib/cinematic/AnimationRegistry.ts`](../src/lib/cinematic/AnimationRegistry.ts)
- Mount: `<RiveSlot animationId="wheel" />` inside the wheel zone
- Audio sync: automatic via `AudioStateMachine` when cinematic states transition

## Placeholder

Until production art is ready, `npm run fetch-audio` downloads a placeholder `.riv`. Replace `public/animations/wheel.riv` and update the registry if the state machine name changes.
