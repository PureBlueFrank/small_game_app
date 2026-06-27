import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import appleImage from "./assets/fruits/apple.png";
import bananaImage from "./assets/fruits/banana.png";
import peachImage from "./assets/fruits/peach.png";
import pearImage from "./assets/fruits/pear.png";
import pineappleImage from "./assets/fruits/pineapple.png";
import watermelonImage from "./assets/fruits/watermelon.png";

const size = 8;
const candyTypes = 6;
const targetScore = 1800;
const startingMoves = 26;
const initialMessage = "交换相邻水果，连成三个或更多即可消除。";
const fruits = [
  { name: "苹果", image: appleImage },
  { name: "香蕉", image: bananaImage },
  { name: "菠萝", image: pineappleImage },
  { name: "梨子", image: pearImage },
  { name: "西瓜", image: watermelonImage },
  { name: "桃子", image: peachImage },
];

function randomCandy() {
  return Math.floor(Math.random() * candyTypes);
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function cellKey(row, col) {
  return `${row},${col}`;
}

function createBoard() {
  const nextBoard = Array.from({ length: size }, () => Array(size).fill(0));

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      let candy = randomCandy();
      while (
        (col >= 2 && nextBoard[row][col - 1] === candy && nextBoard[row][col - 2] === candy) ||
        (row >= 2 && nextBoard[row - 1][col] === candy && nextBoard[row - 2][col] === candy)
      ) {
        candy = randomCandy();
      }
      nextBoard[row][col] = candy;
    }
  }

  return nextBoard;
}

function findMatches(board) {
  const matches = new Set();

  for (let row = 0; row < size; row += 1) {
    let runStart = 0;
    for (let col = 1; col <= size; col += 1) {
      if (col < size && board[row][col] === board[row][runStart]) {
        continue;
      }
      if (col - runStart >= 3) {
        for (let matchCol = runStart; matchCol < col; matchCol += 1) {
          matches.add(cellKey(row, matchCol));
        }
      }
      runStart = col;
    }
  }

  for (let col = 0; col < size; col += 1) {
    let runStart = 0;
    for (let row = 1; row <= size; row += 1) {
      if (row < size && board[row][col] === board[runStart][col]) {
        continue;
      }
      if (row - runStart >= 3) {
        for (let matchRow = runStart; matchRow < row; matchRow += 1) {
          matches.add(cellKey(matchRow, col));
        }
      }
      runStart = row;
    }
  }

  return matches;
}

function removeMatches(board, matches) {
  const nextBoard = cloneBoard(board);

  matches.forEach((key) => {
    const [row, col] = key.split(",").map(Number);
    nextBoard[row][col] = null;
  });

  return nextBoard;
}

function dropCandies(board) {
  const nextBoard = cloneBoard(board);

  for (let col = 0; col < size; col += 1) {
    const remaining = [];

    for (let row = size - 1; row >= 0; row -= 1) {
      if (nextBoard[row][col] !== null) {
        remaining.push(nextBoard[row][col]);
      }
    }

    for (let row = size - 1; row >= 0; row -= 1) {
      nextBoard[row][col] = remaining[size - 1 - row] ?? randomCandy();
    }
  }

  return nextBoard;
}

function swapCells(board, first, second) {
  const nextBoard = cloneBoard(board);
  const temporary = nextBoard[first.row][first.col];
  nextBoard[first.row][first.col] = nextBoard[second.row][second.col];
  nextBoard[second.row][second.col] = temporary;
  return nextBoard;
}

function areNeighbors(first, second) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
}

function findPlayableMove(board) {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const current = { row, col };
      const neighbors = [
        { row: row + 1, col },
        { row, col: col + 1 },
      ];

      for (const neighbor of neighbors) {
        if (neighbor.row >= size || neighbor.col >= size) {
          continue;
        }

        const swapped = swapCells(board, current, neighbor);
        if (findMatches(swapped).size > 0) {
          return [current, neighbor];
        }
      }
    }
  }

  return null;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function isSameCell(first, second) {
  return first?.row === second.row && first?.col === second.col;
}

function App() {
  const [board, setBoard] = useState(() => createBoard());
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(startingMoves);
  const [busy, setBusy] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [message, setMessage] = useState(initialMessage);
  const [clearingCells, setClearingCells] = useState(() => new Set());
  const [hintCells, setHintCells] = useState(() => new Set());
  const [helpOpen, setHelpOpen] = useState(false);
  const closeHelpButtonRef = useRef(null);
  const helpButtonRef = useRef(null);
  const hintTimerRef = useRef(null);

  const gameOver = gameResult !== null;
  const progressWidth = Math.min(100, Math.round((score / targetScore) * 100));
  const candies = useMemo(
    () =>
      board.flatMap((rowValues, row) =>
        rowValues.map((kind, col) => ({
          key: cellKey(row, col),
          row,
          col,
          kind,
        })),
      ),
    [board],
  );

  const showHint = useCallback((nextBoard) => {
    const hint = findPlayableMove(nextBoard);

    if (!hint) {
      return;
    }

    setHintCells(new Set(hint.map(({ row, col }) => cellKey(row, col))));
    window.setTimeout(() => {
      setHintCells(new Set());
    }, 900);
  }, []);

  const startGame = useCallback(() => {
    const nextBoard = createBoard();
    window.clearTimeout(hintTimerRef.current);
    setBoard(nextBoard);
    setSelectedCell(null);
    setScore(0);
    setMoves(startingMoves);
    setBusy(false);
    setGameResult(null);
    setMessage(initialMessage);
    setClearingCells(new Set());
    setHintCells(new Set());
    hintTimerRef.current = window.setTimeout(() => showHint(nextBoard), 700);
  }, [showHint]);

  useEffect(() => {
    hintTimerRef.current = window.setTimeout(() => showHint(board), 700);

    return () => {
      window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!helpOpen) {
      return undefined;
    }

    closeHelpButtonRef.current?.focus();
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        helpButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [helpOpen]);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
    helpButtonRef.current?.focus();
  }, []);

  const checkGameState = useCallback((nextBoard, nextScore, nextMoves) => {
    if (nextScore >= targetScore) {
      setGameResult("won");
      return;
    }

    if (nextMoves <= 0) {
      setGameResult("lost");
      return;
    }

    if (!findPlayableMove(nextBoard)) {
      setMessage("棋盘没有可用交换，已自动刷新。");
      const refreshedBoard = createBoard();
      setBoard(refreshedBoard);
      return;
    }

    setMessage(`还剩 ${nextMoves} 步，继续冲目标分！`);
  }, []);

  const resolveBoard = useCallback(
    async (swappedBoard, initialMatches, nextMoves) => {
      let activeBoard = swappedBoard;
      let activeScore = score;
      let matches = initialMatches;
      let chain = 0;

      while (matches.size > 0) {
        chain += 1;
        const gained = matches.size * 40 * chain;
        activeScore += gained;
        setScore(activeScore);
        setMessage(chain === 1 ? `消除了 ${matches.size} 个水果，+${gained} 分。` : `连锁 x${chain}，+${gained} 分！`);
        setClearingCells(new Set(matches));
        setBoard(activeBoard);
        await wait(260);

        activeBoard = dropCandies(removeMatches(activeBoard, matches));
        setClearingCells(new Set());
        setBoard(activeBoard);
        await wait(180);
        matches = findMatches(activeBoard);
      }

      setBusy(false);
      checkGameState(activeBoard, activeScore, nextMoves);
    },
    [checkGameState, score],
  );

  const handleCandyClick = useCallback(
    async (row, col) => {
      if (busy || gameOver) {
        return;
      }

      const clicked = { row, col };

      if (!selectedCell) {
        setSelectedCell(clicked);
        return;
      }

      if (isSameCell(selectedCell, clicked)) {
        setSelectedCell(null);
        return;
      }

      if (!areNeighbors(selectedCell, clicked)) {
        setSelectedCell(clicked);
        setMessage("请选择相邻的水果进行交换。");
        return;
      }

      setBusy(true);
      const swappedBoard = swapCells(board, selectedCell, clicked);
      const matches = findMatches(swappedBoard);

      if (matches.size === 0) {
        setSelectedCell(null);
        setBoard(board);
        setMessage("这一步没有形成三连，换个位置试试。");
        await wait(130);
        setBusy(false);
        return;
      }

      const nextMoves = moves - 1;
      setMoves(nextMoves);
      setSelectedCell(null);
      setBoard(swappedBoard);
      await resolveBoard(swappedBoard, matches, nextMoves);
    },
    [board, busy, gameOver, moves, resolveBoard, selectedCell],
  );

  const resultTitle = gameResult === "won" ? "通关成功" : "差一点";
  const resultText = gameResult === "won" ? `你拿到了 ${score} 分。` : `最终分数 ${score}，再来一局肯定能过。`;

  return (
    <main className="game-shell">
      <section className="stage" aria-label="水果消消乐游戏">
        <div className="topbar">
          <div>
            <p className="eyebrow">Match 3</p>
            <h1>水果消消乐</h1>
          </div>
          <div className="toolbar" aria-label="游戏工具">
            <button
              ref={helpButtonRef}
              className="icon-button secondary"
              type="button"
              aria-label="游戏说明"
              title="游戏说明"
              onClick={() => setHelpOpen(true)}
            >
              <span aria-hidden="true">?</span>
            </button>
            <button className="icon-button" type="button" aria-label="重新开始" title="重新开始" onClick={startGame}>
              <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>

        <div className="score-strip" aria-label="游戏状态">
          <div className="meter">
            <span>分数</span>
            <strong>{score}</strong>
          </div>
          <div className="meter">
            <span>目标</span>
            <strong>{targetScore}</strong>
          </div>
          <div className="meter">
            <span>步数</span>
            <strong>{moves}</strong>
          </div>
        </div>

        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progressWidth}%` }} />
        </div>

        <div className="board-wrap">
          <div className="board" role="grid" aria-label="消除棋盘">
            {candies.map(({ key, row, col, kind }) => {
              const selected = selectedCell?.row === row && selectedCell?.col === col;
              const classNames = [
                "candy",
                selected ? "selected" : "",
                clearingCells.has(key) ? "clearing" : "",
                hintCells.has(key) ? "hint" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={key}
                  className={classNames}
                  type="button"
                  role="gridcell"
                  data-row={row}
                  data-col={col}
                  data-kind={kind}
                  aria-label={`第 ${row + 1} 行第 ${col + 1} 列${fruits[kind].name}`}
                  disabled={busy || gameOver}
                  onClick={() => handleCandyClick(row, col)}
                >
                  <img className="fruit-image" src={fruits[kind].image} alt="" draggable="false" />
                </button>
              );
            })}
          </div>

          {gameResult && (
            <div className="overlay">
              <div className="overlay-panel">
                <h2>{resultTitle}</h2>
                <p>{resultText}</p>
                <button className="primary-button" type="button" onClick={startGame}>
                  再来一局
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="message" aria-live="polite">
          {message}
        </div>
      </section>

      {helpOpen && (
        <div className="help-modal" role="dialog" aria-modal="true" aria-labelledby="helpTitle" onClick={(event) => event.target === event.currentTarget && closeHelp()}>
          <div className="help-card">
            <div className="help-head">
              <h2 id="helpTitle">游戏说明</h2>
              <button ref={closeHelpButtonRef} className="close-button" type="button" aria-label="关闭说明" title="关闭说明" onClick={closeHelp}>
                ×
              </button>
            </div>
            <div className="help-content">
              <div>
                <strong>怎么玩</strong>
                <p>点击两个相邻水果交换位置，横向或纵向连成 3 个及以上同种水果即可消除。</p>
              </div>
              <div>
                <strong>过关目标</strong>
                <p>在 26 步内拿到 1800 分。进度条会显示当前分数离目标还有多远。</p>
              </div>
              <div>
                <strong>计分规则</strong>
                <p>每个被消除的水果给 40 分。连续掉落产生连锁时，后续消除会获得更高倍率。</p>
              </div>
              <div>
                <strong>小提示</strong>
                <p>开局会短暂高亮一组可交换水果；棋盘无可用交换时会自动刷新。</p>
              </div>
            </div>
            <button className="primary-button" type="button" onClick={closeHelp}>
              开始玩
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
