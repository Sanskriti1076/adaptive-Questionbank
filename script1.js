let questions = [];
let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', initializeQuiz);

// Initialize the quiz
function initializeQuiz() {
    fetchQuestions();
    document.getElementById('restart-button').addEventListener('click', restartQuiz);
    document.getElementById('restart-button').style.display = 'none'; // Hide restart button initially
}

// Fetch questions from the API
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=19&difficulty=medium&type=multiple');
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            questions = data.results;
            showQuestion();
        } else {
            displayError('No questions available. Please try again later.');
        }
    } catch (error) {
        displayError('Error fetching questions. Please check your connection.');
    }
}

// Display the current question
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestionIndex];
    const questionElement = document.getElementById('question');
    const answersContainer = document.getElementById('answers');

    // Clear previous content
    questionElement.textContent = decodeHTML(question.question);
    answersContainer.innerHTML = '';

    // Prepare answers and shuffle them
    const allAnswers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);

    allAnswers.forEach(answer => {
        const answerButton = document.createElement('button');
        answerButton.textContent = decodeHTML(answer);
        answerButton.classList.add('answer-btn');
        answerButton.addEventListener('click', () => checkAnswer(answer, question.correct_answer, answerButton));
        answersContainer.appendChild(answerButton);
    });

    updateProgressBar();
}

// Handle answer selection
function checkAnswer(selectedAnswer, correctAnswer, button) {
    const isCorrect = selectedAnswer === correctAnswer;

    button.classList.add(isCorrect ? 'answer-correct' : 'answer-incorrect');
    score += isCorrect ? 1 : 0;

    // Disable all buttons
    disableAnswerButtons();

    // Show the next question after a delay
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 1000);
}

// Disable all answer buttons
function disableAnswerButtons() {
    document.querySelectorAll('.answer-btn').forEach(button => (button.disabled = true));
}

// Update the progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress');
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// End the quiz and display the score
function endQuiz() {
    const container = document.getElementById('question-container');
    container.innerHTML = `<p>Quiz Over! Your score is ${score} out of ${questions.length}</p>`;
    document.getElementById('restart-button').style.display = 'block'; // Show restart button
}

// Restart the quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;

    // Reset UI elements
    document.getElementById('restart-button').style.display = 'none';
    document.getElementById('progress').style.width = '0%';
    fetchQuestions();
}

// Display error messages
function displayError(message) {
    const container = document.getElementById('question-container');
    container.innerHTML = `<p>${message}</p>`;
}

// Decode HTML entities in questions/answers
function decodeHTML(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}
