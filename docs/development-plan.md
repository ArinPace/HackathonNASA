**Build one unforgettable mission, then expand.** For your remaining day, I recommend an original browser game called **One Last Signal**: construct a visible spacecraft, operate it through competing observation, power and communication demands, and replay the mission to discover which engineering decision changed the science returned. Use **GPT-6.1 Sol as the main implementer**, with a bounded Astra review for difficult simulation or architecture problems. This recommendation deliberately changes your requested sequence: **complete KSP parity first is a long-term project; the 24-hour submission is a focused mission game, not an exact KSP clone.** Both routes are specified below so that the parity requirement remains visible. The strongest opportunity is a complete, memorable example of the mission-design challenge, rather than an unsupported promise to exceed three mature games in every dimension. Winning remains uncertain; the plan gives you observable quality gates that you can control.

The user confirms that the game ideas are their own. Record that concept origin alongside accurate disclosure of this session's AI-assisted research and technical planning, and of any coding, debugging or asset assistance actually used later. The current guide permits SI assistance while saying it **should not** originate the solution idea; the user's confirmation resolves the concept-origin question for this plan. [Current submission guidance](https://www.spaceappschallenge.org/resources/project-submission-guide/)

1. **Choose the release contract before the first implementation prompt.** The research inspected [ArinPace/HackathonNASA](https://github.com/ArinPace/HackathonNASA) through the connected GitHub API on November 14, 2026. It is public and empty: `main` is the configured default branch name, but there are no commits, application files, package manifest, existing stack or repository instructions to preserve. Everything proposed here is new work. Recheck the repository when coding begins in case it has changed.

| Route | What it commits to | Honest deliverable from this starting point |
|---|---|---|
| A — strict clone-first | Audit and reproduce the selected KSP gameplay capabilities before adding the Mars Horizon/Juno-inspired layer | A long-term development program. The first day can establish specifications and prototypes; it cannot credibly complete parity. |
| B — competition-first, recommended | Ship a complete original mission game using selected mechanics; retain the full parity ledger as unimplemented future scope | A plausible but demanding 24-hour attempt with explicit cuts, integration gates and submission reserve. |

Choosing B is a proposed change to your original order, not a claim that a smaller game satisfies it. If A is non-negotiable, use the parity program later in this document and treat tomorrow's deliverable as an early foundation. Full parity has too many unmeasured dependencies for a credible fixed completion date today. Plan it as sustained product development, potentially months or years depending on scope, skills and staffing; that is an engineering judgment, not a measured estimate.

The functional-parity interpretation uses original code, artwork, characters, audio, names and interface presentation. Binary-identical behavior, compatibility with existing KSP saves or plugins, copied assets, and every historical platform variant are separate requirements. They should never slip into an apparently small “clone” task without being named.

2. **Use the winners as evidence for product focus and presentation.** The research followed the [2025 global winners](https://www.spaceappschallenge.org/2025/awards/global-winners/) to individual submissions and their demonstrations. The official award identities establish that Astro Sweepers won Galactic Impact, Zumorroda-X won Art & Technology, and PureFlow won Best Mission Concept. These are relevant precedents, not evidence about the judges' private reasons for selecting them. [NASA's winners announcement](https://www.nasa.gov/learning-resources/stem-engagement-at-nasa/nasa-announces-2025-international-space-apps-challenge-global-winners/)

| Reference | What was actually inspected | Transferable lesson for your game |
|---|---|---|
| [Astro Sweepers](https://www.spaceappschallenge.org/2025/find-a-team/astro-sweepers-we-catch-what-space-leaves-behind/?tab=project) | Official submission, current website text, and eight sampled frames from its submitted 30.505-second video. Frames show problem framing, a numerical comparison and a consistent website presentation. | Give the game one memorable promise and demonstrate a specific before/after result. |
| [Henry's Farm Adventures / Zumorroda-X](https://www.spaceappschallenge.org/2025/find-a-team/zumorroda-x/?tab=project) | Official submission, deployment HTML, and eight frames from its 29.167-second video. Visible elements include farmer dialogue, environmental imagery, a comparison slider and a keyboard-controlled flood mini-game. | Connect a person and a problem to evidence, then let the player act immediately. |
| [PureFlow](https://www.spaceappschallenge.org/2025/find-a-team/pureflow2/?tab=project) | Official description and deployed landing-page text. The team describes 3D habitat design and resource validation; its interactive flow and video were not tested. | Show engineering consequences directly on a designed object. Treat the team's technical claims as claims, not independent validation. |

The actual submitted videos are linked here: [Astro Sweepers demo](https://drive.google.com/file/d/1L3cIR8WZdzdp7eUY3leIToGTbnMiBT4N/view?usp=sharing) and [Henry's Farm Adventures demo](https://drive.google.com/file/d/1P-sOTecG2uO2eLu3UabS0PXWLYUKaF4p/view?usp=sharing). They were visually sampled, not continuously watched or transcribed. No live game was played during this research. Astro's sampled footage does not independently establish a functioning orbital analysis pipeline, and Henry's footage does not prove every level or data request works. Current websites can also differ from submitted versions.

Apply the observed story–evidence–action pattern with an original mission scientist who says: “We have six orbits to return enough evidence to prioritize the next lunar survey. What will you put aboard?” Keep the request brief. Show the target region, allow a component decision, then reveal a consequence. Your game should demonstrate its own working simulation rather than imitate another entry's claims or visual identity.

3. **Define the experience as a complete mission with a clear purpose.** The official challenge asks for integrated mission design, limited resources, operations and understandable consequences. It allows single-player play; collaboration for up to four players is an option, not a requirement. The user supplied the full challenge and resources, which are the basis for this plan. [2026 challenge and resources](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources)

The first scenario is **Lunar Polar Scout**: prioritize promising polar follow-up targets using a hydrogen-proxy survey and contextual observations. It covers six simulated lunar orbits, roughly half a day depending on the selected altitude, in an approximately 8–12-minute session. A fast demonstration preset can compress this further. Do not claim a 90-day operational simulation if only six representative orbits are implemented.

The mission has three explicit requirements: return enough valid observations from the designated region, stay within the fictional budget and delivery constraints, and finish with the required evidence received on Earth. Set concrete cell-count and quality thresholds in the mission configuration, then tune them through the actual simulator. The short campaign should permit at least two successful strategies. The player is rewarded for useful evidence, not simply for surviving or collecting the most bytes.

An ordinary camera must not “discover hidden ice” because it has a higher resolution. NASA's LRO instruments distinguish hydrogen, thermal, topographic and imaging measurements. Use a neutron-like hydrogen proxy for the principal survey, imaging for context, and thermal evidence as an optional extension. Describe results as prioritizing targets, not proving accessible, mineable ice. [NASA LRO instruments](https://science.nasa.gov/mission/lro/spacecraft-and-instruments/)

| Screen and session stage | Player action | Immediate response | Completion condition |
|---|---|---|---|
| Briefing, first 45 seconds | Read the scientist's request; choose the mission and starting design | Destination, target region and three success conditions appear | The player knows what must arrive on Earth. |
| Hangar, minutes 1–3 | Attach or replace components; choose launcher and orbit | Same 3D craft changes; cost, mass and predicted resource margins update | Required sockets are populated and a configuration is saved. |
| Review, about 30 seconds | Inspect blockers and risks; revise or accept a feasible risk | Each finding highlights its component and affected objective | Impossible launch is blocked; feasible but weak science remains a visible choice. |
| Delivery, 15–30 seconds | Commit the launch contract and confirm deployment | The assembled payload appears in an explicitly labeled contracted-launch sequence | Cost is charged once and the valid orbital mission begins. |
| Operations, minutes 4–9 | Point toward targets, Earth or the Sun; pause or accelerate; react to alerts | Craft orientation, contact line, power, buffer and received map respond together | Six orbits or the scenario end condition is reached. |
| Debrief, about a minute | Inspect returned evidence and causes; duplicate the design | Actual events explain missed observations and incomplete data | A second design or operating plan can be run immediately. |

Keep the spacecraft central. A compact resource strip shows battery, stored data, returned evidence and time to the next meaningful window. Budget and mass remain available in expanded details. Let the player see where the antenna points and why a contact is unavailable. A spacecraft that visually reacts to commands will carry more of the experience than a long series of numerical panels.

4. **Make pointing the signature interaction.** The day-one spacecraft has a deliberately simple arrangement of body-fixed instruments, directional communications and solar panels. Three commands create a meaningful trade: `OBSERVE`, `DOWNLINK` and `CHARGE`. Add a safe-mode control that disables discretionary loads and preserves or recovers energy. Keyboard equivalents, such as 1/2/3 and Space to pause, must be shown and rechecked for browser conflicts.

An observe command points the measurement axis toward an eligible target. Data is created only while geometry, instrument compatibility, power and storage permit it. A downlink command points the antenna toward Earth; bytes leave the queue only during a valid link. A charge command seeks favorable panel illumination. These modes do not imply that real spacecraft cannot observe while generating power: generation continues according to the actual modeled panel–Sun geometry in every mode. Each turn has a finite slew interval and a defined energy cost. The ship cannot instantly collect and transmit through the same instant by alternating commands.

Use recoverable pressure. A filling buffer can be managed by transmitting sooner, pausing a lower-priority instrument or foregoing an observation. A low battery can be recovered by changing mode and sacrificing a window. An alert should describe the state and offer the relevant controls, not immediately terminate the mission. Auto-pause once when a new actionable constraint occurs; allow the player to disable this aid. The scenario should naturally produce tension through windows and resources before adding random disasters.

The end-of-run report must distinguish “collected,” “still onboard,” “received” and “usable.” Show three causal statements backed by event IDs and quantities. For example: a buffer became full, a later observation was skipped, and insufficient transmission capacity left data onboard. Suggestions are labeled as suggestions until another simulation verifies them. A counterfactual button reruns a changed design or policy; it never invents an improvement percentage.

5. **Borrow specific strengths while keeping the first release coherent.** KSP's published capabilities cover construction, flight, exploration and several progression modes. Mars Horizon emphasizes agency development and mission resource decisions. Juno's developer documents parametric design, engineering analysis and Vizzy programming. These sources establish useful references, not proof that the new concept is unprecedented. [KSP](https://store.steampowered.com/app/220200/Kerbal_Space_Program/), [Mars Horizon](https://store.steampowered.com/app/765810/Mars_Horizon/), [Juno press kit](https://www.simplerockets.com/About/Presskit)

| Inspiration | Keep in the 24-hour game | Build in the full product | Deliberate refinement |
|---|---|---|---|
| KSP construction and ownership | A socket-based spacecraft whose visible parts persist throughout the mission | Free attachment, arbitrary assemblies, staging, vehicles and structural behavior | Every selectable part affects the authoritative model. |
| KSP exploration and consequences | A destination, a scientific purpose and recoverable engineering failure | Manual flight, rendezvous, landing, surface activity and multiple bodies | The debrief explains the causal chain in beginner language. |
| Mars Horizon management | A constrained budget, delivery provider and readiness review | Procurement, schedules, testing, technology, facilities and concurrent missions | Preparation choices connect to actual operational demands. |
| Mars Horizon operations | Competing observation, communication and power choices | Ground networks, team coordination and fleet scheduling | Costs and opportunities are visible before committing. |
| Juno technical feedback | Immediate calculated changes when a part is swapped | Procedural parts, propulsion tuning and deeper performance tools | Units and assumptions remain accessible beside the numbers. |
| Juno automation | Saved command replay; optional simple rule only after the core passes | A bounded policy language with stepping, logs and debugging | Automation must obey the same resource and command rules as manual play. |

KSP already includes transmission and science-return mechanics; Breaking Ground explicitly describes continuing experiments and transmitted results. Mars Horizon also presents resource trade-offs. The differentiated claim should therefore be **a focused, explainable mission-design learning experience**, not that other games have never connected science, communication or consequences. [Breaking Ground](https://store.steampowered.com/app/982970/Kerbal_Space_Program_Breaking_Ground_Expansion/), [Mars Horizon developer page](https://aurochdigital.com/marshorizonvideogame)

6. **Give the builder a small, consequential catalog.** Use eight visible sockets: bus, primary instrument, secondary instrument, antenna, solar pair, battery, storage and propulsion package. Start with click-to-attach cards and keyboard selection. Drag-and-drop is optional polish. Constrain camera orbit and zoom so a new player cannot lose the craft. An invalid replacement explains its incompatibility without corrupting the current design. Provide reset and duplicate-design actions from the start.

The following are **proposed fictional balancing inputs**, not real mission specifications or NASA costs. Display that distinction in the budget panel. Every number needs calibration in the headless simulator before filming a result.

| Component | Mass, kg | Fictional cost, $M | Proposed capability |
|---|---:|---:|---|
| Standard bus | 25 | 4.0 | 18 W housekeeping |
| Hydrogen-proxy instrument | 12 | 5.0 | 14 W active; 0.02 MiB/s telemetry |
| Context camera | 8 | 3.0 | 12 W active; 0.20 MiB/s |
| Detailed camera | 12 | 6.0 | 25 W active; 1.00 MiB/s; greater valid detail |
| Thermal instrument, optional | 6 | 4.0 | 10 W active; 0.10 MiB/s |
| Basic radio/antenna | 2 | 1.0 | 4 W while sending; 0.05 MiB/s valid link |
| Directional radio/antenna | 6 | 3.0 | 16 W while sending; 0.80 MiB/s valid link |
| Small solar pair | 5 | 1.0 | 45 W at favorable reference incidence |
| Large solar pair | 10 | 2.0 | 110 W at favorable reference incidence |
| Small battery | 4 | 0.7 | 60 Wh |
| Large battery | 8 | 1.2 | 160 Wh |
| Small storage | 1 | 0.3 | 128 MiB |
| Large storage | 2 | 0.8 | 512 MiB |
| Propulsion package | 8 wet | 1.5 | 3 kg dry hardware and 5 kg propellant |
| Light delivery service | external | 18.0 | 100 kg limit for its configured delivery |
| Heavy delivery service | external | 24.0 | 150 kg limit for its configured delivery |

This is fourteen component entries and two delivery providers. A fictional $40M scenario supports meaningful budget checks. Delivery constraints must include allowed destination/orbit and a configured envelope, rather than implying any 100 kg rocket can reach any orbit. The contracted service includes insertion in the base game. The propulsion package is carried contingency reserve; do not claim a fuel-consumption simulation unless explicit burns are implemented. Guided insertion with propellant use is a stretch extension, not a day-one dependency.

7. **Use a calculated comparison without hard-coding its winner.** Design A equips the bus, hydrogen instrument, detailed camera, basic antenna, large panels, large battery, small storage and propulsion package. It totals **78 kg and $39M**, including light delivery. Design B changes the detailed camera to the context camera and the basic antenna to the directional system. It totals **78 kg and $38M**. B is a two-component strategy change; it cannot establish that one component alone caused the entire outcome.

An isolated test fixture with 180 seconds of eligible observation illustrates the bottleneck. A attempts `(1.00 + 0.02) × 180 = 183.6 MiB`; B attempts `39.6 MiB`. Their buffer holds 128 MiB. In a separate 300-second valid downlink fixture, A can send at most 15 MiB and B at most 240 MiB, capped by queued data and energy. These are hand calculations for synthetic test windows, not observed game results or a claim that the selected lunar geometry provides exactly those windows. The integrated scenario must derive its own windows and produce its own report.

Preserve the detailed camera's genuine advantage when enough data is returned. A player might prioritize a few high-value observations rather than maximize coverage. B can return broader contextual evidence with less storage pressure. A third candidate can combine the detailed camera and strong antenna with smaller panels and battery; it trades power margin for detail and communications. Only call it viable after the simulation and a human operating policy demonstrate success.

For a controlled one-component experiment, compare a context-camera design with the basic antenna against the same design with the directional antenna. Those configurations cost $36M and $38M respectively and remain within the illustrative budget. Keep scenario and command policy fixed, show all changed properties of that antenna, and report any differences. Changing a part naturally changes several engineering attributes; the controlled variable is the selected part, not antenna throughput alone.

8. **Use one simulation as the source of every result.** The recommended stack is React, TypeScript, Vite and Three.js, using React Three Fiber if it simplifies scene work. Add a small local state store, a test runner and one browser end-to-end runner. Pin the compatible versions actually installed. A worker keeps computation separate from interface work, and fast scene animation should avoid per-frame React state churn. [Vite guide](https://vite.dev/guide/), [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), [R3F performance guidance](https://r3f.docs.pmnd.rs/advanced/pitfalls)

Keep the first implementation one static application. It needs no account service, database, live model API, multiplayer server or live NASA API to complete a mission. Bundle the required content and assets locally. The application should work when external data services are unavailable. A production build and a tested public link are the eventual delivery artifacts; this planning task has not built either.

```text
Player commands → typed command adapter → pure simulation core
                                         ↓
                              state snapshots + causal events
                               ↙           ↓             ↘
                         3D scene      interface       report/replay
                                         ↓
                                 versioned local save
```

All of the following paths are proposed new files in the currently empty repository:

```text
README.md                          Run, play, sources, actual scope
STATUS.md                          Current milestone, blockers, exact commands
docs/mission-spec.md                Mission, controls, success criteria
docs/simulation-assumptions.md      Fidelity, units, limitations
docs/feature-parity.csv             KSP audit ledger and evidence status
docs/demo-script.md                 Reproducible presentation
src/app/App.tsx                     Screen flow
src/app/gameStore.ts                UI choices and simulation snapshots
src/content/parts.ts                Fictional catalog
src/content/mission.ts              Targets, requirements, timeline
src/content/bodies.ts               Sourced physical constants
src/content/sources.ts              Provenance manifest
src/sim/types.ts                    Shared contracts
src/sim/design.ts                   Derived vehicle and validation
src/sim/orbit.ts                    Analytic orbit and environment
src/sim/operations.ts               Pointing, energy, buffers, transmission
src/sim/science.ts                  Valid unique received evidence
src/sim/events.ts                   Causal records
src/sim/runner.ts                   Advance and replay
src/sim/sim.worker.ts               Typed message adapter
src/scenes/HangarScene.tsx          Socket craft and selection
src/scenes/OrbitScene.tsx           Moon, craft, windows and pointing
src/ui/{Briefing,BuildPanel,ReviewPanel}.tsx
src/ui/{OperationsControls,Debrief,CompareRuns}.tsx
src/lib/save.ts                     Versioned persistence
src/styles.css
tests/{design,orbit,operations,science,replay}.test.ts
tests/e2e/mission.spec.ts
public/assets/                     Local original/credited assets
```

Keep the simulation independent of React, the DOM, Three.js vectors and wall-clock time. Renderers read snapshots; they never decide if a packet exists or a mission succeeded. A headless runner and the worker call the same functions. Avoid a generic engine framework or monorepo during this event. For the full parity project, benchmark a browser and a native-engine prototype against the same demanding craft, docking and persistence fixtures before committing to an engine. Moving to a native engine does not eliminate coordinate precision work. [Godot large-world coordinates](https://docs.godotengine.org/en/stable/tutorials/physics/large_world_coordinates.html)

9. **Freeze the domain contract before several screens depend on it.** The types below show the required information, not complete production code. Replace loose strings with catalog-derived identifiers and validate imported data at the boundary.

```ts
type Mode = 'observe' | 'downlink' | 'charge' | 'safe';
type Vec3 = readonly [number, number, number];
type Command =
  | { sequence: number; atS: number; type: 'set-mode'; mode: Mode }
  | { sequence: number; atS: number; type: 'set-instrument'; id: string; on: boolean }
  | { sequence: number; atS: number; type: 'set-data-priority'; ids: string[] };

interface Design {
  schemaVersion: 1;
  partBySocket: Record<string, string>;
  launcherId: string;
  orbitId: string;
  objectiveIds: string[];
}
interface Packet {
  id: string;
  cellId: string;
  measurement: 'hydrogen-proxy' | 'context' | 'thermal';
  capturedAtS: number;
  bytesTotal: number;
  bytesRemaining: number;
  quality: number;
}
interface MissionState {
  schemaVersion: 1;
  modelVersion: string;
  simTimeS: number;
  design: Design;
  mode: Mode;
  slewEndsAtS: number | null;
  batteryWh: number;
  fuelKg: number;
  queued: Packet[];
  delivered: Packet[];
  appliedCommandSequence: number;
}
interface MissionEvent {
  id: string;
  atS: number;
  code: string;
  partIds: string[];
  causedBy: string[];
  quantities: Record<string, number>;
}
```

Define `validateDesign`, `deriveVehicle`, `environmentAt`, `applyCommand`, `advance`, `evaluateScience`, `runMission` and `compareRuns` before implementing their callers. The worker protocol carries a run ID, model version and monotonically increasing command sequence. Reset terminates or invalidates the old run so stale messages cannot resurrect its state. Pause and time-rate selection are runner controls; they must not alter the modeled physics. Store design, scenario version, command log and needed state for a reproducible save.

10. **Declare the fidelity boundary in the product itself.** Use a small valid set of circular lunar orbits. A lower-inclination option can demonstrate why polar coverage fails, while two polar altitudes can demonstrate different geometry. If time is short, keep one suitable orbit and one unsuitable comparison. The review must explain the latter; selecting it cannot secretly earn polar observations.

| System | First-day model | Capability it does not establish |
|---|---|---|
| Delivery | Provider capacity, allowed destination, budget and a cinematic summary | Hand-flown ascent, atmospheric flight or solved lunar transfer |
| Orbit | Analytic circular position and period in a consistent Moon-centered frame | Arbitrary maneuvers, n-body propagation or long-term orbit stability |
| Environment | Spherical occultation; declared fixed Earth/Sun directions during the short scenario | Accurate ephemerides, terrain shadows or ground-station scheduling |
| Power | Panel incidence, eclipse, mode loads and battery energy | Electrical circuits, cell chemistry or a detailed thermal model |
| Communication | Valid contact, antenna pointing, illustrative rates and finite queued bytes | An operational RF link budget or propagation-delay navigation |
| Science | Instrument compatibility, geometry, quality and unique received records | Real measurements or confirmed lunar ice deposits |
| Attitude | Finite slews and a simple body-fixed geometry | Reaction-wheel dynamics or flexible-body control |

Use meters, seconds, kilograms, radians, watts and bytes internally. Explicitly named Wh is acceptable for stored energy. Convert only at UI/content boundaries. One MiB is 1,048,576 bytes; a megabit per second is not a megabyte per second. Use different names for dry hardware, propellant and total carried mass so the propulsion package's wet mass is never counted twice.

For the spherical Moon model, set radius to **1,737,400 m** and gravitational parameter to **4.902800118 × 10¹² m³/s²**, with source URLs beside the constants. These come from JPL's physical and astrodynamic tables; the model's simplicity does not make them fictional. [JPL satellite parameters](https://ssd.jpl.nasa.gov/sats/phys_par/sep.html), [JPL astrodynamic parameters](https://ssd.jpl.nasa.gov/astro_par.html)

```text
r = bodyRadiusM + altitudeM
speedMps = sqrt(muM3PerS2 / r)
periodS = 2π × sqrt(r³ / muM3PerS2)

generationW = ratedW × max(0, dot(panelNormal, sunDirection)) × eclipseFactor
energyChangeWh = (generationW - actualLoadW) × dtS / 3600

producedBytes = actualProductionBytesPerS × dtS
sentBytes ≤ min(queuedBytes, availableLinkBytes, energyPermittedBytes)

deltaVMps = ispS × 9.80665 × ln(initialMassKg / finalMassKg)
```

The final equation is useful for a later explicit maneuver model; it does not solve atmospheric ascent or a transfer trajectory. Mass changes, staging and additional losses need their own treatment. [NASA ideal rocket equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/)

Keep all direction vectors in one declared frame. Test Moon occultation by whether the forward ray/segment toward the Sun or Earth intersects the sphere, including a documented tangent tolerance. Define target eligibility and instrument footprint explicitly; a texture on the sphere is not a coverage calculation. Label frozen orientation or rotation assumptions used during the short scenario. Source coordinate metadata should remain in the provenance record even when the game uses a simplified spherical frame.

11. **Prevent fast-forward and scoring from manufacturing success.** Advance to the earliest scheduled command, contact/eclipse transition, slew completion, battery threshold, buffer threshold or requested time. Apply that event and continue. A small fixed-step implementation is acceptable if threshold and equivalence tests pass, but raising speed should perform more simulated work rather than enlarge the step until important windows disappear. Protect against zero-duration event loops with explicit state transitions and an iteration guard.

If energy reaches its limit midway through a step, stop or reduce the affected load then; do not collect a full step's data using a negative battery. A full buffer pauses acquisition or applies a declared discard policy. Record the skipped opportunity or dropped bytes. Free storage only for bytes actually sent under the simplified acknowledgement rule. The accounting identity is generated bytes equals queued bytes plus sent bytes plus deliberately discarded bytes, with any framing convention documented. Here queued bytes means the sum of each packet's `bytesRemaining`; sent bytes includes acknowledged partial packets. Completed packets alone enter the received-science ledger, so partial transmission frees storage without prematurely awarding science or counting bytes twice.

Credit science on completed received records. Identify a measurement by cell, instrument type and validity criteria. Repeated observations can improve quality only under an explicit rule; they cannot multiply credit indefinitely. Show paired hydrogen/context coverage when the objective requires complementary evidence. A summary score can be a published weighted, capped function of valid unique evidence, but success conditions remain separate. Spending less without completing the objective must not be a winning strategy. Show actual cost and science per cost as secondary comparisons instead of hiding all outcomes in one score.

Replay requires the same model version, scenario, initial state and commands. If both hardware and operations changed, label both. If comparing only hardware, use a common policy that is valid for both designs and disclose where resource limitations prevented actions. Do not promise cross-browser bit-identical floating-point output without testing it; use documented tolerances and compare domain outcomes. Rendering quality, screen size and frame rate must never change science.

12. **Make NASA sources functional and traceable.** Use the four mission segments in the supplied design reference: launch service, spacecraft, ground reception and scientist/user requirements. Review the design from objective to measurement, instrument, orbit, resource budget and operations. This is inspired by NASA's design process; it is not a NASA approval or certification. [Design and Develop Science Missions](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf)

| Resource | Concrete implementation | Visible evidence |
|---|---|---|
| JPL physical constants | `src/content/bodies.ts` | Changing altitude changes the calculated orbital period and geometry. |
| [NASA polar mosaic metadata](https://pgda.gsfc.nasa.gov/products/81) | A sourced target-region extent of 87–90° south in `mission.ts` | A low-inclination orbit cannot satisfy the polar objective. This uses region metadata, not ingested elevation data. |
| LRO instrument descriptions | Instrument/measurement compatibility in `parts.ts` | Camera imagery supplies context; a hydrogen proxy supplies a different kind of evidence. |
| [Mission Design Lab](https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/) and supplied CML reference | Simplified design review and trade comparison | Requirements and margins precede operation; changed designs are compared against the same objective. |
| [NASA telescope game](https://science.nasa.gov/mission/webb/game-build-it-yourself/) | Objective-first payload selection | Scientific ambition determines an appropriate measurement system. |
| [CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/) | One locally bundled lightweight lunar texture | Actual lunar visual context with the exact requested credits. |
| [NASA Mission Viz](https://nasa.github.io/mission-viz/) | Spatial/timeline presentation reference | Ship, body, trajectory and events remain understandable together. |
| Supplied GMAT resource | Optional independent reference fixture after core completion | A documented validation comparison, if actually run; no runtime dependency. |
| Supplied CubeSat 101 resource | Subsystem and operations explanations | Clear interfaces and concept-to-operation thinking; fictional values stay labeled. |
| Supplied CSA activities and 2023 VR reference | Beginner wording and spatial explanation | Accessible concepts, without forcing every linked resource into the application. |

The Moon Kit offers a small 2K color texture suitable for the time budget. The cited south-pole terrain product's raw height raster is 3.3 GB; full raster ingestion is outside the first-day plan. Its region metadata can still inform a meaningful coverage constraint. Do not label a texture as an ice map or claim terrain analysis that was never performed. [CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), [LOLA south-pole product](https://pgda.gsfc.nasa.gov/products/81)

Each used source needs a manifest entry: title, URL, retrieval date, credit, usage note, local file/hash where applicable, source units, converted units, coordinate frame, transformations and actual in-game use. Distinguish **sourced facts**, **derived model predictions**, and **synthetic training data** in the interface and README. A compact “Why this model?” panel should explain those categories. Never imply NASA endorsement, mission certification or scientific accuracy beyond the implemented model.

13. **Spend visual effort where the player acts.** Use one original visual system across briefing, hangar, orbit and debrief. A dark space background, bright readable surfaces, one accent for normal activity and a distinct warning treatment is enough. Show spacecraft components as clean silhouettes made from reusable primitives; add a small set of materials, clear lighting and purposeful transitions. Use the credited Moon texture on a lightweight sphere. High-resolution terrain, volumetric clouds and large cinematic asset packs are poor first-day investments.

Make part attachment snap into place, slews visibly take time, the antenna line disappear during occultation, and returned map cells illuminate only when data is received. A subtle audio pulse can signal first data, an approaching window or a low-resource alert; sounds must be short, original or properly reusable, muted by a visible control, and independent of successful gameplay. Unlock browser audio through a user action. Reduced motion should remove camera sweeps without hiding state.

Proposed performance targets are 60 fps on the selected demonstration laptop, a 30 fps low-quality fallback, visible input response within 100 ms and first interaction within five seconds on the tested connection. These are targets to measure, not achieved results. Use one canvas, capped pixel ratio, reused geometry/materials, limited particles and snapshots for text at roughly 5–10 Hz. A comparison screen can use two images and charts rather than two live scenes.

Keyboard navigation, visible focus, readable contrast, labels on icon controls, pause, mute and non-color-only alerts belong in the core. Desktop is the first target; responsive legibility does not establish a complete mobile control scheme. A first-time player should act within 60 seconds and explain one consequence after a run. Measure this with actual people rather than claiming usability from a screenshot.

14. **Allocate exactly 24 hours and protect the last six.** These are wall-clock budgets, not promises about AI throughput. Recalculate against the actual submission cutoff before starting. If fewer than 24 hours remain, cut scope immediately while preserving testing and submission time. Short breaks fit inside blocks; one human still needs to integrate, play and make decisions.

| Elapsed time | Budget | Work | Exit gate |
|---|---:|---|---|
| 0–1 h | 1 h | Inspect repo/instructions and event eligibility, scaffold minimal stack, lock mission/contracts, verify build | A clean app runs and builds; concept provenance and submission cutoff are recorded; optional dependencies are removed if troublesome. |
| 1–4 h | 3 h | Catalog, validation, environment, resource/science core and headless fixtures | **G1:** one complete simulated mission produces a report; conservation checks pass. |
| 4–8 h | 4 h | Plain complete UI flow, primitive ship/Moon, commands, reset/save and worker adapter | **G2:** a human can finish a mission in the browser. |
| 8–11 h | 3 h | Tactile socket builder, visible pointing, contacts/eclipses, camera presets and alerts | **G3:** three operational choices visibly alter real state. |
| 11–14 h | 3 h | Causal debrief, received-science map, actual comparison replay and balance | **G4:** two viable strategies and a genuine design-dependent bottleneck are demonstrated. |
| 14–16 h | 2 h | Visual/audio/tutorial polish and precise NASA provenance | The first minute is understandable; assets and claims are traceable. |
| 16–18 h | 2 h | Production hosting, fresh-session run, e2e test and quality fallback | **G5:** stable complete production loop. **Feature freeze at hour 18.** |
| 18–20 h | 2 h | Two or three fresh-player sessions; fix blocking defects/confusion | New players finish and can explain a consequence. |
| 20–22 h | 2 h | Required short recording/slides, supplementary live pitch, README and submission text | Tested links, truthful scope, credits and backup are ready. |
| 22–24 h | 2 h | Upload, external access check and failure reserve | Submission completes before the actual cutoff. |

Total: **24 hours**. The task packets below are the work within these blocks, not extra time added to them. Check deployment early enough to discover host constraints, but do not replace the first complete local loop with infrastructure work. A clean build at hour 1 and a production URL before the feature freeze are separate gates.

15. **Give Sol bounded task packets with observable completion.** One primary implementer owns shared interfaces and integration. A packet should produce a small coherent commit; a PR is useful when review logistics justify it, not a reason to spend the day managing branches. Independent dependencies do not remove the solo developer's integration time.

| ID | Dependencies and time block | New artifacts | Acceptance criterion |
|---|---|---|---|
| T00 | Start; 0–1 h | Package setup, app entry, README scripts | Clean install, dev server and production build work. |
| T01 | T00; 0–1 h | Mission spec, assumptions, types | Units, success conditions, commands and event contract agree. |
| T02 | T01; 1–4 h | Catalog, design derivation/validation | A/B totals match independent arithmetic; invalid design explains the violated constraint. |
| T03 | T01; 1–4 h | Orbit/environment | Known near/far-side and lit/dark cases behave correctly; period uses the configured constants. |
| T04 | T02/T03; 1–4 h | Operations and runner | Resources remain bounded; threshold transitions terminate; mode/pointing gates apply. |
| T05 | T04; 1–4 h | Science and causal events | Only valid received unique evidence scores; every report claim can identify its event data. |
| T06 | T05; 1–4 h | Headless fixtures/tests | A full mission reaches a report and G1 passes. |
| T07 | T02/T05; 4–8 h | Plain screen flow and panels | Briefing through replay is traversable without fabricated metrics. |
| T08 | T07; 4–8 h | Worker protocol and save/reset | Commands apply once; stale runs cannot mutate a reset; valid saves round-trip. |
| T09 | T07; 4–11 h | Hangar scene and sockets | A part choice changes both visible craft and computed metrics; keyboard alternative works. |
| T10 | T03/T08; 4–11 h | Orbit scene and controls | Pointing, contact, power and data agree with the same state; G2 and G3 pass. |
| T11 | T05/T10; 11–14 h | Debrief and compare | Saved actual runs compare; changed inputs and unsimulated suggestions are labeled. |
| T12 | T11; 11–14 h | Balance fixtures/policies | At least two strategies succeed; the data bottleneck follows modeled rates, not a part-name trigger. |
| T13 | T09/T10/T12; 14–16 h | Local assets, sound, tutorial and manifest | Effects clarify state; mute/motion controls work; generated media is marked where used; no required external data request. |
| T14 | T11/T13; 16–18 h | Production build, e2e and fallback | Fresh visitor finishes; no blocking errors; actual public route/assets work. |
| T15 | T14; 18–20 h | Observed playtest notes and fixes | Record real confusion and whether each player explains a consequence. |
| T16 | T15; 20–24 h | Recording, documentation and submission bundle | Required format, public access, backups, sources and implementation claims are checked. |

The critical path is contracts → data/environment → simulation → full UI loop → operational feedback → causal comparison → verification → submission. Build a primitive version of every required phase before polishing one screen. If G1 is late, remove orbit variation and optional instruments. If G2 is late, stop visual embellishment until the mission completes. If G4 is late, use clear causal sentences and actual result cards rather than an elaborate graph.

16. **Use a cut order that preserves the central experience.** Remove expensive effects first, then drag-and-drop in favor of click-to-attach, then additional orbit/provider/instrument options. Keep at least one power trade and one communications trade. Replace animated side-by-side replay with two saved results and a rerun button. Keep the actual spacecraft, consequential commands, resource simulation, scientific objective, debrief and restart. A smaller complete game remains reviewable; an unfinished collection of screens does not.

After G4, and only with G5 still safely achievable, choose at most one stretch: a guided insertion burn using an explicit propellant model, a second scenario using the same mechanics, or a simple deterministic operating rule. Do not start a general six-degree-of-freedom solver to implement the first option. Manual ascent, terrain landing, docking, crew, rovers, robotics, online multiplayer, accounts, research trees, procedural planets and runtime AI narration belong to subsequent releases. Four people discussing roles around one screen is not networked multiplayer and must not be advertised as such.

17. **Test the behaviors that can invalidate the demonstration.** Tests should establish useful properties, not mirror internal implementation line for line. The following checks are proposed, not already passed:

| Check | Required observation |
|---|---|
| Mass and budget fixtures | Both 78 kg examples and their $39M/$38M totals are reproduced without double-counting propellant. |
| Energy units | A constant 10 W deficit for 3,600 seconds removes 10 Wh. |
| Energy boundary | Depletion within a step stops unsupported loads then; no negative energy or unpowered science. |
| Buffer accounting | A 1 MiB/s input cannot exceed a 128 MiB capacity without a recorded pause/discard. |
| Contact and attitude | Wrong pointing or occultation yields zero received bytes. |
| Transmission bounds | Sent data never exceeds queue, window capacity or available power. |
| Data conservation | Generated equals queued, sent and declared discarded data under the documented framing rule. |
| Science duplication | Repeated transmit/observe commands cannot duplicate received credit. |
| Geometry | Circular orbit period, target coverage and sphere-intersection cases match independent fixtures. |
| Warp/replay | Pause, acceleration and headless replay preserve domain outcomes within stated tolerances. |
| State isolation | Changing graphics quality or rendering rate does not change mission results. |
| Persistence/reset | Save/reload preserves state and commands; invalid versions fail clearly; reset rejects old messages. |
| End-to-end | A fresh session configures, reviews, launches, operates, completes, redesigns and repeats. |
| Production delivery | Assets load at the actual deployed base path; missing optional asset has a usable fallback. |

Test the public production build, not only the development server. Run it with sound disabled and with the low-quality graphics setting. Use a second browser or signed-out session for link access when available. Record any remaining limitation in the README. A passing build establishes compilation, not a complete mission, and a compelling screenshot establishes presentation, not resource correctness.

For two or three quick user sessions, ask the player to predict the limiting subsystem, complete a run, name the decision responsible for an outcome, and change one choice. Observe where they hesitate. Report the sample size and anecdotal nature honestly. Do not claim measured educational effectiveness from three informal tests. The useful immediate result is a clearer game and an authentic example of a student understanding an interacting constraint.

18. **Prepare the submission around a real comparison and the current listed fields.** The official project submission and judging guides, updated November 13, 2026, were retrieved after the initial research. They confirm a demo of **no more than 30 seconds of video OR seven slides, including the title/introduction**. Exceeding that limit removes Global Judging eligibility. Use a 29-second required recording to leave a margin; keep any 120-second live pitch supplementary. This is a current official requirement, not an inference from 2025 winners or community replies. [Current Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/)

| Listed submission field | Prepare for One Last Signal |
|---|---|
| Project Name | One clear original title, used consistently in the game and submission. |
| High-Level Project Summary | Problem, audience, playable solution and demonstrated learning benefit; describe actual implemented behavior. |
| Link to Project Demo | Publicly viewable compliant short video or slide deck. |
| Link to Final Project | The working game URL; make the repository, README and runnable build easy to reach from it. |
| Detailed Project Description | Mission flow, engineering model, actual features, NASA inputs, test evidence, limitations and future work distinguished. |
| Use of Super Intelligence (SI) | Disclose the tools/models actually used and their contributions; distinguish development assistance from any runtime functionality. |
| NASA Data | Specific sources, transformations and actual in-game uses, with credits and links. |
| Space Agency Partner Data and Other References | Any partner or other resources actually used; do not invent integrations to fill the field. |

These are the guide's listed fields; its public text does not individually mark required versus optional fields or give text-length caps. Follow the live form's required markers and validation. Links must open without login, registration or permission requests. Video and document links need external hosting; the guide allows a website, repository or cloud location for the final project. A playable website plus repository is this plan's practical recommendation. [Official project submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/)

The project page and linked materials must be in English. A demonstration in another spoken language needs English subtitles. Make the required short demo comprehensible on its own; a longer linked presentation does not relax its limit. The current judging guide scores Impact, Creativity, Validity, Relevance and Presentation from 1–5 each; it specifies no percentage weights. At least one NASA resource is necessary for Global Awards. Partner resources are optional, while references for third-party material actually used remain necessary. [Current judging guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/), [current participant FAQ](https://www.spaceappschallenge.org/resources/participant-faqs/)

| Judging criterion | Evidence this game should supply |
|---|---|
| Impact | A clear student need and honestly recorded learner observations. |
| Creativity | The original interaction and explanatory redesign experience; a clone claim alone is not evidence of innovation. |
| Validity | Traceable NASA inputs, scientifically appropriate instruments, tested resource constraints and stated approximations. |
| Relevance | The complete objective-to-operation-to-evaluation lifecycle specified by the challenge. |
| Presentation | A usable game, concise actual demonstration and a complete readable written entry. |

| Short recording | Show actual software |
|---|---|
| 0–4 s | Scientist request, moving spacecraft and mission objective |
| 4–10 s | A part swap with computed resource changes |
| 10–16 s | An actual buffer/contact/power consequence during operation |
| 16–23 s | An actual revised run and its returned-science comparison |
| 23–29 s | Play link and a concise statement of NASA sources and modeled scope |

The optional live pitch can spend 12 seconds on the problem, 18 on design, 25 on consequences, 20 on explanation, 25 on the redesign, and 20 on provenance, observations and invitation to play. That totals 120 seconds. Keep detailed credits readable on the project page rather than flashing an unreadable bibliography. If using seven slides instead, cover problem, playable loop, engineering model, NASA inputs, observed comparison, actual testing/limitations, and play link.

The submission bundle contains the public play URL, repository, run instructions, actual implemented feature list, assumptions, source credits, SI disclosure, two reproducible design fixtures, the exact production build and a backup recording. Those supporting artifacts should make the listed fields convincing; they are not all separate required form uploads. Clearly separate planned features from delivered ones. Disclose the actual planning/coding/debugging contributions. Generated images or video need visible SI watermarks; generated code, audio and data need acknowledgement in descriptive text and metadata. SI-generated material must not use or modify NASA branding. Apply these rules to the assets actually shipped and clarify ambiguous cases rather than inventing an exemption. [Current submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/)

Use **Submit for Judging**, not only Save Progress. Confirm the required terms and original-work checkboxes, then verify the success banner. The guide permits editing and resubmitting before the deadline and says the last saved submission is reviewed. The deadline is **November 15, 2026 at 11:59 PM in the event's time zone**; for Universal Event teams, use the team owner's residence time zone. Local presentation requirements can impose an earlier practical cutoff. Build in enough reserve to verify the final submitted page and every public link. [Official project submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/)

Team eligibility depends on the selected event: Local Event teams can contain **1–6 people**; Universal teams need **2–6 for Global Judging**. Everyone must be registered, accepted at the same event and listed on the team before closing. One developer can have a noncoding teammate. The user's selected event is not established, so check it rather than assuming solo development is ineligible. [Current judging guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/), [participant FAQ](https://www.spaceappschallenge.org/resources/participant-faqs/)

Choose and document the project's intended license. The event terms require original solution content to be freely available without restriction or OSI open source, and state an Apache 2.0 distribution default when no license is selected. That is the event's stated rule, not a general claim that any unlicensed GitHub repository is Apache-licensed. Retain third-party source/license documentation, including free assets. Submission material must not contain recognizable names, voices or likenesses of under-18s; featured adults need the required rights/consent. Record game footage rather than identifiable student playtest footage. [Current event terms](https://www.spaceappschallenge.org/legal/)

19. **Use Sol for delivery and Astra for bounded hard questions.** Local model metadata confirms `gpt-6.1-sol` and `gpt-6-astra`, both with an `ultra` option. OpenAI positions Sol for repeated complex work at lower cost and Astra for its hardest workflows. The official guide describes Ultra as a reasoning/execution mode that can delegate work; it is not a separate game engine or proof of better end-to-end productivity for this project. No model bake-off or project-specific timing measurement was performed here. [Sol announcement](https://openai.com/index/introducing-gpt-6-1-sol/), [official model guidance](https://learn.chatgpt.com/docs/models)

| Work | Initial model choice | What would justify escalation |
|---|---|---|
| Scaffolding, ordinary UI and content | Sol default/Medium | Repeated concrete failures after a clear specification |
| Resource simulation and numerical tests | Sol High/Extra High | Unresolved conservation, frame or threshold defects |
| Architecture or scientific review | Astra High/Extra High on a frozen scope | Ultra when distinct review areas can be separated usefully |
| Visual refinement and browser checks | Sol with screenshots and observations | A cross-system defect the implementer cannot resolve |
| Final fixes | The existing implementer | Only reproducible blockers; no architectural restart |

If uncertain, allow at most a small comparison on the same battery/downlink task and fixtures. Judge accepted behavior, integration time, interventions and actual client consumption. Do not spend an hour debating model names. Official model-selection guidance supports comparing models on the task; it does not establish a guaranteed winner here. [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection)

One agent should own the shared contract and final integration. If you deliberately choose a delegated workflow, divide stable, disjoint modules and inspect the combined result. Multiple agents editing the same schemas or application root can erase any speed benefit. Runtime LLM narration is unnecessary for this game: deterministic explanations derived from actual events are faster to validate and do not require a live service.

Use this implementation packet template for each T-number:

```text
Implement Txx in ArinPace/HackathonNASA.
Read the mission spec, simulation assumptions and existing types first.
Observable objective: [one behavior].
Files and interfaces: [bounded paths and existing contract].
Acceptance: [3–6 external observations or mathematical invariants].
Preserve one authoritative simulation and explicit units.
Do not add unrelated systems, dependencies or fabricated demo outcomes.
Run affected tests, typecheck, and the production build when integration changes.
Report changed files, actual checks, remaining limitations and next dependency.
If a contract is wrong, make the smallest justified correction consistently.
```

Ask Astra to review a frozen milestone with this bounded prompt:

```text
Find defects that could invalidate this mission demonstration. Prioritize units,
reference frames, resource creation, skipped time-warp events, duplicated science,
stale worker state, unreachable completion and misleading comparison claims.
Give a minimal reproduction and small fix for each confirmed blocker.
Separate confirmed defects from hypotheses. Do not add gameplay or redesign
the architecture. Review against the supplied acceptance fixtures and scope.
```

20. **Preserve KSP through an auditable feature ledger.** Pin the researched PC reference to KSP 1.12.5 and record the exact installed manifest during the real audit. The publisher announcement archive establishes that version; the audit must still enumerate its actual content and behavior. Track Making History and Breaking Ground separately from stock. The official wiki/manual access limitations mean the list below is a **proposed comprehensive audit structure**, not a certified exhaustive inventory. [KSP announcement archive](https://store.steampowered.com/oldnews/?appgroupname=Kerbal+Space+Program&appids=220200&feed=steam_community_announcements)

Use one atomic row per capability, part variant, scenario or workflow in `docs/feature-parity.csv`. Fields should include ID, baseline/build, stock/DLC/mod classification, observed reference evidence, content count, expected behavior, acceptance scenario, dependencies, implementation status, test result, demonstration link and remaining gap. Statuses are `UNVERIFIED`, `SPECIFIED`, `IMPLEMENTED`, `TESTED`, `ACCEPTED`. A visible button does not establish acceptance. The following thirty-five families organize that work; their examples are original proposed acceptance tests, with fine details to verify in the reference build.

| ID | Capability family to enumerate | Example parity acceptance test | 24-hour relationship |
|---|---|---|---|
| K01 | Sandbox, Science and Career; starting conditions and difficulty | Same craft is unrestricted in sandbox and correctly gated by progression | One scenario only |
| K02 | Every part, variant, module, property, resource and attachment rule | Generated catalog fixtures instantiate and exercise each verified module | Fourteen component entries |
| K03 | Root, node/surface attachment, reparent, delete and graph validity | Delete/undo a parent without corrupting child topology | Fixed sockets |
| K04 | Translation, rotation, snapping, symmetry, duplication and editor camera | Mirrored/radial copies orient correctly and retain independent resources | Camera and swap controls |
| K05 | Undo/redo, craft files, descriptions, organization and subassemblies | Nontrivial craft save/load returns the same canonical design | Basic local save |
| K06 | Staging, action groups, activation state and in-flight editing | Separation changes mass/vessel membership exactly once | Contracted delivery; no arbitrary staging |
| K07 | Mass/balance, thrust/lift indicators, TWR, delta-v and burn readouts | Independent calculation agrees with stated environmental assumptions | Relevant design totals only |
| K08 | Throttle, attitude, angular dynamics, gimbal and control authority | Unbalanced craft and exhausted fuel produce correct consequences | Pointing modes only |
| K09 | Propellant mixtures, crossfeed, priorities, isolation, RCS and electric propulsion | Resource transfer/staging preserves accounting and supply constraints | No complete resource graph |
| K10 | Structures, joints, loads, collision, breakage and debris | Controlled separation preserves momentum within declared tolerance | Rigid spacecraft presentation |
| K11 | Atmospheres, lift/drag, shielding, control surfaces and flight envelope | Exposed and shielded payload fixtures experience different modeled loads | Deferred |
| K12 | Thermal exchange, heating, cooling, ablation and reentry | Shielded/unshielded reentry fixtures diverge for causal reasons | Deferred |
| K13 | Entire body/environment content: gravity, rotation, atmosphere, terrain, biomes, oceans | Every supported body permits the promised orbit/surface/persistence activities | Spherical lunar mission |
| K14 | State-vector propagation, bound/unbound paths and influence transitions | Reference trajectory passes the correct transitions without teleporting | Preset circular orbit |
| K15 | Orbit map, maneuver nodes, encounters, relative geometry and estimates | Planned maneuver agrees with resulting trajectory within tolerance | Preset selection and visualization |
| K16 | Pause, physical/coasting warp, limits, alarms and warp-to-event | Equivalent time advances preserve mission/resources across all supported contexts | Bounded event-aware acceleration |
| K17 | Flight instruments, reference modes, cameras, menus and shortcuts | Every displayed velocity identifies its frame; controls survive pause/reload | Minimal operations interface |
| K18 | Probes, antennas, relay networks, occultation, transmission and control consequences | Link disappears for the correct reason and stored data survives until restored | One direct link |
| K19 | Power generation/storage/consumption and deployment states | Eclipse and deployment affect only the modeled systems; state persists | Solar, battery and operating loads |
| K20 | Crew roster, seats, roles, experience, transfer, EVA and recovery/loss | Crew and equipment transfer without duplication or missing mass | Uncrewed mission |
| K21 | EVA inventory, construction, repair, range/mass constraints and assistance | Replacement part consumes the right inventory and restores the subsystem | Deferred |
| K22 | Rendezvous, port orientation, capture, docking, undocking and transfer | Two craft join/split while retaining correct mass, identities and resources | Deferred |
| K23 | Aircraft, air-breathing engines, wings, gear, wheels, suspension and surface operation | Runway and rover fixtures stay controllable and persist correctly | Deferred |
| K24 | Experiments, contexts, data, transmission/return, repeats and labs | Science credit follows the verified completion rule and is not duplicated | Original limited science loop |
| K25 | Resource sensing, deposits, drills, converters, storage and dependencies | Production stops at exhausted inputs or full storage and conserves resources | Deferred |
| K26 | Funds, reputation, science, contracts, deadlines, rewards and recovery | Contract success/failure occurs once and survives reload | Fixed mission budget |
| K27 | Technology, facility upgrades, strategies and personnel workflows | Prerequisites cannot be bypassed; changes affect specified systems only | Deferred |
| K28 | Multiple vessels, debris, switching, background operation and tracking | Landed/orbiting craft reload consistently at common universal time | One active craft |
| K29 | Discoveries, anomalies, asteroids/comets and special content | Discovery and interaction state persists with valid world behavior | Original target cells only |
| K30 | Every tutorial, scenario, reference/help flow and retry | Reference lessons map to implemented capabilities; a novice completes their equivalent | Short original onboarding |
| K31 | Inputs, graphics, audio, UI scale, difficulty and localization settings | Verified preferences persist and controls remain operable | Core accessibility settings |
| K32 | Craft sharing, imports, extension surfaces and platform-service equivalents | Supported content imports; incompatible schemas fail clearly | Optional JSON export |
| D01 | Making History authoring, conditions, branches, scenarios, parts and suits | Create, export/import and complete both branches of a mission | Deferred expansion tier |
| D02 | Breaking Ground deployed experiments and surface-object science | Leave experiments, advance time, return and recover consistent results | Deferred expansion tier |
| D03 | Breaking Ground robotics, motors, limits, sequences, blades and persistence | Powered mechanism executes and reloads its sequence consistently | Deferred expansion tier |

The boundary matters. Publisher releases establish base-game additions such as thermal/aerodynamic systems, relay communication and later EVA construction; they should not accidentally be classified as DLC merely because they are advanced. [KSP 1.0 release](https://forum.kerbalspaceprogram.com/developerarticles.html/ksp-10-is-released-r162/), [KSP 1.2 announcement](https://store.steampowered.com/news/posts/?appids=220200&enddate=1481132240&feed=steam_community_announcements), [later official development archive](https://store.steampowered.com/news/posts/?appgroupname=Kerbal+Space+Program&appids=220200&enddate=1624554193&feed=steam_community_announcements)

Making History and Breaking Ground are distinct expansion scopes. Confirm their installed versions and exact contents separately. Named mods are a further optional list, not an unbounded promise to reproduce an entire ecosystem. Save/plugin binary compatibility must have its own specification if desired. [Making History](https://store.steampowered.com/app/283740/Kerbal_Space_Program_Making_History_Expansion/), [Breaking Ground](https://store.steampowered.com/app/982970/Kerbal_Space_Program_Breaking_Ground_Expansion/)

21. **Gate the full product by demonstrated capability.** For strict clone-first development, the order below preserves your requested sequence. Calendar estimates come after prototypes establish actual throughput and the content census establishes workload.

| Gate | Capability demonstration | Required evidence before proceeding |
|---|---|---|
| P0 — reference contract | Versioned installation audit, content census and behavioral examples | No hidden ambiguity about base/DLC/mod scope; unverified items explicitly listed |
| P1 — engine decision | Same substantial part assembly, orbit and persistence workload in candidate technologies | Measured performance, numerical behavior, tooling and deployment trade-offs |
| P2 — construction/flight foundation | Editable part graph, mass/inertia, thrust, fuel, staging and orbital prediction | Conservation/reference fixtures, playable craft and reliable save/load |
| P3 — environment/navigation | Atmospheres, aerodynamic/thermal effects, terrain/contact, maneuvers and body transitions | Reentry, landing and transfer scenarios with declared tolerances |
| P4 — persistent exploration | Multiple vessels, docking, resources, crew/EVA, surface science and vehicles | Background time consistency, joins/splits and recovery fixtures |
| P5 — full game structure | Career, contracts, technology, facilities, content, tutorials and settings | Complete mode playthroughs and catalog/workflow audit |
| P6 — parity acceptance | Every required stock ledger item; expansions if included in contract | All required rows accepted, regression evidence, performance and persistence gates |
| P7 — expansion beyond parity | Mars Horizon-style agency depth; Juno-style parametrization/automation; original mission review/debrief | Each addition demonstrates a specific improvement without breaking prior capabilities |

For numerical flight, use a fixed-step active solver and safe coasting propagation with explicit transitions around burns, atmosphere, collision and proximity. Keep astronomical coordinates separate from camera-relative rendering and local craft physics. Docking changes graph identity; staging changes retained mass and inertia; background resource simulation must share universal time. These are systems to validate independently, not features that appear automatically when a physics library is installed.

After parity, the agency layer should connect objective selection, readiness testing, procurement, schedule risk, launch availability, ground-station allocation and concurrent missions. The parametric layer should connect geometry and engine settings to actual mass, drag, thrust, heat and reliability assumptions. Automation needs typed commands, resource limits, execution budgets, debugging and deterministic logs. Classroom/co-op features should define authority, shared mission state, role responsibilities and conflict resolution before adding networking. The target is a better integrated experience; more sliders or screens alone do not establish superiority.

22. **Start with a playable contract, and finish with measured evidence.** The first coding action is to re-inspect the repository, read the separate kickoff prompt, create the minimal project and freeze the mission/types. The first serious milestone is a headless mission with correct resource accounting. The first human milestone is the complete browser loop. The first presentation milestone is a reproducible comparison between actual runs. Each later decision should protect those outcomes.

The 24-hour version is done only when a new visitor can understand the objective, change the visible spacecraft, receive correct feasibility feedback, launch through the labeled service, make consequential operating decisions, see valid science arrive, understand an actual limitation and repeat with a modified design. It also needs a working production build, credited sources, honest assumptions, tested links and the required submission artifact. None of those outcomes has been implemented by this planning work. The next step is execution against these gates, with full KSP parity remaining visible and unclaimed until its separate evidence exists.
