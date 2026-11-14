import { env, period, type Design, type State } from "./sim/mission";
export function nextWindow(d: Design, t: number, kind: "target" | "contact") {
  for (let dt = 10; dt <= period(d); dt += 10)
    if (env(d, t + dt)[kind]) return dt;
  return null;
}
export function FlightMap({ design, state }: { design: Design; state: State }) {
  const e = env(design, state.t),
    a = e.angle,
    x = 150 + 105 * Math.cos(a),
    y = 123 - 105 * Math.sin(a);
  return (
    <div className="flight-map">
      <div className="map-caption">
        <span>LIVE ORBIT / MOON-CENTERED</span>
        <span>{e.eclipse ? "◐ ECLIPSE" : "☀ SUNLIT"}</span>
      </div>
      <svg
        viewBox="0 0 390 248"
        role="img"
        aria-label={`Live orbital map. ${e.contact ? "Earth contact available" : "Earth blocked by Moon"}. ${e.target ? "Survey region in range" : "Outside survey region"}.`}
      >
        <defs>
          <radialGradient id="mapmoon">
            <stop stopColor="#596768" />
            <stop offset="1" stopColor="#202d33" />
          </radialGradient>
        </defs>
        <circle
          cx="150"
          cy="123"
          r="105"
          fill="none"
          stroke="#40545b"
          strokeDasharray="3 5"
        />
        <circle cx="150" cy="123" r="74" fill="url(#mapmoon)" />
        <path
          d="M 109 220 A 105 105 0 0 0 191 220"
          stroke="#c4f38c"
          strokeWidth="9"
          fill="none"
          opacity=".7"
        />
        <text
          x="150"
          y="118"
          textAnchor="middle"
          fill="#b7c8c6"
          fontSize="10"
          letterSpacing="2"
        >
          MOON
        </text>
        <text x="150" y="135" textAnchor="middle" fill="#6d8587" fontSize="8">
          SOUTH-POLAR SURVEY
        </text>
        <circle cx="348" cy="123" r="15" fill="#326980" />
        <text x="348" y="151" textAnchor="middle" fill="#8cb4c6" fontSize="9">
          EARTH
        </text>
        {e.contact && (
          <line
            x1={x}
            y1={y}
            x2="333"
            y2="123"
            stroke={state.mode === "downlink" ? "#c4f38c" : "#3c6875"}
            strokeWidth={state.mode === "downlink" ? 2 : 1}
            strokeDasharray="5 5"
            className={state.mode === "downlink" ? "link-flow" : ""}
          />
        )}
        <circle cx={x} cy={y} r="10" fill="#c4f38c" opacity=".13" />
        <circle cx={x} cy={y} r="4" fill="#c4f38c" />
        <text x="18" y="22" fill="#798f90" fontSize="8">
          SCHEMATIC · NOT TO SCALE
        </text>
      </svg>
      <div className="map-legend">
        <span>
          <i /> Survey window
        </span>
        <span>
          {e.target
            ? "Collect now"
            : `Next survey: ${Math.ceil((nextWindow(design, state.t, "target") || 0) / 60)} sim min`}
        </span>
      </div>
    </div>
  );
}
