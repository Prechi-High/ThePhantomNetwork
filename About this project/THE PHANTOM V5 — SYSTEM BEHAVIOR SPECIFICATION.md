THE PHANTOM V5 — SYSTEM BEHAVIOR SPECIFICATION 

Status: Locked Working Specification (V5)
Purpose: Define EXACT system behavior, calculations, flows, and interactions with zero ambiguity.

0. CORE DESIGN RULE (NON-NEGOTIABLE)

# 1. SESSION SYSTEM BEHAVIOR (FULL SPECIFICATION)

## 1.1 SESSION OVERVIEW

A Session is the primary competitive event inside THE PHANTOM.

Players pay a cash entry fee and compete through multiple elimination phases.

The objective is:

* Accumulate Session Tokens
* Survive eliminations
* Reach Championship Phase
* Win rewards from the session pool

A session always exists before subsection creation.

Subsections are generated only when registration closes.

---

# 1.2 SESSION TIMELINE

Example:

Session Start Time:
8:00 PM

Registration Opens:
immediately previous session ends 

Registration Closes:
7:50 PM

Subsection Generation:
7:51 PM

Session Begins:
8:00 PM

Session Ends:
8:20 PM

Total Session Duration:
20 Minutes

Admin can modify:

* Start Time
* Registration Window
* Entry Fee
* Maximum Players

Admin cannot modify active sessions.

Once session status becomes ACTIVE:

Session is locked.

---


# 1.7 SESSION STRUCTURE

Total Session Duration:

20 Minutes

Contains:

Phase 1
Phase 2
Phase 3
Phase 4

Each phase contains rounds.

---

# PHASE 1 — ACTIVE SPIN PHASE

Duration:
6 Minutes

Rounds:
3

Round Duration:
2 Minutes

Total:
3 × 2

= 6 Minutes

Purpose:

Generate tokens.
Generate interaction.
Generate eliminations.

---

# SPIN SYSTEM

Spin Duration:

8 Seconds

Every spin requires:

1. Wheel animation
2. Result reveal
3. Next spin becomes available

User cannot skip results.

Maximum Spins Per Round:

120 seconds ÷ 8

= 15 Spins

Per Phase:

15 × 3

= 45 Spins

---

# SPIN OUTCOMES

ADVANCE

+3 Tokens

ACQUIRE

+1 Token

DISCOVER

+0.5 Tokens

STEAL

Attempt token theft

VOID

No reward



---




---

# PHASE 1 ELIMINATION

Target Score:

38 Tokens

Current V5 recommendation.

At minute 6:

Phase 1 ends.

Players categorized.

CATEGORY A

38+

Advance automatically.

CATEGORY B

35–37.5

Revivable.

CATEGORY C

Below 35

Eliminated.

Cannot be revived.

---

# REVIVE SYSTEM

Only CATEGORY B can be revived.

Cost:

3 Session Tokens

Not Squad Tokens.

Source:

Personal Tokens only.

---

# REVIVE FLOW

Example:

User B

36 Tokens

Needs:

3 Tokens

System displays:

Required:
3

Remaining:
3

---

Squadmate A contributes:

1 Token

Remaining:

2

Squadmate C contributes:

1 Token

Remaining:

1

Squadmate D contributes:

1 Token

Remaining:

0

User B revived.

---

Important:

Any squadmate may contribute:

1 Token
2 Tokens
3 Tokens

Maximum contribution:

3

System always shows:

Required
Contributed
Remaining

Live.

---

# PHASE 2

Duration:
6 Minutes

Rounds:
3

2 Minutes Each

Players continue spinning.

End Rule:

Bottom 60% eliminated.

Top 40% survive.

---

Example

50 Players Enter

Bottom 30 eliminated.

Top 20 survive.

---

# PHASE 3

Duration:
5 Minutes

Rounds:
5

1 Minute Each

Players continue competing.

End Rule:

Bottom 70% eliminated.

Top 30% survive.

---

Example

20 Enter

14 Eliminated

6 Survive

---

# PHASE 4 — CHAMPIONSHIP

Duration:
3 Minutes

Single Final Round

No further eliminations.

Highest Session Tokens wins.

Rankings generated.

Winner declared.

---

# FINAL SESSION OUTPUT

System produces:

Winner

Winner Squad

Top 15 Reward Players

Full Ranking

Token History

Steal History

Revive History

Session History

Squad History

Reward Breakdown

Complete Economy Audit

All calculations visible.

No hidden reward logic.

STEAL BEHAVIOR (CRITICAL)
User receives STEAL.

STEAL TARGETING ENGINE (LOCKED)
PURPOSE

The steal system exists to:

Create rivalry
Create tension
Slow runaway leaders
Create squad cooperation opportunities
Reward strategic targeting

The system MUST NOT select targets completely randomly.

Random-only targeting removes strategy.

TARGET SELECTION FLOW

When a player spins STEAL:

The system generates a list of eligible targets.

The player then selects a target from that list.

The system never steals automatically.

The player always chooses.

STEP 1 — BUILD ELIGIBLE TARGET LIST

The system builds a target list using the following rules.

A user can be targeted ONLY if:

✓ Same subsection

✓ Not eliminated

✓ Not protected by shield

✓ Not protected by cloak

✓ Not the stealing player

✓ Has at least 1 token

STEP 2 — TARGET PRIORITY SCORING

Every eligible player receives a Target Score.

Formula:

TargetScore =
(TokenScore × 50%)
+
(RivalryScore × 30%)
+
(RecentStealScore × 20%)

TOKEN SCORE

Higher token players receive higher scores.

Example:

Player	Tokens
A	45
B	32
C	12

A receives highest Token Score.

RIVALRY SCORE

Players that previously attacked you become more valuable targets.

Example:

User_45 stole from User_20 three times.

Rivalry table:

User_20 ↔ User_45

Intensity = 3

User_45 receives higher Target Score.

RECENT STEAL SCORE

Players who recently stole from anybody become attractive targets.

Example:

User_33 stole 5 seconds ago.

User_33 receives bonus targeting score.

This creates revenge chains.

STEP 3 — PRESENT TARGET OPTIONS

The player DOES NOT see 99 players.

The player sees:

TOP 5 TARGETS

ranked by Target Score.

Example:

Available Targets

User_45
Tokens: 47

Reason:
Highest Tokens

User_33
Tokens: 41

Reason:
Recently Stole

User_71
Tokens: 38

Reason:
Rival

User_12
Tokens: 37

Reason:
High Tokens

User_08
Tokens: 35

Reason:
High Tokens
If successful:
Attacker gains stolen amount
Victim loses equal amount
If shield active → steal blocked
Base Steal:

1 Token

---

# SQUAD AMPLIFICATION

Permanent or Temporary Squad Members receive notification:

"Your teammate is stealing from User_X"

Tap to Amplify.

Each squad member can contribute:

+1 Additional Steal

Maximum:

4 Additional

Example:

Attacker = 1

Squad Member A = +1

Squad Member B = +1

Squad Member C = +1

Squad Member D = +1

Total Steal:

5 Tokens

Maximum.

SHIELD BEHAVIOR
Shield is a DEFENSIVE FLAG
If active:
First incoming steal is blocked
Shield is consumed after block
CLOAK BEHAVIOR
Cloak reduces targeting probability by 70%
Does NOT make player invisible
Does NOT guarantee safety
1.3 TOKEN CALCULATION MODEL

Each player accumulates:

SessionTokens = Σ(Spin Outcomes)

2. SQUAD SYSTEM BEHAVIOR
2.1 Squad Structure
Permanent squads: fixed 4–5 members
Squad persists across sessions
Squad has HISTORY metric (session completions)
2.2 SQUAD TOKEN SYSTEM (IMPORTANT FIXED RULE)
Squad Tokens:
NOT generated during sessions
GENERATED ONLY AFTER SESSION ENDS
SquadTokensPerSession = 100 (fixed per completed session)
2.3 Squad Token Purpose

Squad Tokens can ONLY be used for:

Cosmetics
Squad skins
Visual upgrades
Prestige items

They CANNOT be used for:

Revives
Steals
Gameplay advantages
2.4 Squad Contribution Tracking

Each squad tracks:

ContributionScore = sum(SessionTokens per player)

Used for:

Squad ranking
Internal performance analysis
Camp metrics

NOT used for revive currency.

3. REVIVE SYSTEM BEHAVIOR (CRITICAL REWRITE)
3.1 Revive Currency

Revives use:

PERSONAL PLAYER TOKENS ONLY

NOT squad tokens.

3.2 Revive Rule

To revive ONE player:

Cost = 3 Personal Tokens per revive target

squad members are given the option tocontribute tokens to help save team mate 
 each member are shown the user to be eliminated and they are given three option 
to contribute 1, 2, or 3 tokens to help their squad member survive.

Total Cost = 3 × number of revived players
3.3 Revive Flow (STRICT LOGIC)

Step-by-step:

Player A survives Phase 1
Player B is revivable (40–59 range)
Player A chooses to help
System checks:
A has ≥ 1 tokens greater than phase 1 target tokens 
If yes:
A can choose to give out 1, 2, or 3 tokens to revive squad mate then A looses that number of token(s)
B is revived
3.4 MULTI-PLAYER REVIVE LOGIC

If squad contains multiple survivors:

System allows:

Shared Revive Pool = combined contributions

BUT:

Each contributor must individually commit tokens
No automatic squad pooling
3.5 REVIVE RESTRICTION RULE

A player can only be revived if:

They are in 40–59 token range
AND at least one survivor exists in squad
AND survivor has sufficient personal token buffer
4. ELIMINATION SYSTEM BEHAVIOR
4.1 Phase 1 Classification

After spins end:

0–39  → ELIMINATED
40–59 → REVIVABLE
60+   → PASSED
4.2 Survival Dependency
Survivors = players with 60+
If NONE exist → squad cannot revive
4.3 Squad Collapse Rule

If squad has:

0 survivors → full squad eliminated
1 survivor → partial revive possible
2+ survivors → distributed revive decisions
5. STEAL SYSTEM BEHAVIOR
5.1 Steal Mechanics

Steal occurs:

15% chance per spin

Target selection:

Priority order:

Highest token player
Rival marked player
Random top 30% players
5.2 Steal Execution

If steal succeeds:

TransferAmount = predefined steal value (0.5–2 tokens)

Apply:

Attacker +X
Victim -X

If shield active → cancel transaction

6. SHIELD SYSTEM BEHAVIOR
6.1 Shield State
Boolean ACTIVE / INACTIVE
6.2 Trigger

Automatically activates when:

Incoming steal detected
6.3 Resolution
Shield blocks first steal only
Shield is consumed after use
7. CLOAK SYSTEM BEHAVIOR
7.1 Cloak Effect
Reduces targeting probability by 70%
Does NOT prevent steals fully
Does NOT affect rewards
8. SESSION ECONOMY BEHAVIOR (CASH FLOW)
8.1 Entry Fee Flow
TotalPool = Players × EntryFee
8.2 Distribution Flow
Platform Fee deducted
Winner allocation deducted
Refund layer applied
Performance pool distributed
Squad pool distributed

# THE PHANTOM V5 — SESSION ECONOMY BEHAVIOR (FULLY DETERMINISTIC)

## RULE 1 — TOTAL SESSION POOL

Example Session:

100 Players

Entry Fee = $5

Total Pool:

Total Pool = 100 × $5

Total Pool = $500

---

# RULE 2 — PLATFORM FEE

Platform Fee = 15%

Calculation:

$500 × 15%

= $75

Platform Receives:

$75

Remaining Pool:

$500 − $75

= $425

---

# RULE 3 — WINNER ALLOCATION

Winner Allocation = 25% of Total Pool

Calculation:

$500 × 25%

= $125

Winner Receives:

$125

Remaining Pool:

$425 − $125

= $300

---

# RULE 4 — DETERMINE TOP 15% PLAYERS (ranked by nuber of tokens of individual players from that sub session)

IMPORTANT:

Winner is NOT included.

Top 15% starts from Rank 2.

Top 15% is determined by FINAL sub SESSION TOKENS.

Example:

Rank 1 = User_049 = WINNER

Top 15% begins (for 100 players it would be):

Rank 2 = User_081
Rank 3 = User_079
Rank 4 = User_024
Rank 5 = User_086
Rank 6 = User_073
Rank 7 = User_064
Rank 8 = User_023
Rank 9 = User_008
Rank 10 = User_072
Rank 11 = User_046
Rank 12 = User_003
Rank 13 = User_037
Rank 14 = User_056
Rank 15 = User_067
Rank 16 = User_014

These are the Top 15%  Reward Players.

---

# RULE 5 — REFUND TIER

Ranks 7–16   receive entry fee refunds.

Refund Amount:

$5 each

10 Players

Calculation:

10 × $5

= $50

Refund Pool Used:

$50

Remaining Pool:

$300 − $50

= $250

---

# RULE 6 — SPLIT REMAINING POOL

Remaining Pool:

$250

Split:

60% Performance Pool

40% Winner Squad Pool

Performance Pool:

$250 × 60%

= $150

Winner Squad Pool:

$250 × 40%

= $100

---

# RULE 7 — PERFORMANCE POOL

Performance Pool is distributed only to:

Ranks 2–6

NOT winner

NOT ranks 7–16

Example:

Rank 2 = 181 Tokens
Rank 3 = 180 Tokens
Rank 4 = 159 Tokens
Rank 5 = 157 Tokens
Rank 6 = 150 Tokens

Total:

181 + 180 + 159 + 157 + 150

= 827 Tokens

---

Rank 2 Share

181 ÷ 827

= 21.89%

$150 × 21.89%

= $32.84

---

Rank 3 Share

180 ÷ 827

= 21.76%

$150 × 21.76%

= $32.64

---

Rank 4 Share

159 ÷ 827

= 19.22%

$150 × 19.22%

= $28.83

---

Rank 5 Share

157 ÷ 827

= 18.98%

$150 × 18.98%

= $28.47

---

Rank 6 Share

150 ÷ 827

= 18.14%

$150 × 18.14%

= $27.22

---

Performance Pool Fully Distributed

Total:

$150

---

# RULE 8 — WINNER SQUAD POOL

Winner Squad Pool:

$100

IMPORTANT:

Winner DOES NOT participate.

Only the OTHER squad members.

Example:

Winner Squad:

User_046
User_047
User_048
User_049 (Winner)
User_050

Winner removed.

Eligible Squad Members:

User_046
User_047
User_048
User_050

---

Squad Token Totals

User_046 = 133

User_047 = 85

User_048 = 23

User_050 = 91

Total:

133 + 85 + 23 + 91

= 332

---

User_046

133 ÷ 332

= 40.06%

$100 × 40.06%

= $40.06

---

User_047

85 ÷ 332

= 25.60%

$100 × 25.60%

= $25.60

---

User_048

23 ÷ 332

= 6.93%

$100 × 6.93%

= $6.93

---

User_050

91 ÷ 332

= 27.41%

$100 × 27.41%

= $27.41

---

Winner Squad Pool Fully Distributed

Total:

$100

---

# RULE 9 — FINAL USER PAYOUT REPORT

WINNER

User_049

Winner Allocation:

$125

TOTAL:

$125

---

TOP 15 REWARD PLAYERS

Rank 2 User_081

Performance:

$32.84

Total:

$32.84

---

Rank 3 User_079

Performance:

$32.64

Total:

$32.64

---

Rank 4 User_024

Performance:

$28.83

Total:

$28.83

---

Rank 5 User_086

Performance:

$28.47

Total:

$28.47

---

Rank 6 User_073

Performance:

$27.22

Total:

$27.22

---

Rank 7 User_064

Refund:

$5

Total:

$5

---

Rank 8 User_023

Refund:

$5

Total:

$5

---

Rank 9 User_008

Refund:

$5

Total:

$5

---

Rank 10 User_072

Refund:

$5

Total:

$5

---

Rank 11 User_046

Refund:

$5

Squad Share:

$40.06

Total:

$45.06

---

Rank 12 User_003

Refund:

$5

Total:

$5

---

Rank 13 User_037

Refund:

$5

Total:

$5

---

Rank 14 User_056

Refund:

$5

Total:

$5

---

Rank 15 User_067

Refund:

$5

Total:

$5

---

Rank 16 User_014

Refund:

$5

Total:

$5

---

WINNER'S SQUAD MEMBERS

User_046

Squad Share:

$40.06

---

User_047

Squad Share:

$25.60

---

User_048

Squad Share:

$6.93

---

User_050

Squad Share:

$27.41

---

# FINAL RECONCILIATION

Platform Fee:

$75

Winner:

$125

Refunds:

$50

Performance Pool:

$150

Winner Squad Pool:

$100

Total:

$500

Original Pool:

$500

Result:

RECONCILIATION SUCCESS
NOTE : if a squad member of the winner also falls into the category of the top 15 ranked (minus the winner or Rank 1) users they should 
recieve their pay for both the winner squaad pool and the performance or reward pool ( depending on where they fall  in between rank 2 to 16)
8.3 IMPORTANT RULE

CASH NEVER INTERACTS WITH TOKENS

They are fully separate systems.

# 9. SESSION MATCHMAKING & SQUAD PAIRING SYSTEM (FULL SPECIFICATION)

# 9.1 GLOBAL SESSION STRUCTURE

A session always begins as ONE global session.

Example:

Session 1
Start Time = 8:00 PM

All players entering before lock time enter the same global session.

Example:

User A joins
User B joins
User C joins
...
User 634 joins

All 634 users initially belong to the same session.

No sub-sessions exist yet.

---

# 9.2 SESSION REGISTRATION WINDOW

Each session has two states:

OPEN

LOCKED

OPEN

Players may join (entry fee deducted and added to pool cannot be reveersed).

Squads may join.

LOCKED

No new players may join.

No players may leave.

No squad composition changes allowed.

---

# 9.3 SESSION LOCK TIME

Example:

Session Start:

8:00 PM

Registration Lock:

7:55 PM

At 7:55 PM:

System freezes participant list.

Example:

Total Registered:

634 Users

This number becomes final.

No further users can enter.

---

# 9.4 SESSION POOL CALCULATION

After lock:

System calculates total pool.

Example:

634 Players

Entry Fee:

$5

Total Pool:

634 × $5

=

$3,170

Displayed publicly.

Users see:

SESSION POOL

$3,170

This prevents trust issues.

Users know exact pool before gameplay begins.

---

# 9.5 SUB-SESSION CREATION

Sub-sessions are created ONLY after registration closes.

Maximum Capacity:

100 Players

Example:

634 Players

Sub Session A = 100

Sub Session B = 100

Sub Session C = 100

Sub Session D = 100

Sub Session E = 100

Sub Session F = 100

Sub Session G = 34

Total:

634

---

# 9.6 SUB SESSION POOL VISIBILITY

Each sub-session displays its own pool.

Example:

Sub Session A

100 Players

Pool:

$500

---

Sub Session G

34 Players

Pool:

$170

Displayed before Phase 1 begins.

This removes payout ambiguity.

---

# 9.7 PERMANENT SQUAD PRESERVATION RULE

Permanent squads must never be split.

Example:

Squad Alpha

User A

User B

User C

User D

User E

All 5 users are online.

System places all 5 into same sub-session.

Never split.

Forbidden:

Sub A:

A B C

Sub B:

D E

This cannot happen.

---

# 9.8 PARTIAL SQUAD PARTICIPATION

Example:

Squad Alpha

A

B

C

D

E

Only:

A

B

online.

Result:

Only A and B enter session.

C D E remain absent.

No replacements added.

Squad identity remains intact.

---

# 9.9 SOLO PLAYER MATCHMAKING

Example:

User X

User Y

User Z

have no squad.

System groups them into temporary squads.

Purpose:

Revive cooperation.

Skill amplification.

Social discovery.

---

# 9.10 TEMPORARY SQUAD CREATION

Example:

Solo Users:

A

B

C

D

E

Temporary Squad T1 created.

These users become teammates for that session only.

Temporary Squad T1 expires after session.

---

# 9.11 TEMPORARY SQUAD PRIVILEGES

Temporary Squads CAN:

Revive teammates.

Amplify steals.

Coordinate.

Play together.

Temporary Squads CANNOT:

Receive squad reward pool.

Receive squad progression.

Earn squad cosmetics.

Earn squad ranking.

Earn squad tokens.

---

# 9.12 TEMPORARY SQUAD REVIVE EXAMPLE

Temporary Squad:

A

B

C

D

E

Phase 1 ends.

Player B eliminated.

Needs:

3 revive tokens.

Player A donates 2.

Player C donates 1.

Player B revived.

Allowed.

---

# 9.13 TEMPORARY SQUAD REWARD RESTRICTION

Winner belongs to Temporary Squad T1.

Winner earns:

Winner Allocation.

Performance Rewards.

Refund Rewards.

Winner's Temporary Squad Members:

Receive NOTHING from Squad Pool.

Reason:

Squad Pool reserved for permanent squads.

---

# 9.14 WINNER SQUAD ELIGIBILITY RULE

Winner Squad Pool only activates if:

Winner belongs to permanent squad.

Example:

Winner = Squad Alpha.

Remaining Squad Members:

Receive Winner Squad Pool.

Allowed.

---

Example:

Winner = Temporary Squad T1.

Winner Squad Pool:

NOT CREATED.

Money remains inside economy rule defined by admin.

---

# 9.15 SESSION HISTORY SYSTEM

After session:

System records:

All teammates.

All rivals.

All revives.

All skill amplifications.

All steals.

All attacks.

---

# 9.16 SOCIAL DISCOVERY SYSTEM

After session:

User sees:

PLAYED WITH

User B

User C

User D

User E

---

# 9.17 PERMANENT SQUAD RECRUITMENT FLOW

From Session History:

User taps:

INVITE TO PERMANENT SQUAD

Example:

User A enjoyed playing with User B.

User A sends invitation.

User B accepts.

User B joins permanent squad.

---

# 9.18 FUTURE MATCHMAKING BENEFIT

Permanent Squad Tokens serve as:

Squad Age

Squad Experience

Squad History

Session Count

Example:

100 Squad Tokens

=

1 completed session.

1000 Squad Tokens

=

10 completed sessions.

This helps ranking, prestige and future matchmaking systems.

---

# 9.19 FULL MATCHMAKING FLOW

Session Opens

↓

Players Register

↓

Registration Lock

↓

Pool Calculated

↓

Pool Displayed

↓

Sub Sessions Created

↓

Permanent Squads Preserved

↓

Solo Users Grouped

↓

Temporary Squads Created

↓

Phase 1 Begins

↓

Revives

↓

Championship

↓

Winner

↓

Rewards

↓

Session History Generated

↓

Permanent Squad Invitations Available


10. CAMP SYSTEM BEHAVIOR
10.1 Camp Assignment
Auto-assigned at onboarding
10.2 Camp Switching
Allowed ONLY after admin-defined level threshold
11. ADMIN SYSTEM BEHAVIOR

Admin controls:

Session timing
Economy percentages
Entry fees
Reward logic
Camp rules

Admin does NOT:

Participate in gameplay logic
Override live sessions
12. SYSTEM VALIDATION RULE

Every session must produce:

Full token audit
Full cash audit
Squad participation audit
Steal logs
Revive logs

If mismatch occurs:

SESSION IS INVALID

13. FINAL CORE LOOP
Join Session
  ↓
Spin Engine
  ↓
Token Accumulation
  ↓
Steal / Shield / Cloak resolution
  ↓
Phase classification
  ↓
Revive logic (personal tokens only)
  ↓
Elimination finalization
  ↓
Reward distribution
  ↓
Squad token issuance (100 fixed)
  ↓
Camp progression update
FINAL STATEMENT

This specification defines exact runtime behavior for THE PHANTOM V5 MVP1.

No system outside this document is allowed to introduce new logic without explicit update to this specification.

11. SHOP SYSTEM BEHAVIOR (V5 — FINALIZED ARCHITECTURE)
11.1 CORE SHOP PRINCIPLE

The Shop is divided into 3 independent economies:

A. SESSION ITEMS (Cash Only)

Used inside sessions to influence survival and competition.

B. SQUAD ITEMS (Squad Tokens Only)

Used after sessions for squad progression and cosmetics.

C. PRESTIGE ITEMS (Cash Only + Level Locked)

Used for status identity (not gameplay advantage).

11.2 AVAILABILITY RULE (LOCKED)

All shop purchases happen:

BEFORE SESSION ONLY

Once session starts:

❌ No purchases allowed
❌ No shop access
❌ No item injection mid-session
11.3 SESSION ITEMS (FULL BEHAVIOR SPECIFICATION)

These affect gameplay directly.

ITEM 1 — SHIELD
Function

Blocks steals.

Behavior

When a steal is attempted:

System checks:

IF shield_count > 0

→ Activate shield automatically

→ Consume 1 shield charge

→ Cancel steal completely

Example

Steal Attempt:
7 Tokens

Player Shield:
1 available

Result:

Steal = FAILED
Shield = CONSUMED
Player loses = 0
Stack Rule

Shields can stack:

Example:
Shield = 3

Can block 3 separate attacks.

ITEM 2 — CLOAK
Function

Removes player from steal targeting system.

Behavior Flow

IF cloak_active = TRUE:

→ Player is removed from:

steal target list
top 5 targets
rivalry suggestions
Duration Example

Cloak Duration = 60 seconds

During this time:

Cannot be selected
Cannot be previewed as target

After expiry:

Returns to pool
ITEM 3 — INSURANCE (UPDATED LOGIC — CRITICAL)

Insurance ONLY applies in:

Phase 1
Phase 2
Phase 3

NOT Phase 4

FUNCTION TYPE

Insurance is a threshold protection system, not revival token.

RULE A — PHASE 1 (TOKEN THRESHOLD MODE)

If target is:

Target = 38 tokens

Player ends at:

33–37 tokens

AND insurance_active = TRUE

→ Player is allowed to progress

CONDITION:

IF (Target - PlayerScore ≤ 5)

→ Insurance activates

→ Player advances

→ Insurance consumed

EXAMPLE

Target:
38

Player:
34

Gap:
4

Result:

Insurance activates
Player advances to Phase 2
Insurance destroyed
RULE B — PHASE 2 & 3 (PERCENTILE MODE)

Elimination is percentage-based.

Example Phase 2:

Bottom 60% eliminated

Cutoff score:

80 tokens

INSURANCE RULE:

IF PlayerScore is within:

1% to 5% of cutoff boundary

AND insurance_active = TRUE

→ Player is saved

EXAMPLE

Cutoff:
80 tokens

Player:
77 tokens

Gap:
3 tokens equivalent zone

Result:

Player survives
Moves to next phase
Insurance consumed
IMPORTANT RULE

Insurance is:

NOT stackable
NOT reusable
Consumed immediately when triggered
ITEM 4 — STEAL BOOST (CORRECTED MATH MODEL)
FUNCTION

Increases steal output by +50%

BASE STEAL RULE

Base Steal = 1 Token

SQUAD AMPLIFICATION RULE

Each squad member adds:

+1 Token

FINAL FORMULA

Final Steal = (Base + Squad Contribution) × 1.5

EXAMPLE

Base:
1

Squad:

4 members contribute

= +4

Subtotal:
5 tokens

Boost:
× 1.5

Final:
7.5 Tokens

RULE

Steal Boost applies AFTER squad amplification.

ITEM 5 — SHIELD BOOST
FUNCTION

Allows shield to absorb 2 attacks instead of 1.

BEHAVIOR

Normal Shield:

1 block → consumed

Shield Boost:

2 blocks → then consumed

EXAMPLE

Player has:

Shield Boost + Shield

Attack 1 → blocked

Attack 2 → blocked

Attack 3 → player takes damage

11.4 SHOP ITEM CATALOG (FINAL LOCKED)
SESSION ITEMS (Cash Only)
Shield
Cloak
Insurance
Steal Boost
Shield Boost
SQUAD ITEMS (Squad Tokens Only)

Used AFTER session:

Squad Banner
Squad Emblem
Squad Aura
Squad Wheel Skin
Squad Progress Skin
PRESTIGE ITEMS (Cash + Level Locked)
RULE

Prestige items:

Cannot be bought at level 1
Require player progression threshold
EXAMPLES
REQUIREMENT MODEL

Level Requirement:
Level 10+

OR

Top 20 finish

OR

3 session wins

PRESTIGE ITEMS
Phantom Elite Title
Shadow King Frame
Champion Badge
Legendary Name Glow
Top 15 Badge
DIFFERENCE: COSMETIC VS PRESTIGE
COSMETICS (BUYABLE)
PURPOSE

Aesthetic only

No status meaning

EXAMPLES
Cyber Avatar Skin
Gold Wheel Skin
Neon Trail Effect
Smoke Entrance Animation
EFFECT
Visual only
No gameplay impact
No unlock requirement
PRESTIGE (UNLOCKED STATUS)
PURPOSE

Proof of achievement

Cannot be freely purchased

EXAMPLES
“Top 15 Survivor”
“Camp Champion”
“Session Winner”
“Shadow Elite”
EFFECT
Visible in leaderboard
Visible in profile
Permanent record
11.5 SHOP FLOW (FULL SYSTEM)
BEFORE SESSION

Player can:

Buy Shield
Buy Cloak
Buy Insurance
Buy Boosts
SESSION START

System locks shop.

Items become active.

DURING SESSION

System enforces:

Auto shield activation
Cloak visibility suppression
Steal boost math
Insurance triggers
AFTER SESSION

System generates:

Prestige unlocks
Squad token rewards
Cosmetic unlock eligibility
11.6 KEY SYSTEM CLARIFICATION (NO AMBIGUITY RULE)

To prevent AI guessing:

ALWAYS TRUE
Insurance is NOT revival
Insurance is threshold survival override
Steal boost applies AFTER squad amplification
Shields are automatic
Cloak removes visibility (not damage reduction)
Shop closes when session starts