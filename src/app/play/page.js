"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

export default function PlayCompiled() {
  const [gameState, setGameState] = useState({
    isPlanted: false,
    isExploded: false
  });

  const plantTheBomb = () => {
    setGameState((prev) => {
      return { ...prev, isPlanted: true };
    });
  };

  if (!gameState.isPlanted) {
    return <ShowBombPlanting plantTheBomb={plantTheBomb} />;
  }
}

function ShowBombPlanting(props) {
  const { plantTheBomb } = props;
  const [timeLeft, setTimeLeft] = useState(3);

  const playBombPlantedSFX = () => {
    const audio = new Audio("/assets/sounds/bomb-planted.wav");
    audio.play();
  };

  // Countdown

  useEffect(() => {
    if (timeLeft === 0) {
      return;
    }

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [timeLeft]);

  // Bomb Planted

  useEffect(() => {
    if (timeLeft !== 0) {
      return;
    }

    playBombPlantedSFX();
    setTimeout(() => {
      plantTheBomb();
    }, 2000);
  }, [timeLeft]);

  return (
    <section id={styles.countdown}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {timeLeft !== 0 ? <h1>{timeLeft}</h1> : null}
          {timeLeft === 0 ? <h1 data-aos="zoom-in">The bomb has been planted.</h1> : null}
        </div>
      </div>
    </section>
  );
}
