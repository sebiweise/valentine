"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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

export default function Home() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name')
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const yesButtonSize = noCount * 20 + 16;

  function handleNoClick() {
    setNoCount(noCount + 1);
  }

  function getNoButtonText() {
    return phrases[Math.min(noCount, phrases.length - 1)];
  }

  return (
    <main className="flex-1">
      <div className="valentine-container">
        {yesPressed ? (
          <>
            <img src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif" />
            <div className="text-container">Ok yay!!!</div>
          </>
        ) : (
          <>
            <img
              className="h-[200px]"
              src="https://gifdb.com/images/high/cute-love-bear-roses-ou7zho5oosxnpo6k.gif"
            />
            <h1 className="text-container">{name ? `${name}, will` : 'Will'} you be my Valentine?</h1>
            <div>
              <button
                className="yes-button"
                style={{ fontSize: yesButtonSize }}
                onClick={() => setYesPressed(true)}
              >
                Yes
              </button>
              <button className="no-button" onClick={() => handleNoClick()}>
                {getNoButtonText()}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
