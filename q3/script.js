const out = document.getElementById("out");
const expr = document.getElementById("expr");

let expression = "";
let entry = "0";

function render() {
  out.value = entry;
  expr.textContent = expression;
}

function isOperator(ch) {
  return ch === "+" || ch === "-" || ch === "*" || ch === "/";
}

function appendDigit(d) {
  if (entry === "0") entry = d;
  else entry += d;
  render();
}

function appendDot() {
  if (!entry.includes(".")) entry += ".";
  render();
}

function pushEntryToExpression() {
  if (entry === "" || entry === "-") return;
  if (expression && /[\d.)]$/.test(expression)) expression += " ";
  expression += entry;
  entry = "0";
}

function appendOperator(op) {
  // Ensure expression has a number before operator
  if (entry !== "0" || (expression === "" && entry !== "")) {
    pushEntryToExpression();
  }

  // Replace last operator if user taps operators repeatedly
  const trimmed = expression.trim();
  if (trimmed.length === 0) return;

  if (isOperator(trimmed.at(-1))) {
    expression = trimmed.slice(0, -1) + op;
  } else {
    expression = trimmed + op;
  }
  render();
}

function appendParen(which) {
  if (which === "open") {
    if (entry !== "0") pushEntryToExpression();
    expression = (expression.trim() + " (").trimStart();
  } else {
    if (entry !== "0") pushEntryToExpression();
    expression = (expression.trim() + ")").trimStart();
  }
  render();
}

function clearAll() {
  expression = "";
  entry = "0";
  render();
}

function clearEntry() {
  entry = "0";
  render();
}

function safeEval(exp) {
  // Only allow digits, ., whitespace, parentheses, and + - * /
  if (!/^[0-9+\-*/().\s]+$/.test(exp)) throw new Error("Invalid expression");
  // Prevent things like "**" or "//"
  if (/([*/+\-])\1+/.test(exp.replace(/\s+/g, ""))) {
    // allow "--" as part of negatives? keep simple for lab
  }
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${exp});`)();
}

function equals() {
  const full = (expression.trim() + " " + (entry !== "0" ? entry : "")).trim();
  if (!full) return;
  try {
    const val = safeEval(full);
    if (!Number.isFinite(val)) throw new Error("Math error");
    expression = full + " =";
    entry = String(val);
  } catch {
    expression = full;
    entry = "Error";
  }
  render();
}

document.querySelectorAll(".key").forEach((btn) => {
  btn.addEventListener("click", () => {
    const num = btn.getAttribute("data-num");
    const op = btn.getAttribute("data-op");
    const action = btn.getAttribute("data-action");

    if (num != null) return appendDigit(num);
    if (op != null) return appendOperator(op);

    if (action === "dot") return appendDot();
    if (action === "ce") return clearEntry();
    if (action === "c") return clearAll();
    if (action === "equals") return equals();
    if (action === "paren-open") return appendParen("open");
    if (action === "paren-close") return appendParen("close");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") return appendDigit(e.key);
  if (e.key === ".") return appendDot();
  if (e.key === "Enter") return equals();
  if (e.key === "Escape") return clearAll();
  if (e.key === "Backspace") return clearEntry();
  if (e.key === "(") return appendParen("open");
  if (e.key === ")") return appendParen("close");
  if (["+", "-", "*", "/"].includes(e.key)) return appendOperator(e.key);
});

render();

