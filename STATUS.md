# Implemented
Complete configuration → review → contracted deployment → orbital operations → report → redesign flow. Three.js spacecraft with changing payload/antenna/panels/battery/recorder, NASA lunar texture, analytic environment, coupled resources, manual commands and optional operator, received-science map, saved designs, actual automated comparison, report export, source/assumption notes, responsive styling and keyboard controls.

# Verification
`npm test`: 7 simulation checks. `npm run build`: TypeScript + Vite production build. `node tests/browser.mjs`: browser flow and mobile overflow/errors. Browser executable path is local and must be adjusted on another machine. Headless numerical references return 1 paired cell for the initial design and 4 for the balanced configuration with the same policy; differing hardware changes policy timing.

# Remaining
Worker isolation, full command-log replay UI, autonomous design optimization, manual launch, true ground-station/ephemeris fidelity, full KSP parity and multiplayer are future scope. Single-threaded simulation is bounded to 600×, one-second substeps and 10Hz UI. Full plan is a roadmap, not an implemented feature claim.

# Run
`npm install`, `npm run dev`; `npm test`; `npm run build`. No accounts or keys required.
