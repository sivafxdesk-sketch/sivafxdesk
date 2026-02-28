const macroDatabase = {
  'grilled chicken rice bowl': { calories: 520, protein: 42, carbs: 53, fats: 14, fiber: 5, sugar: 4 },
  'paneer tikka wrap': { calories: 610, protein: 31, carbs: 48, fats: 29, fiber: 7, sugar: 6 },
  'salmon quinoa salad': { calories: 470, protein: 36, carbs: 34, fats: 20, fiber: 8, sugar: 5 },
  'oats banana shake': { calories: 390, protein: 17, carbs: 61, fats: 8, fiber: 6, sugar: 22 }
};

const goalsByMode = {
  cut: { calories: 2100, protein: 170, carbs: 180, fats: 60 },
  maintain: { calories: 2400, protein: 160, carbs: 240, fats: 72 },
  bulk: { calories: 2900, protein: 185, carbs: 340, fats: 86 }
};

const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

const ids = {
  calories: ['caloriesVal', 'caloriesBar', 'calorieGoal'],
  protein: ['proteinVal', 'proteinBar', 'proteinGoal'],
  carbs: ['carbsVal', 'carbsBar', 'carbsGoal'],
  fats: ['fatsVal', 'fatsBar', 'fatsGoal']
};

function findMeal(keyword) {
  const key = keyword.trim().toLowerCase();
  if (!key) return macroDatabase['grilled chicken rice bowl'];
  const direct = macroDatabase[key];
  if (direct) return direct;

  const fuzzy = Object.keys(macroDatabase).find((name) => key.includes(name.split(' ')[0]));
  return fuzzy ? macroDatabase[fuzzy] : macroDatabase['grilled chicken rice bowl'];
}

function updateMacroUI(goals) {
  Object.entries(ids).forEach(([macro, [valueId, barId, goalId]]) => {
    document.getElementById(valueId).textContent = Math.round(totals[macro]);
    document.getElementById(goalId).textContent = goals[macro];
    const pct = Math.min((totals[macro] / goals[macro]) * 100, 100);
    document.getElementById(barId).style.width = `${pct}%`;
  });

  const compliance = Math.min(Math.round((totals.protein / goals.protein) * 100), 100);
  document.querySelector('.ring').style.setProperty('--p', compliance);
  document.getElementById('complianceVal').textContent = `${compliance}%`;
}

function renderInsights(mealData, goals) {
  const deficit = goals.calories - totals.calories;
  const messages = [
    deficit > 0
      ? `You are ${Math.round(deficit)} kcal below target. Good for controlled ${document.getElementById('goalMode').value === 'cut' ? 'cutting' : 'progression'} if energy is stable.`
      : `You are ${Math.abs(Math.round(deficit))} kcal above target. Add a 20-minute incline walk or lower fats in next meal.`,
    mealData.protein < 30
      ? 'Meal protein is moderate. Add greek yogurt, egg whites, or whey to improve muscle recovery.'
      : 'Strong protein quality detected. This supports muscle retention and satiety.',
    mealData.fiber < 7
      ? 'Fiber is low. Include vegetables or chia seeds for gut health and appetite control.'
      : 'Great fiber score. Digestive profile looks athlete-friendly.'
  ];

  const container = document.getElementById('coachInsights');
  container.innerHTML = messages
    .map((message) => `<div class="insight-item">${message}</div>`)
    .join('');
}

function analyzeMeal({ keyword, grams, mode }) {
  const meal = findMeal(keyword);
  const multiplier = grams / 300;
  const mealData = Object.fromEntries(
    Object.entries(meal).map(([k, v]) => [k, Number((v * multiplier).toFixed(1))])
  );

  totals.calories += mealData.calories;
  totals.protein += mealData.protein;
  totals.carbs += mealData.carbs;
  totals.fats += mealData.fats;

  const goals = goalsByMode[mode];
  updateMacroUI(goals);
  renderInsights(mealData, goals);

  document.getElementById('scanResult').innerHTML = `
    <strong>Scan complete:</strong> ${keyword || 'grilled chicken rice bowl'} (${grams}g)<br>
    Calories: <strong>${mealData.calories}</strong> kcal •
    Protein: <strong>${mealData.protein}g</strong> •
    Carbs: <strong>${mealData.carbs}g</strong> •
    Fats: <strong>${mealData.fats}g</strong> •
    Fiber: <strong>${mealData.fiber}g</strong> •
    Sugar: <strong>${mealData.sugar}g</strong>
  `;
}

document.getElementById('macroForm').addEventListener('submit', (event) => {
  event.preventDefault();
  analyzeMeal({
    keyword: document.getElementById('foodKeyword').value,
    grams: Number(document.getElementById('servingSize').value || 300),
    mode: document.getElementById('goalMode').value
  });
  document.getElementById('meals').textContent = String(Number(document.getElementById('meals').textContent) + 1);
});

document.getElementById('demoScan').addEventListener('click', () => {
  document.getElementById('foodKeyword').value = 'grilled chicken rice bowl';
  analyzeMeal({ keyword: 'grilled chicken rice bowl', grams: 320, mode: document.getElementById('goalMode').value });
});

document.getElementById('logWorkout').addEventListener('click', () => {
  totals.calories = Math.max(0, totals.calories - 180);
  const goals = goalsByMode[document.getElementById('goalMode').value];
  updateMacroUI(goals);
  document.getElementById('streak').textContent = String(Number(document.getElementById('streak').textContent) + 1);
});

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
});

document.getElementById('mealInput').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const preview = document.getElementById('preview');
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  document.getElementById('uploadLabel').style.display = 'none';
});

updateMacroUI(goalsByMode.cut);
renderInsights({ protein: 0, fiber: 0 }, goalsByMode.cut);
