// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const ORIGINAL_WORDS = [
  { word: "privacy", hint: "What should be default" },
  { word: "gmpc", hint: "community greeting" },
  { word: "manticore", hint: "MPC model that operate under a 'honest but curious' model" },
  { word: "loosty", hint: " Arcium community head" },
  { word: "mpc", hint: "Arcium main cryptographic technology" },
  { word: "encrypted", hint: "brand statement used often with <> symbol" },
  { word: "miebi", hint: "queen of fooling" },
  { word: "purple", hint: "arcium brand color" },
  { word: "cerberus", hint: "MPC model that operate under a 'dishonest majority' model" },
  { word: "arcium", hint: "the encrypted super computer" },
  { word: "yannik", hint: "Ceo of encryption" },
];

const MAX_WRONG = 6;
const ROUND_TIME = 60; // seconds

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function App() {
  const [wordList, setWordList] = useState(shuffle(ORIGINAL_WORDS));
  const [wordIndex, setWordIndex] = useState(0);
  const [wordData, setWordData] = useState({ word: "", hint: "" });
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState("start");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const tickRef = useRef();
  const audioRef = useRef(null);

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0) {
      tickRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [gameStatus]);

  useEffect(() => {
    if (timeLeft <= 0 && gameStatus === "playing") {
      setGameStatus("ended");
      clearInterval(tickRef.current);
    }
  }, [timeLeft, gameStatus]);

  useEffect(() => {
    const didWin =
      wordData.word &&
      wordData.word.split("").every((letter) => guessedLetters.includes(letter));
    if (didWin) {
      setScore((s) => s + 1);
      audioRef.current?.play();
       setTimeLeft((t) => t + 10); // Add 10 seconds for winning
      nextWord();
    }
    if (wrongGuesses >= MAX_WRONG) {
      nextWord();
    }
  }, [guessedLetters, wrongGuesses]);

  const nextWord = () => {
    setGuessedLetters([]);
    setWrongGuesses(0);
    const nextIdx = (wordIndex + 1) % wordList.length;
    setWordIndex(nextIdx);
    setWordData(wordList[nextIdx]);
  };

  const startGame = () => {
    const shuffled = shuffle(ORIGINAL_WORDS);
    setWordList(shuffled);
    setWordIndex(0);
    setWordData(shuffled[0]);
    setTimeLeft(ROUND_TIME);
    setScore(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
  };

  const handleGuess = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    setGuessedLetters((prev) => [...prev, letter]);
    if (!wordData.word.includes(letter)) setWrongGuesses((prev) => prev + 1);
  };

  const renderWord = () => {
    return wordData.word.split("").map((letter, idx) => (
      <span
        key={idx}
        className="inline-block w-6 text-center border-b border-purple-400 text-2xl mx-1"
      >
        {guessedLetters.includes(letter) ? letter : ""}
      </span>
    ));
  };

  const letters = "abcdefghijklmnopqrstuvwxyz".split("");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.wav" />

      <h1 className="text-4xl text-purple-400 font-bold mb-4 animate-pulse">Arcium Hangman</h1>

      {gameStatus === "start" &&  (
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-8 py-4 text-xl bg-purple-700 hover:bg-purple-800 rounded"
          >
            Start Game
          </button>
        </div>
      )}

      {gameStatus !== "start" && gameStatus !== "ended"  && (
        <>
          <div className="mb-2 text-purple-300 italic text-center max-w-md">
            Hint: {wordData.hint}
          </div>

          <div className="mb-2 text-yellow-400">Time left: {timeLeft}s</div>

          <div className="mb-4">Wrong guesses: {wrongGuesses} / {MAX_WRONG}</div>

          <div className="mb-6 text-center">{renderWord()}</div>

          <div className="grid grid-cols-7 gap-3 max-w-lg">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
                className={`px-4 py-3 rounded text-lg transition ${
                  guessedLetters.includes(letter)
                    ? wordData.word.includes(letter)
                      ? "bg-green-600 animate-bounce"
                      : "bg-red-600 animate-shake"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </>
      )}

      {gameStatus === "ended" && (
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-xl text-green-400 font-semibold">
            Time's up! You guessed {score} word{score !== 1 ? "s" : ""} correctly.
          </p>
          <button
            onClick={()=> setGameStatus("start")}
            className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-lg rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
