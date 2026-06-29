# fullstack-engineering-interview-questions — project conventions

When reportin information to me be extremely concise and sacrifice grammar for the sake of concision.

Personal full-stack interview-prep reference — algorithm patterns, front-end component builds,
JS/TS utility primitives, JS/TS knowledge questions. Goal: **recognition over memorization** —
train the trigger mapping a problem (or real code, any stack) → the right trick. **Third lens:**
understand the **data structure underneath** (its physical layout vs the abstraction JS hands you —
a JS `Array` isn't a contiguous C array, a "file" isn't text + a DB pointer) → see **why the
algorithm depends on it** → pick the optimal **structure + algorithm together**. (`structures/`
super-category.)

## Voice (REQUIRED — all notes, all informative prose)

**Extremely concise, sacrifice grammar for concision.** Drop articles/filler/hedging, fragments
OK, short synonyms — caveman register. **All technical substance stays exact** (terms, Big-O,
edge cases, bug consequences). Reference note: `paradigms/recursion/README.md`.

- **Audience:** engineer who codes with frameworks, never studied algorithms or much math.
  **Plain words, no bare jargon** — ground every term first use (Big-O as loops, "Stack =
  last-in-first-out pile"). Plain ≠ verbose: ground the term in a fragment, move on.
- **Terse everywhere; real depth only on the genuinely hard part**, inline.
- **Untouched:** code blocks, mermaid, commits, PRs, security/destructive warnings — normal prose.

## Note format (REQUIRED — the preferred shape)

Each trick at `<family>/<trick>/` — `README.md` + `solution.ts`. README order: **questions first,
bug-focused pseudocode middle, real example problems last**. Reference:
`techniques/search/binary-search/find-target/README.md`.

**Three axes.** (1) Algorithm patterns under `techniques/` (e.g.
`techniques/search/binary-search/`, `techniques/hashing/`…), grouped into super-categories
`techniques/` & `paradigms/` (navigated by *recognising which trick*) and `structures/` (the data
structures themselves — navigated by *which tool fits + what it costs*); nesting = "more specific
case of parent." (2) Front-end & full-stack solutions under
`frontend/<category>/<trick>/` — GFE 75 classics + friends; nesting = plain categorisation, not
"built-on." Axis spans **implement-from-scratch JS/TS primitives** (ship `solution.ts` — e.g.
debounce), **UI component builds** (React/TSX, possibly multi-file — ship component file(s) +
`solution.ts` for extractable pure logic — e.g. Data Table pagination), **JS/TS knowledge
questions**. References: `frontend/rate-limiting/debounce/README.md` (primitive),
`frontend/pagination/data-table/README.md` (component build). (3) **Domain** knowledge under
`domains/<domain>/` — things you *build*, not tricks you *spot* (e.g. `domains/fintech/`: money,
ledgers, idempotency), navigated by domain; uses the **building-block shape** below. Reference:
`domains/fintech/README.md`.

1. **Title** — `# <Trick> — <one-line plain gist>`
2. **## TL;DR**
   - **"Is it <trick>? Ask these — all yes → yes:"** recognition test — questions run on a
     problem's words to decide if the trick applies. Last one = real decider.
   - **"Before you code, pin down:"** trick-specific clarifying questions.
   - **"The lines where bugs hide:"** one-line list of bug-critical decisions.
3. **## What it is** — plain explanation + tiny worked example on real values.
4. **## What you track** — the variables, familiar terms.
5. **## How it works** — code-like-but-readable pseudocode, **⚠️ on every bug-prone line** +
   consequence (off-by-one, infinite loop, wrong seed, overflow). Close with one-line recap.
6. **## Picture** — Mermaid flowchart.
7. **## Where you'll meet it (practice + recognition)** — LeetCode/other problems + one-line
   mapping, real-life examples any stack, "looks like it but ISN'T" naming the sibling trick +
   the question telling them apart.
8. Footer link to `solution.ts`.

**Split families (trick with sibling sub-notes).** Trick fans into siblings (e.g.
`sliding-window/` → `fixed-size/` · `variable-distinct/` · `shrink-to-target/`) → add **two
extra pieces** so a reader landing on a child isn't dropped cold:
- **overview README** at parent (`<family>/<trick>/README.md`) — shared idea, the **goal**, N
  flavors as a table + "which one?" guide, link to each child. Reference:
  `techniques/two-pointers/sliding-window/README.md`.
- **context banner** atop each child — blockquote **between title and TL;DR**: "N of M flavors —
  read the overview first", one-line "this flavor: …", canonical problem. Reference:
  `techniques/two-pointers/sliding-window/fixed-size/README.md`.

**Structure notes (`structures/`) — sibling shape.** A structure isn't a trick you *spot*, it's a
tool you *pick*. Same skeleton, swapped middle: **TL;DR** ("Reach for `<structure>` when — any yes →
candidate; decider settles it" · "Before you use it, pin down" · "Where it bites") → **What it
really is (abstraction vs the metal)** — physical layout vs what JS hands you, where it leaks (the
"file" insight) → **What it costs (and why)** — op → Big-O → why, rooted in the layout → **What it
unlocks** — links to the `techniques/`/`paradigms/` notes that *need* it (the algorithms stay there;
this is the link, not a new home) → **Picture** → **Where you'll meet it** (JS built-in · real life ·
looks-like-but-isn't *sibling structure*). References: `structures/README.md` (super-category
overview), `structures/array/README.md` (exemplar).

**Building-block notes (`domains/`) — third shape.** Domain knowledge you *build*, not a trick you
*spot* (ledgers, idempotency, money types). Adapts the structure shape, middle swapped for **failure
modes** (money/compliance bugs are the point): **TL;DR** ("Reach for it when — any yes → you need
this" · "Before you build it, pin down" · "Where money/compliance bugs hide") → **What it really
is** → **What it costs & risks** (decision → the wrong way → the consequence) → **How to build it**
(pseudocode, ⚠️ on the money-breaking lines) → **Picture** → **Where you'll meet it** (real systems ·
libraries/standards · looks-like-but-isn't sibling). References: `domains/fintech/README.md`
(roadmap), `domains/fintech/architecture/money-representation/README.md` (exemplar).

Do **not** use old sections "Spot it", "Two disguises", "Questions to ask", "Go faster" — folded
into TL;DR (questions), How it works (bug lines), Where you'll meet it (examples).

## solution.ts

- TypeScript, strict-clean (explicit return types, no `any`, `const` default, double quotes, semicolons).
- Header doc comment carries ALL reasoning: problem, approach, why-it-works, complexity, edge cases, language trap (e.g. JS `<<` is 32-bit).
- Lean on idiomatic JS built-ins where Big-O unchanged — `Math.max`/`Math.min` running best, `arr.reduce` to seed a sum, `Map`/`Set` membership. But keep the trick's **core step explicit** when collapsing hides the idea or blows up complexity (e.g. O(1) slide `sum += entrant − leaver` stays a slide, never per-window `reduce` → O(n·k)).
- Include real LeetCode solution **and** a far-apart twin from a different domain.
- **Structure notes** instead ship a `solution.ts` that *builds the structure* (e.g. `DynamicArray` over a fixed buffer) so the cost story is **executed, not asserted** — in place of the LeetCode+twin pair.
- End with runnable self-check guarded by `if (import.meta.url === \`file://${process.argv[1]}\`)`.
- **Component builds** (React/TSX) ship component file(s) + fixtures (e.g. `DataTable.tsx`, `data.ts`); keep pure testable logic in a `solution.ts` beside them so the self-check still covers the bug-prone math (the `.tsx` needs a React/JSX toolchain, stays a thin shell over that primitive).

## Verifying solutions

No TS toolchain yet — `tsc` can't run. Node 24+ strips types natively, so `node <solution.ts>` runs
the self-check directly (the `import.meta.url` guard still fires). Fallback: a type-stripped mirror
in node (`/tmp/*.mjs`). Cover LeetCode examples + adversarial edges; every committed solution passes
its checks.

## Git

- Direct push to `main` blocked by guard hook — work on a branch, open a PR.
- Conventional commits (`feat:`, `docs:`, `fix:`…).
- Each note added to README **Notes** index table and, if new family, the folder tree.
