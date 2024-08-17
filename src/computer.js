/**
 * 电脑下棋算法
 */
const ChessSize = 15;
// 保存棋盘位置的分数
let score = [];
for (let i = 0; i < ChessSize; i++) {
  score[i] = [];
}

// 电脑下棋
export function findBestMove(board, computerIsFirst) {
  let goalX = -1,
    goalY = -1;
  const chessPlace = convertArray(board, ChessSize + 1);
  // 初始化score评分组
  for (let i = 0; i < ChessSize; i++) {
    for (let j = 0; j < ChessSize; j++) {
      score[i][j] = 0;
    }
  }
  // 五元组中黑棋(先手)落子数量
  let frontNum = 0;
  // 五元组中白棋(后手)落子数量
  let backNum = 0;
  // 五元组临时得分
  let tempScore = 0;
  // 最大得分
  let maxScore = -1;

  // 横向寻找
  for (let i = 0; i < ChessSize; i++) {
    for (let j = 0; j < ChessSize - 4; j++) {
      for (let k = 0; k < j + 5; k++) {
        // 如果是玩家落得子
        if (chessPlace[i][k] == 1) {
          frontNum++;
        } else if (chessPlace[i][k] == 2) {
          //如果是电脑落子
          backNum++;
        }
      }
      // 将每一个五元组中的黑棋和白棋个数传入评分表中
      tempScore = chessScore(frontNum, backNum, computerIsFirst);
      // 为该五元组的每个位置添加分数
      for (let k = j; k < j + 5; k++) {
        score[i][k] += tempScore;
      }
      // 清空五元组中棋子数量和瞬时分数值
      frontNum = 0;
      backNum = 0;
      tempScore = 0;
    }
  }

  // 纵向寻找
  for (let i = 0; i < ChessSize; i++) {
    for (let j = 0; j < ChessSize - 4; j++) {
      for (let k = j; k < j + 5; k++) {
        // 统计横向先手的棋子数量
        if (chessPlace[k][i] == 1) {
          frontNum++;
        } else if (chessPlace[k][i] == 2) {
          // 统计横向后手的棋子数量
          backNum++;
        }
      }

      // 将每一个五元组中的黑棋和白棋个数传入评分表中
      tempScore = chessScore(frontNum, backNum, computerIsFirst);
      // 为该五元组的每个位置添加分数
      for (let k = j; k < j + 5; k++) {
        score[k][i] += tempScore;
      }
      // 清空五元组中棋子数量和五元组临时得分
      frontNum = 0;
      backNum = 0;
      tempScore = 0;
    }
  }

  // 反斜线寻找

  // 反斜线上侧部分
  for (let i = ChessSize - 1; i >= 4; i--) {
    for (let k = i, j = 0; j < ChessSize && k >= 0; j++, k--) {
      let m = k; //x 14 13
      let n = j; //y 0  1
      for (; m > k - 5 && k - 5 >= -1; m--, n++) {
        // 如果是玩家落得子
        if (chessPlace[m][n] == 1) {
          frontNum++;
        } else if (chessPlace[m][n] == 2) {
          //如果是电脑落子
          backNum++;
        }
      }
      // 注意在斜向判断时，可能出现构不成五元组（靠近棋盘的四个顶角）的情况，所以要忽略这种情况
      if (m == k - 5) {
        // 将每一个五元组中的黑棋和白棋个数传入评分表中
        tempScore = chessScore(frontNum, backNum, computerIsFirst);
        // 为该五元组的每个位置添加分数
        for (m = k, n = j; m > k - 5; m--, n++) {
          score[m][n] += tempScore;
        }
      }
      // 清空五元组中棋子数量和五元组临时得分
      frontNum = 0;
      backNum = 0;
      tempScore = 0;
    }
  }
  // 反斜线下侧部分
  for (let i = 1; i < 15; i++) {
    for (let k = i, j = ChessSize - 1; j >= 0 && k < 15; j--, k++) {
      let m = k; //y 1
      let n = j; //x 14
      for (; m < k + 5 && k + 5 <= 15; m++, n--) {
        // 如果是玩家落得子
        if (chessPlace[n][m] == 1) {
          frontNum++;
        } else if (chessPlace[n][m] == 2) {
          //如果是电脑落子
          backNum++;
        }
      }
      // 注意在斜向判断时，可能出现构不成五元组（靠近棋盘的四个顶角）的情况，所以要忽略这种情况
      if (m == k + 5) {
        // 将每一个五元组中的黑棋和白棋个数传入评分表 中
        tempScore = chessScore(frontNum, backNum, computerIsFirst);
        // 为该五元组的每个位置添加分数
        for (m = k, n = j; m < k + 5; m++, n--) {
          score[n][m] += tempScore;
        }
      }
      // 清空五元组中棋子数量和五元组临时得分
      frontNum = 0;
      backNum = 0;
      tempScore = 0;
    }
  }

  // 正斜线寻找

  // 正斜线上侧部分
  for (let i = 0; i < ChessSize - 1; i++) {
    for (let k = i, j = 0; j < ChessSize && k < ChessSize; j++, k++) {
      let m = k;
      let n = j;
      for (; m < k + 5 && k + 5 <= ChessSize; m++, n++) {
        // 如果是玩家落得子
        if (chessPlace[m][n] == 1) {
          frontNum++;
        } else if (chessPlace[m][n] == 2) {
          //如果是电脑落子
          backNum++;
        }
      }
      // 注意在斜向判断时，可能出现构不成五元组（靠近棋盘的四个顶角）的情况，所以要忽略这种情况
      if (m == k + 5) {
        // 将每一个五元组中的黑棋和白棋个数传入评分表中
        tempScore = chessScore(frontNum, backNum, computerIsFirst);
        // 为该五元组的每个位置添加分数
        for (m = k, n = j; m < k + 5; m++, n++) {
          score[m][n] += tempScore;
        }
      }
      // 清空五元组中棋子数量和五元组临时得分
      frontNum = 0;
      backNum = 0;
      tempScore = 0;
    }
  }

  // 正斜线下侧部分
  for (let i = 1; i < ChessSize - 4; i++) {
    for (let k = i, j = 0; j < ChessSize && k < ChessSize; j++, k++) {
      let m = k;
      let n = j;
      for (; m < k + 5 && k + 5 <= ChessSize; m++, n++) {
        // 如果是玩家落得子
        if (chessPlace[n][m] == 1) {
          frontNum++;
        } else if (chessPlace[n][m] == 2) {
          //如果是电脑落子
          backNum++;
        }
      }
      // 注意在斜向判断时，可能出现构不成五元组（靠近棋盘的四个顶角）的情况，所以要忽略这种情况
      if (m == k + 5) {
        // 将每一个五元组中的黑棋和白棋个数传入评分表中
        tempScore = chessScore(frontNum, backNum, computerIsFirst);
        // 为该五元组的每个位置添加分数
        for (m = k, n = j; m < k + 5; m++, n++) {
          score[n][m] += tempScore;
        }
      }
      // 清空五元组中棋子数量和五元组临时得分
      frontNum = 0;
      backNum = 0;
      tempScore = 0;
    }
  }

  // 从空位置中找到得分最大的位置
  for (let i = 0; i < ChessSize; i++) {
    for (let j = 0; j < ChessSize; j++) {
      if (chessPlace[i][j] == 0 && score[i][j] > maxScore) {
        goalX = i;
        goalY = j;
        maxScore = score[i][j];
      }
    }
  }
  if (goalX != -1 && goalY != -1 && chessPlace[goalX][goalY] == 0) {
    // 落子
    return goalX * 16 + goalY;
  }
}

// 五元组评分表
function chessScore(playerNum, computerNum, computerIsFirst) {
  // 机器进攻

  // 1.既有人类落子，又有机器落子，判分为0
  if (playerNum > 0 && computerNum > 0) {
    return 0;
  }
  // 2.全部为空没有棋子，判分为7
  if (playerNum == 0 && computerNum == 0) {
    return 7;
  }

  // 这个评分表预设电脑是后手, 得出的结果才对电脑有利
  // 当机器先走时，要互换一下角色,得出的结果才是对电脑有利
  if (computerIsFirst == true) {
    let temp = playerNum;
    playerNum = computerNum;
    computerNum = temp;
  }

  // 3.机器落一子，判分为35
  if (computerNum == 1) {
    return 35;
  }
  // 4.机器落两子，判分为800
  if (computerNum == 2) {
    return 800;
  }
  // 5.机器落三子，判分为15000
  if (computerNum == 3) {
    return 15000;
  }
  // 6.机器落四子，判分为800000
  if (computerNum == 4) {
    return 800000;
  }

  // 机器防守
  // 7.玩家落一子，判分为15
  if (playerNum == 1) {
    return 15;
  }
  // 8.玩家落两子，判分为400
  if (playerNum == 2) {
    return 400;
  }
  // 9.玩家落三子，判分为1800
  if (playerNum == 3) {
    return 1800;
  }
  // 10.玩家落四子，判分为100000
  if (playerNum == 4) {
    return 100000;
  }

  return -1; //如果是其他情况，则出现错误，不会执行该段代码
}

function convertArray(oneDimArray, size) {
  // 确保输入数组的长度符合要求
  if (oneDimArray.length !== size * size) {
    throw new Error("输入的一维数组长度与指定的尺寸不匹配");
  }

  // 将一维数组转换为二维数组
  const twoDimArray = [];
  for (let i = 0; i < size; i++) {
    twoDimArray.push(oneDimArray.slice(i * size, (i + 1) * size));
  }

  // 去掉最后一行和最后一列
  const trimmedArray = [];
  for (let i = 0; i < size - 1; i++) {
    trimmedArray.push(twoDimArray[i].slice(0, size - 1));
  }

  return trimmedArray;
}
