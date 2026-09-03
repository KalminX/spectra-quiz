# Spectra 4-Minute Quiz Web Application

A lightweight, production-quality, dependency-free **Spectra Knowledge Assessment** web application. Designed around learning about **Spectra**, its strategic collaboration with **NeoLife**, active vs. passive income architecture, and leadership fundamentals.

The application follows modern SaaS/product onboarding design standards with a timed assessment engine, interactive question navigation, dynamic scoring, and an in-depth educational review breakdown.

---

## Quick Start / Running

The application requires **zero external dependencies**, **no build steps**, and **no local server**.

### Option 1: Direct File Open
Double-click `index.html` or open it directly in any modern web browser:
```text
file:///path/to/spectra-quiz/index.html
```

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local server:
```bash
# Python 3
python3 -m http.server 8080

# Or Node.js
npx serve .
```
Then visit `http://localhost:8080`.

---

## Project Structure

```text
spectra-quiz/
├── index.html              # Semantic, accessible HTML5 single-page structure
├── css/
│   ├── style.css           # Core styling, CSS tokens, layout, card systems
│   └── responsive.css      # Fluid layouts (320px to 1920px+), touch targets, accessibility
├── js/
│   ├── quiz.js             # Question bank data store, categories, and validation
│   ├── timer.js            # Drift-free precision countdown timer class
│   ├── ui.js               # UI rendering engine, modal controller, transitions
│   └── app.js              # Application state machine, keyboard shortcuts, persistence
├── assets/
│   ├── favicon.svg         # SVG favicon
│   └── spectra-mark.svg    # Geometric Spectra brand vector mark
└── README.md               # Documentation and technical guide
```

---

## Architectural Highlights

### 1. Timing Engine (`js/timer.js`)
* **Drift Elimination:** Rather than decrementing an integer with `setInterval` (which accumulates browser thread drift), the timer uses `Date.now()` timestamp differentials:
  $$\text{remainingTime} = \max(0, \text{endTime} - \text{Date.now()})$$
* **Visual States:**
  * `> 60s`: Standard neutral badge.
  * `< 60s`: Amber warning badge.
  * `< 15s`: High-urgency red badge with subtle rhythmic pulse.
  * `0:00`: Automatic submission trigger with accessibility announcement.
* **Drift-Free Interval:** Runs at 200ms resolution to guarantee sub-second visual synchronization with minimal CPU overhead.

### 2. State Management & Navigation (`js/app.js`)
* Application state is maintained centrally:
  ```javascript
  const state = {
    currentQuestion: 0,
    answers: {},       // { [questionIndex]: selectedOptionIndex }
    started: false,
    finished: false,
    expired: false,
    timeLimit: 240000  // 4 minutes
  };
  ```
* **Non-Destructive Navigation:** Users can navigate forward, backward, or jump to any question using the quick-jump dots (1–10). Previous selections are preserved.
* **Unfinished Confirmation Modal:** If a user attempts to submit before answering all questions, a custom modal indicates the specific pending questions (e.g., `Q4, Q8`) and allows them to either jump directly to them or submit anyway.

### 3. Scoring & Educational Breakdown
* Total score is computed upon submission or timer expiry.
* Tiered encouraging feedback:
  * **90–100%:** Exceptional Mastery
  * **70–89%:** Strong Understanding
  * **50–69%:** Solid Foundation
  * **< 50%:** Learning in Progress
* **Interactive Breakdown:** Shows the user's answer, correct answer, and an educational explanation for each question. Filter tabs allow viewing *All*, *Needs Review*, or *Correct* answers.
* **Local Persistence:** Best recorded score is safely stored in `localStorage` under `spectra_quiz_best_score_v1` without leaking session data into new quiz attempts.

---

## Keyboard Shortcuts

The app is fully navigable without a mouse:

| Key | Action |
| :--- | :--- |
| `Enter ↵` | Start quiz (Welcome screen) / Advance to next question |
| `1`, `2`, `3`, `4` or `A`, `B`, `C`, `D` | Select answer option |
| `→` (Right Arrow) | Next question / Finish quiz |
| `←` (Left Arrow) | Previous question |
| `Esc` | Close unfinished confirmation modal |
| `R` | Retake quiz (Results screen) |
| `Tab` / `Shift + Tab` | Standard accessible element navigation |

---

## How to Add or Modify Questions

Open [js/quiz.js](file:///Users/kalmin/startups/spectra-quiz/js/quiz.js) and edit the `QUIZ_QUESTIONS` array:

```javascript
{
  id: 11,
  category: "Business Strategy",
  question: "Your question text goes here?",
  options: [
    "First choice",
    "Second choice",
    "Third choice",
    "Fourth choice"
  ],
  answer: 0, // 0-based index of the correct option (0 = A, 1 = B, 2 = C, 3 = D)
  explanation: "Educational rationale explaining why this choice is correct."
}
```

The quiz engine dynamically recalculates the total count, updates progress percentages, generates navigator dots, and handles scoring automatically.

---

## Accessibility & Standards Compliance

* **Semantic HTML5:** Native landmark elements (`<header>`, `<main>`, `<nav>`, `<footer>`), actual heading hierarchy (`<h1>`, `<h2>`, `<h3>`), and semantic `<button>` elements.
* **WCAG Contrast:** All color pairings exceed WCAG AA 4.5:1 contrast ratios.
* **Screen Reader Announcer:** Dynamic live region (`#sr-announcer` with `aria-live="polite"`) announces question changes, timer checkpoints (180s, 120s, 60s, 30s, 15s), and quiz completion.
* **Touch Targets:** Tap targets meet or exceed 44×44px for thumb-friendly mobile usage.
* **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce` by disabling ambient animations and pulse effects.
* **Zero Dependencies:** Fully self-contained, offline-ready, no CDNs or external fonts.
