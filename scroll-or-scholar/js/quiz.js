// quiz.js - Modified quiz functionality with Show Answer fixed

// Variables to track quiz state
let currentQuestionIndex = 0;
let score = 0;
let category = '';
let questions = [];
let timeLeft = 10;
let timerInterval;
let userAnswers = [];
let answerLocked = false;


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
  setupEventListeners();
}

function displayQuestion(index) {
  if (index < 0 || index >= questions.length) {
    console.error('Question index out of bounds:', index);
    return;
  }
  
  answerLocked = false;
  const questionData = questions[index];
  
  document.querySelector('h4').textContent = `Question ${index + 1}`;
  document.querySelector('.question-panel p').textContent = questionData.question;
  
  const choiceCards = document.querySelectorAll('.choice-card');
  choiceCards.forEach((card, i) => {
    const optionLetter = String.fromCharCode(65 + i);
    card.textContent = `${optionLetter}. ${questionData.options[i]}`;
    card.dataset.index = i;
    
    // Reset any previously selected options
    card.classList.remove('selected', 'correct', 'incorrect');
    
    // If this question has been answered before, show the selection
    if (userAnswers[index] !== null && userAnswers[index] === i) {
      card.classList.add('selected');
    }
  });
  
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
      // Only allow selection if answers aren't locked and time hasn't run out
      if (!answerLocked && timeLeft > 0) {
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
  
  const showAnswerLink = document.querySelector('.show-answer a');
  if (showAnswerLink) {
    showAnswerLink.addEventListener('click', (e) => {
      e.preventDefault();
      answerLocked = true;
      revealCorrectAnswer(); 
    });
  }

  // Set up next button
  const nextBtn = document.querySelector('.result-btn a');
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Lock answers when moving to next question
      answerLocked = true;
      
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
    timeLeft = 10;
    document.getElementById('timer').textContent = formatTime(timeLeft);
    //create an an element that will play a timer sound in each question
    //why is is double playing the sound in the first instance?
    const timerSound = document.createElement('audio');
    timerSound.src = '/assets/audios/timer.mp3';
    timerSound.play();

    //remove the sound after 10 seconds and when the next buttion is clicked
    const nextBtn = document.querySelector('.result-btn a');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        timerSound.pause();
        timerSound.currentTime = 0;
      });
    }
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').textContent = formatTime(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!answerLocked) {
          revealCorrectAnswer();
          answerLocked = true;
        }
      }
    }, 1000);
  }

function resetTimer() {
  // Reset timer
  timeLeft = 10;
  document.getElementById('timer').textContent = formatTime(timeLeft);
  
  // Clear any existing intervals
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Start new timer
  startTimer();
}

function revealCorrectAnswer() {
    const choiceCards = document.querySelectorAll('.choice-card');
    const correctAnswerIndex = questions[currentQuestionIndex].correctAnswer;

    choiceCards.forEach((card, i) => {
      if (i === correctAnswerIndex) {
        card.classList.add('correct');
      } else if (userAnswers[currentQuestionIndex] === i) {
        card.classList.add('incorrect');
      }
    });

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.video) {
      showVideoPopup(currentQuestion.video);
    }
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

// Add this to your CSS or style section
const style = document.createElement('style');
style.textContent = `
  .video-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
    .video-popup-content {
    background: #4b1235;
    padding: 20px;
    border-radius: 10px;
    max-width: 800px;
    width: 90%;
    position: relative;
    border: 2px solid #ffffff; /* Corrected color */
  }
  .close-popup {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    color: #ffffff;
    border: none;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: bold;
  }
  .video-container {
    width: 100%;
    aspect-ratio: 16/9;
  }
`;
document.head.appendChild(style);

// Add this HTML structure dynamically
const popupHTML = `
  <div class="video-popup">
    <div class="video-popup-content">
      <button class="close-popup">X</button>
        <h3 style="color: white; font-size: 30px; margin-bottom: 20px; text-align: center;">Answer</h3>
      <div class="video-container"></div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', popupHTML);

// Get popup elements
const videoPopup = document.querySelector('.video-popup');
const closePopupBtn = document.querySelector('.close-popup');
const videoContainer = document.querySelector('.video-container');

// Close popup function
function closeVideoPopup() {
  videoPopup.style.display = 'none';
  videoContainer.innerHTML = ''; // Clear the video
}

// Show video popup function
function showVideoPopup(videoPath) {
    if (!videoPath) return;
    
    videoContainer.innerHTML = `
      <video controls width="100%" height="100%" autoplay ="true" loop ="true">
        <source src="${videoPath}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
    
    videoPopup.style.display = 'flex';
  }

// Close popup when clicking X or outside
closePopupBtn.addEventListener('click', closeVideoPopup);
videoPopup.addEventListener('click', (e) => {
  if (e.target === videoPopup) {
    closeVideoPopup();
  }
});

// Helper functions for session storage
function saveToSessionStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to session storage:', e);
  }
}

function getFromSessionStorage(key) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Error reading from session storage:', e);
    return null;
  }
}