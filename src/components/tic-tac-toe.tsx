"use client";

import { useCallback, useState } from "react";

type Player = "X" | "O";
type Board = (Player | null)[];

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares: Board): {
  winner: Player | null;
  line: number[];
} {
  for (const [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as Player, line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

function getBotMove(squares: Board, botPlayer: Player): number {
  const humanPlayer: Player = botPlayer === "X" ? "O" : "X";

  for (const [a, b, c] of WINNING_LINES) {
    const line = [squares[a], squares[b], squares[c]];
    if (line.filter((s) => s === botPlayer).length === 2 && line.includes(null))
      return [a, b, c][line.indexOf(null)];
  }
  for (const [a, b, c] of WINNING_LINES) {
    const line = [squares[a], squares[b], squares[c]];
    if (
      line.filter((s) => s === humanPlayer).length === 2 &&
      line.includes(null)
    )
      return [a, b, c][line.indexOf(null)];
  }
  if (!squares[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !squares[i]);
  if (corners.length)
    return corners[Math.floor(Math.random() * corners.length)];
  const edges = [1, 3, 5, 7].filter((i) => !squares[i]);
  if (edges.length) return edges[Math.floor(Math.random() * edges.length)];
  return -1;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line
        x1="5"
        y1="5"
        x2="19"
        y2="19"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line
        x1="19"
        y1="5"
        x2="5"
        y2="19"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function OIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ you: 0, bot: 0, ties: 0 });
  const [thinking, setThinking] = useState(false);

  const { winner, line: winLine } = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = useCallback(
    (index: number) => {
      if (!isPlayerTurn || board[index] || winner || isDraw || thinking) return;

      const newBoard = [...board];
      newBoard[index] = "X";
      setBoard(newBoard);

      const { winner: w } = calculateWinner(newBoard);
      if (w) {
        setScore((s) => ({ ...s, you: s.you + 1 }));
        setGameOver(true);
        return;
      }
      if (newBoard.every(Boolean)) {
        setScore((s) => ({ ...s, ties: s.ties + 1 }));
        setGameOver(true);
        return;
      }

      setIsPlayerTurn(false);
      setThinking(true);
      setTimeout(() => {
        const move = getBotMove(newBoard, "O");
        if (move === -1) {
          setThinking(false);
          return;
        }
        const botBoard = [...newBoard];
        botBoard[move] = "O";
        setBoard(botBoard);
        const { winner: bw } = calculateWinner(botBoard);
        if (bw) {
          setScore((s) => ({ ...s, bot: s.bot + 1 }));
          setGameOver(true);
        } else if (botBoard.every(Boolean)) {
          setScore((s) => ({ ...s, ties: s.ties + 1 }));
          setGameOver(true);
        } else setIsPlayerTurn(true);
        setThinking(false);
      }, 400);
    },
    [board, isPlayerTurn, winner, isDraw, thinking],
  );

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
  };

  const status = winner
    ? winner === "X"
      ? "You won :)"
      : "Bot wins :("
    : isDraw
      ? "Tie :)"
      : thinking
        ? "Bot thinking..."
        : isPlayerTurn
          ? "Your turn (X)"
          : "Bot's turn (O)";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score */}
      <div className="flex items-center gap-6 text-sm font-mono text-muted-foreground">
        <span>
          You <span className="text-foreground font-semibold">{score.you}</span>
        </span>
        <span className="text-border">·</span>
        <span>
          Ties{" "}
          <span className="text-foreground font-semibold">{score.ties}</span>
        </span>
        <span className="text-border">·</span>
        <span>
          Bot <span className="text-foreground font-semibold">{score.bot}</span>
        </span>
      </div>

      {/* Status */}
      <p className="text-xs text-muted-foreground font-mono">{status}</p>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={gameOver || !isPlayerTurn || !!cell}
            className={`
              flex items-center justify-center
              w-16 h-16 rounded-lg border
              transition-all duration-150
              ${
                winLine.includes(i)
                  ? "border-primary/60 bg-primary/10"
                  : cell
                    ? "border-border/50 bg-muted/30"
                    : "border-border/30 bg-transparent hover:border-border hover:bg-muted/30 cursor-pointer"
              }
              ${!cell && (gameOver || !isPlayerTurn) ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            {cell === "X" && (
              <XIcon
                className={`w-6 h-6 ${winLine.includes(i) ? "text-primary" : "text-foreground"}`}
              />
            )}
            {cell === "O" && (
              <OIcon
                className={`w-6 h-6 ${winLine.includes(i) ? "text-primary" : "text-muted-foreground"}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <button
        onClick={reset}
        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors font-mono"
      >
        {gameOver || isDraw ? "play again" : "reset"}
      </button>
    </div>
  );
}
