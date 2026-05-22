# Bug Report Log

Tracking all issues, from critical bugs to minor suggestions.

## Critical (App Breaking)

-   ...

## Warning (Unexpected Behavior)

-   **[2026-05-22] (Resolved)**: Overhauled hand geometries and weapon handles to address weapon-holding misalignment. Designed puffy thicker "Glob Hands" (dense cartoon glove capsules) and thickened handgun handles and tactical wood dagger grids, aligning drawing coordinates tightly to eliminate any gaps or robotic slide-lag.
-   **[2026-05-22] (Resolved)**: Replaced stiff punch-melee controls with fluid comedy "Slap Mechanics". Custom GSAP wide swing overlays trigger on alternate left/right arms with fanned palm alignments and custom Web Audio slap-shiver crack synthesizers.
-   **[2026-05-22] (Resolved)**: Fixed "Identifier 'React' has already been declared" React error inside Character file caused by conflicting automated visual adjustments, consolidating imports cleanly under a single import header.
-   **[2026-05-22] (Resolved)**: Cleared JSX tag discrepancies (such as `</</Box>`) and memo parenthesis imbalances inside Player file that caused the esbuild compiler to fail.
-   **[2026-05-22] (Resolved)**: Prevented standard page scroll events by overriding keydown/keyup on Space, Q, and Tab in `Controls.tsx`, locking controls inside the single-page boundaries.
-   **[2026-05-22] (Resolved)**: Locked camera rotation `OrbitControls` while the weapon wheel selector is held open to avoid erratic 3D visual pans while selecting.
-   **[2026-05-22] (Resolved)**: Corrected hand Z-orientation coordinate mirroring, relocated the outer-fanning thumb coordinates to prevent inward overlap, and replaced bulkier spheres with a flat, sleek RoundedBox palm to eliminate unnatural meatiness.
-   **[2026-05-22] (Resolved)**: Solved bottom-heavy weapon offsets and rigid linear init orientations. Added an organic rotative lock on the `wristRef` and shifted weapon attachments up to Y=`0.065`, seamlessly nesting pistol grips and knives inside fingers, while rotating default standing unarmed hands to face inward parallel to the core body.
-   **[2026-05-22] (Resolved)**: Resolved robotic snapping on gun/knife draw and grab. Designed continuous placement mounts with smooth dynamic spring slide-up and scaling on draw transition, added custom trigger guard loop frames with metallic triggers on the Glocks, and aligned tactical knives vertically along the hand's Y-axis to replicate real grips perfectly.
-   **[2026-05-22] (Resolved)**: Restructured character visor to use an exact mathematical layout offset in Z-space, eradicating positioning sink and surface depth-fighting/flickering against the body capsule.
-   **[2026-02-27]**: Pre-existing TypeScript lint errors in `MetaPrototype.tsx`, `StyleGuidePanel.tsx`, `TabbedPanel.tsx`, and `Stage.tsx`. These appear to be related to type mismatches in window state and style guide data structures.

## Suggestion (Improvements)

-   **[2026-05-22] (Implemented)**: Replace low-detail robotic floating cartoon hands with detailed wrist-only segments containing realistic human skin tones and detailed custom wear (smartwatch, thread/bead jewelry).
-   [ ] Add more interactive SVG animations to the System Spec window for each rule.
-   ...
