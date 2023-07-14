"use client";

import Button from "@/components/Buttons/Buttons";
import ToolButton from "@/components/ToolButton/ToolButton";
import {
  defuseKit,
  generateDefuseKitTree,
  getAllToolsFromGeneratedKitTree
} from "@/functions/defuse-kit";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

export default function Welcome() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const handlePlayClick = () => {
    setIsGameStarted(true);
  };

  if (isGameStarted) {
    return <Game />;
  }

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

const MainGameContext = createContext();
const DefuseKitSequenceContext = createContext();
const GameStateContext = createContext();

function Game() {
  const bgm = useRef(new Audio());
  const [toolSequence, setToolSequence] = useState(null);
  const [isSelectedCorrect, setIsSelectedCorrect] = useState(null);
  const [gameState, setGameState] = useState({
    isPlanted: false,
    isExploded: false,
    isDefused: false,
    level: 1,
    timerLength: 15
  });

  const generateToolKit = useCallback(() => {
    const rootTool = generateDefuseKitTree(5 + gameState.level - 1);
    setToolSequence(getAllToolsFromGeneratedKitTree(rootTool));
  }, [gameState.level]);

  const setIsDoneShowingToolsSequence = () => {
    setGameState((prev) => {
      return { ...prev, isPlanted: true };
    });
  };

  const blink = () => {
    new Audio("/assets/sounds/correct.wav").play();
    setIsSelectedCorrect(true);

    // Remove the green blinker
    setTimeout(() => {
      setIsSelectedCorrect(null);
    }, 200);
  };

  const handleUserSelectTool = (toolID) => {
    const isUserSelectedIncorrectTool = toolID !== toolSequence[0].id;
    if (isUserSelectedIncorrectTool) {
      setBombExploded();
      return;
    }

    // If correct, dequeue tool from a toolSequence
    setToolSequence((prev) => {
      prev.shift();
      return [...prev];
    });

    blink();
  };

  const setBombExploded = () => {
    playAudio("/assets/sounds/explosion.wav");
    setGameState((prev) => {
      return { ...prev, isPlanted: false, isExploded: true };
    });
  };

  const setBombDefused = useCallback(() => {
    playAudio("/assets/sounds/defused.wav");
    setGameState((prev) => {
      return {
        ...prev,
        isPlanted: false,
        isDefused: true,
        level: prev.level + 1,
        timerLength: prev.timerLength - 2
      };
    });
  }, []);

  const handleNextLevel = () => {
    generateToolKit();
    setGameState({ ...gameState, isPlanted: false, isExploded: false, isDefused: false });
  };

  const playAudio = (audio) => {
    bgm.current.pause();
    bgm.current = new Audio(audio);
    bgm.current.play();
  };

  useEffect(() => {
    if (toolSequence === null) return;
    if (toolSequence.length === 0) setBombDefused();
  }, [toolSequence, setBombDefused]);

  useEffect(() => {
    generateToolKit();
  }, [generateToolKit]);

  if (gameState.isExploded) {
    return (
      <GameStateContext.Provider value={gameState}>
        <Exploded />
      </GameStateContext.Provider>
    );
  }

  if (gameState.isDefused) {
    return (
      <GameStateContext.Provider value={gameState}>
        <Defused handleNextLevel={handleNextLevel} />
      </GameStateContext.Provider>
    );
  }

  if (!gameState.isPlanted) {
    return (
      <DefuseKitSequenceContext.Provider
        value={{
          setIsDoneShowingToolsSequence,
          toolSequence,
          playAudio
        }}>
        <ShowDefuseKitSequence />
      </DefuseKitSequenceContext.Provider>
    );
  }

  return (
    <MainGameContext.Provider
      value={{ gameState, handleUserSelectTool, isSelectedCorrect, setBombExploded, playAudio }}>
      <MainGame />
    </MainGameContext.Provider>
  );
}

function ShowDefuseKitSequence() {
  const { toolSequence, setIsDoneShowingToolsSequence, playAudio } =
    useContext(DefuseKitSequenceContext);
  const [currentDisplayedTool, setCurrentDisplayedTool] = useState(null);
  const [isToolChanged, setIsToolChanged] = useState(0);
  const [isSequenceDone, setIsSequenceDone] = useState(false);

  useEffect(() => {
    playAudio("/assets/sounds/tool-sequence.wav");
  }, []);

  useEffect(() => {
    if (toolSequence === null) return;

    const toolSetQueue = [...toolSequence];

    const displayNextTool = () => {
      if (toolSetQueue.length === 0) {
        clearInterval(toolInterval);
        setIsSequenceDone(true);
      }

      setCurrentDisplayedTool(toolSetQueue.shift());
      setIsToolChanged((prev) => prev + 1);
    };

    const toolInterval = setInterval(displayNextTool, 1000);

    return () => {
      clearInterval(toolInterval);
    };
  }, [toolSequence]);

  useEffect(() => {
    if (isSequenceDone === false) return;
    playAudio("/assets/sounds/playing.mp3");

    setTimeout(() => {
      setIsDoneShowingToolsSequence();
    }, 3000);
  }, [isSequenceDone, setIsDoneShowingToolsSequence]);

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
    <section id={styles.sequenceDisplayer}>
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
  const { gameState, handleUserSelectTool, isSelectedCorrect, setBombExploded } =
    useContext(MainGameContext);
  const [bombTime, setBombTime] = useState(null);

  const displayTools = () => {
    return defuseKit.map((tool, index) => (
      <ToolButton
        key={index}
        imageLink={tool.image}
        toolName={tool.name}
        onClick={() => {
          handleUserSelectTool(tool.id);
        }}
      />
    ));
  };

  const handleDetonate = () => {
    setBombExploded();
  };

  const updateTimer = useCallback(() => {
    setBombTime((prev) => {
      let seconds = prev.seconds;
      let milliseconds = prev.milliseconds - 1;

      if (milliseconds < 0) {
        seconds -= 1;
        milliseconds = 100;
      }

      return { seconds, milliseconds };
    });
  }, []);

  // Initialize bomb timer
  useEffect(() => {
    setBombTime({ seconds: gameState.timerLength, milliseconds: 0 });
  }, [gameState.timerLength]);

  // Start timer countdown
  useEffect(() => {
    if (bombTime === null) return;

    const timer = setInterval(() => {
      if (bombTime.seconds === 0 && bombTime.milliseconds === 0) {
        clearInterval(timer);
        setBombExploded();
        return;
      }

      updateTimer();
    }, 10);

    return () => {
      clearInterval(timer);
    };
  }, [bombTime, setBombExploded, updateTimer]);

  if (bombTime === null) return null;

  return (
    <section id={styles.mainGame}>
      <div className={styles.level}>Level {gameState.level}</div>
      <div className={styles.bombDisplay}>
        <div data-aos="fade-up" className={styles.bomb}>
          <div className={styles.timer}>
            <h2>{`${bombTime.seconds}:${bombTime.milliseconds}`}</h2>
            <p>Time Left</p>
          </div>
          <div className={styles.controls}>
            <div
              className={styles.defuseScreen}
              style={{
                backgroundColor: isSelectedCorrect ? "green" : null
              }}></div>
            <div className={styles.detonate} onClick={handleDetonate}>
              <p>Detonate</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.defuseKit}>{displayTools()}</div>
    </section>
  );
}

function Exploded() {
  const gameState = useContext(GameStateContext);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <section id={styles.exploded}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div data-aos="zoom-out" className={styles.texts}>
            <h1>The bomb has exploded.</h1>
            <p>You failed to defuse the bomb.</p>
          </div>
          <div className={styles.status}>
            <p>Highest level: {gameState.level}</p>
          </div>
          <div className={styles.buttons}>
            <Button onClick={handlePlayAgain}>Play Again</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Defused({ handleNextLevel }) {
  const gameState = useContext(GameStateContext);

  const handleExit = () => {
    window.location.reload();
  };

  return (
    <section id={styles.defused}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div data-aos="zoom-out" className={styles.texts}>
            <h1>The bomb has been defused.</h1>
            <p>You have successfully defused the bomb.</p>
          </div>
          <div className={styles.status}>
            <p>Next level: {gameState.level}</p>
          </div>
          <div className={styles.buttons}>
            <Button onClick={handleNextLevel}>Next Level</Button>
            <Button onClick={handleExit}>Exit</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
