"use client";
import ToolButton from "@/components/ToolButton/ToolButton";
import { defuseKit, generateDefuseKitTree, getAllToolsFromTree } from "@/functions/defuse-kit";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

export default function PlayCompiled() {
  const [toolSequence, setToolSequence] = useState(null);
  const [gameState, setGameState] = useState({
    isPlanted: false,
    isExploded: false,
    isDefused: false,
    round: 1
  });

  useEffect(() => {
    const rootTool = generateDefuseKitTree(5);
    setToolSequence(getAllToolsFromTree(rootTool));
  }, []);

  const setIsBombPlanted = () => {
    setGameState((prev) => {
      return { ...prev, isPlanted: true };
    });
  };

  if (!gameState.isPlanted) {
    return <ShowBombPlanting setIsBombPlanted={setIsBombPlanted} toolSequence={toolSequence} />;
  }

  if (gameState.isPlanted) {
    return <MainGame />;
  }
}

function ShowBombPlanting({ toolSequence, setIsBombPlanted }) {
  const [currentDisplayedTool, setCurrentDisplayedTool] = useState(null);
  const [isSequenceDone, setIsSequenceDone] = useState(false);
  const [isToolChanged, setIsToolChanged] = useState(0);

  function playSound() {
    new Audio("/assets/sounds/bomb-planted.wav").play();
  }

  function prepareGameStart() {
    setTimeout(() => {
      setIsBombPlanted();
    }, 3000);
  }

  useEffect(() => {
    // This effect is responsible for displaying a kit sequence.
    if (toolSequence === null) return;

    const toolSetQueue = [...toolSequence];

    const toolInterval = setInterval(() => {
      setCurrentDisplayedTool(toolSetQueue.shift()); // dequeue the first tool
      setIsToolChanged((prev) => prev + 1); // responsible for animating sequence

      if (toolSetQueue.length === 0) {
        clearInterval(toolInterval);
        setIsSequenceDone(true);
      }
    }, 2000);

    return () => {
      clearInterval(toolInterval);
    };
  }, [toolSequence]);

  useEffect(() => {
    if (isSequenceDone === false) return;

    playSound();
    prepareGameStart();
  }, [isSequenceDone]);

  const displayTool = () => {
    return (
      <ToolButton
        key={isToolChanged}
        imageLink={currentDisplayedTool.image}
        toolName={currentDisplayedTool.name}
      />
    );
  };

  const displayGuide = (text) => {
    return <h1 data-aos="zoom-out">{text}</h1>;
  };

  return (
    <section data-aos="fade-up" id={styles.sequenceDisplayer}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {isSequenceDone ? displayGuide("The bomb has been planted.") : null}
          {!isSequenceDone && currentDisplayedTool !== null ? displayTool() : null}
          {!isSequenceDone && currentDisplayedTool === null
            ? displayGuide("Follow this defuse kit sequence.")
            : null}
        </div>
      </div>
    </section>
  );
}

function MainGame() {
  const displayTools = () => {
    return defuseKit.map((tool, index) => (
      <ToolButton key={index} imageLink={tool.image} toolName={tool.name} />
    ));
  };

  return (
    <section id={styles.mainGame}>
      <div className={styles.level}>Level 1</div>
      <div className={styles.bombDisplay}>
        <div className={styles.bomb}>
          <div className={styles.timer}>
            <h2>00:00:10</h2>
            <p>Time Left</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.defuseScreen}></div>
            <div className={styles.detonate}>
              <p>Detonate</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.defuseKit}>{displayTools()}</div>
    </section>
  );
}
