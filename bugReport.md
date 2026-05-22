# Bug Report Log

Tracking all issues, from critical bugs to minor suggestions.

## Critical (App Breaking)

-   ...

## Warning (Unexpected Behavior)

-   **[2026-05-22] (Resolved)**: Fixed the upside-down hand glub orientation while maintaining vertical gun handles. Inverted parent hand targets to `[Math.PI / 2, Math.PI / 2, 0]` (Left) and `[Math.PI / 2, -Math.PI / 2, 0]` (Right) to point thumbs 100% straight up. Updated the local `HandgunAttachment` group to use rotation order `'XYZ'` and counter-twist values `[-Math.PI / 2, isLeft ? -Math.PI / 2 : Math.PI / 2, 0]`. This correctly keeps the gun barrel oriented forward (+Z) and the handle pointing vertically down while the hands are upright.
-   **[2026-05-22] (Resolved)**: Resolved upside-down hands and sideways horizontal angled guns handle. Corrected the parent hand target rotation in the main `useFrame` game loop and GSAP shot timelines to a precise, upright combat posture `[Math.PI / 2, -Math.PI / 2, 0]` (Left) and `[Math.PI / 2, Math.PI / 2, 0]` (Right). Combined this with setting the local gun attachment rotation to order `'YXZ'` and values `[-Math.PI / 2, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]`—the exact mathematical inverse. This cancels wrist twist perfectly, pointing the thumbs 100% vertically up to the sky, aiming the barrels straight forward along +Z, and hanging the gun grips 100% vertically down from sights to ground.
-   **[2026-05-22] (Resolved)**: Fixed handgun orientation alignment issue where guns pointed sideways relative to character body. Prior rotation parameter of `[Math.PI / 2, 0, +/-Math.PI / 2]` rotated the hands/guns sideways under Three.js default XYZ Euler order. Corrected to `[Math.PI / 2, -Math.PI / 2, 0]` (Left) and `[Math.PI / 2, Math.PI / 2, 0]` (Right). Aligning the gun barrel and index finger to point perfectly forward along the aim line while keeping the thumbs pointed upright to the sky. Adjustments were applied to both the frame-tick targets and the GSAP recoil trigger timeline.
-   **[2026-05-22] (Resolved)**: Rotated hand pivots 90° around the Y-axis (`Math.PI / 2` and `-Math.PI / 2`) in gun mode for organic tactical side-grips, so palms face each other horizontally and fingers wrap around handles sideways. Fully counter-rotated the handguns around Y inside `HandgunAttachment` to keep them pointing straight forward, and aligned GSAP recoil resetting keyframes.
-   **[2026-05-22] (Resolved)**: Rerigged hand holding guns handle mode to establish natural trigger finger placements. Extracted the index finger out of tight clenches to rest inside trigger loops, animating custom trigger-squeeze reactions inside `useFrame`. Overhauled handguns into polished titanium-silver and brass gold dual-tone metal materials featuring realistic mechanical slide recoils, cocking hammers, and rotating gold shell ejection physics.
-   **[2026-05-22] (Resolved)**: Updated the handgun grip style to use the exact same snug, fully curled "hand glob" state as the tactical knife, wrapping the fingers tightly around the handle and eliminating trigger finger protrusion for visual consistency.
-   **[2026-05-22] (Resolved)**: Refactored the tactical knife blade from separate overlapping rectangular and cylindrical mesh parts (which looked bad due to lighting seams and overlap artifacts) into a single, seamless, custom-calculated THREE.BufferGeometry where only the top tip is tapered sharp.
-   **[2026-05-22] (Resolved)**: Overhauled hand geometries and weapon handles to address weapon-holding misalignment. Designed puffy thicker "Glob Hands" (dense cartoon glove capsules) and thickened handgun handles and tactical wood dagger grids, aligning drawing coordinates tightly to eliminate any gaps or robotic slide-lag.
-   **[2026-05-22] (Resolved)**: Replaced stiff punch-melee controls with fluid comedy "Slap Mechanics". Custom GSAP wide swing overlays trigger on alternate left/right arms with fanned palm alignments and custom Web Audio slap-shiver crack synthesizers.
-   **[2026-05-22] (Resolved)**: Fixed "Identifier 'React' has already been declared" React error inside Character file caused by conflicting automated visual adjustments, consolidating imports cleanly under a single import header.
-   **[2026-05-22] (Resolved)**: Cleared JSX tag discrepancies (such as `</</Box>`) and memo parenthesis imbalances inside Player file that caused the esbuild compiler to fail.
-   **[2026-05-22] (Resolved)**: Prevented standard page scroll events by overriding keydown/keyup on Space, Q, and Tab in `Controls.tsx`, locking controls inside the single-page boundaries.
-   **[2026-05-22] (Resolved)**: Locked camera rotation `OrbitControls` while the weapon wheel selector is held open to avoid erratic 3D visual pans while selecting.
-   **[2026-05-22] (Resolved)**: Corrected hand Z-orientation coordinate mirroring, relocated the outer-fanning thumb coordinates to prevent inward overlap, and replaced bulkier spheres with a flat, sleek RoundedBox palm to eliminate unnatural meatiness.
-   **[2026-05-22] (Resolved)**: Solved bottom-heavy weapon offsets and rigid linear init orientations. Added an organic rotative lock on the `wristRef` and shifted weapon attachments up to Y=`0.065`, seamlessly nesting pistol grips and knives inside fingers, while rotating default standing unarmed hands to face inward parallel to the core body.
-   **[2026-05-22] (Resolved)**: Fixed "curled" thumb in gunmode. Upgraded the `FloatingHand` skeletal logic to support dynamic X-axis rotation per finger, allowing the thumb to straighten and point vertically upwards (world-up) independently of the hand's forward-pointing pitch.
-   **[2026-05-22] (Resolved)**: Resolved robotic snapping on gun/knife draw and grab. Designed continuous placement mounts with smooth dynamic spring slide-up and scaling on draw transition, added custom trigger guard loop frames with metallic triggers on the Glocks, and aligned tactical knives vertically along the hand's Y-axis to replicate real grips perfectly.
-   **[2026-05-22] (Resolved)**: Restructured character visor to use an exact mathematical layout offset in Z-space, eradicating positioning sink and surface depth-fighting/flickering against the body capsule.
-   **[2026-02-27]**: Pre-existing TypeScript lint errors in `MetaPrototype.tsx`, `StyleGuidePanel.tsx`, `TabbedPanel.tsx`, and `Stage.tsx`. These appear to be related to type mismatches in window state and style guide data structures.

## Suggestion (Improvements)

-   **[2026-05-22] (Implemented)**: Replace low-detail robotic floating cartoon hands with detailed wrist-only segments containing realistic human skin tones and detailed custom wear (smartwatch, thread/bead jewelry).
-   [ ] Add more interactive SVG animations to the System Spec window for each rule.
-   ...
