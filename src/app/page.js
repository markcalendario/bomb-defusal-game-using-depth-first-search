"use client";

import Button from "@/components/Buttons/Buttons";
import ToolButton from "@/components/ToolButton/ToolButton";
import {
  defuseKit,
  generateDefuseKitTree,
  getAllToolsFromGeneratedKitTree
} from "@/functions/defuse-kit";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
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

  const [gameState, setGameState] = useState({
    isPlanted: false,
    isExploded: false,
    isDefused: false,
    isGameCompleted: false,
    level: 1,
    timerLength: 20
  });

  const setPlanted = () => {
    setGameState((prev) => {
      return {
        ...prev,
        isPlanted: true
      };
    });
  };

  const playAudio = useCallback(
    (audio) => {
      bgm.current.pause();
      bgm.current = new Audio(audio);
      bgm.current.play();
    },
    [bgm]
  );

  const setBombExploded = useCallback(() => {
    playAudio("/assets/sounds/explosion.wav");
    setGameState((prev) => {
      return {
        ...prev,
        isPlanted: false,
        isExploded: true
      };
    });
  }, [playAudio]);

  const checkIsGameCompleted = useCallback(() => {
    const MAX_LEVEL = 5;

    if (gameState.level === MAX_LEVEL) {
      setGameState((prev) => {
        return {
          ...prev,
          isGameCompleted: true
        };
      });
    }
  }, [gameState.level]);

  const setBombDefused = useCallback(() => {
    playAudio("/assets/sounds/defused.wav");
    setGameState((prev) => {
      return {
        ...prev,
        isPlanted: false,
        isDefused: true
      };
    });
    checkIsGameCompleted();
  }, [playAudio, checkIsGameCompleted]);

  const dequeueTool = () => {
    setToolSequence((prev) => {
      prev.shift();
      return [...prev];
    });
  };

  const handleNextLevel = useCallback(() => {
    setGameState((prev) => {
      return {
        ...prev,
        isPlanted: false,
        isExploded: false,
        isDefused: false,
        level: prev.level + 1,
        timerLength: prev.timerLength - 2
      };
    });

    setToolSequence(null);
  }, []);

  const generateToolKit = useCallback(() => {
    const rootTool = generateDefuseKitTree(5 + gameState.level - 1);
    const tools = getAllToolsFromGeneratedKitTree(rootTool);
    console.log("Solution:", tools);
    setToolSequence(tools);
  }, [gameState.level]);

  useEffect(() => {
    if (toolSequence === null) return;
    if (toolSequence.length === 0) setBombDefused();
  }, [toolSequence, setBombDefused]);

  useEffect(() => {
    generateToolKit();
  }, [generateToolKit]);

  if (gameState.isGameCompleted) {
    return (
      <GameStateContext.Provider value={gameState}>
        <Completed />
      </GameStateContext.Provider>
    );
  }

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
      <DefuseKitSequenceContext.Provider value={toolSequence}>
        <ShowDefuseKitSequence setPlanted={setPlanted} playAudio={playAudio} />
      </DefuseKitSequenceContext.Provider>
    );
  }

  return (
    <MainGameContext.Provider value={{ gameState, toolSequence }}>
      <MainGame setBombExploded={setBombExploded} dequeueTool={dequeueTool} />
    </MainGameContext.Provider>
  );
}

function ShowDefuseKitSequence({ playAudio, setPlanted }) {
  const toolSequence = useContext(DefuseKitSequenceContext);
  const [currentDisplayedTool, setCurrentDisplayedTool] = useState(null);
  const [isToolChanged, setIsToolChanged] = useState(0);
  const [sequenceState, setSequenceState] = useState("not-started");

  const displayTool = () => {
    return (
      <ToolButton
        key={isToolChanged}
        imageLink={currentDisplayedTool.image}
        toolName={currentDisplayedTool.name}
      />
    );
  };

  const handleSequenceDone = useCallback(() => {
    playAudio("/assets/sounds/playing.mp3");
    setSequenceState("ended");
    setTimeout(setPlanted, 3000);
  }, [playAudio, setPlanted]);

  useEffect(() => {
    playAudio("/assets/sounds/tool-sequence.wav");

    setTimeout(() => {
      setSequenceState("started");
    }, 2000);
  }, [playAudio]);

  useEffect(() => {
    /**
     * Changes the currentDisplayedTool state every 1000ms.
     * It uses queue to display all items until the queue becomes empty.
     */

    if (toolSequence === null || sequenceState !== "started") return;

    const toolSetQueue = [...toolSequence];

    const displayNextTool = () => {
      if (toolSetQueue.length === 0) {
        clearInterval(toolInterval);
        handleSequenceDone();
        return;
      }

      setCurrentDisplayedTool(toolSetQueue.shift());
      setIsToolChanged((prev) => prev + 1);
    };

    displayNextTool();
    const toolInterval = setInterval(displayNextTool, 1000);

    return () => clearInterval(toolInterval);
  }, [toolSequence, sequenceState, setPlanted, handleSequenceDone]);

  const displayGuide = (text) => {
    return (
      <div
        className={styles.bigText}
        data-aos="fade-right"
        data-aos-duration="500">
        <h1 data-aos="flip-up" data-aos-delay="600">
          {text}
        </h1>
      </div>
    );
  };

  return (
    <section id={styles.sequenceDisplayer}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {sequenceState === "started" && currentDisplayedTool !== null
            ? displayTool()
            : null}
          {sequenceState === "not-started"
            ? displayGuide("Follow this defuse kit sequence.")
            : null}
          {sequenceState === "ended"
            ? displayGuide("The bomb has been planted.")
            : null}
        </div>
      </div>
    </section>
  );
}

function MainGame({ setBombExploded, dequeueTool }) {
  const { gameState, toolSequence } = useContext(MainGameContext);
  const [bombTime, setBombTime] = useState(null);
  const [isSelectedCorrect, setIsSelectedCorrect] = useState(null);

  const blink = () => {
    new Audio("/assets/sounds/correct.wav").play();
    setIsSelectedCorrect(true);

    // Remove the green blinker
    setTimeout(() => {
      setIsSelectedCorrect(null);
    }, 200);
  };

  const handleUserSelectTool = (toolID) => {
    const isUserSelectedCorrectTool = toolID === toolSequence[0].id;
    if (!isUserSelectedCorrectTool) {
      setBombExploded();
      return;
    }

    dequeueTool(); // If correct, dequeue tool from a toolSequence
    blink();
  };

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

  const updateTimer = useCallback(() => {
    setBombTime((prev) => {
      let seconds = prev.seconds;
      let milliseconds = prev.milliseconds - 1;

      if (milliseconds < 0) {
        seconds -= 1;
        milliseconds = 100;
      }

      return {
        seconds,
        milliseconds
      };
    });
  }, []);

  // Initialize bomb timer
  useEffect(() => {
    setBombTime({
      seconds: gameState.timerLength,
      milliseconds: 0
    });
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
      <div
        className={styles.level}
        id={styles.test}
        style={{ backdropFilter: "-moz-initial" }}>
        Level {gameState.level}
      </div>
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
              }}
            />
            <div className={styles.detonate} onClick={setBombExploded}>
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
            <p>Next level: {gameState.level + 1}</p>
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

function Completed() {
  const gameState = useContext(GameStateContext);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <section id={styles.defused}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div data-aos="zoom-out" className={styles.texts}>
            <h1>You completed the game.</h1>
            <p>You are a bomb expert!</p>
          </div>
          <div className={styles.status}>
            <p>Level: {gameState.level}</p>
          </div>
          <div className={styles.buttons}>
            <Button onClick={handlePlayAgain}>Play Again</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
