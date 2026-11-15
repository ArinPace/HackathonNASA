# Implemented
Complete configuration → review → contracted deployment → orbital operations → report → redesign flow. Three.js spacecraft with changing payload/antenna/panels/battery/recorder, NASA lunar texture, analytic environment, coupled resources, manual commands and optional operator, received-science map, saved designs, actual automated comparison, report export, source/assumption notes, responsive styling and keyboard controls.

# Verification
`npm test`: 7 simulation checks. `npm run build`: TypeScript + Vite production build. `node tests/browser.mjs`: browser flow and mobile overflow/errors. Browser executable path is local and must be adjusted on another machine. Headless numerical references return 1 paired cell for the initial design and 4 for the balanced configuration with the same policy; differing hardware changes policy timing.

# Remaining
Worker isolation, full command-log replay UI, autonomous design optimization, six-degree-of-freedom launch/orbit insertion, true ground-station/ephemeris fidelity, full KSP parity and multiplayer are future scope. Single-threaded simulation is bounded to 600×, one-second substeps and 10Hz UI. Full plan is a roadmap, not an implemented feature claim.

# Run
`npm install`, `npm run dev`; `npm test`; `npm run build`. No accounts or keys required.

# Flight school revision
Added a seven-step action-gated tutorial, replayable help, event coasting with resource accounting, live orbital SVG, active scan/downlink beam, flight-director hints, unique-evidence transmission priority, science milestones and medals. Fixed manual commands being overridden by auto, persistent toasts, detached panel-grid rendering and commands failing to resume after a pause/coast. Notes pause the mission. Compact mobile operations layout and reduced-motion preference supported. Added tutorial browser coverage and transmission-priority/score invariants.

# Beginner and launch revision
Added a three-part basics introduction, rocket-versus-explorer explanation, plain-language mission goal and command descriptions. Interactive two-stage 3D launch connects design review to lunar operations: assisted/manual throttle and pitch, countdown, stage separation, atmospheric climb and transfer sequence. The lunar simulation remains independent of launch real time. Tests include thrust/fuel response, safe separation, countdown, assisted completion and bounded fuel.

# Career progression revision
The default entry is now a six-chapter, eighteen-assignment career map. Every chapter has three progressively stricter assignments with multiple objectives, saved XP/stars/badges, sequential unlocks and no replay XP farming. Includes satellite commissioning/antenna tracking/power rescue; Earth orbital surveys; station docking; lunar surveys; Moon landings; and combined Mars survey/landing. Local training approximations are labeled. A launch certificate avoids repeated launch grinding; the original sandbox remains accessible.
