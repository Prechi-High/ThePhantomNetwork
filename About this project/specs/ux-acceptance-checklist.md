# DS-5 UX Acceptance Checklist

Per-screen validation before marking redesign complete.

- [ ] Uses V5 tokens from `src/lib/design/tokens.ts` / `globals.css`
- [ ] Single dominant focal element above the fold
- [ ] Answers: Who am I? How am I progressing? What next? Why care now?
- [ ] Reachable in ≤3 taps from Home
- [ ] ScreenState variants: loading, empty, error
- [ ] Temporary actions use BottomSheet, not new pages
- [ ] No `fetch()` in page components
- [ ] Gameplay preserves four-engine separation

## Routes verified

| Route | Focal element | Status |
|-------|---------------|--------|
| `/` | LEGACIES splash | Done |
| `/welcome` | Enter the world | Done |
| `/tutorial` | Guided steps | Done |
| `/home` | Next session countdown | Done |
| `/sessions` | Joinable session | Partial |
| `/play/[id]` | Spin wheel | Done |
| `/legacy` | Kata + Influence | Done |
| `/world` | Rankings + War reserve | Done |
| `/creator` | Record CTA | Done |
| `/notifications` | Alert list | Done |

Run guardrail: `node scripts/check-no-fetch-in-components.mjs`
