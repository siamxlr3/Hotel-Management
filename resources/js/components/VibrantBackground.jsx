export default function VibrantBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="g1" cx="20%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#C8F0C0" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#C8F0C0" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="g2" cx="80%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#B2E6A8" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#B2E6A8" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="g3" cx="60%" cy="10%" r="40%">
            <stop offset="0%" stopColor="#E8F5B0" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#E8F5B0" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="g4" cx="10%" cy="80%" r="35%">
            <stop offset="0%" stopColor="#D4F5C4" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#D4F5C4" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Blob shapes */}
        <ellipse cx="200" cy="180" rx="380" ry="300" fill="url(#g1)"/>
        <ellipse cx="1200" cy="700" rx="420" ry="320" fill="url(#g2)"/>
        <ellipse cx="860" cy="80" rx="340" ry="220" fill="url(#g3)"/>
        <ellipse cx="100" cy="750" rx="280" ry="200" fill="url(#g4)"/>

        {/* Decorative rings (top-right) */}
        <circle cx="1380" cy="60" r="120" fill="none" stroke="#A8D5A2" strokeWidth="1.2" strokeOpacity="0.25"/>
        <circle cx="1380" cy="60" r="80" fill="none" stroke="#A8D5A2" strokeWidth="0.8" strokeOpacity="0.2"/>
        <circle cx="1380" cy="60" r="40" fill="none" stroke="#A8D5A2" strokeWidth="0.6" strokeOpacity="0.15"/>

        {/* Decorative rings (bottom-left) */}
        <circle cx="60" cy="860" r="100" fill="none" stroke="#B8E0A0" strokeWidth="1" strokeOpacity="0.2"/>
        <circle cx="60" cy="860" r="60" fill="none" stroke="#B8E0A0" strokeWidth="0.7" strokeOpacity="0.15"/>

        {/* Scattered dots grid */}
        {[...Array(8)].map((_, row) =>
          [...Array(12)].map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={100 + col * 115}
              cy={80 + row * 110}
              r="1.5"
              fill="#A8D5A2"
              fillOpacity="0.18"
            />
          ))
        )}

        {/* Diagonal accent lines */}
        <line x1="0" y1="900" x2="400" y2="0" stroke="#A8D5A2" strokeWidth="0.5" strokeOpacity="0.12"/>
        <line x1="200" y1="900" x2="600" y2="0" stroke="#A8D5A2" strokeWidth="0.5" strokeOpacity="0.08"/>
        <line x1="1040" y1="900" x2="1440" y2="200" stroke="#A8D5A2" strokeWidth="0.5" strokeOpacity="0.1"/>
      </svg>
    </div>
  );
}
