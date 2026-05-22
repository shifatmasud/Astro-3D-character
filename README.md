# React 18 Meta Prototype & Design System Starter Kit

[**Remix on AI Studio**](https://ai.studio/apps/4c5ad789-603f-46a9-bdad-8e14663811ed)

This is a starter project for building modern, theme-aware React applications. It's set up with a modular structure, a powerful design system, and is ready for you to integrate the Gemini API.

## Project Scan Sheet

| Category | Details |
| :--- | :--- |
| **Framework** | React 18.2.0 (ESM via `importmap`) |
| **Styling** | CSS-in-JS (JS Objects), Semantic Design Tokens, No CSS Modules/Tailwind |
| **Animation** | Framer Motion 12.x (Spring Physics, Layout Animations) |
| **Typography** | Bebas Neue (Display), Comic Neue (Quotes), Inter (UI), Victor Mono (Code) |
| **Icons** | Phosphor Icons (Web Component) |
| **State Management** | React Context (`Theme`, `Breakpoint`), Local State, History Stack (Undo/Redo) |
| **Architecture** | Atomic-based: `Core` → `Package` → `Section` → `Page` → `App` |
| **Key Components** | Floating Windows, Draggable Dock, State Layer (Ripple), Element Anatomy Inspector |
| **Theme System** | Light/Dark Modes, Responsive Tokens, Feedback States (Success, Warning, Error, Signal) |
| **Inputs** | Range Sliders, Color Pickers, Toggles, Selects, TextAreas |
| **Visuals** | Confetti System, Blueprint Overlays, Token Badges, Glassmorphism |

## What's Inside? (ELI10 Version)

Imagine you're building with LEGOs. This project gives you a super organized box of special LEGO pieces to build an amazing app.

-   **`index.html`**: The front door to our app.
-   **`index.tsx`**: The main brain of the app.
-   **`importmap.js`**: A map that tells our app where to find its tools (like React).
-   **`Theme.tsx`**: The "master closet" for our app's style (colors, fonts, etc.).
-   **`hooks/`**: Special tools (custom hooks).
    -   `useBreakpoint.tsx`: Checks if you're on a phone, tablet, or desktop.
    -   `useElementAnatomy.tsx`: A special ruler that precisely measures a component and its inner parts.
-   **`types/`**: A dictionary for our app's data shapes.
    -   `index.tsx`: Defines what a "Window" or a "Log Entry" looks like.
-   **`components/`**: The LEGO pieces themselves, organized by complexity!
    -   **`Core/`**: The most basic, single-purpose pieces (Button, Input, Toggle, etc.).
    -   **`Package/`**: Combines Core pieces into something more useful (`ControlPanel`, `FloatingWindow`).
    -   **`Section/`**: A whole section of the app (the `Dock` at the bottom, the main `Stage`).
    -   **`Page/`**: A full screen you see (`Welcome` page).
    -   **`App/`**: The complete, running application (`MetaPrototype`).
-   **`README.md`**: This file! Your friendly guide.
-   **`LLM.md`**: Special instructions for AI helpers.
-   **`noteBook.md`**: A diary of tasks and progress.
-   **`bugReport.md`**: A list of bugs to fix.

## Directory Tree

```
.
├── components/
│   ├── App/
│   │   ├── MetaPrototype.tsx
│   │   └── Character.tsx
│   ├── Core/
│   │   ├── AnimatedCounter.tsx
│   │   ├── Button.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── Confetti.tsx
│   │   ├── DockIcon.tsx
│   │   ├── Input.tsx
│   │   ├── LogEntry.tsx
│   │   ├── RangeSlider.tsx
│   │   ├── Select.tsx
│   │   ├── StateLayer.tsx
│   │   ├── TextArea.tsx
│   │   ├── ThemeToggleButton.tsx
│   │   └── Toggle.tsx
│   ├── Package/
│   │   ├── CodePanel.tsx
│   │   ├── ConsolePanel.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── FloatingWindow.tsx
│   │   └── UndoRedo.tsx
│   ├── Page/
│   │   └── Welcome.tsx
│   └── Section/
│       ├── Dock.tsx
│       └── Stage.tsx
├── hooks/
│   ├── useBreakpoint.tsx
│   └── useElementAnatomy.tsx
├── types/
│   └── index.tsx
├── README.md
├── LLM.md
├── noteBook.md
├── bugReport.md
├── Theme.tsx
├── importmap.js
├── index.html
├── index.tsx
├── metadata.json
```

## Recent Updates

- **High-Fidelity Floating Wrists**: Replaced original basic floating box hands with realistic human-like floating wrists. Features include tapered organic forearm cylinders, anatomical bone details (ulnar styloid), stitched rolled fabric sleeves, and asymmetric accessories (smartwatch on left, braided gold / leather beads on right).
- **AI Agent Enhancements**: Implemented a dedicated input field for the Gemini API key in the Control Panel's Agent section, with local storage persistence for convenience. The AI window now consistently opens centered on the screen and always appears on top of other windows for improved visibility.
- **System Spec Window**: Added a dedicated floating window that outlines the project's core rules, engineering standards, and design system. Accessible via the "System Spec" toggle in the Inspector group.
- **Interactive Visuals**: The System Spec window features custom SVG animations and a "Copy as Markdown" utility.

- **3D Character Component**: Staged a high-quality 3D astronaut character (`Character.tsx`) using React Three Fiber and GSAP. Features include walking animations, jetpack flame effects, and customizable props for colors and transformations.

## How to Get Started

1.  Open the `index.html` file in a modern web browser.
2.  That's it! The app will run.
3.  Start changing the code in the `.tsx` files to build your own features.

---

## 🔫 Session 2 Update: Player I-Pose & Weapon Mechanics

### Summary
- **Weapon Selector Wheel**: Added a GTA 5 inspired slow-motion radial weapon selection overlay (Fist, Knife, and Handgun).
- **Player I-Pose Stance**: Incorporated a rigid structural I-pose toggle that freezes character velocity and locks arms parallel to the body.
- **3D Visual Accessories**: Fabricated detailed, procedural 3D metallic knife blade models and tactical laser handguns that orient in hand coordinates.
- **Dynamic Feedback Effects**: Designed screen-shaking camera recoil, yellow muzzle flashes, torus slice trails, and procedural synth audio feedback using Web Audio API.

### Architecture (IPO model)
- **Input**: Keyboard triggers (hold 'Q' or 'Tab', press 'Space', 'WASD', 'F'/'E' attack) & Touch devices (radial touch bobs, dedicated jump, select wheels, attack triggers).
- **Process**: Sector degrees hunt (`Math.atan2`), slow-mo dilation delta dilation, character physics damping, camera randomized shake decaying, arm GSAP triggers.
- **Output**: 3D Character models, laser tracers, muzzle sparks, torus slash sweeps, synthesizer punch/slash/shoot frequencies, dual-mode pose states.

### Completed Action List
1. `soundEffects.ts`: Outlined real-time procedural synthesizers for punch frequencies, swoosh slashes, noise-filtered firearms, and menu clicks.
2. `Character.tsx`: Rigged the 3D character with props for equipped weapons and structural pose stances, packing visual effects coordinates directly alongside arms.
3. `Controls.tsx`: Designed the touch bobs, virtual jump triggers, radial sector calculations, HUD banners, and combat firing overlays.
4. `Playground.tsx`: Integrated the time dilation velocity scaling, camera state context-aware shakes, and orbit locks.

---

## 🌪️ Session 3 Update: Standing Dual-Wield & Skeleton rigging

### Summary
- **Consolidated Player Component**: Combined the Character body architecture and custom 5-finger hands into a single high-performance `/components/App/Player.tsx` file.
- **GSAP Context Orbits**: Utilized the modern `useGSAP` hook scope to handle non-leaking attack action sequences, dual-wield recoil coordinates, muzzle flares, tracer pathways, and sword-slits.
- **Dual Wield Systems**: Equipped dual metallic knives and dual sub-compact laser handguns on *both* left and right hands concurrently, dynamically alternating fire/slashing triggers between both arms.
- **Dynamic Skeletal Locomotion**: Rigged natural walking animation synchronizations where the floating hands swing forward and backward alternately matching leg phase frequencies, automatically returning to weapon postures upon attacking.
- **Responsive Grip System**: Configured custom finger-curl matrix states ('open', 'fist', 'pistol', 'knife') that dynamically morph phalanx rotation vectors in real-time.

---

## 🍃 Session 4 Update: Organic Finger Cascades & Spring Damping

### Summary
- **Piano Finger Ripples**: Implemented continuous fluid wave-ripples (wave offsets across index, middle, ring, and pinky bones) in empty-hand idle postures to simulate weightless organic blood flow.
- **Spring Positional Damping**: Exchanged immediate hand coordinate snaps with a frame-rate independent elastic lag interpolation (`THREE.Vector3.lerp`) that lets arms slide smoothly into place.
- **Inertial Weight Lag**: Connected vertical player velocities inside the movement physics engine directly to the arms, creating natural weight sways on high jump peaks and rapid falls.
- **Anatomical Landing Squeezes**: Enabled responsive landing impact detection that physically compresses torso and arm coordinates downward upon touching the soil before springing back.
- **Dynamic Alert Postures**: Rigged micro sways, subtle fanning, and high-frequency target muscle tremors inside weapon grips (combat clenches/fist tension) to remove any clinical, robotic static feels.

---

## 🖐️ Session 5 Update: Anatomical Double-Joint Rigging & Standing I-Pose Default

### Summary
- **Skeletal Double-Joint Rigging**: Learned custom organic hand shapes and configurations from visual guidelines, implementing full secondary joint segment controllers (`thumbTipRef`, `indexTipRef`, etc.) to fold, clench, and fold-curl fingers naturally.
- **Resting I-Pose Sync by Default**: Grounded the unarmed stance so the player's arms hang straight down parallel to thighs/hips by default when idle (exactly like a human normally standing).
- **Pendulum Locomotion**: Built realistic pendulum walking/running arm bobs swinging comfortably from thighs forward and back as feet swing, completely dissolving robotic combat guards.
- **Responsive Clenching Dynamics**: Synchronized fist clenches, item grip curvatures (clamping cylinders), trigger guard extensions, and loose cradles across all base and tip bones concurrently.
- **Unified Hand-Weapon Coordinate Nesting**: Solved hand-weapon translation lag and rotation drift relative to the player. Removed static rigid slanted intermediate groups and nested the procedurally generated Knives and Handguns directly as children under the dynamic glove's `wristRef` group (the palm structure). This guarantees that held weapons inherit 100% of the hand's organic drift, breathing, sways, and recoil kicks with perfect coordinate locked rotation.

---

## 🎯 Session 6 Update: Organic Wrist-Bone Pivots & Knuckle Grip Slotting

### Summary
- **Dynamic Wrist bone Rotation**: Implemented a realistic dynamic roll-pitch-yaw state controller on the palm `wristRef` that twists the hand customly depending on active weapon grip types (guarded fists, canted hunter knives, slanted shooter pistol wrist lock).
- **Proportional Knuckle Slotting**: Raised the nested item attachments Y-anchor coordinate closer to the fingers (from Y=`0.035` up to Y=`0.065`). Held weapons now nest organically directly within the curling finger bones instead of dangling near the bottom of the wrist.
- **Anatomic Thigh Orientation**: Rotated default resting arms 90 degrees outward on the Y-axis so the hands hang parallel and face the thighs naturally, completely resolving artificial forward-stretched zombie positions.

---

## ⚡ Session 7 Update: Realistic Finger-Locked Knuckle Grips & Dynamic Sliding Draws

### Summary
- **Dynamic Sliding-Draw Swap Transitions**: Mounted both weapons permanently inside the hand groups, using `useFrame` to interpolate their scale and position on weapon switch. Weapons now procedurally slide up organically from pockets (`Y=-0.06`) to finger slots (`Y=0.085` / `0.075`), eliminating any sudden snapping or visual pops on draw/grab.
- **True-to-Life Glock Rigging (Ref 1)**: Shifted coordinates and rotated components so that the Glock handle slots precisely into the curled middle, ring, and pinky finger bones. Added a high-fidelity trigger guard loop frame and a metallic responsive trigger model, aligning the extended index finger trigger placement perfectly.
- **Natural Tactical Dagger Angles (Ref 2)**: Aligned the knife handle vertically along the hand's local Y-axis parent frame so fingers wrap horizontally around the wood cylinder, while the blade extends straight up above the thumb/index bounds exactly like standard combat stances.
- **Outward flared Human A-pose (Ref 3)**: Shifted unarmed positions outward to `-0.46` (left) and `0.46` (right) to flare the arms comfortably away from the torso, while angling the wrists inwardly `1.2` / `-1.2` radians on the Y-axis to replicate real human neutral state standing postures with 100% precision.
- **Smooth Startup Entry**: Initialized position vector references inside the hand refs to the default neutral standing pose to completely prevent visual frame-glitching or snapping on page load.

---

## 💥 Session 8 Update: Comedic Slap Mechanics & Cartoon Glob Hands

### Summary
- **Comedic Slap Melee**: Replaced the basic unarmed punch attack with a satisfyingly hilariously aggressive "slap" mechanic. Animations utilize custom GSAP timelines to pull the hand back in an outer wind-up before executing a sweeping horizontal arc across the character's torso, striking flat with a fanned-out palm.
- **Puffy Cartoon Glob Hands**: Redesigned the human-like wrists into thick, adorable, puffy cartoon glove-style "glob hands". Built from highly rounded, thick bubble capsules and spheres, these glove models resemble organic cartoon marshmallow blobs.
- **Flawless Weapon-Glove Coupling**: Thickened wood knife handles, handgun slides, and gun grips to match the chubby glob hands. Shifted drawing and knuckle offsets closer to palm centers to ensure weapons lock tightly inside the puffy, curling glove fingers with zero gaps or translation lag.
- **Two-Stage High-Impact Slap Synth**: Engineered a procedural audio synthesizer for slap skin cracks. Combines a high-frequency band-swept triangle wave (for flesh strike tone) with high-pass filtered white noise transients to deliver a crisp, bone-chilling impact on hit.