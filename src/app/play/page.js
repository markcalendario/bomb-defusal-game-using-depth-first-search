"use client";
import ToolButton from "@/components/ToolButton/ToolButton";
import { defuseKit, generateDefuseKitTree, getAllToolsFromTree } from "@/functions/defuse-kit";
import { Fragment, createContext, useContext, useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

const MainGameContext = createContext();
const DefuseKitSequenceContext = createContext();

export default function PlayCompiled() {
  const gameAudio = useRef(new Audio());
  const [toolSequence, setToolSequence] = useState(null);
  const [isSelectedCorrect, setIsSelectedCorrect] = useState(null);
  const [gameState, setGameState] = useState({
    isPlanted: false,
    isExploded: false,
    isDefused: false,
    level: 1,
    timerLength: 15
  });

  const generateToolKit = () => {
    const rootTool = generateDefuseKitTree(5 + gameState.level - 1);
    setToolSequence(getAllToolsFromTree(rootTool));
  };

  const setIsDoneShowingToolsSequence = () => {
    setGameState((prev) => {
      return { ...prev, isPlanted: true };
    });
  };

  const setBombExploded = () => {
    playAudio("/assets/sounds/explosion.wav");
    setGameState((prev) => {
      return { ...prev, isPlanted: false, isExploded: true };
    });
  };

  const setBombDefused = () => {
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
  };

  const handleUserSelectTool = (toolID) => {
    if (toolID !== toolSequence[0].id) {
      setBombExploded();
      return;
    }

    setToolSequence((prev) => {
      prev.shift();
      return [...prev];
    });

    setIsSelectedCorrect(true);
    new Audio("/assets/sounds/correct.wav").play();

    // Remove the blinker
    setTimeout(() => {
      setIsSelectedCorrect(null);
    }, 100);
  };

  const handleNextLevel = () => {
    generateToolKit();
    setGameState({ ...gameState, isPlanted: false, isExploded: false, isDefused: false });
  };

  const playAudio = (audio, simultaneous = false) => {
    if (!simultaneous) {
      gameAudio.current.pause();
    }

    gameAudio.current = new Audio(audio);
    gameAudio.current.play();
  };

  useEffect(() => {
    if (toolSequence === null) return;

    if (toolSequence.length === 0) setBombDefused();
  }, [toolSequence]);

  useEffect(() => {
    generateToolKit();
  }, []);

  if (!gameState.isPlanted && !gameState.isExploded && !gameState.isDefused) {
    return (
      <DefuseKitSequenceContext.Provider
        value={{
          setIsDoneShowingToolsSequence,
          toolSequence,
          gameAudio,
          playAudio
        }}>
        <ShowDefuseKitSequence />
      </DefuseKitSequenceContext.Provider>
    );
  }

  if (gameState.isPlanted && !gameState.isExploded && !gameState.isDefused) {
    return (
      <MainGameContext.Provider
        value={{ gameState, handleUserSelectTool, isSelectedCorrect, setBombExploded, playAudio }}>
        <MainGame />
      </MainGameContext.Provider>
    );
  }

  if (gameState.isExploded && !gameState.isPlanted) {
    return <h1>Exploded.</h1>;
  }

  if (gameState.isDefused) {
    return (
      <Fragment>
        <h1>Defused</h1>
        <button onClick={handleNextLevel}>Next Level</button>
      </Fragment>
    );
  }
}

function ShowDefuseKitSequence() {
  const { toolSequence, setIsDoneShowingToolsSequence, gameAudio, playAudio } =
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
        return;
      }

      setBombTime((prev) => {
        if (prev.milliseconds === 0) {
          return { seconds: bombTime.seconds - 1, milliseconds: 100 };
        }

        return { seconds: bombTime.seconds, milliseconds: bombTime.milliseconds - 1 };
      });
    }, 10);

    return () => {
      clearInterval(timer);
    };
  }, [bombTime]);

  useEffect(() => {
    if (bombTime === null) return;

    if (bombTime.seconds === 0 && bombTime.milliseconds === 0) {
      setBombExploded();
    }
  }, [bombTime, setBombExploded]);

  return (
    <section id={styles.mainGame}>
      <div className={styles.level}>Level {gameState.level}</div>
      <div className={styles.bombDisplay}>
        <div data-aos="fade-up" className={styles.bomb}>
          <div className={styles.timer}>
            {bombTime !== null ? <h2>{`${bombTime.seconds}:${bombTime.milliseconds}`}</h2> : null}
            <p>Time Left</p>
          </div>
          <div className={styles.controls}>
            <div
              className={styles.defuseScreen}
              style={{
                backgroundColor: isSelectedCorrect ? "green" : null
              }}></div>
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
