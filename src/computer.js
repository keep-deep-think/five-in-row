const BOARD_SIZE = 15; // 棋盘为 15x15

export function findBestMove(board, player) {
  let bestMove = -1;
  let bestValue = player === 1 ? -Infinity : Infinity;

  // 只考虑已有棋子的周围位置
  let candidateMoves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== 0) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          let newRow = Math.floor(i / BOARD_SIZE) + j;
          let newCol = (i % BOARD_SIZE) + k;
          let newIndex = newRow * BOARD_SIZE + newCol;
          if (
            newRow >= 0 &&
            newRow < BOARD_SIZE &&
            newCol >= 0 &&
            newCol < BOARD_SIZE &&
            board[newIndex] === 0 &&
            !candidateMoves.includes(newIndex)
          ) {
            candidateMoves.push(newIndex);
          }
        }
      }
    }
  }

  for (let i = 0; i < candidateMoves.length; i++) {
    let move = candidateMoves[i];
    board[move] = player;
    let moveValue = minimax(board, 2, player === 1, -Infinity, Infinity); // 使用较浅的深度
    board[move] = 0;

    if ((player === 1 && moveValue > bestValue) || (player === 2 && moveValue < bestValue)) {
      bestMove = move;
      bestValue = moveValue;
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
  let score = evaluate(board, isMaximizingPlayer ? 1 : 2);

  if (score === Infinity || score === -Infinity || depth === 0) {
    return score;
  }

  let best;
  if (isMaximizingPlayer) {
    best = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === 0) {
        // 空位
        board[i] = 1;
        best = Math.max(best, minimax(board, depth - 1, false, alpha, beta));
        board[i] = 0;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) {
          break;
        }
      }
    }
  } else {
    best = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === 0) {
        // 空位
        board[i] = 2;
        best = Math.min(best, minimax(board, depth - 1, true, alpha, beta));
        board[i] = 0;
        beta = Math.min(beta, best);
        if (beta <= alpha) {
          break;
        }
      }
    }
  }

  return best;
}

function evaluate(board, player) {
  let score = 0;

  // 遍历整个棋盘，计算行、列、两个对角线的分数
  for (let i = 0; i < BOARD_SIZE; i++) {
    // 行检查
    score += evaluateLine(board, i * BOARD_SIZE, 1, player);
    // 列检查
    score += evaluateLine(board, i, BOARD_SIZE, player);
  }

  // 对角线检查
  for (let i = 0; i <= BOARD_SIZE - 5; i++) {
    score += evaluateLine(board, i * BOARD_SIZE, BOARD_SIZE + 1, player); // 主对角线
    score += evaluateLine(board, i, BOARD_SIZE - 1, player); // 副对角线
  }

  return score;
}

function evaluateLine(board, startIndex, step, player) {
  let score = 0;
  let count = 0;
  let blockCount = 0;

  for (let i = 0; i < 5; i++) {
    const index = startIndex + i * step;
    if (board[index] === player) {
      count++;
    } else if (board[index] !== 0) {
      blockCount++;
    }
  }

  // 评分逻辑：根据 count 和 blockCount 来计算分数
  if (count === 5) {
    score += 100000; // 五连
  } else if (count === 4 && blockCount === 0) {
    score += 10000; // 活四
  } else if (count === 3 && blockCount === 0) {
    score += 100; // 活三
  } else if (count === 3 && blockCount === 1) {
    score += 10; // 眠三
  } else if (count === 2 && blockCount === 0) {
    score += 5; // 活二
  } else if (count === 4 && blockCount === 1) {
    score += 1000; // 眠四
  }

  return score;
}
// 辅助函数，将一维数组索引转换为行列
function getRowCol(index) {
  return {
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
  };
}
