"use client";

import Button from "@/components/Buttons/Buttons";
import styles from "./page.module.scss";

export default function Welcome() {
  const handlePlayClick = () => {
    window.location.href = "/play";
  };

  return (
    <section id={styles.welcome}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1>Defuse Da Bomb</h1>
          <Button onClick={handlePlayClick}>Play Now</Button>
        </div>
      </div>
    </section>
  );
}
