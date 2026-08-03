# THE PHANTOM V5 Master Screen Architecture

THE PHANTOM V5 — Master Screen Architecture (Navigation Blueprint)
Part 1 — Application Hierarchy
Launch → Splash → Onboarding → Authentication → Home → Sessions → Gameplay → Results → Legacy → World → Squad → Camp → Creator → Wallet → Notifications → Search → Profile → Settings
Part 2 — Navigation Graph
Document every screen and every destination. No isolated screens.
Part 3 — Screen Specification
For every screen define: Purpose, Entry Points, Exit Points, Widgets, Persistent Components, Quick Actions, Bottom Navigation, Overlays, Bottom Sheets, Popups, Back Action, Deep Links, Dependencies.
Part 4 — Bottom Navigation Blueprint
Home, Sessions, World, Creator, Legacy with their internal sections.
Part 5 — Button Map
Every button documents destination, confirmation flow and return path.
Part 6 — Bottom Sheets
Deposit, Withdraw, Join Session, Purchase Item, Promotion, Camp Funding, Squad Invite, Create Squad, Create Camp, Share Replay, Creator Analytics, Notifications, Filters, Edit Profile, Treasury.
Part 7 — Modal System
Insufficient Balance, Insufficient Tokens, Promotion, Leave Squad, Leave Camp, Season End, Legacy War, Session Cancelled, Reward Ready, Camp Takeover.
Part 8 — Overlay System
Countdowns, Recording, Voice Active, Searching Players, Connection Lost, Replay Saved.
Part 9 — Popup System
Token gain, Influence gain, Shield Activated, New Session, Funding Complete.
Part 10 — Notification Architecture
Session, Squad, Camp, Legacy, Creator, Wallet, Social, System, War.
Part 11 — Deep Links
Every notification opens directly to its relevant screen.
Part 12 — Navigation Rules
Maximum three taps to major features; preserve context; use bottom sheets where possible; never interrupt gameplay.
Part 13 — Global Floating Components
Session countdown, recording indicator, live status, promotion tracker, camp war banner.
Part 14 — Screen States
Loading, Empty, Live, Success, Error, Offline, First-Time, Returning.
Part 15 — Major User Flows
New Player, Returning Player, Join Session, Session Completion, Promotion, Squad, Camp, Creator, Wallet, Legacy War.
Part 16 — Contextual Entry Matrix
Define entry paths from notifications, invites, links and shared content into every feature.