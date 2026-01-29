const gridEl = document.getElementById("grid");
const msgEl = document.getElementById("msg");
const solveBtn = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");

const N = 6;
const BOX_R = 2; // 2 rows
const BOX_C = 3; // 3 cols

const sample = [
  [0, 0, 3, 0, 0, 6],
  [6, 0, 0, 0, 2, 0],
  [0, 6, 0, 0, 0, 5],
  [0, 0, 5, 6, 0, 0],
  [0, 1, 0, 0, 6, 0],
  [4, 0, 0, 2, 0, 0],
];

function setMsg(text) {
  msgEl.textContent = text;
}

function idx(r, c) {
  return r * N + c;
}

function buildGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const input = document.createElement("input");
      input.className = "cell";
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.dataset.r = String(r);
      input.dataset.c = String(c);

      // Thick borders to show 2x3 boxes
      if (c === 2) input.classList.add("sep-r");
      if (r === 1 || r === 3) input.classList.add("sep-b");

      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^1-6]/g, "");
        validateAndMark();
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
          input.value = "";
          input.classList.remove("given");
          validateAndMark();
        }
      });

      gridEl.appendChild(input);
    }
  }
}

function getInputs() {
  return [...gridEl.querySelectorAll(".cell")];
}

function readBoard() {
  const board = Array.from({ length: N }, () => Array(N).fill(0));
  for (const el of getInputs()) {
    const r = Number(el.dataset.r);
    const c = Number(el.dataset.c);
    const v = Number(el.value);
    board[r][c] = Number.isFinite(v) ? v : 0;
  }
  return board;
}

function writeBoard(board, keepGivens = true) {
  for (const el of getInputs()) {
    const r = Number(el.dataset.r);
    const c = Number(el.dataset.c);
    const v = board[r][c];
    if (v === 0) {
      el.value = "";
      if (!keepGivens) el.classList.remove("given");
    } else {
      el.value = String(v);
    }
  }
}

function markGivensFromCurrent() {
  for (const el of getInputs()) {
    if (el.value) el.classList.add("given");
    else el.classList.remove("given");
  }
}

function validAt(board, r, c, val) {
  for (let x = 0; x < N; x++) {
    if (x !== c && board[r][x] === val) return false;
    if (x !== r && board[x][c] === val) return false;
  }
  const br = Math.floor(r / BOX_R) * BOX_R;
  const bc = Math.floor(c / BOX_C) * BOX_C;
  for (let rr = br; rr < br + BOX_R; rr++) {
    for (let cc = bc; cc < bc + BOX_C; cc++) {
      if ((rr !== r || cc !== c) && board[rr][cc] === val) return false;
    }
  }
  return true;
}

function validateAndMark() {
  const board = readBoard();
  const inputs = getInputs();
  inputs.forEach((el) => el.classList.remove("bad"));

  let ok = true;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const v = board[r][c];
      if (!v) continue;
      if (!validAt(board, r, c, v)) {
        ok = false;
        inputs[idx(r, c)].classList.add("bad");
      }
    }
  }
  setMsg(ok ? "" : "There are conflicts (red cells). Fix them before solving.");
  return ok;
}

function findEmpty(board) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function solve(board) {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [r, c] = empty;

  for (let val = 1; val <= 6; val++) {
    board[r][c] = val;
    if (validAt(board, r, c, val) && solve(board)) return true;
    board[r][c] = 0;
  }
  return false;
}

function loadSample() {
  writeBoard(sample, false);
  markGivensFromCurrent();
  validateAndMark();
  setMsg("Sample loaded.");
}

function clearAll() {
  writeBoard(Array.from({ length: N }, () => Array(N).fill(0)), false);
  getInputs().forEach((el) => el.classList.remove("given", "bad"));
  setMsg("Cleared.");
}

solveBtn.addEventListener("click", () => {
  if (!validateAndMark()) return;
  const board = readBoard();
  const ok = solve(board);
  if (!ok) {
    setMsg("No solution found for this puzzle.");
    return;
  }
  writeBoard(board, true);
  setMsg("Solved.");
});

clearBtn.addEventListener("click", clearAll);
sampleBtn.addEventListener("click", loadSample);

buildGrid();
loadSample();

