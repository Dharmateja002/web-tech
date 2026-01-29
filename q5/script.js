const ayEl = document.getElementById("ay");
const categoryEl = document.getElementById("category");
const resEl = document.getElementById("res");
const incomeEl = document.getElementById("income");
const calcBtn = document.getElementById("calcBtn");
const resetBtn = document.getElementById("resetBtn");
const msgEl = document.getElementById("msg");

const taxEl = document.getElementById("tax");
const surchargeEl = document.getElementById("surcharge");
const cessEl = document.getElementById("cess");
const totalEl = document.getElementById("total");

// Demo slabs (old-regime style). Adjust as your lab expects.
// Each slab: [uptoInclusive, rate]
const slabsByCategory = {
  general: [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.20],
    [Infinity, 0.30],
  ],
  senior: [
    [300000, 0],
    [500000, 0.05],
    [1000000, 0.20],
    [Infinity, 0.30],
  ],
  super_senior: [
    [500000, 0],
    [1000000, 0.20],
    [Infinity, 0.30],
  ],
};

function fmtINR(n) {
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })
  );
}

function setMsg(t) {
  msgEl.textContent = t;
}

function computeSlabTax(income, slabs) {
  let tax = 0;
  let prev = 0;
  for (const [upto, rate] of slabs) {
    const band = Math.min(income, upto) - prev;
    if (band > 0) tax += band * rate;
    prev = upto;
    if (income <= upto) break;
  }
  return tax;
}

function computeSurcharge(tax, income) {
  // Simple demo surcharge tiers (not exhaustive).
  // You can change/remove this if not needed.
  if (income > 50000000) return tax * 0.37;
  if (income > 20000000) return tax * 0.25;
  if (income > 10000000) return tax * 0.15;
  if (income > 5000000) return tax * 0.10;
  return 0;
}

function compute() {
  const income = Number(incomeEl.value);
  if (!Number.isFinite(income) || income < 0) {
    setMsg("Enter a valid income (>= 0).");
    return;
  }

  // For lab: treat "non-resident" same slabs (simplified)
  const _ay = ayEl.value;
  const _res = resEl.value;
  const category = categoryEl.value;
  void _ay;
  void _res;

  const slabs = slabsByCategory[category] || slabsByCategory.general;

  const baseTax = Math.round(computeSlabTax(income, slabs));
  const surcharge = Math.round(computeSurcharge(baseTax, income));
  const cess = Math.round((baseTax + surcharge) * 0.04);
  const total = baseTax + surcharge + cess;

  taxEl.textContent = fmtINR(baseTax);
  surchargeEl.textContent = fmtINR(surcharge);
  cessEl.textContent = fmtINR(cess);
  totalEl.textContent = fmtINR(total);

  setMsg("Calculated.");
}

function resetAll() {
  incomeEl.value = "";
  taxEl.textContent = "₹0";
  surchargeEl.textContent = "₹0";
  cessEl.textContent = "₹0";
  totalEl.textContent = "₹0";
  setMsg("Reset.");
}

calcBtn.addEventListener("click", compute);
resetBtn.addEventListener("click", resetAll);

// small demo default
incomeEl.value = "850000";
compute();

