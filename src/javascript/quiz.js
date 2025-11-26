let quizData = [];

var currentQuestionIndex = 0;
var score = 0;
var quizContainer = document.getElementById('quiz'); //gets HTML with id='quiz'
var submitButton = document.getElementById('submit'); //gets HTML with id='submit'
var resultsContainer = document.getElementById('results'); //gets HTML with id='results'

async function loadQuiz() { //async means it can run in the background without freezing the whole page
    try {
        const response = await fetch('../../data/sample-questions.json'); //Fetches questions from sample-questions.json and calls it response
        quizData = await response.json(); //puts the response in json form in quizData
        console.log('Quiz data loaded:', quizData); //prints info in brackets
        displayQuestion();
    } catch (error) {
        console.error('Error loading quiz data:', error); //displays if there is an error
    }
}

function selectTopic() {
    const topicSelect = document.getElementById("topic-select");
    const topic = topicSelect.value;
    if (topic === "all") {
        filteredQuestions = [...quizData];  // clone all
    } else {
        filteredQuestions = quizData.filter(q => q.topic === topic);
    }
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

function displayQuestion() { //new function
    if (currentQuestionIndex < filteredQuestions.length) { //if question number < total number of questions
        const question = filteredQuestions[currentQuestionIndex]; //question = 'currentQuestionIndex'th question in quizData
        quizContainer.innerHTML = ''; //empties HTML inside quizContainer
        quizContainer.innerHTML = ` 
            <div class='quiz-question'>
                <p>${question.question}</p>
                <div class='quiz-options'>
                    ${question.answers.map(answer => `<button class='quiz-button' type='button' data-answer='${answer}'>${answer}</button>`).join('')}
                </div>
            </div>
        `; //puts new HTML in quizContainer. The ${} is similar to f{} in Python. question.question is the question
            // and question.answers are the answers in the current JSON object. The .join('') joins the array of buttons/answers into one string.
        document.querySelectorAll('.quiz-button').forEach(button => //selects all with class 'quiz-button'.
        {button.addEventListener('click',selectAnswer)}); //When button is clicked, selectAnswer function runs. (45 and 46 all on 1 line). 
    } else {
        displayResults();
    }
}

function selectAnswer(event) {
    const selectedButton = event.target;
    const selectedAnswer = selectedButton.dataset.answer;
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (selectedAnswer === String(currentQuestion.correctAnswer)) { //if answer is correct
        score++;
        selectedButton.classList.add('correct'); //adds to class 'correct' for CSS
    } else {
        selectedButton.classList.add('wrong'); //adds to class 'wrong' for CSS
        document.querySelectorAll('.quiz-button').forEach(button => {
            if (button.dataset.answer === String(currentQuestion.correctAnswer)) {
                button.classList.add('correct-answer');
            }
        });
    }
    document.querySelectorAll('.quiz-button').forEach(button => {button.disabled = true;}); //disables buttons
    setTimeout(() => {
        currentQuestionIndex++; //move to next question
        displayQuestion(); // display next question
    }, 1000); //code will run after 1000 milliseconds
}

function displayResults() {
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
        loadQuiz(); //load new quiz
    });
    
}

loadQuiz();



