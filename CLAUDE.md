# ts-algorithms — project conventions

Personal algorithm-pattern reference. Goal: **recognition over memorization** — train
the trigger that maps a problem (or real code in any stack) to the right trick.

Audience voice: an engineer who codes with frameworks but never studied algorithms or
much math. **Plain words, no bare jargon** — ground every term the first time (explain
Big-O as loops, "Stack = last-in-first-out pile", etc.). Terse for general/navigation;
real depth only on the genuinely hard part, inline.

## Note format (REQUIRED — this is the preferred shape)

Each trick lives at `<family>/<trick>/` with a `README.md` + a `solution.ts`. The
README follows this order — **questions first, bug-focused pseudocode in the middle,
real example problems last**. Reference note: `binary-search/find-target/README.md`.

**Two axes, same note shape.** (1) Algorithm patterns at root (`binary-search/`,
`hashing/`…) — navigated by *recognising which trick*; nesting means "built on parent."
(2) Front-end primitives (GFE 75) under `frontend/<category>/<trick>/` — JS/browser
utilities you implement from scratch; nesting is plain categorisation, not "built-on."
Scope of the frontend axis: implement-from-scratch primitives that fit a `solution.ts`;
UI-build questions are out. Reference: `frontend/rate-limiting/debounce/README.md`.

1. **Title** — `# <Trick> — <one-line plain gist>`
2. **## TL;DR**
   - **"Is it <trick>? Ask these — all yes → yes:"** the recognition test — the
     questions you run on a problem's words to decide if this trick applies. The last
     one is the real decider.
   - **"Before you code, pin down:"** the trick-specific clarifying questions.
   - **"The lines where bugs hide:"** a one-line list of the bug-critical decisions.
3. **## What it is** — plain explanation + a tiny worked example on real values.
4. **## What you track** — the variables, in familiar terms.
5. **## How it works** — pseudocode that is code-like but readable, with a **⚠️ on
   every bug-prone line** and the consequence of getting it wrong (off-by-one, infinite
   loop, wrong seed, overflow). Close with a one-line recap of those lines.
6. **## Picture** — a Mermaid flowchart.
7. **## Where you'll meet it (practice + recognition)** — LeetCode/other-platform
   problems with a one-line mapping, real-life examples in any stack, and a "looks like
   it but ISN'T" line naming the sibling trick + the question that tells them apart.
8. Footer link to `solution.ts`.

Do **not** use the older sections "Spot it", "Two disguises", "Questions to ask",
"Go faster" — they're folded into TL;DR (questions), How it works (bug lines), and
Where you'll meet it (examples).

## solution.ts

- TypeScript, strict-clean (explicit return types, no `any`, `const` by default, double quotes, semicolons).
- Header doc comment carries ALL the reasoning: problem statement, approach, why-it-works, complexity, edge cases, and any language trap (e.g. JS `<<` is 32-bit).
- Include the real LeetCode solution **and** a far-apart twin from a different domain.
- End with a runnable self-check guarded by `if (import.meta.url === \`file://${process.argv[1]}\`)`.

## Verifying solutions

The repo has no TS toolchain yet, so `tsc` can't run. Verify logic by executing a
type-stripped mirror in node (`/tmp/*.mjs`) covering the LeetCode examples + adversarial
edges. Every committed solution must pass its checks.

## Git

- Direct push to `main` is blocked by a guard hook — always work on a branch and open a PR.
- Conventional commits (`feat:`, `docs:`, `fix:`…).
- Each note is added to the README **Notes** index table and, if it's a new family, the folder tree.
