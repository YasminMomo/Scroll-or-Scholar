// results.js - Results display functionality

document.addEventListener("DOMContentLoaded", () => {
    displayResults();
    setupPlayAgainButton();
  });
  
  function displayResults() {
    // Get results from session storage
    const results = getFromSessionStorage('quizResults');
    const userAnswers = getFromSessionStorage('userAnswers');
    const questions = getFromSessionStorage('questions');
    
    if (!results || !userAnswers || !questions) {
      console.error('No quiz results found!');
      showError();
      return;
    }
    
    // Update congratulations message
    const congratsElement = document.querySelector('.congrats');
    if (congratsElement) {
      if (results.percentage >= 70) {
        congratsElement.textContent = 'Great job!';
      } else if (results.percentage >= 40) {
        congratsElement.textContent = 'Good effort!';
      } else {
        congratsElement.textContent = 'Nice try!';
      }
    }
    
    // Create graph
    createGraph(results);
    
    // Populate summary cards
    populateSummary(questions, userAnswers);
  }
  
  function createGraph(results) {
    const graphContainer = document.querySelector('.graph');
    if (!graphContainer) return;
    
    // Clear existing content
    graphContainer.innerHTML = '';
    
    // Calculate percentage
    const percentage = results.percentage;
    
    // Create SVG element for the circular progress indicator
    const svgHTML = `
      <div class="score-circle-container">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <!-- Background circle -->
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" stroke-width="10"></circle>
          
          <!-- Progress circle -->
          <circle id="score-circle" cx="50" cy="50" r="45" fill="none" 
            stroke="#C363C0" 
            stroke-width="10"
            stroke-dasharray="${2 * Math.PI * 45}"
            stroke-dashoffset="${2 * Math.PI * 45 - (percentage / 100) * (2 * Math.PI * 45)}"
            transform="rotate(-90, 50, 50)"></circle>
          
          <!-- Slice lines -->
          ${Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36 - 90) * (Math.PI / 180);
            const x1 = 50 + 40 * Math.cos(angle);
            const y1 = 50 + 40 * Math.sin(angle);
            const x2 = 50 + 50 * Math.cos(angle);
            const y2 = 50 + 50 * Math.sin(angle);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#361b35" stroke-width="2"></line>`;
          }).join('')}

          <!-- Center text -->
          <text id="score-percent" x="50" y="50" text-anchor="middle" dominant-baseline="middle" 
            font-family="DM Sans" font-size="18" font-weight="bold" fill="#ffff">${percentage}%</text>
          
        </svg>
    `;
    
    graphContainer.innerHTML = svgHTML;
    
    // Add animation for better user experience
    setTimeout(() => {
      const circle = document.getElementById('score-circle');
      if (circle) {
        circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
      }
    }, 100);
  }
  
  function populateSummary(questions, userAnswers) {
    const summaryWrapper = document.querySelector('.summary-card-wrapper');
    if (!summaryWrapper) return;
    
    // Clear existing summary cards
    summaryWrapper.innerHTML = '';
    
    // Create a card for each question
    questions.forEach((question, index) => {
      const isCorrect = userAnswers[index] === question.correctAnswer;
      const userAnswer = userAnswers[index] !== null ? question.options[userAnswers[index]] : 'No answer';
      const correctAnswer = question.options[question.correctAnswer];
      
      const card = document.createElement('div');
      card.className = 'summary-card';
      
      // Create answer section with correct/incorrect indicator
      const answerDiv = document.createElement('div');
      answerDiv.className = `summary-answer ${isCorrect ? 'correct' : 'incorrect'}`;
      
      const answerP = document.createElement('p');
      answerP.textContent = isCorrect ? 'Correct' : 'Incorrect';
      answerDiv.appendChild(answerP);
      
      // Create question section
      const questionDiv = document.createElement('div');
      questionDiv.className = 'summary-question';
      
      const questionP = document.createElement('p');
      questionP.textContent = question.question;
      questionDiv.appendChild(questionP);
      
      // Add user answer and correct answer
      const userAnswerP = document.createElement('p');
      userAnswerP.className = 'user-answer';
      userAnswerP.innerHTML = `<strong>Your answer:</strong> ${userAnswer}`;
      questionDiv.appendChild(userAnswerP);
      
      if (!isCorrect) {
        const correctAnswerP = document.createElement('p');
        correctAnswerP.className = 'correct-answer';
        correctAnswerP.innerHTML = `<strong>Correct answer:</strong> ${correctAnswer}`;
        questionDiv.appendChild(correctAnswerP);
      }
      
      // Add elements to card
      card.appendChild(answerDiv);
      card.appendChild(questionDiv);
      
      // Add card to wrapper
      summaryWrapper.appendChild(card);
    });
  }
  
  function setupPlayAgainButton() {
    const playAgainBtn = document.querySelector('.result-btn a:first-child');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'category.html';
      });
    }
  }
  
  function showError() {
    const resultCard = document.querySelector('.result-card');
    if (resultCard) {
      resultCard.innerHTML = `
        <h4>No Quiz Results Found</h4>
        <p>Please take a quiz first to see results.</p>
        <div class="result-btn">
          <a href="category.html" class="btn">Start Quiz</a>
          <a href="index.html" class="btn">Home</a>
        </div>
      `;
    }
  }