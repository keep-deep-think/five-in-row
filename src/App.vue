<template>
  <div class="player-box">
    <div class="avatar-box front">
      <LoadingOutlined :class="['wait', avatarStatus(true)]" />
      <UserAddOutlined class="avatar" />
    </div>

    <a-select
      v-model:value="priorityMoveRole"
      :disabled="btnName === '对战中...'"
      placeholder="请选择谁先走"
      style="width: 140px; text-align: left">
      <a-select-option value="human">人先走</a-select-option>
      <a-select-option value="computer">电脑先走</a-select-option>
    </a-select>
    <a-button type="primary" :loading="loading" @click="matchPlayer">{{ btnName }}</a-button>

    <div class="avatar-box back">
      <LoadingOutlined :class="['wait', avatarStatus(false)]" />
      <UserDeleteOutlined class="avatar" />
    </div>
  </div>

  <div style="margin-bottom: 10px">
    <div v-if="winnerMsg">{{ winnerMsg }}</div>
    <div v-else-if="gameStart && priorityMoveRole">
      给人分配的是
      <span
        class="text-highlight"
        :style="{ color: priorityMoveRole === 'human' ? FrontChessColor : BackChessColor }"
        >{{ priorityMoveRole === "human" ? "黑棋" : "绿棋" }}</span
      >
      ，现在该
      <span class="text-highlight" :style="{ color: placeWaitColor.textColor }">{{ placeWaitColor.text }}</span>
      走了
    </div>
  </div>

  <div id="js-chessboard" class="chess-board">
    <div v-for="(chess, index) in board" class="chess-grid" :key="index">
      <div @click="placeChess(index)" :class="['chess-cell', chessColor(chess)]"></div>
    </div>
  </div>
  <div id="js-follow-mouse-chess" class="follow-mouse"></div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { LoadingOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons-vue";
import { findBestMove } from "./computer";

onMounted(() => {
  // setMouseFollowChess();
});

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout);
});

const loading = ref(false);

const btnName = ref("开始游戏");
const chessColor = computed(() => (chess) => {
  return {
    1: "front",
    2: "back",
    0: "",
  }[chess];
});

const avatarStatus = computed(() => (isFront) => {
  let condition = btnName.value === "对战中..." && winnerMsg.value === "";
  if (isFront) {
    if (priorityMoveRole.value === "human") {
      return activePlayer.value === "human" && condition ? "active" : "";
    } else {
      return activePlayer.value === "computer" && condition ? "active" : "";
    }
  } else {
    if (priorityMoveRole.value === "human") {
      return activePlayer.value === "computer" && condition ? "active" : "";
    } else {
      return activePlayer.value === "human" && condition ? "active" : "";
    }
  }
});

const placeWaitColor = computed(() => {
  if (priorityMoveRole.value === "human") {
    return {
      textColor: activePlayer.value === "human" ? FrontChessColor : BackChessColor,
      text: activePlayer.value === "human" ? "黑棋" : "绿棋",
    };
  } else {
    return {
      textColor: activePlayer.value === "human" ? BackChessColor : FrontChessColor,
      text: activePlayer.value === "human" ? "绿棋" : "黑棋",
    };
  }
});

// 设置优先走棋的玩家,默认是人类
const priorityMoveRole = ref(undefined);
// 轮到落子的一方
const activePlayer = ref("");
// 获胜方
const winnerMsg = ref("");

// 棋盘的行数和列数-因为棋盘的最后一行和一列会被隐藏,所以假设BOARD_SIZE=16时,实际的棋盘大小是15*15=225
const Board_Size = 16;
const FrontChessColor = "black";
const BackChessColor = "#52c41a";

// 初始化棋盘数组,没放置黑白棋子时值初始化为0
const board = ref(Array(Board_Size * Board_Size).fill(0));

// 开始游戏
const gameStart = ref(false);
const matchPlayer = () => {
  if (btnName.value === "对战中...") {
    btnName.value = "再玩一局";
    gameStart.value = false;
    resetChess();
    return;
  }

  gameStart.value = true;
  // 设置先落子的角色
  activePlayer.value = priorityMoveRole.value;
  resetChess();

  if (priorityMoveRole.value === "computer") {
    // 初始化AI落子位置
    const aiInitPlaceIndex = 7 * 16 + 7;
    board.value[aiInitPlaceIndex] = 1;
    activePlayer.value = "computer";
    playerPlaceChess(aiInitPlaceIndex);
  }

  btnName.value = "对战中...";
};

const resetChess = () => {
  if (timeout) clearTimeout(timeout);
  // 清空获胜消息
  winnerMsg.value = "";
  board.value = Array(Board_Size * Board_Size).fill(0);
};

let timeout = 0;
// 放置棋子
const placeChess = (index) => {
  // console.log(index, board.value[index], winnerMsg.value);
  // 放置条件--正在下棋的过程中+该点位未落过棋子+轮到己方落子
  if (winnerMsg.value === "" && board.value[index] === 0 && btnName.value === "对战中...") {
    // 设置落子位置
    if (priorityMoveRole.value === "human") {
      if (activePlayer.value === "human") {
        board.value[index] = 1;
        playerPlaceChess(index);

        if (winnerMsg.value === "") {
          timeout = setTimeout(() => {
            let bestMove = findBestMove(board.value, 2);
            board.value[bestMove] = 2;
            playerPlaceChess(bestMove);
          }, 100);
        }
      }
    } else {
      if (activePlayer.value === "human") {
        board.value[index] = 2;
        playerPlaceChess(index);

        if (winnerMsg.value === "") {
          timeout = setTimeout(() => {
            let bestMove = findBestMove(board.value, 1);
            board.value[bestMove] = 1;
            playerPlaceChess(bestMove);
          }, 100);
        }
      }
    }
  }
};

const playerPlaceChess = (index) => {
  drawPlaceChess(index);
  activePlayer.value = activePlayer.value === "human" ? "computer" : "human";
  checkWinner(index);
};

const drawPlaceChess = (index) => {
  // 棋盘上显示棋子
  const chess = document.createElement("div");
  chess.classList.add("chess");
  chess.classList.add(activePlayer.value);
  chess.style.left = `${(index % 15) * 40}px`;
  chess.style.top = `${Math.floor(index / 15) * 40}px`;

  // activePlayer.value = "computer";
  followMouseChess?.classList.remove("show");
};

// 设置棋盘上鼠标移动时棋子跟随效果
let followMouseChess;
const setMouseFollowChess = () => {
  const chessBoardArea = document.getElementById("js-chessboard");
  const rect = chessBoardArea.getBoundingClientRect();
  followMouseChess = document.getElementById("js-follow-mouse-chess");
  // 添加鼠标移动事件监听器，限定在棋盘区域内
  document.addEventListener("mousemove", function (event) {
    // 还未分配角色 || 该对方走棋了 || 或者某方获胜了
    if (priorityMoveRole.value === "" || winnerMsg.value || priorityMoveRole.value !== activePlayer.value) return;
    // 检查鼠标是否在棋盘区域内
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      // 更新自定义形状的位置
      followMouseChess?.classList.add("show");
      followMouseChess.style.left = `${event.clientX - 10}px`; // 减去一半宽度以居中
      followMouseChess.style.top = `${event.clientY - 10}px`; // 减去一半高度以居中
      followMouseChess.style.backgroundColor = priorityMoveRole.value === "human" ? FrontChessColor : BackChessColor;
    } else {
      // 如果鼠标移出棋盘区域，隐藏跟随鼠标棋子
      followMouseChess?.classList.remove("show");
    }
  });
};

// 检测正在下棋的一方是否获胜
const checkWinner = (index) => {
  const player = board.value[index];
  // 计算所放棋子所在的行列索引
  const row = Math.floor(index / Board_Size);
  const col = index % Board_Size;

  // 检查落子点所在行是否存在五子连珠
  const rowLine = board.value.slice(row * Board_Size, row * Board_Size + Board_Size);

  // console.log({ rowLine, player });
  if (checkFiveChessConnected(rowLine, player)) {
    return sendWinMsg(player);
  }

  // 检查落子点所在列是否存在五子连珠
  const colLine = [];
  for (let i = 0; i < Board_Size; i++) {
    colLine.push(board.value[i * Board_Size + col]);
  }

  if (checkFiveChessConnected(colLine, player)) {
    return sendWinMsg(player);
  }

  // 检查落子点所在对角线是否存在五子连珠
  const diagonalIndex = calcDiagonalIndex(row, col, index, Board_Size);
  // console.log(diagonalIndex);

  // 检查左上右下对角线是否存在五子连珠
  if (
    checkFiveChessConnected(
      diagonalIndex.left.map((itemIndex) => board.value[itemIndex]),
      player
    )
  ) {
    return sendWinMsg(player);
  }

  // console.log(index, diagonalIndex, player);

  // 检查右上左下对角线是否存在五子连珠
  if (
    checkFiveChessConnected(
      diagonalIndex.right.map((itemIndex) => board.value[itemIndex]),
      player
    )
  ) {
    return sendWinMsg(player);
  }

  // 平局检测-因为黑子先下有优势,如何棋子落满棋盘,仍是平局,判断后落子的胜
  // if (board.value.includes(0) === false) {
  //   sendWinMsg(2);
  // }
};
const sendWinMsg = (player) => {
  if (priorityMoveRole.value === "human") {
    winnerMsg.value = `${player === 1 ? "人" : "AI"}赢了!`;
  } else {
    winnerMsg.value = `${player === 1 ? "AI" : "人"}赢了!`;
  }
  message.success(winnerMsg.value);
  btnName.value = "再玩一局";
};

// 检查某个方向是否出现五子连珠
const checkFiveChessConnected = (line, player) => {
  if (line.length < 5) return false;

  for (let i = 0; i < line.length - 4; i++) {
    // console.log("checkFiveChessConnected", line.slice(i, i + 5));
    if (line.slice(i, i + 5).every((cell) => cell === player)) {
      return true;
    }
  }
  return false;
};

/**
 * 计算落子点对角线索引
 * @param {落子点的行号} row
 * @param {落子点的列号} col
 * @param {落子点在棋盘上的索引} placeIndex
 * @param {棋盘规格} boardSize
 */
function calcDiagonalIndex(row, col, placeIndex, boardSize) {
  /**
   * 计算某个基准点的左上，右上，左下，右下对角线上的落子点索引
   * @param {对角线计算基准点的行号} startRow
   * @param {对角线计算基准点的列号} startCol
   * @param {行的自增方向} directionRow
   * @param {列的自增方向} directionCol
   * @param {棋盘规格} boardSize
   */
  const getDiagIndex = (startRow, startCol, directionRow, directionCol, boardSize) => {
    const indexArr = [];
    let curRow = startRow + directionRow;
    let curCol = startCol + directionCol;

    while (curRow >= 0 && curCol >= 0 && curRow < boardSize && curCol < boardSize) {
      indexArr.push(curRow * boardSize + curCol);
      curRow += directionRow;
      curCol += directionCol;
    }

    return indexArr;
  };

  // 左上对角线落子点
  const leftTopDiag = getDiagIndex(row, col, -1, -1, boardSize);
  // 右下对角线落子点
  const rightBottomDiag = getDiagIndex(row, col, 1, 1, boardSize);

  // 右上对角线落子点
  const rightTopDiag = getDiagIndex(row, col, -1, 1, boardSize);

  // 左下对角线落子点
  const leftBottomDiag = getDiagIndex(row, col, 1, -1, boardSize);

  return {
    left: [...leftTopDiag.reverse(), placeIndex, ...rightBottomDiag],
    right: [...rightTopDiag.reverse(), placeIndex, ...leftBottomDiag],
  };
}
</script>
<style lang="less">
.player-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .avatar-box {
    position: relative;
    width: 60px;
    height: 60px;

    &.front {
      & > .wait,
      & > .avatar {
        color: v-bind(FrontChessColor);
      }
    }
    &.back {
      & > .wait,
      & > .avatar {
        color: v-bind(BackChessColor);
      }
    }

    .wait,
    .avatar {
      position: absolute;
    }

    .wait {
      font-size: 60px;
      z-index: 1;
      display: none;
      &.active {
        display: block;
      }
    }

    .avatar {
      left: 10px;
      top: 7px;
      font-size: 40px;
      z-index: 2;
    }
  }
}

.text-highlight {
  font-size: 18px;
  font-weight: bold;
}

.chess-board {
  display: grid;
  grid-template-columns: repeat(v-bind(Board_Size), 1fr);
  grid-gap: 1px;
  background-color: #d18b47;
  padding: 8px;
  width: fit-content;
  margin: 0 auto;
  .chess-grid {
    width: 30px;
    height: 30px;
    background-color: #f9d16b;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    // 隐藏最后一列和最后一行超出棋盘边界的棋子
    &:nth-child(16n),
    &:nth-child(n + 240) {
      & > .chess-cell {
        display: none;
      }
    }

    & > .chess-cell {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      position: absolute;
      right: -10px;
      bottom: -10px;
      z-index: 1;

      &.front {
        background-color: v-bind(FrontChessColor);
      }

      &.back {
        background-color: v-bind(BackChessColor);
      }
    }
  }
}

.follow-mouse {
  position: absolute;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  /* 防止遮挡鼠标事件 */
  pointer-events: none;
  display: none;
  &.show {
    display: block;
  }
}
</style>
./computer-bak
