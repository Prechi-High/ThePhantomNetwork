# THE PHANTOM — Complete Product Audit & Screen Inventory

---

## 1. NAVIGATION MAP

### Player Routes (protected by authentication)
- `/home` — Home Dashboard
- `/sessions` — Session Browser
- `/sessions/[sessionId]` — Session Details
- `/play/[sessionId]` — Gameplay Arena
- `/squads` — Squad Browser
- `/squads/[squadId]` — Squad Details
- `/camps` — Camp Browser
- `/camps/[campId]` — Camp Details
- `/shop` — Shop
- `/profile` — User Profile
- `/profile/sessions` — Session History
- `/rivals` — Rivals
- `/social` — Social

### Auth Routes
- `/login` — Login
- `/onboarding` — Onboarding
- `/auth/callback` — Auth Callback

### Admin Routes
- `/admin/login` — Admin Login
- `/admin` — Admin Dashboard
- `/admin/analytics` — Analytics & Economy
- `/admin/camps` — Camp Management
- `/admin/errors` — Error Monitor
- `/admin/sessions` — Session Management
- `/admin/sessions/new` — Create New Session
- `/admin/sessions/[sessionId]` — Edit Session
- `/admin/users` — User Moderation

### Camp Owner Routes
- `/camp-owner` — Camp Owner Dashboard
- `/camp-owner/members` — Camp Members
- `/camp-owner/recruit` — Recruit Players
- `/camp-owner/revenue` — Camp Revenue
- `/camp-owner/squads` — Camp Squads

---

## 2. COMPLETE SCREEN INVENTORY

---

### **Screen 1: Root Redirect**
- **Route / File Path**: `/` (src/app/page.tsx)
- **Parent Navigation**: Initial entry
- **Purpose**: Redirect to login, onboarding, or home based on user state
- **Current Features**: Redirect logic only
- **Current Components**: None
- **User Actions**: None
- **Inputs**: None
- **Outputs**: Redirects user
- **Current Data Displayed**: None
- **Connected Systems**: Authentication
- **Design Purpose Classification**: Keep

---

### **Screen 2: Login**
- **Route / File Path**: `/login` (src/app/(auth)/login/page.tsx)
- **Parent Navigation**: Initial entry, or redirected from root
- **Purpose**: Authenticate users via Telegram, Google, or dev mode
- **Current Features**:
  - Telegram auto-login
  - Google OAuth button
  - Dev login button
  - Captcha verification
- **Current Components**: Button, Card
- **User Actions**: Click login buttons, enter captcha
- **Inputs**: Buttons, forms
- **Outputs**: Calls /api/auth/telegram, /api/auth/captcha, /api/auth/dev; navigates to /home or /onboarding
- **Current Data Displayed**: Login options, errors
- **Connected Systems**: Authentication, Telegram
- **Design Purpose Classification**: Keep

---

### **Screen 3: Onboarding**
- **Route / File Path**: `/onboarding` (src/app/(auth)/onboarding/page.tsx + OnboardingContent.tsx)
- **Parent Navigation**: Redirected from login or root
- **Purpose**: Complete user profile setup (choose avatar, enter referral code)
- **Current Features**:
  - Avatar selection grid
  - Referral code input (optional)
- **Current Components**: Button, Card
- **User Actions**: Select avatar, enter referral code, click complete button
- **Inputs**: Buttons, form
- **Outputs**: Calls /api/auth/onboarding; navigates to /home
- **Current Data Displayed**: Avatar options, referral code field
- **Connected Systems**: Authentication, Profiles, Camps
- **Design Purpose Classification**: Keep

---

### **Screen 4: Home Dashboard**
- **Route / File Path**: `/home` (src/app/(player)/home/page.tsx)
- **Parent Navigation**: Redirected from onboarding, or via NavBar
- **Purpose**: Primary landing page for players
- **Current Features**:
  - Welcome message
  - Wallet balance display
  - Upcoming sessions
  - Quick links to Rivals and Social
- **Current Components**: Card, UpcomingSessions
- **User Actions**: Click links to other pages
- **Inputs**: Links
- **Outputs**: Navigation
- **Current Data Displayed**:
  - Username
  - Camp name
  - Wallet balance
  - Upcoming sessions
- **Connected Systems**: Profiles, Sessions, Camps, Economy
- **Design Purpose Classification**: Keep

---

### **Screen 5: Session Browser**
- **Route / File Path**: `/sessions` (src/app/(player)/sessions/page.tsx)
- **Parent Navigation**: NavBar
- **Purpose**: Browse available sessions
- **Current Features**:
  - Session list with status, countdown, entry fee, pool size
- **Current Components**: Button, Card, Badge, SessionCountdown
- **User Actions**: Click "Details" or "Play" buttons
- **Inputs**: Buttons, links
- **Outputs**: Navigation
- **Current Data Displayed**:
  - Session title
  - Start time
  - Status
  - Entry fee
  - Pool size
  - Registered count
- **Connected Systems**: Sessions, Economy
- **Design Purpose Classification**: Keep

---

### **Screen 6: Session Details**
- **Route / File Path**: `/sessions/[sessionId]` (src/app/(player)/sessions/[sessionId]/page.tsx)
- **Parent Navigation**: Session Browser or NavBar
- **Purpose**: View session details and join
- **Current Features**:
  - Session info display
  - Countdown timer
  - Join button (when open)
  - Enter gameplay button (when active)
  - Visit shop link
- **Current Components**: Button, Card, Badge, SessionCountdown
- **User Actions**: Join session, visit shop, enter gameplay
- **Inputs**: Buttons
- **Outputs**: Calls /api/sessions/[sessionId]/join; navigates to /shop or /play
- **Current Data Displayed**:
  - Session title
  - Start time
  - Status
  - Entry fee
  - Pool size
  - Registration closes time
- **Connected Systems**: Sessions, Economy, Shop
- **Design Purpose Classification**: Keep

---

### **Screen 7: Gameplay Arena**
- **Route / File Path**: `/play/[sessionId]` (src/app/(player)/play/[sessionId]/page.tsx + GameplayArena.tsx)
- **Parent Navigation**: Session Details or NavBar
- **Purpose**: Main gameplay screen
- **Current Features**:
  - Cinematic background
  - Phase/round info
  - Countdown timer
  - Player rank
  - Token count
  - Squad panel
  - Leaderboard
  - Premium spin wheel
  - Steal target picker
  - Fire boost meter
  - Revive panel
  - TikTok-style action rail
  - Power-ups bar
- **Current Components**:
  - PremiumWheel
  - ButtonAnimator
  - StealTargetPicker
  - FireBoostMeter
  - RevivePanel
  - AnimatedAvatar
  - TikTokActionRail
  - Button
  - Badge
- **User Actions**: Spin wheel, select steal target, fire boost, resolve steal, contribute to revive
- **Inputs**: Buttons
- **Outputs**:
  - Calls /api/gameplay/spin
  - Calls /api/gameplay/steal/[execute|boost|targets]
  - Calls /api/gameplay/revive/contribute
  - Animations, state changes
- **Current Data Displayed**:
  - Phase, round
  - Tokens
  - Rank
  - Squad members and status
  - Leaderboard
  - Spin outcome
  - Steal targets
  - Fire boost taps
  - Revive contribution status
- **Connected Systems**: Gameplay, Sessions, Squads, Economy, Notifications
- **Design Purpose Classification**: Keep

---

### **Screen 8: Squad Browser**
- **Route / File Path**: `/squads` (src/app/(player)/squads/page.tsx)
- **Parent Navigation**: NavBar
- **Purpose**: Browse squads and create/join
- **Current Features**:
  - Squad leaderboard
  - Your squad info (if in one)
  - Create new squad form
- **Current Components**: Button, Card
- **User Actions**: Create squad, view squad details
- **Inputs**: Buttons, form
- **Outputs**: Calls /api/squads; navigates to squad details
- **Current Data Displayed**:
  - Squad leaderboard
  - Your squad name and tokens
- **Connected Systems**: Squads, Profiles
- **Design Purpose Classification**: Keep

---

### **Screen 9: Squad Details**
- **Route / File Path**: `/squads/[squadId]` (src/app/(player)/squads/[squadId]/page.tsx)
- **Parent Navigation**: Squad Browser or NavBar
- **Purpose**: View squad details and members
- **Current Features**:
  - Squad info (name, tokens, history)
  - Member list
- **Current Components**: Card
- **User Actions**: None
- **Inputs**: None
- **Outputs**: None
- **Current Data Displayed**:
  - Squad name
  - Member count
  - Squad tokens
  - History sessions
  - Members
- **Connected Systems**: Squads, Profiles
- **Design Purpose Classification**: Keep

---

### **Screen 10: Camp Browser**
- **Route / File Path**: `/camps` (src/app/(player)/camps/page.tsx)
- **Parent Navigation**: NavBar
- **Purpose**: Browse available camps
- **Current Features**: Camp list with leaderboard score
- **Current Components**: Card
- **User Actions**: View camp details
- **Inputs**: Links
- **Outputs**: Navigation
- **Current Data Displayed**:
  - Camp name
  - Member count
  - Leaderboard score
- **Connected Systems**: Camps
- **Design Purpose Classification**: Keep

---

### **Screen 11: Camp Details**
- **Route / File Path**: `/camps/[campId]` (src/app/(player)/camps/[campId]/page.tsx)
- **Parent Navigation**: Camp Browser or NavBar
- **Purpose**: View camp details and switch
- **Current Features**:
  - Camp info
  - Camp leaderboard
  - Switch camp button
- **Current Components**: Button, Card
- **User Actions**: Switch to camp
- **Inputs**: Button
- **Outputs**: Calls /api/camps/switch
- **Current Data Displayed**:
  - Camp name
  - Member count
  - Score
  - Leaderboard
- **Connected Systems**: Camps
- **Design Purpose Classification**: Keep

---

### **Screen 12: Shop**
- **Route / File Path**: `/shop` (src/app/(player)/shop/page.tsx + ShopContent.tsx)
- **Parent Navigation**: NavBar, Session Details
- **Purpose**: Buy in-game items and power-ups for sessions
- **Current Features**:
  - Shop items grouped by economy type
  - Purchase items with real money or squad tokens
  - Locked when session is active/locked
- **Current Components**: Button, Card, Badge
- **User Actions**: Buy items
- **Inputs**: Buttons
- **Outputs**: Calls /api/shop/purchase
- **Current Data Displayed**:
  - Shop items (name, description, price)
  - Locked status
- **Connected Systems**: Shop, Economy, Sessions
- **Design Purpose Classification**: Keep

---

### **Screen 13: User Profile**
- **Route / File Path**: `/profile` (src/app/(player)/profile/page.tsx)
- **Parent Navigation**: NavBar
- **Purpose**: View and edit user profile, manage wallet
- **Current Features**:
  - Edit profile (username, avatar)
  - Wallet display
  - Deposit funds
  - Session history link
  - Admin login link
  - Prestige score
  - Transactions list
- **Current Components**: Button, Card, WalletDeposit
- **User Actions**: Edit profile, deposit funds, view history
- **Inputs**: Buttons, forms
- **Outputs**: Calls /api/profile, /api/wallet/deposit
- **Current Data Displayed**:
  - Username
  - Avatar
  - Level
  - Wallet balance
  - Prestige score
  - Transactions
- **Connected Systems**: Profiles, Economy, Authentication
- **Design Purpose Classification**: Keep

---

### **Screen 14: Session History**
- **Route / File Path**: `/profile/sessions` (src/app/(player)/profile/sessions/page.tsx)
- **Parent Navigation**: Profile
- **Purpose**: View past sessions
- **Current Features**: Session history list
- **Current Components**: Card
- **User Actions**: None
- **Inputs**: None
- **Outputs**: None
- **Current Data Displayed**:
  - Final rank
  - Final tokens
- **Connected Systems**: Sessions, History
- **Design Purpose Classification**: Keep

---

### **Screen 15: Rivals**
- **Route / File Path**: `/rivals` (src/app/(player)/rivals/page.tsx)
- **Parent Navigation**: Home or NavBar
- **Purpose**: View rival players
- **Current Features**: Rival list with intensity
- **Current Components**: Card, Badge
- **User Actions**: None
- **Inputs**: None
- **Outputs**: None
- **Current Data Displayed**:
  - Rivalries, intensity
- **Connected Systems**: Rivals
- **Design Purpose Classification**: Keep

---

### **Screen 16: Social**
- **Route / File Path**: `/social` (src/app/(player)/social/page.tsx)
- **Parent Navigation**: Home or NavBar
- **Purpose**: Connect with other players
- **Current Features**: "Played with" list
- **Current Components**: Button, Card
- **User Actions**: Invite to squad
- **Inputs**: Buttons
- **Outputs**: None
- **Current Data Displayed**:
  - Players played with, session count
- **Connected Systems**: Social, Squads
- **Design Purpose Classification**: Keep

---

### **Screen 17: Admin Login**
- **Route / File Path**: `/admin/login` (src/app/admin/(auth)/login/page.tsx)
- **Parent Navigation**: Profile link or direct
- **Purpose**: Authenticate admins
- **Current Features**: Email/password login
- **Current Components**: Button, Card
- **User Actions**: Enter email/password, submit
- **Inputs**: Form
- **Outputs**: Calls /api/admin/auth/login; navigates to /admin
- **Current Data Displayed**: Login form, errors
- **Connected Systems**: Authentication, Admin
- **Design Purpose Classification**: Keep

---

### **Screen 18: Admin Dashboard**
- **Route / File Path**: `/admin` (src/app/admin/(panel)/page.tsx)
- **Parent Navigation**: Admin login or admin nav
- **Purpose**: Admin overview and quick actions
- **Current Features**:
  - Revenue and participation stats
  - Quick links to create session, manage camps, user moderation
- **Current Components**: Card, Badge
- **User Actions**: Navigate to admin pages
- **Inputs**: Links
- **Outputs**: Navigation
- **Current Data Displayed**:
  - Deposits
  - Entry fees
  - Platform revenue
  - Registrations
  - Active/completed sessions
- **Connected Systems**: Admin, Analytics, Economy
- **Design Purpose Classification**: Keep

---

### **Screen 19: Admin Analytics & Economy**
- **Route / File Path**: `/admin/analytics` (src/app/admin/(panel)/analytics/page.tsx)
- **Parent Navigation**: Admin nav
- **Purpose**: View analytics and configure economy defaults
- **Current Features**:
  - Revenue and participation analytics
  - Platform config form (platform fee, entry fee, camp share, switch level)
- **Current Components**: Button, Card
- **User Actions**: Save config
- **Inputs**: Form, button
- **Outputs**: Calls /api/admin/config
- **Current Data Displayed**:
  - Revenue analytics
  - Participation stats
  - Current config
- **Connected Systems**: Admin, Analytics, Economy
- **Design Purpose Classification**: Keep

---

### **Screen 20: Admin Camp Management**
- **Route / File Path**: `/admin/camps` (src/app/admin/(panel)/camps/page.tsx)
- **Parent Navigation**: Admin nav
- **Purpose**: Manage camps
- **Current Features**:
  - Camp list
  - Create camp form
- **Current Components**: Button, Card
- **User Actions**: Create camp
- **Inputs**: Form, button
- **Outputs**: Calls /api/admin/camps
- **Current Data Displayed**:
  - Camp name
  - Referral code
  - Member count
  - Owner
- **Connected Systems**: Admin, Camps
- **Design Purpose Classification**: Keep

---

### **Screen 21: Admin Error Monitor**
- **Route / File Path**: `/admin/errors` (src/app/admin/(panel)/errors/page.tsx)
- **Parent Navigation**: Admin nav
- **Purpose**: Monitor and manage errors
- **Current Features**:
  - Error list with severity filters
  - Resolve errors
  - Download JSON
  - Clear all
- **Current Components**: Button, Card, Badge
- **User Actions**: Filter, copy, resolve, download, clear
- **Inputs**: Buttons, filters
- **Outputs**: Calls /api/admin/errors
- **Current Data Displayed**:
  - Errors with severity, area, message, cause, stack, context
- **Connected Systems**: Admin, Monitoring
- **Design Purpose Classification**: Keep

---

### **Screen 22: Admin Session Management**
- **Route / File Path**: `/admin/sessions` (src/app/admin/(panel)/sessions/page.tsx)
- **Parent Navigation**: Admin nav
- **Purpose**: Manage sessions
- **Current Features**:
  - Session list
  - Lock/start buttons
  - Edit link
- **Current Components**: Button, Card, Badge
- **User Actions**: Lock, start, edit
- **Inputs**: Buttons
- **Outputs**: Calls /api/admin/sessions
- **Current Data Displayed**:
  - Session title, time, status, registered, pool
- **Connected Systems**: Admin, Sessions
- **Design Purpose Classification**: Keep

---

### **Screen 23: Admin Create Session**
- **Route / File Path**: `/admin/sessions/new` (src/app/admin/(panel)/sessions/new/page.tsx)
- **Parent Navigation**: Admin sessions page
- **Purpose**: Create new sessions
- **Current Features**:
  - Session creation form
  - Phase configuration
- **Current Components**: Button, Card
- **User Actions**: Create session
- **Inputs**: Form, buttons
- **Outputs**: Calls /api/admin/sessions (PUT)
- **Current Data Displayed**: Form
- **Connected Systems**: Admin, Sessions
- **Design Purpose Classification**: Keep

---

### **Screen 24: Admin Edit Session**
- **Route / File Path**: `/admin/sessions/[sessionId]` (src/app/admin/(panel)/sessions/[sessionId]/page.tsx)
- **Parent Navigation**: Admin sessions page
- **Purpose**: Edit existing sessions
- **Current Features**:
  - Edit session form
  - Phase configuration
  - Cancel session
- **Current Components**: Button, Card
- **User Actions**: Save changes, cancel session
- **Inputs**: Form, buttons
- **Outputs**: Calls /api/admin/sessions/[sessionId]
- **Current Data Displayed**: Form
- **Connected Systems**: Admin, Sessions
- **Design Purpose Classification**: Keep

---

### **Screen 25: Admin User Moderation**
- **Route / File Path**: `/admin/users` (src/app/admin/(panel)/users/page.tsx)
- **Parent Navigation**: Admin nav
- **Purpose**: Manage users
- **Current Features**:
  - User search
  - User list
  - Role management
  - Ban/unban
- **Current Components**: Button, Card, Badge
- **User Actions**: Search, change roles, ban/unban
- **Inputs**: Search, buttons
- **Outputs**: Calls /api/admin/users
- **Current Data Displayed**:
  - Users, roles, level, wallet, ban status
- **Connected Systems**: Admin, Profiles
- **Design Purpose Classification**: Keep

---

### **Screen 26: Camp Owner Dashboard**
- **Route / File Path**: `/camp-owner` (src/app/camp-owner/page.tsx)
- **Parent Navigation**: (camp owner access)
- **Purpose**: Camp owner overview
- **Current Features**:
  - Member count
  - Camp wallet
  - Total revenue
  - Recent activity
- **Current Components**: Button, Card, Badge
- **User Actions**: Navigate to camp owner pages
- **Inputs**: Links
- **Outputs**: Navigation
- **Current Data Displayed**: Camp stats
- **Connected Systems**: Camp Owner, Camps, Economy
- **Design Purpose Classification**: Keep

---

### **Screen 27: Camp Owner Members**
- **Route / File Path**: `/camp-owner/members` (src/app/camp-owner/members/page.tsx)
- **Parent Navigation**: Camp owner nav
- **Purpose**: View camp members
- **Current Features**: Member list
- **Current Components**: Card
- **User Actions**: None
- **Inputs**: None
- **Outputs**: None
- **Current Data Displayed**:
  - Members, level, prestige, sessions played
- **Connected Systems**: Camp Owner, Camps
- **Design Purpose Classification**: Keep

---

### **Screen 28: Camp Owner Recruit**
- **Route / File Path**: `/camp-owner/recruit` (src/app/camp-owner/recruit/page.tsx)
- **Parent Navigation**: Camp owner nav
- **Purpose**: Recruit new players
- **Current Features**:
  - Referral code and link
  - Copy button
- **Current Components**: Button, Card
- **User Actions**: Copy referral link
- **Inputs**: Button
- **Outputs**: Clipboard copy
- **Current Data Displayed**:
  - Referral code, link, member count
- **Connected Systems**: Camp Owner, Camps
- **Design Purpose Classification**: Keep

---

### **Screen 29: Camp Owner Revenue**
- **Route / File Path**: `/camp-owner/revenue` (src/app/camp-owner/revenue/page.tsx)
- **Parent Navigation**: Camp owner nav
- **Purpose**: View camp revenue
- **Current Features**:
  - Wallet balance
  - Total earned
  - Revenue share
  - Revenue events list
- **Current Components**: Card
- **User Actions**: None
- **Inputs**: None
- **Outputs**: None
- **Current Data Displayed**: Revenue stats and events
- **Connected Systems**: Camp Owner, Camps, Economy
- **Design Purpose Classification**: Keep

---

### **Screen 30: Camp Owner Squads**
- **Route / File Path**: `/camp-owner/squads` (src/app/camp-owner/squads/page.tsx)
- **Parent Navigation**: Camp owner nav
- **Purpose**: View camp squads
- **Current Features**: Squad list
- **Current Components**: Card
- **User Actions**: None
- **Inputs**: None
- **Outputs**: None
- **Current Data Displayed**:
  - Squads, member count, tokens, history sessions
- **Connected Systems**: Camp Owner, Camps, Squads
- **Design Purpose Classification**: Keep

---

## 3. FEATURE INVENTORY

### Authentication & Onboarding
- Telegram login
- Google OAuth login
- Dev mode login
- Onboarding (avatar, referral code)
- Session bootstrap

### Gameplay
- Spin wheel
- Phase-based gameplay with rounds
- Token system
- Elimination/Revival
- Stealing from other players
- Fire boost defense
- Squad revival contributions
- Leaderboard
- Squad panel
- TikTok-style action rail
- Power-ups

### Sessions
- Session browser
- Session details
- Join sessions
- Session countdown
- Session management (admin)
- Phase configuration (admin)

### Squads
- Squad browser/leaderboard
- Create/join squads
- Squad details
- Squad members

### Camps
- Camp browser
- Camp details
- Switch camps
- Camp owner dashboard
- Camp members
- Recruit with referral code
- Camp revenue
- Camp squads

### Economy & Shop
- Wallet management
- Deposit funds
- Shop (items/power-ups)
- Session entry fees
- Prize pools
- Camp revenue share

### Social
- Rivals list
- Played with list
- Invite to squad

### Admin
- Dashboard
- Analytics
- Camp management
- Error monitoring
- Session management (create/edit/start/lock/cancel)
- User moderation (roles, bans)

### Notifications
- Floating notifications
- Notification provider

---

## 4. COMPONENT INVENTORY

### UI Components
- **Button** (src/components/ui/Button.tsx) – Primary UI button
- **Card** (src/components/ui/Card.tsx) – Container card with glass effect
- **Badge** (src/components/ui/Badge.tsx) – Status/info badges
- **FloatingNotification** (src/components/ui/FloatingNotification.tsx) – Toast notifications
- **NotificationProvider** (src/components/ui/NotificationProvider.tsx) – Notification context provider
- **ErrorBoundary** (src/components/ui/ErrorBoundary.tsx) – React error boundary

### Layout Components
- **NavBar** (src/components/layout/NavBar.tsx) – Bottom navigation bar
- **LiveFeed** (src/components/layout/LiveFeed.tsx) – Live feed
- **PhaseTimer** (src/components/layout/PhaseTimer.tsx) – Phase timer display

### Avatar Components
- **AnimatedAvatar** (src/components/avatar/AnimatedAvatar.tsx) – Animated user avatar
- **index** (src/components/avatar/index.ts) – Avatar exports

### Gameplay Components
- **GameplayArena** (src/components/gameplay/GameplayArena.tsx) – Main gameplay screen
- **PhantomNetworkIntro** (src/components/gameplay/PhantomNetworkIntro.tsx) – Intro sequence
- **PhaseTransition** (src/components/gameplay/PhaseTransition.tsx) – Phase transition animation
- **RevivePanel** (src/components/gameplay/RevivePanel.tsx) – Revive interface
- **StealTargetPicker** (src/components/gameplay/StealTargetPicker.tsx) – Steal target selection
- **TikTokActionRail** (src/components/gameplay/TikTokActionRail.tsx) – Vertical action buttons
- **FireBoostMeter** (src/components/gameplay/FireBoostMeter.tsx) – Fire boost UI
- **PremiumWheel** (src/components/gameplay/premium-wheel/PremiumWheel.tsx) – Spin wheel
- **ButtonAnimator** (src/components/gameplay/premium-wheel/ButtonAnimator.tsx) – Spin button animation
- **FairnessPanel** (src/components/gameplay/premium-wheel/FairnessPanel.tsx) – Provably fair info
- **config** (src/components/gameplay/premium-wheel/config.ts) – Wheel config
- **index** (src/components/gameplay/premium-wheel/index.ts) – Premium wheel exports

### Session Components
- **SessionCountdown** (src/components/session/SessionCountdown.tsx) – Session countdown timer
- **UpcomingSessions** (src/components/session/UpcomingSessions.tsx) – Upcoming sessions list

### Profile Components
- **WalletDeposit** (src/components/profile/WalletDeposit.tsx) – Wallet deposit interface

### Auth Components
- **AuthGate** (src/components/auth/AuthGate.tsx) – Authentication gate
- **SessionBootstrap** (src/components/auth/SessionBootstrap.tsx) – Session bootstrap

### Admin Components
- **AdminNav** (src/components/admin/AdminNav.tsx) – Admin navigation

### Monitoring Components
- **ClientErrorReporter** (src/components/monitoring/ClientErrorReporter.tsx) – Client-side error reporting

### Sprite Components
- **AnimatedSprite** (src/components/sprites/AnimatedSprite.tsx) – Spritesheet animation component
- **index** (src/components/sprites/index.ts) – Sprite exports

---

## 5. USER JOURNEY MAP

### First-Time User Journey
1. Launch app (root `/`)
2. Redirect to `/login`
3. Authenticate (Telegram/Google/dev)
4. Redirect to `/onboarding`
5. Choose avatar, optionally enter referral code
6. Complete onboarding → `/home`
7. View home dashboard, wallet balance
8. Browse sessions via `/sessions`
9. Join a session → view session details
10. When active, enter gameplay via `/play/[sessionId]`
11. Play, spin wheel, interact with other players
12. Session completes → check results in profile history
13. Explore other features: squads, camps, shop, social, rivals

### Player User Journey (Repeat)
1. Launch app → `/home`
2. Check upcoming sessions, wallet
3. Browse sessions → `/sessions`
4. Join new session or continue existing
5. Play in gameplay arena
6. View profile, deposit funds if needed → `/profile`
7. Join/Create squad → `/squads`
8. View/switch camps → `/camps`
9. Buy items from shop → `/shop`
10. Connect with others via `/social`
11. Check rivals → `/rivals`

### Camp Owner User Journey
1. Login
2. Access `/camp-owner` dashboard
3. View camp stats
4. Manage members → `/camp-owner/members`
5. Recruit players → `/camp-owner/recruit`
6. Track revenue → `/camp-owner/revenue`
7. View camp squads → `/camp-owner/squads`

### Admin User Journey
1. Go to `/admin/login`
2. Authenticate
3. Access `/admin` dashboard
4. Manage sessions → `/admin/sessions`
5. Create new session → `/admin/sessions/new`
6. Manage camps → `/admin/camps`
7. Moderate users → `/admin/users`
8. View analytics → `/admin/analytics`
9. Monitor errors → `/admin/errors`

---

## 6. GAMEPLAY FLOW
1. Player enters gameplay → `/play/[sessionId]`
2. Intro sequence plays
3. For each phase:
   a. Phase starts, countdown begins
   b. For each round:
      i. Player can spin wheel
      ii. Spin outcome determines action (ADVANCE, ACQUIRE, DISCOVER, STEAL, VOID)
      iii. If STEAL: select target, execute steal
      iv. If being stolen from: use fire boost
   c. Phase ends → elimination occurs
   d. If eliminated and revivable: teammates can contribute to revive
4. Session completes → results recorded in profile history

---

## 7. SESSION FLOW
1. Session created by admin (draft)
2. Session opened for registration
3. Players browse and join sessions
4. Registration closes → session locked
5. Players matched into sub-sessions
6. Session starts → gameplay begins
7. Phases execute with rounds
8. Session completes → payouts calculated
9. Results recorded

---

## 8. SQUAD FLOW
1. Player creates or joins squad
2. Squad members play sessions together
3. Squad tokens tracked
4. Squad appears on leaderboard
5. In gameplay: squad members can revive each other

---

## 9. CAMP FLOW
1. Camp created (default or by admin)
2. Players join camp via referral code or switch
3. Camp owner manages camp
4. Camp earns revenue share from member session fees
5. Camp has leaderboard score

---

## 10. ECONOMY FLOW
1. Players deposit funds into wallet
2. Players pay entry fee to join sessions
3. Entry fees go into prize pool
4. Platform takes fee percentage
5. Camp takes revenue share percentage
6. Remaining pool distributed as prizes
7. Prizes based on rank, performance, squad, refunds

---

## 11. ADMIN FLOW
1. Admin logs in
2. Creates/configures sessions
3. Manages camps and users
4. Monitors analytics and errors
5. Adjusts economy config

---

## 12. DEAD CODE & REDUNDANT FEATURES

### Unused Stores
- **useAuthStore** (src/stores/useAuthStore.ts) – Not imported/used anywhere in codebase
- **useCampStore** (src/stores/useCampStore.ts) – Not imported/used anywhere in codebase
- **useSquadStore** (src/stores/useSquadStore.ts) – Not imported/used anywhere in codebase

### Partially Implemented Features
- **Power-ups Bar** (GameplayArena.tsx) – Has placeholder buttons, not functional yet
- **Shop** – ShopContent.tsx exists, but full feature set TBD
- **Steal System** – Some components exist, but full flow TBD

### Notes from Initial Exploration
- ShopContent.tsx exists and is functional
- Power-ups bar in GameplayArena has placeholders (not fully functional yet)

---

## 13. KEEP / MERGE / REMOVE RECOMMENDATIONS

All screens and components listed above are classified as **Keep** pending further requirements for V6 redesign.

---

## 14. OVERALL PRODUCT ARCHITECTURE SUMMARY

### Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- State Management: Zustand
- UI: Tailwind CSS, Framer Motion
- Auth: Supabase, Telegram, Google OAuth
- Database: Supabase (PostgreSQL)
- Real-time: Supabase Realtime + Redis

### Folder Structure
- `src/app/` – Next.js App Router pages
  - `(auth)/` – Auth routes
  - `(player)/` – Player routes
  - `admin/` – Admin routes
  - `camp-owner/` – Camp owner routes
  - `api/` – API routes
- `src/components/` – React components
- `src/hooks/` – Custom hooks
- `src/lib/` – Utilities and libraries
  - `admin/`
  - `api/`
  - `assets/`
  - `auth/`
  - `camps/`
  - `captcha/`
  - `gameplay/`
  - `monitoring/`
  - `redis/`
  - `sprites/`
  - `supabase/`
  - `telegram/`
- `src/stores/` – Zustand stores
- `src/types/` – TypeScript types
- `public/` – Static assets
- `supabase/` – Supabase config

### Key Systems
- Authentication & Session Management
- Gameplay Orchestration
- Session Management
- Squad System
- Camp System
- Economy & Shop
- Notifications
- Monitoring & Error Reporting
- Admin Tools
