const create = document.getElementById('create-button');
const modal = document.getElementById('setupModal');
const generate = document.getElementById('generate');
const addButton = document.getElementById("addSubject");
const subjects = document.getElementById("subjects");
let cells = document.querySelectorAll('.revision-table td'); //cells

addButton.addEventListener("click", () => {

    const row = subjects.firstElementChild.cloneNode(true);

    row.querySelector(".exam-date").value = '';

    row.querySelector(".difficulty").value = 3;

    subjects.appendChild(row);

});

create.addEventListener("click", () => {

    modal.classList.remove("hidden");

});

modal.addEventListener("click", (e) => {

    if (e.target===modal) {

        modal.classList.add("hidden");

    }

});

generate.addEventListener("click", () => {

    generateTimetable();

    modal.classList.add("hidden");

});

function generateTimetable() {

    const subjectRows = document.querySelectorAll(".subject-row");
    const subjects = [];

    cells.forEach(cell => {
        cell.textContent = "";
    });

    subjectRows.forEach(row => {

        subjects.push({
            name: row.querySelector(".subject").value,
            examDate: row.querySelector(".exam-date").value,
            difficulty: Number(row.querySelector(".difficulty").value)
        });

    });

    const startRow = Number(document.getElementById("startTime").value);

    const hoursPerDay = Number(document.getElementById('hours').value);
    const totalSessions = hoursPerDay * 7;

    if (startRow + hoursPerDay > 9) {
        alert("Your study hours don't fit into the timetable.");
        return;
    }

    let totalPriority = 0;
    let allocated = 0;

    subjects.forEach(subject => {

        subject.priority = calculateUrgency(subject);

        totalPriority += subject.priority;

    });

    subjects.forEach(subject => {

        subject.percentage = subject.priority / totalPriority;

        subject.sessions = Math.floor(subject.percentage * totalSessions);

        allocated += subject.sessions;
    });

    let remaining = totalSessions - allocated;
    let i = 0;

    subjects.sort((a, b) => b.priority - a.priority);

    while (remaining > 0) {
        subjects[i].sessions++;
        remaining--;
        i++;
        if (i >= subjects.length) {
            i = 0;
        }
    }

    let sessions = [];
    let session = 0;

    subjects.forEach(subject => {

        for (let i = 0; i < subject.sessions; i++) {
            sessions.push(subject.name);
        }
    });

    sessions.sort(() => Math.random() - 0.5);

    for (let day = 0; day < 7; day++) {

        for (let row = startRow; row < startRow + hoursPerDay; row++) {

            const index = row * 7 + day;

            if (session >= sessions.length) break;

            cells[index].textContent = sessions[session];

            session++;
        }
    }

    saveTimetable();
}

function calculateUrgency(subject) {

    const today = new Date();

    if (subject.examDate === '') {
        alert(`No date selected for ${subject.name}.`);
        return;
    }

    const exam = new Date(subject.examDate);

    const daysLeft = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

    // Prevent divide by zero
    const urgency = (subject.difficulty * 10) + (100 / Math.max(daysLeft,1));

    return urgency;
}

cells.forEach(cell => cell.addEventListener('click', (e) => {

    if (cell.querySelector("input")) return;

    const currentText = cell.textContent.trim();

    cell.innerHTML = `<input type="text" id="subject" value="${currentText}">`;
    const input = cell.querySelector("input");

    input.focus();

    input.addEventListener('blur', () => {
        cell.textContent = input.value;
    });
}));

function saveTimetable() {
    const subjectsArray = [];

    cells.forEach(cell => {
        subjectsArray.push(cell.textContent);
    });
    
    localStorage.setItem('timetable', JSON.stringify(subjectsArray));
};

function loadTimetable() {
    const savedTimetable = localStorage.getItem('timetable');

    if (!savedTimetable) return;

    const subjectsArray = JSON.parse(savedTimetable);

    cells.forEach((cell, index) => {
        if (subjectsArray[index] !== undefined) {
            cell.textContent = subjectsArray[index];
        };
    });
};

loadTimetable();