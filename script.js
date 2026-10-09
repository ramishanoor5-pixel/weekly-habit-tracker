
// DATA & STORAGE

const STORAGE_KEY = "weeklyHabits";
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function getHabits() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

let habits = getHabits();

// GET CURRENT WEEK (Monday → Sunday)

function getCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    week.push(date);
  }
  return week;
}


// RENDER HEADER (Month, Year + Dates)

function renderHeader() {
  const week = getCurrentWeek();
  const today = new Date();

  document.getElementById("currentYear").textContent = today.getFullYear();
  document.getElementById("currentMonth").textContent = today.toLocaleString("default", { month: "long" });

  const header = document.getElementById("gridHeader");
  let html = `<div class="habit-label">Habit</div>`;

  week.forEach((date, index) => {
    const isToday = date.toDateString() === today.toDateString();
    html += `
      <div class="day-header">
        <div class="day-name">${DAY_NAMES[index]}</div>
        <div class="day-date ${isToday ? "today" : ""}">${date.getDate()}</div>
      </div>
    `;
  });

  html += `<div class="actions-label">Actions</div>`;
  header.innerHTML = html;
}

// RENDER HABITS

function renderHabits() {
  const habitGrid = document.getElementById("habitGrid");
  habitGrid.innerHTML = "";

  if (habits.length === 0) {
    habitGrid.innerHTML = `
      <p style="text-align:center; padding: 50px 20px; color:#94a3b8;">
        No habits yet. Add your first habit above!
      </p>`;
    return;
  }

  const week = getCurrentWeek();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  habits.forEach(habit => {
    const row = document.createElement("div");
    row.className = "habit-row";
    row.dataset.id = habit.id;

    let html = `<div class="habit-name">${habit.name}</div>`;

    DAY_KEYS.forEach((day, index) => {
      const cellDate = new Date(week[index]);
      cellDate.setHours(0, 0, 0, 0);

      const isFuture = cellDate > today;
      const isCompleted = habit.days[day];

      let classes = "day-cell";
      if (isCompleted) classes += " completed";
      if (isFuture) classes += " disabled";

      html += `
        <div class="${classes}"
             data-day="${day}"
             data-id="${habit.id}">
        </div>
      `;
    });

    html += `
      <div class="actions">
        <button class="btn-rename" data-id="${habit.id}">Rename</button>
        <button class="btn-delete" data-id="${habit.id}">Delete</button>
      </div>
    `;

    row.innerHTML = html;
    habitGrid.appendChild(row);
  });
}

// ADD NEW HABIT

function addHabit() {
  const input = document.getElementById("habitInput");
  const name = input.value.trim();

  if (!name) {
    alert("Please enter a habit name");
    return;
  }

  const newHabit = {
    id: Date.now(),
    name: name,
    days: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    }
  };

  habits.push(newHabit);
  saveHabits(habits);
  input.value = "";
  renderHabits();
}

// TOGGLE DAY COMPLETION

function toggleDay(id, day) {
  habits = habits.map(habit => {
    if (habit.id === id) {
      return {
        ...habit,
        days: {
          ...habit.days,
          [day]: !habit.days[day]
        }
      };
    }
    return habit;
  });

  saveHabits(habits);
  renderHabits();
}

// RENAME HABIT

function renameHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const newName = prompt("Enter new name:", habit.name);
  if (newName === null || newName.trim() === "") return;

  habits = habits.map(h => {
    if (h.id === id) {
      return { ...h, name: newName.trim() };
    }
    return h;
  });

  saveHabits(habits);
  renderHabits();
}

// DELETE HABIT

function deleteHabit(id) {
  if (!confirm("Are you sure you want to delete this habit?")) return;

  habits = habits.filter(h => h.id !== id);
  saveHabits(habits);
  renderHabits();
}

// EVENT LISTENERS

document.getElementById("addHabitBtn").addEventListener("click", addHabit);

document.getElementById("habitInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addHabit();
});

document.getElementById("habitGrid").addEventListener("click", (e) => {
  const target = e.target;
  const id = Number(target.dataset.id);

  if (target.classList.contains("day-cell") && !target.classList.contains("disabled")) {
    toggleDay(id, target.dataset.day);
  }

  if (target.classList.contains("btn-rename")) {
    renameHabit(id);
  }

  if (target.classList.contains("btn-delete")) {
    deleteHabit(id);
  }
});

// INITIAL LOAD

renderHeader();
renderHabits();