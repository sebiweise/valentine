// Self-made SVG illustrations (same license as this repository). They replace
// the GIFs that were hotlinked from third-party hosts, so no visitor data is
// sent to other servers and the CSP can stay at img-src 'self'.
import styles from "./illustrations.module.css";

const FUR = "#b07d48";
const FUR_DARK = "#8f6236";
const SNOUT = "#f1d2a9";
const INK = "#3b2314";
const HEART = "#e11d48";

// Heart centered on (0, 0), roughly 2 x 1.6 units, scaled via transform
const HEART_PATH =
  "M0 0.75 C-1.1 0.05 -0.95 -0.85 0 -0.35 C0.95 -0.85 1.1 0.05 0 0.75 Z";

interface HeartProps {
  x: number;
  y: number;
  size: number;
  className?: string;
}

function Heart({ x, y, size, className }: Readonly<HeartProps>) {
  // The transform attribute positions the heart, the CSS class animates the
  // inner path (a CSS transform would otherwise replace the attribute)
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path d={HEART_PATH} fill={HEART} className={className} />
    </g>
  );
}

interface BearProps {
  eyesClosed?: boolean;
  holdsHeart?: boolean;
}

// A bear drawn in a 200 x 200 box, centered on x = 100
function Bear({ eyesClosed = false, holdsHeart = false }: Readonly<BearProps>) {
  return (
    <g>
      {/* Ears */}
      <circle cx="62" cy="50" r="18" fill={FUR_DARK} />
      <circle cx="138" cy="50" r="18" fill={FUR_DARK} />
      <circle cx="62" cy="50" r="9" fill={SNOUT} />
      <circle cx="138" cy="50" r="9" fill={SNOUT} />
      {/* Body and belly */}
      <ellipse cx="100" cy="160" rx="42" ry="36" fill={FUR} />
      <ellipse cx="100" cy="166" rx="26" ry="22" fill={SNOUT} />
      {/* Head */}
      <circle cx="100" cy="85" r="45" fill={FUR} />
      <ellipse cx="100" cy="102" rx="20" ry="15" fill={SNOUT} />
      <ellipse cx="100" cy="95" rx="7" ry="5" fill={INK} />
      <path
        d="M100 100 q-6 8 -12 2 M100 100 q6 8 12 2"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Eyes */}
      {eyesClosed ? (
        <path
          d="M78 80 q6 6 12 0 M110 80 q6 6 12 0"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <>
          <circle cx="84" cy="78" r="5" fill={INK} />
          <circle cx="116" cy="78" r="5" fill={INK} />
          <circle cx="85.5" cy="76.5" r="1.5" fill="#fff" />
          <circle cx="117.5" cy="76.5" r="1.5" fill="#fff" />
        </>
      )}
      {/* Cheeks */}
      <circle cx="72" cy="98" r="6" fill="#f4a6a6" opacity="0.8" />
      <circle cx="128" cy="98" r="6" fill="#f4a6a6" opacity="0.8" />
      {holdsHeart && (
        <Heart x={100} y={152} size={26} className={styles.heartbeat} />
      )}
      {/* Paws */}
      <circle cx="74" cy="150" r="11" fill={FUR_DARK} />
      <circle cx="126" cy="150" r="11" fill={FUR_DARK} />
    </g>
  );
}

/** Shown with the question: a bear holding a beating heart */
export function BearWithHeart() {
  return (
    <svg
      viewBox="0 0 200 200"
      className={styles.illustration}
      role="img"
      aria-label="Cute bear holding a heart"
    >
      <g className={styles.sway}>
        <Bear holdsHeart />
      </g>
    </svg>
  );
}

/** Shown after "Yes": two bears kissing, with hearts floating up */
export function BearsKissing() {
  return (
    <svg
      viewBox="0 0 300 200"
      className={styles.illustration}
      role="img"
      aria-label="Two bears kissing"
    >
      {/* Both bears lean in until their heads touch in the middle */}
      <g transform="translate(-22 0) rotate(18 100 190)">
        <Bear eyesClosed />
      </g>
      {/* Mirrored copy on the right */}
      <g transform="translate(300 0) scale(-1 1) translate(-22 0) rotate(18 100 190)">
        <Bear eyesClosed />
      </g>
      <Heart x={150} y={62} size={12} className={styles.float} />
      <Heart x={134} y={48} size={8} className={`${styles.float} ${styles.delay1}`} />
      <Heart x={166} y={44} size={9} className={`${styles.float} ${styles.delay2}`} />
    </svg>
  );
}
