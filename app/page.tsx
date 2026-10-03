"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

const phrases = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again!",
  "Last chance!",
  "Surely not?",
  "You might regret this!",
  "Give it another thought!",
  "Are you absolutely certain?",
  "This could be a mistake!",
  "Have a heart!",
  "Don't be so cold!",
  "Change of heart?",
  "Wouldn't you reconsider?",
  "Is that your final answer?",
  "You're breaking my heart ;(",
];

const MAX_NAME_LENGTH = 50;
const BASE_YES_FONT_SIZE = 16;
const YES_FONT_SIZE_STEP = 20;
// Keeps the Yes button from growing beyond the viewport after many "No" clicks
const MAX_YES_FONT_SIZE = 240;
const CONFETTI_DURATION_MS = 5000;

function Valentine() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name")?.trim().slice(0, MAX_NAME_LENGTH);
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const yesButtonSize = Math.min(
    noCount * YES_FONT_SIZE_STEP + BASE_YES_FONT_SIZE,
    MAX_YES_FONT_SIZE,
  );
  const noButtonText = phrases[Math.min(noCount, phrases.length - 1)];

  return (
    <div className="valentine-container">
      {yesPressed ? (
        <>
          <Fireworks
            className="confetti-canvas"
            autorun={{ speed: 3, duration: CONFETTI_DURATION_MS }}
            globalOptions={{ disableForReducedMotion: true }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- animated remote GIF, no optimization needed */}
          <img
            src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif"
            alt="Two bears kissing"
            className="h-[200px]"
          />
          <div className="text-container" role="status">
            Ok yay!!!
          </div>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- animated remote GIF, no optimization needed */}
          <img
            src="https://gifdb.com/images/high/cute-love-bear-roses-ou7zho5oosxnpo6k.gif"
            alt="Cute bear holding roses"
            className="h-[200px]"
          />
          <h1 className="text-container">
            {name ? `${name}, will` : "Will"} you be my Valentine?
          </h1>
          <div className="button-row">
            <button
              type="button"
              className="yes-button"
              style={{ fontSize: yesButtonSize }}
              onClick={() => setYesPressed(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className="no-button"
              onClick={() => setNoCount((count) => count + 1)}
            >
              {noButtonText}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* useSearchParams() requires a Suspense boundary for static rendering */}
      <Suspense>
        <Valentine />
      </Suspense>
    </main>
  );
}
