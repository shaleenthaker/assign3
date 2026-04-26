import * as React from 'react'
import * as ReactBootstrap from 'react-bootstrap'
import { useState } from 'react';

const { Badge, Button, Card } = ReactBootstrap

const ADJACENCY = [
  [1, 3, 4],
  [0, 2, 3, 4, 5],
  [1, 4, 5],
  [0, 1, 4, 6, 7],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [1, 2, 4, 7, 8],
  [3, 4, 7],
  [3, 4, 5, 6, 8],
  [4, 5, 7]
];

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] == squares[b] && squares[a] == squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function countPieces(squares, player) {
  return squares.filter(s => s === player).length;
}

function isAdjacent(from, to) {
  return ADJACENCY[from].includes(to);
}

function mustMoveCenter(squares, player) {
  return squares[4] == player;
}

function hasWinningMove(squares, player) {
  const myPieces = squares.map((v, i) => v === player ? i : -1).filter(i => i >= 0);
  for (const from of myPieces) {
    for (const to of ADJACENCY[from]) {
      if(!squares[to]) {
        const test = squares.slice();
        test[from] = null;
        test[to] = player;
        if (calculateWinner(test)) {
          return true;
        }
      }
    }
  }
  return false;
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}


function Board({ xIsNext, squares, onPlay }) {

  const [selectedSquare, setSelectedSquare] = useState(null);
  const currentPlayer = xIsNext ? "X" : "O";

  const xCount = countPieces(squares, "X");
  const oCount = countPieces(squares, "O");

  const totalPlaced = xCount + oCount;
  const isMovingPhase = (xIsNext && xCount === 3) || (!xIsNext && oCount === 3);

  const winner = calculateWinner(squares);

  function handleClick(i) {
    if (calculateWinner(squares)) {
      return;
    }
    if (!isMovingPhase) {
      if (squares[i]) {
        return;
      }
      const next = squares.slice();
      next[i] = currentPlayer;
      setSelectedSquare(null);
      onPlay(next);
    } else {
      if (selectedSquare === null) {
        if (squares[i] === currentPlayer) {
          setSelectedSquare(i);
        }
        return;
      }

      if (selectedSquare === i) {
        setSelectedSquare(null);
        return;
      }

      if (squares[i] === currentPlayer) {
        setSelectedSquare(i);
        return;
      }

      if (squares[i] !== null) {
        return;
      }

      if (!isAdjacent(selectedSquare, i)) {
        return;
      }

      const next = squares.slice();
      next[selectedSquare] = null;
      next[i] = currentPlayer;

      if (mustMoveCenter(squares, currentPlayer)) {
        const movesWin = !!calculateWinner(next);
        const vacatesCenter = selectedSquare === 4;
        if (!movesWin && !vacatesCenter) {
          return;
        }
      }

      setSelectedSquare(null);
      onPlay(next);
    }
  }

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isMovingPhase) {
    const centerWarning = mustMoveCenter(squares, currentPlayer)
      ? " (must win or vacate center!)"
      : "";
    const hint = selectedSquare !== null
      ? ` — piece selected at ${selectedSquare}, click adjacent empty square`
      : " — select one of your pieces to move";
    status = `Next player: ${currentPlayer} [MOVE phase]${centerWarning}${hint}`;
  } else {
    status = `Next player: ${currentPlayer} [PLACE phase]`;
  }

  const renderSquare = (idx) => (
    <Square
      key={idx}
      value={squares[idx]}
      onSquareClick={() => handleClick(idx)}
    />
  );

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}{renderSquare(1)}{renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}{renderSquare(4)}{renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}{renderSquare(7)}{renderSquare(8)}
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    const description = move > 0 ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <h1>Chorus Lapilli</h1>
        <p className="rules-hint">
          Place 3 pieces, then <em>move</em> them to adjacent squares.<br />
          If you hold the center, you must win or vacate it!
        </p>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}