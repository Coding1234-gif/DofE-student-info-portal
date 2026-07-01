let quizData = [];
let filteredQuestions = [];

let currentQuestionIndex = 0;
let score = 0;
let quizContainer = document.getElementById('quiz'); //gets HTML with id='quiz'
let resultsContainer = document.getElementById('results'); //gets HTML with id='results'

quizContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('quiz-button')) {
        selectAnswer(e);
    }
});

async function loadQuiz(topic = 'all') { 
    try {
        const fetchTopic = topic === 'all' ? 'sample-questions' : topic; // if topic is 'all', fetch sample questions, else fetch chosen topic
        const response = await fetch(`../../data/${fetchTopic}.json`); 
        const rawData = await response.json(); 
        
        // Merge with SRS data from localStorage
        const srsData = loadSRSData();
        quizData = rawData.map(q => {
            if (srsData[q.id]) {
                q.srs = srsData[q.id];
            }
            return q;
        });
        
        // Filter questions due for review today
        const todayStr = new Date().toISOString().split('T')[0];
        filteredQuestions = quizData.filter(q => {
            if (!q.srs || !q.srs.next_review) return true; // Never seen
            return q.srs.next_review <= todayStr; // Due today or earlier
        });

        currentQuestionIndex = 0;
        score = 0;
        resultsContainer.innerHTML = ''; 

        console.log(`Quiz data loaded for ${topic}:`, quizData);
        if (filteredQuestions.length > 0) {
            displayQuestion();
        } else {
            quizContainer.innerHTML = '';
            resultsContainer.innerHTML = `
                <h2>All caught up!</h2>
                <p>You have no questions due for review today in this topic.</p>
            `;
        };
    } catch (error) {
        console.error('Error loading quiz data:', error); 
        quizContainer.innerHTML = `<p>Error loading questions for ${topic}. Please try again later.</p>`;
    };
    document.getElementById("streak").innerHTML = '';
};

function selectTopic() {
    const topicSelect = document.getElementById("topic-select");
    const topic = topicSelect.value;
    loadQuiz(topic);
}

function displayQuestion() {
    if (currentQuestionIndex < filteredQuestions.length) {
        const question = filteredQuestions[currentQuestionIndex];
        quizContainer.innerHTML = '';
        
        let optionsHtml = '';
        
        if (question.type === 'fill_blank') {
            optionsHtml = `
                <div class='quiz-input-container'>
                    <input type='text' id='blank-input' class='quiz-input' placeholder='Type your answer here...' autocomplete='off'> <!-- Makes answer box -->
                    <button id='submit-blank' class='quiz-button quiz-submit' type='button'>Submit</button>
                    <p id='q_num'>Question ${currentQuestionIndex + 1} of ${filteredQuestions.length}</p>
                </div>
            `;
        } else {
            // For MCQ or True/False, use buttons
            let options = question.options;
            if (question.type === 'true_false' && (!options || options.length === 0)) { // if question type is true/false and no options are provided
                options = ["True", "False"];
            };
            optionsHtml = `
                <div class='quiz-options'>
                    ${options.map(option => `<button class='quiz-button' type='button' data-answer='${option}'>${option}</button>`).join('')}
                </div>
            `;
        };

        quizContainer.innerHTML = `
            <div class='quiz-question'>
                <p>${question.question}</p>
                ${optionsHtml}
                <p id='q_num'>Question ${currentQuestionIndex + 1} of ${filteredQuestions.length}</p>
            </div>
        `;

        if (question.type === 'fill_blank') {
            const submitBtn = document.getElementById('submit-blank');
            const inputField = document.getElementById('blank-input');
            
            submitBtn.addEventListener('click', () => {
                const answer = inputField.value.trim(); // removes whitespace from both ends of a string
                if (answer) selectAnswer(null, answer); // if answer is not empty, select answer
            });

            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { // if enter key is pressed
                    const answer = inputField.value.trim();
                    if (answer) selectAnswer(null, answer); // if answer is not empty, select answer
                };
            });
            
            inputField.focus(); // automatically focuses on the input field
        };
    } else {
        displayResults();
    };
};

function selectAnswer(event, manualAnswer) {
    const quizButtons = document.querySelectorAll('.quiz-button');
    const currentQuestion = filteredQuestions[currentQuestionIndex]; //gets current question
    let selectedAnswer = manualAnswer; //sets selected answer to manual answer
    let selectedButton = event ? event.target : null; //sets selected button to event target if there is event, otherwise null

    if (!selectedAnswer && selectedButton) { //if selected answer is empty and selected button is not empty
        selectedAnswer = selectedButton.dataset.answer; //sets selected answer to selected button's answer
    };

    console.log('Clicked');

    let isCorrect = false;
    const correctAnswer = currentQuestion.answer;

    if (currentQuestion.type === 'fill_blank') {
        // Check against array of acceptable answers
        const main = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        const acceptable = currentQuestion.acceptable_answers || [];
        const answers = [...main, ...acceptable]; // combines main and acceptable answers
        isCorrect = answers.some(a => String(a).toLowerCase() === selectedAnswer.toLowerCase().trim()); // checks if selected answer is in the array of answers
        
        // Disable input and button
        const input = document.getElementById('blank-input');
        const submitBtn = document.getElementById('submit-blank');
        if (input) { input.disabled = true; input.classList.add(isCorrect ? 'correct-border' : 'wrong-border'); };
        if (submitBtn) submitBtn.classList.add('disabled');
    } else {
        // MCQ or True/False comparison
        isCorrect = String(selectedAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
        
        if (selectedButton) {
            selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');
        };

        // Show correct answer if wrong
        if (!isCorrect) {
            quizButtons.forEach(button => {
                if (String(button.dataset.answer).toLowerCase() === String(correctAnswer).toLowerCase()) {
                    button.classList.add('correct-answer');
                };
            });
        };
    };

    if (isCorrect) score++;
    
    // Update SRS data for this question
    updateSRS(currentQuestion.id, isCorrect, currentQuestion.srs);
    
    quizButtons.forEach(button => { button.disabled = true; }); 
    
    setTimeout(() => {
        currentQuestionIndex++; //move to next question
        displayQuestion(); // display next question
    }, 1000); //code will run after 1000 milliseconds
};

function updateStreak() {
    const today = new Date().toDateString(); //gets today's date
    const lastDate = localStorage.getItem("lastQuizDate"); //gets last date
    if (lastDate !== today) {
        if (lastDate === null) { //if first time doing quiz (no last date)
            localStorage.setItem("streak", 1); //sets streak to 1
        } else {
            const diff = (new Date(today) - new Date(lastDate)) / (1000*60*60*24); //gets difference in days (1 day = 1000*60*60*24 milliseconds)
            if (diff === 1) { //if quiz done yesterday
                let current = parseInt(localStorage.getItem("streak") || "1"); //converts streak to integer, if streak not found set to 1
                localStorage.setItem("streak", current + 1); //updates streak (+1)
            } else {
                localStorage.setItem("streak", 1); //resets streak to 1
            };
        };
        localStorage.setItem("lastQuizDate", today); //stores today's date
    };
    document.getElementById("streak").innerHTML = "Streak: " + localStorage.getItem("streak") + " days";
};

function displayResults() {
    updateStreak();

    quizContainer.innerHTML = '';
    resultsContainer.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>You scored ${score} out of ${filteredQuestions.length} questions.</p>
        <button id='restart-button' class='quiz-button' type='button'>Restart Quiz</button>
    `;
    document.getElementById('restart-button').addEventListener('click',() => {
        //reset quiz
        currentQuestionIndex = 0;
        score = 0;
        resultsContainer.innerHTML = ''; //clear previous results
        const topicSelect = document.getElementById("topic-select");
        loadQuiz(topicSelect.value); 
    });
};

// --- SRS (Spaced Repetition System) Logic ---

function loadSRSData() {
    const data = localStorage.getItem('quiz_srs_data');
    return data ? JSON.parse(data) : {};
};

function saveSRSData(data) {
    localStorage.setItem('quiz_srs_data', JSON.stringify(data));
};

function updateSRS(questionId, isCorrect, currentSrs) {
    let srsData = loadSRSData();
    
    // Default or existing values
    let srs = srsData[questionId] || currentSrs || {
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review: null,
        last_review: null
    };

    if (isCorrect) {
        if (srs.repetitions === 0) {
            srs.interval = 1;
        } else if (srs.repetitions === 1) {
            srs.interval = 6;
        } else {
            srs.interval = Math.round(srs.interval * srs.ease_factor);
        };
        srs.repetitions += 1;
    } else {
        srs.repetitions = 0;
        srs.interval = 1;
        srs.ease_factor = Math.max(1.3, srs.ease_factor - 0.2);
    };

    const today = new Date();
    srs.last_review = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + srs.interval);
    srs.next_review = nextReviewDate.toISOString().split('T')[0];

    srsData[questionId] = srs;
    saveSRSData(srsData);
    
    return srs;
};

loadQuiz('all');