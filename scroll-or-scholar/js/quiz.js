// quiz.js - Core quiz functionality

// Variables to track quiz state
let currentQuestionIndex = 0;
let score = 0;
let category = '';
let questions = [];
let timeLeft = 30; // Seconds per question
let timerInterval;
let userAnswers = [];
let answerLocked = false; // Flag to track if answers are locked for current question

document.addEventListener("DOMContentLoaded", () => {
  initializeQuiz();
});

function initializeQuiz() {
  // Get selected category from session storage
  category = getFromSessionStorage('selectedCategory') || 'breaking-news';
  
  // Get questions for selected category
  questions = quizData[category] || [];
  
  if (questions.length === 0) {
    console.error('No questions found for category:', category);
    return;
  }
  
  // Initialize user answers array
  userAnswers = new Array(questions.length).fill(null);
  
  // Start with the first question
  displayQuestion(0);
  
  // Start timer
  startTimer();
  
  // Set up event listeners
  setupEventListeners();
}

function displayQuestion(index) {
  if (index < 0 || index >= questions.length) {
    console.error('Question index out of bounds:', index);
    return;
  }
  
  // Reset answer locked state for new question
  answerLocked = false;
  
  const questionData = questions[index];
  
  // Update question number
  document.querySelector('h4').textContent = `Question ${index + 1}`;
  
  // Update question text
  document.querySelector('.question-panel p').textContent = questionData.question;
  
  // Update options
  const choiceCards = document.querySelectorAll('.choice-card');
  choiceCards.forEach((card, i) => {
    const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
    card.textContent = `${optionLetter}. ${questionData.options[i]}`;
    card.dataset.index = i;
    
    // Reset any previously selected options
    card.classList.remove('selected', 'correct', 'incorrect');
    
    // If this question has been answered before, show the selection
    if (userAnswers[index] !== null && userAnswers[index] === i) {
      card.classList.add('selected');
    }
  });
  
  // Update media if present
  const mediaContainer = document.querySelector('.media');
  if (mediaContainer) {
    if (questionData.media) {
      mediaContainer.innerHTML = `<img src="${questionData.media}" alt="Question media">`;
      mediaContainer.style.display = 'block';
    } else {
      mediaContainer.style.display = 'none';
    }
  }
  
  // Update hint
  const hintLink = document.querySelector('.hint a');
  if (hintLink) {
    hintLink.setAttribute('data-hint', questionData.hint);
  }
  
  // Update next/result button text
  const resultBtn = document.querySelector('.result-btn a');
  if (resultBtn) {
    if (index === questions.length - 1) {
      resultBtn.textContent = 'See Results';
    } else {
      resultBtn.textContent = 'Next';
      resultBtn.innerHTML = 'Next<i class="fa-solid fa-arrow-right"></i>';
    }
  }
  
  // Reset timer
  resetTimer();
}

function setupEventListeners() {
  // Set up choice selection
  const choiceCards = document.querySelectorAll('.choice-card');
  choiceCards.forEach(card => {
    card.addEventListener('click', () => {
      // Only allow selection if answers aren't locked
      if (!answerLocked) {
        // Remove selected class from all cards
        choiceCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Store user's answer
        const answerIndex = parseInt(card.dataset.index);
        userAnswers[currentQuestionIndex] = answerIndex;
      }
    });
  });
  
  // Set up hint functionality
  const hintLink = document.querySelector('.hint a');
  if (hintLink) {
    hintLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert(hintLink.getAttribute('data-hint'));
    });
  }
  
  // Set up show answer functionality
  const showAnswerLink = document.querySelector('.show-answer a');
  if (showAnswerLink) {
    showAnswerLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Lock answers so they can't be changed after showing the answer
      answerLocked = true;
      
      // If no answer was selected, record it as null
      if (userAnswers[currentQuestionIndex] === null) {
        // The answer remains null, effectively recording "no answer"
      }
      
      // Show correct answer
      const correctAnswerIndex = questions[currentQuestionIndex].correctAnswer;
      
      choiceCards.forEach((card, i) => {
        if (i === correctAnswerIndex) {
          card.classList.add('correct');
        } else if (userAnswers[currentQuestionIndex] === i) {
          card.classList.add('incorrect');
        }
      });
    });
  }
  
  // Set up next button
  const nextBtn = document.querySelector('.result-btn a');
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // If last question, go to results page
      if (currentQuestionIndex === questions.length - 1) {
        finishQuiz();
      } else {
        // Otherwise, go to next question
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
      }
    });
  }
}

function startTimer() {
  // Reset timer
  timeLeft = 30;
  document.getElementById('timer').textContent = formatTime(timeLeft);
  
  // Clear any existing intervals
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Start new timer
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = formatTime(timeLeft);
    
    if (timeLeft <= 0) {
      // Time's up - move to next question or finish quiz
      clearInterval(timerInterval);
      
      if (currentQuestionIndex === questions.length - 1) {
        finishQuiz();
      } else {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
      }
    }
  }, 1000);
}

function resetTimer() {
  // Reset timer
  timeLeft = 30;
  document.getElementById('timer').textContent = formatTime(timeLeft);
  
  // Clear any existing intervals
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Start new timer
  startTimer();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function calculateScore() {
  let correctAnswers = 0;
  
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] === questions[i].correctAnswer) {
      correctAnswers++;
    }
  }
  
  return {
    totalQuestions: questions.length,
    correctAnswers: correctAnswers,
    percentage: Math.round((correctAnswers / questions.length) * 100)
  };
}

function finishQuiz() {
  // Calculate score
  const result = calculateScore();
  
  // Store results in session storage
  saveToSessionStorage('quizResults', result);
  saveToSessionStorage('userAnswers', userAnswers);
  saveToSessionStorage('questions', questions);
  
  // Navigate to results page
  window.location.href = 'results.html';
}