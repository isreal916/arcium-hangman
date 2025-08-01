// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { WORDS } from "./data";
import rightanswer from "./assets/rightanswer-95219.mp3";
import wronganswer from "./assets/wronganswer-37702.mp3";
import "./App.css";

const MAX_WRONG = 6;

function App() {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordData, setWordData] = useState({ word: "", hint: "" });
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState("start");
  const [score, setScore] = useState(0);
  const audioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  // Shuffle words once at start or reset
  useEffect(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, []);

  // Update current word data when wordIndex or shuffledWords change
  useEffect(() => {
    if (gameStatus === "playing" && shuffledWords.length > 0) {
      setWordData({
        word: shuffledWords[wordIndex]?.word.toLowerCase(),
        hint: shuffledWords[wordIndex]?.hint,
      });
    }
  }, [wordIndex, shuffledWords, gameStatus]);

  // Check win or loss on guessed letters or wrong guesses update
  useEffect(() => {
    const didWin =
      wordData.word &&
      wordData.word
        .split("")
        .every((letter) => guessedLetters.includes(letter));

    if (didWin) {
      audioRef.current?.play();
      setScore((prev) => prev + 1);
      setTimeout(() => {
        if (wordIndex + 1 < shuffledWords.length) {
          setWordIndex((i) => i + 1);
          setGuessedLetters([]);
          setWrongGuesses(0);
        } else {
          setGameStatus("end");
        }
      }, 1000);
    }

    if (wrongGuesses >= MAX_WRONG) {
      if (wordIndex + 1 < shuffledWords.length) {
        setTimeout(() => {
          setWordIndex((i) => i + 1);
          setGuessedLetters([]);
          setWrongGuesses(0);
        }, 1000);
      } else {
        setGameStatus("end");
      }
    }
  }, [guessedLetters, wrongGuesses, wordData.word, wordIndex, shuffledWords]);

  // Grading feedback based on score
  const getFeedback = () => {
    const total = WORDS.length;
    if (score === total) return "👑 You are a true Arcian, One latina for you";
    if (score >= 11) return "Almost flawless!";
    if (score >= 8) return "Impressive!";
    if (score >= 5) return "You're getting there! Good effort.";
    return "😢 Keep learning Arcian!";
  };

  const handleGuess = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    setGuessedLetters((prev) => [...prev, letter]);
    if (!wordData.word.includes(letter)){ setWrongGuesses((prev) => prev + 1); wrongAudioRef.current?.play(); }
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

  const resetGame = () => {
    const reshuffled = [...WORDS].sort(() => Math.random() - 0.5);
    setShuffledWords(reshuffled);
    setWordIndex(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setScore(0);
  };

  const letters = "abcdefghijklmnopqrstuvwxyz".split("");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <audio ref={audioRef} src={rightanswer} />
      <audio ref={wrongAudioRef} src={wronganswer} />

      {gameStatus === "start" && (
        <div className="text-center">
          <h1 className="text-4xl text-purple-400 font-bold mb-4 animate-pulse">
            Arcium Hangman
          </h1>
          <button
            onClick={resetGame}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-lg rounded"
          >
            Start Game
          </button>
        </div>
      )}

      {gameStatus === "playing" && (
        <>
          <div className="mb-2 text-purple-300 italic text-center max-w-md">
            Hint: {wordData.hint}
          </div>

          {/* Lives as hearts */}
          <div className="mb-4 text-xl text-red-500">
            Lives left:{" "}
            {Array.from({ length: MAX_WRONG - wrongGuesses }).map((_, idx) => (
              <span key={idx}>❤️</span>
            ))}
            {Array.from({ length: wrongGuesses }).map((_, idx) => (
              <span key={idx}>🤍</span>
            ))}
          </div>

          <div className="mb-6 text-center">{renderWord()}</div>

          <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 sm:gap-3 max-w-xs sm:max-w-lg w-full">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter)}
                className={`py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg rounded transition ${
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

      {gameStatus === "end" && (
        <div className="mt-6 text-center animate-fade-in">
          <h2 className="text-2xl mb-2">Game Over</h2>
          <p className="mb-1 font-bold">
            Total Guessed Words: {score}/{WORDS.length}
          </p>
          <p className="mb-4 text-purple-300">{getFeedback()}</p>

          <button
            onClick={resetGame}
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
