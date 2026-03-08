# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🚨 MANDATORY PRE-OPERATION CHECK

**BEFORE you call `Edit` or `Write` tool on these files, you MUST complete the version management workflow:**
- `fsar-demo-hightech.html`
- `fsar-demo.html`

**This applies to ANY modification, no matter how small:**
- ✅ Changing one character, one coordinate, one color value
- ✅ Fixing typos, adjusting text positions, tweaking visual elements
- ✅ Algorithm changes, parameter tuning, bug fixes
- ✅ Adding comments, updating documentation

**NO EXCEPTIONS. If you skip this, you will cause version loss and break rollback capability.**

---

## 📋 Version Management Workflow (5-Step Checklist)

When you need to modify `fsar-demo-hightech.html` or `fsar-demo.html`, follow this exact sequence:

### Step 1: 🛑 STOP - Pre-Modification Check
**Before touching the file, ask yourself:**
- [ ] Have I backed up the current version to `versions/` directory?
- [ ] If NO → Proceed to Step 2
- [ ] If YES → Skip to Step 3

### Step 2: 📦 BACKUP CURRENT VERSION
**Action:** Copy the current file to `versions/` directory
```bash
# For hightech version
cp fsar-demo-hightech.html versions/fsar-demo-hightech-v{CURRENT_VERSION}.html

# For standard version
cp fsar-demo.html versions/fsar-demo-v{CURRENT_VERSION}.html
```
**Example:** If current version is v2.2-L, run:
```bash
cp fsar-demo-hightech.html versions/fsar-demo-hightech-v2.2-L.html
```

### Step 3: 🔢 UPDATE VERSION NUMBER
**Action:** Increment version in TWO places in the file:

**Location 1:** Find `<span class="version-tag">` and increment version
```html
<!-- Before -->
<span class="version-tag">MICRO-SIMULATION v2.2-L</span>

<!-- After -->
<span class="version-tag">MICRO-SIMULATION v2.3-L</span>
```

**Location 2:** Add version comment at top of CONFIG section (around line 704-710)
```javascript
// v2.3-L: [Brief description of what changed]
//         [Key parameters or visual elements modified]
const CONFIG = {
    // ...
```

**Version numbering rules:**
- Major feature: v2.2-L → v3.0-L
- Algorithm change: v2.2-L → v2.3-L
- Visual/UI tweak: v2.2-L → v2.2.1-L (or just v2.3-L if you prefer)
- Bug fix: v2.2-L → v2.2.1-L

### Step 4: ✏️ MODIFY THE FILE
**Now you can safely make your changes using `Edit` or `Write` tool.**

### Step 5: 📦 BACKUP NEW VERSION + 📝 UPDATE LOG
**Action A:** Backup the newly modified file
```bash
cp fsar-demo-hightech.html versions/fsar-demo-hightech-v{NEW_VERSION}.html
```

**Action B:** Update `versions/CHANGELOG.md` (create if doesn't exist)
```markdown
## v{NEW_VERSION} (YYYY-MM-DD)
### [Category: Feature/Fix/Visual/Algorithm]

**Problem/Motivation**:
- Brief description of why this change was needed

**Changes**:
- What was modified (files, functions, parameters)
- Key technical details

**Effect**:
- Expected outcome or improvement
```

---

## ⚠️ Why This Matters

**If you skip version management:**
- ❌ User loses ability to rollback to previous working version
- ❌ No audit trail of what changed and why
- ❌ Risk of losing critical intermediate versions
- ❌ User will question your reliability and attention to detail

**Remember:** User would rather you spend 30 seconds on version management than lose a single critical version.

---

## 🔍 Self-Check Before Every File Modification

**When user asks you to modify the simulation file, mentally run this checklist:**

1. ❓ "Am I about to call `Edit` or `Write` on `fsar-demo-hightech.html` or `fsar-demo.html`?"
   - If YES → Go to question 2
   - If NO → Proceed normally

2. ❓ "Have I completed the 5-step version management workflow?"
   - If YES → Proceed with modification
   - If NO → STOP and complete Steps 1-3 first, then modify, then complete Step 5

3. ❓ "Is this a 'small' change that doesn't need version management?"
   - **ANSWER: NO. There is no such thing as a change too small for version management.**

---

## Project Overview

FSAR (Fluid Segregation & Active Relief / 流体隔离与主动泄压) traffic engineering demonstration project. Visualizes a novel highway ramp confluence optimization technique that eliminates turbulent flow at merge points.

**Patent**: CN202311836940.X

## How to Run

- **Traffic simulation**: Open `fsar-demo.html` in browser (interactive comparison of Traditional vs FSAR structures)
- **High-tech UI version**: Open `fsar-demo-hightech.html` in browser (CRT scanline aesthetic, terminal-style UI)
- **Infographic**: Open `fsar-infographic.html` in browser

## Simulation Architecture (fsar-demo.html)

### Core Models

**IDM (Intelligent Driver Model)** - Car-following model:
- `aMax`: Maximum acceleration (0.08)
- `bComfort`: Comfortable deceleration (0.12)
- `s0`: Minimum gap (6)
- `T`: Safe time headway (15 frames)
- `v0Main`/`v0Ramp`: Desired speeds (3.0/1.8)

**Gap Acceptance Model** - Lane change decision:
- `minLeadGap`: 35 units
- `minLagGap`: 25 units

**MOBIL Lane Change Incentive Model** - Active congestion avoidance:
- `politeness`: Courtesy factor (0.3, 0=selfish, 1=fully courteous)
- `threshold`: Lane change incentive threshold (0.015)
- `safeDecel`: Safe deceleration limit (0.15)
- `speedRatioTrigger`: Speed ratio triggering lane change consideration (0.5)
- `laneChangeProbability`: Base lane change willingness (0.65)

**Driver Personality Distribution** - Heterogeneous behavior:
- `aggressiveRatio`: 35% - More willing to change lanes
- `patientRatio`: 25% - More willing to queue
- `normalRatio`: 40% - Moderate behavior

### FSM States (5-state machine for outer lane vehicles)

| State | Description |
|-------|-------------|
| `APPROACH` | Approaching warning zone |
| `SORTING` | Lane change negotiation (turn signal active) |
| `DECISION` | Lane change failed → forced relief |
| `RELIEF` | Exiting via off-ramp |
| `CRUISE` | Normal driving after successful merge |
| `ZF_MERGE` | Zero-friction merge from on-ramp |

### FSAR Structure Components

1. **Topological Inversion (拓扑逆序)**: Exit ramp placed *before* entry ramp
2. **Vacuum Isolation Zone (真空隔离区)**: Physical barrier in outer lane between ramps (`fsarIsolationStart` to `fsarIsolationEnd`)
3. **Active Pressure Relief (主动泄压)**: Electronic lane change lines with warning zone → solid line lockout
4. **Vacuum Slot (真空空槽)**: No-interference acceleration zone after isolation, enabling zero-friction merge

### Traditional Structure (对照组)

**Parallel Acceleration Lane (平行式加速车道)**:
- Entry ramp vehicles enter acceleration lane first
- Must accelerate while searching for gaps in mainline
- High speed differential (30 km/h vs 80 km/h) causes friction
- Forced merge at lane end creates turbulence waves

### Key Difference: Speed Differential Friction

| Structure | Entry Behavior | Speed Diff | Result |
|-----------|---------------|------------|--------|
| Traditional | Compete for gaps while accelerating | High (50 km/h) | Turbulent flow, stop-and-go waves |
| FSAR | Accelerate freely in vacuum slot, then merge | Near-zero | Laminar flow, zero stops |

### Key CONFIG Parameters

```javascript
// Road layout
roadY: 120, laneHeight: 40, laneCount: 3

// FSAR zones
fsarExitX: 180, fsarEntryX: 350
fsarIsolationStart: 210, fsarIsolationEnd: 340

// FSM decision points
fsm.warningZoneStart: 60, fsm.solidLineX: 150, fsm.exitDeadlineX: 180
```

## Color Scheme

| Element | Color |
|---------|-------|
| Main flow | `#3498db` (blue) |
| Ramp flow | `#e74c3c` (red) |
| Exit flow | `#2ecc71` (green) |
| Conflict zone | `#f39c12` (orange) |
| Vacuum isolation | `#9b59b6` (purple) |
| FSAR brand | gradient `#00d4ff` → `#7b2cbf` |

## Validation Metrics (VISSIM)

| Metric | Traditional | FSAR | Δ |
|--------|-------------|------|---|
| Downstream flow | 4104 pcu/h | 4980 pcu/h | +21% |
| Average speed | 44 km/h | 51 km/h | +17% |
| Stop count | 9.85/veh | 0.12/veh | -98.8% |
| Net sacrifice | - | 4.8% | 1:4.86 ratio |

## Animation & Anti-Penetration Techniques

**Smooth lane changes**: Use cosine interpolation (S-curve) instead of linear:
```javascript
const smoothProgress = (1 - Math.cos(progress * Math.PI)) / 2;
```

**Ramp path alignment**: Quadratic Bézier curves match visual ramp geometry:
```javascript
const t = smoothProgress;
const oneMinusT = 1 - t;
v.x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * endX;
v.y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * endY;
```

**Anti-penetration**: Check both target lane AND vehicles changing into target lane in `checkGapAcceptance`. Emergency braking when `actualGap < minSafeDistance`.

**Forced lane centering**: Non-changing vehicles snap to lane center every frame:
```javascript
if (!vehicle.isChangingLane && !vehicle.onRamp) {
    vehicle.y = CONFIG.roadY + vehicle.lane * CONFIG.laneHeight + CONFIG.laneHeight / 2;
}
```
