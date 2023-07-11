"use client";
import { Fragment, useEffect, useState } from "react";
import styles from "./page.module.scss";
import { generateDefuseKitTree, getAllToolsFromTree } from "@/functions/bomb";

export default function PlayCompiled() {
  const [toolSequence, setToolSequence] = useState(null);
  const [gameState, setGameState] = useState({
    isPlanted: false,
    isExploded: false,
    round: 1
  });

  useEffect(() => {
    const root = generateDefuseKitTree(5);
    setToolSequence(getAllToolsFromTree(root));
  }, []);

  const setIsBombPlanted = () => {
    setGameState((prev) => {
      return { ...prev, isPlanted: true };
    });
  };

  if (!gameState.isPlanted) {
    return <ShowBombPlanting setIsBombPlanted={setIsBombPlanted} toolSequence={toolSequence} />;
  }

  return <h1>asdas</h1>;
}

function ShowBombPlanting(props) {
  const { toolSequence, setIsBombPlanted } = props;
  const [currentDisplayedTool, setCurrentDisplayedTool] = useState(null);
  const [isSequenceDone, setIsSequenceDone] = useState(false);
  const [isToolChanged, setIsToolChanged] = useState(0);

  useEffect(() => {
    if (toolSequence === null) return;

    const toolSet = [...toolSequence];

    const toolInterval = setInterval(() => {
      if (toolSet.length === 0) {
        clearInterval(toolInterval);
        setIsSequenceDone(true);
      }

      setIsToolChanged((prev) => prev + 1);
      setCurrentDisplayedTool(toolSet.shift());
    }, 500);

    return () => {
      clearInterval(toolInterval);
    };
  }, [toolSequence]);

  useEffect(() => {
    if (isSequenceDone === false) {
      return;
    }

    new Audio("/assets/sounds/bomb-planted.wav").play();

    setTimeout(() => {
      setIsBombPlanted();
    }, 3000);
  }, [isSequenceDone]);

  if (currentDisplayedTool === null) {
    return;
  }

  return (
    <section id={styles.sequenceDisplayer}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {!isSequenceDone ? (
            <div data-aos="fade-up" key={isToolChanged}>
              <img src={`/assets/images/defuse-kit/${currentDisplayedTool}.png`} />
              <p>{currentDisplayedTool}</p>
            </div>
          ) : (
            <h1 data-aos="fade-up">The bomb has been planted.</h1>
          )}
        </div>
      </div>
    </section>
  );
}
