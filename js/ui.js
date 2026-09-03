/**
 * SPECTRA 4-MINUTE QUIZ - UI CONTROLLER & RENDERING ENGINE
 * 
 * Handles all DOM manipulation, animations, screens, modal dialogs,
 * keyboard accessibility, and results visualization.
 */

(function (root) {
  'use strict';

  class SpectraUI {
    constructor() {
      // DOM Elements Cache
      this.screens = {
        welcome: document.getElementById('screen-welcome'),
        quiz: document.getElementById('screen-quiz'),
        results: document.getElementById('screen-results')
      };

      // Header & Timer
      this.timerBadge = document.getElementById('timer-badge');
      this.timerText = document.getElementById('timer-text');
      this.timerAria = document.getElementById('timer-aria');

      // Quiz Elements
      this.questionCategory = document.getElementById('question-category');
      this.questionNumber = document.getElementById('question-number');
      this.questionText = document.getElementById('question-text');
      this.optionsContainer = document.getElementById('options-container');
      this.progressBar = document.getElementById('progress-bar');
      this.progressText = document.getElementById('progress-text');
      this.questionNav = document.getElementById('question-nav');
      this.questionStatusBadge = document.getElementById('question-status-badge');

      // Controls
      this.btnPrev = document.getElementById('btn-prev');
      this.btnNext = document.getElementById('btn-next');
      this.btnStart = document.getElementById('btn-start');
      this.btnRetake = document.getElementById('btn-retake');
      this.btnHome = document.getElementById('btn-home');

      // Modal Elements
      this.modalUnanswered = document.getElementById('modal-unanswered');
      this.modalMessage = document.getElementById('modal-message');
      this.modalBtnContinue = document.getElementById('modal-btn-continue');
      this.modalBtnFinish = document.getElementById('modal-btn-finish');

      // Results Elements
      this.resultsScoreFraction = document.getElementById('results-score-fraction');
      this.resultsScorePercent = document.getElementById('results-score-percent');
      this.resultsFeedbackBadge = document.getElementById('results-feedback-badge');
      this.resultsFeedbackTitle = document.getElementById('results-feedback-title');
      this.resultsFeedbackDesc = document.getElementById('results-feedback-desc');
      this.resultsCorrectCount = document.getElementById('results-correct-count');
      this.resultsIncorrectCount = document.getElementById('results-incorrect-count');
      this.resultsTimeUsed = document.getElementById('results-time-used');
      this.resultsBestScore = document.getElementById('results-best-score');
      this.resultsBanner = document.getElementById('results-banner');
      this.breakdownList = document.getElementById('breakdown-list');
      this.breakdownFilterTabs = document.querySelectorAll('.breakdown-tab');

      // Welcome Screen Elements
      this.welcomeBestScoreBadge = document.getElementById('welcome-best-score-badge');
      this.welcomeBestScoreText = document.getElementById('welcome-best-score-text');

      // Announcer for screen readers
      this.announcer = document.getElementById('sr-announcer');

      // State cache for UI
      this.currentFilter = 'all'; // 'all' | 'incorrect' | 'correct'
      this._lastActiveModalTrigger = null;
    }

    /**
     * Announce dynamic message to screen readers
     * @param {string} message 
     */
    announce(message) {
      if (this.announcer) {
        this.announcer.textContent = '';
        setTimeout(() => {
          this.announcer.textContent = message;
        }, 50);
      }
    }

    /**
     * Switch active screen with smooth transition
     * @param {'welcome'|'quiz'|'results'} screenName 
     */
    showScreen(screenName) {
      Object.keys(this.screens).forEach(key => {
        const screen = this.screens[key];
        if (key === screenName) {
          screen.classList.remove('hidden');
          screen.setAttribute('aria-hidden', 'false');
          // Smooth fade in
          screen.classList.add('screen-active');
        } else {
          screen.classList.add('hidden');
          screen.setAttribute('aria-hidden', 'true');
          screen.classList.remove('screen-active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Update Timer Display
     * @param {Object} timerState 
     */
    updateTimer(timerState) {
      const { formatted, isWarning, isDanger, remainingMs } = timerState;
      if (this.timerText) {
        this.timerText.textContent = formatted;
      }

      if (this.timerBadge) {
        this.timerBadge.classList.remove('timer-normal', 'timer-warning', 'timer-danger', 'timer-pulse');
        if (isDanger) {
          this.timerBadge.classList.add('timer-danger', 'timer-pulse');
        } else if (isWarning) {
          this.timerBadge.classList.add('timer-warning');
        } else {
          this.timerBadge.classList.add('timer-normal');
        }
      }

      // Live screen-reader updates at significant intervals
      const seconds = Math.ceil(remainingMs / 1000);
      if (seconds === 180 || seconds === 120 || seconds === 60 || seconds === 30 || seconds === 15) {
        this.announce(`${seconds} seconds remaining`);
      }
    }

    /**
     * Update Progress Bar and Counter
     * @param {number} currentIndex 0-based
     * @param {number} totalQuestions 
     */
    updateProgress(currentIndex, totalQuestions) {
      const currentNumber = currentIndex + 1;
      const percent = Math.round((currentNumber / totalQuestions) * 100);

      if (this.progressBar) {
        this.progressBar.style.width = `${percent}%`;
        this.progressBar.setAttribute('aria-valuenow', percent);
      }

      if (this.progressText) {
        this.progressText.textContent = `${percent}% Completed`;
      }

      if (this.questionNumber) {
        this.questionNumber.textContent = `Question ${currentNumber} of ${totalQuestions}`;
      }
    }

    /**
     * Render Quick-Jump Question Navigation Dots
     * @param {number} totalQuestions 
     * @param {number} currentIndex 
     * @param {Object} userAnswers Map of { [questionIndex]: optionIndex }
     * @param {Function} onSelectQuestion Callback when dot is clicked
     */
    renderQuestionNav(totalQuestions, currentIndex, userAnswers, onSelectQuestion) {
      if (!this.questionNav) return;
      this.questionNav.innerHTML = '';

      for (let i = 0; i < totalQuestions; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'q-dot';
        dot.setAttribute('aria-label', `Go to Question ${i + 1}`);

        const isCurrent = i === currentIndex;
        const isAnswered = userAnswers[i] !== undefined;

        if (isCurrent) {
          dot.classList.add('q-dot-current');
          dot.setAttribute('aria-current', 'step');
        } else if (isAnswered) {
          dot.classList.add('q-dot-answered');
        } else {
          dot.classList.add('q-dot-unanswered');
        }

        dot.innerHTML = `<span class="q-dot-inner">${i + 1}</span>`;

        dot.addEventListener('click', () => {
          if (typeof onSelectQuestion === 'function') {
            onSelectQuestion(i);
          }
        });

        this.questionNav.appendChild(dot);
      }
    }

    /**
     * Render the active question card
     * @param {Object} questionObj Question data item
     * @param {number} questionIndex 0-based index
     * @param {number} totalCount Total questions
     * @param {number|undefined} selectedOption Currently selected answer index
     * @param {Function} onSelect Callback when option is picked
     */
    renderQuestion(questionObj, questionIndex, totalCount, selectedOption, onSelect) {
      if (!questionObj) return;

      // Update Category & Prompt
      if (this.questionCategory) {
        this.questionCategory.textContent = questionObj.category || 'General Knowledge';
      }

      if (this.questionText) {
        this.questionText.textContent = questionObj.question;
      }

      // Update question status badge (Answered vs Unanswered)
      if (this.questionStatusBadge) {
        if (selectedOption !== undefined) {
          this.questionStatusBadge.textContent = 'Answered';
          this.questionStatusBadge.className = 'status-badge status-answered';
        } else {
          this.questionStatusBadge.textContent = 'Optional to skip & return';
          this.questionStatusBadge.className = 'status-badge status-unanswered';
        }
      }

      // Render Options
      if (this.optionsContainer) {
        this.optionsContainer.innerHTML = '';
        const optionKeys = ['A', 'B', 'C', 'D'];

        questionObj.options.forEach((optText, optIndex) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'option-card';
          btn.setAttribute('role', 'radio');
          const isSelected = selectedOption === optIndex;
          btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
          btn.setAttribute('data-index', optIndex);

          if (isSelected) {
            btn.classList.add('selected');
          }

          btn.innerHTML = `
            <div class="option-key" aria-hidden="true">${optionKeys[optIndex]}</div>
            <div class="option-content">
              <span class="option-text">${this.escapeHTML(optText)}</span>
            </div>
            <div class="option-indicator" aria-hidden="true">
              <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          `;

          btn.addEventListener('click', () => {
            if (typeof onSelect === 'function') {
              onSelect(optIndex);
            }
          });

          this.optionsContainer.appendChild(btn);
        });
      }

      // Update Nav Buttons
      if (this.btnPrev) {
        this.btnPrev.disabled = questionIndex === 0;
        this.btnPrev.setAttribute('aria-disabled', questionIndex === 0 ? 'true' : 'false');
      }

      if (this.btnNext) {
        const isLastQuestion = questionIndex === totalCount - 1;
        if (isLastQuestion) {
          this.btnNext.innerHTML = `
            <span>Finish Quiz</span>
            <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          `;
          this.btnNext.classList.add('btn-finish');
        } else {
          this.btnNext.innerHTML = `
            <span>Next Question</span>
            <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          `;
          this.btnNext.classList.remove('btn-finish');
        }
      }

      // Focus management: announce question for screen readers
      this.announce(`Question ${questionIndex + 1} of ${totalCount}: ${questionObj.question}`);
    }

    /**
     * Show the Unfinished Confirmation Modal
     * @param {Array<number>} unansweredList Array of 1-based question numbers
     * @param {Function} onContinue Callback when user clicks Continue
     * @param {Function} onFinishAnyway Callback when user clicks Finish Anyway
     */
    showUnansweredModal(unansweredList, onContinue, onFinishAnyway) {
      if (!this.modalUnanswered) return;

      this._lastActiveModalTrigger = document.activeElement;

      const count = unansweredList.length;
      const questionListFormatted = unansweredList.map(n => `Q${n}`).join(', ');

      if (this.modalMessage) {
        this.modalMessage.innerHTML = `
          You still have <strong>${count} unanswered question${count > 1 ? 's' : ''}</strong> (${questionListFormatted}).<br><br>
          Would you like to return to complete them, or submit your quiz now?
        `;
      }

      this.modalUnanswered.classList.remove('hidden');
      this.modalUnanswered.setAttribute('aria-hidden', 'false');

      // Focus first actionable button
      if (this.modalBtnContinue) {
        this.modalBtnContinue.focus();
      }

      // One-time click handlers
      const handleContinue = () => {
        this.hideModal();
        if (typeof onContinue === 'function') onContinue();
        cleanup();
      };

      const handleFinish = () => {
        this.hideModal();
        if (typeof onFinishAnyway === 'function') onFinishAnyway();
        cleanup();
      };

      const handleKey = (e) => {
        if (e.key === 'Escape') {
          handleContinue();
        }
      };

      const cleanup = () => {
        this.modalBtnContinue.removeEventListener('click', handleContinue);
        this.modalBtnFinish.removeEventListener('click', handleFinish);
        document.removeEventListener('keydown', handleKey);
      };

      this.modalBtnContinue.addEventListener('click', handleContinue);
      this.modalBtnFinish.addEventListener('click', handleFinish);
      document.addEventListener('keydown', handleKey);
    }

    /**
     * Hide all active modals
     */
    hideModal() {
      if (this.modalUnanswered) {
        this.modalUnanswered.classList.add('hidden');
        this.modalUnanswered.setAttribute('aria-hidden', 'true');
      }
      if (this._lastActiveModalTrigger) {
        this._lastActiveModalTrigger.focus();
        this._lastActiveModalTrigger = null;
      }
    }

    /**
     * Render the comprehensive Results Screen
     * @param {Object} resultsData
     */
    renderResults(resultsData) {
      const {
        score,
        total,
        percentage,
        correctCount,
        incorrectCount,
        timeUsedFormatted,
        bestScore,
        expired,
        questions,
        answers
      } = resultsData;

      // Banner Status
      if (this.resultsBanner) {
        if (expired) {
          this.resultsBanner.innerHTML = `
            <div class="banner-pill banner-expired">
              <svg class="banner-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span>Time Expired — Quiz Automatically Submitted</span>
            </div>
          `;
        } else {
          this.resultsBanner.innerHTML = `
            <div class="banner-pill banner-success">
              <svg class="banner-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Assessment Completed Successfully</span>
            </div>
          `;
        }
      }

      // Score Hero
      if (this.resultsScoreFraction) {
        this.resultsScoreFraction.textContent = `${score} / ${total}`;
      }
      if (this.resultsScorePercent) {
        this.resultsScorePercent.textContent = `${percentage}%`;
      }

      // Dynamic Feedback according to score tier
      let tierBadge = 'Exceptional Mastery';
      let tierTitle = 'Outstanding Comprehension';
      let tierDesc = 'You have demonstrated a comprehensive understanding of Spectra, active and passive income frameworks, and collaborative entrepreneurship.';
      let tierClass = 'badge-tier-gold';

      if (percentage >= 90) {
        tierBadge = 'Exceptional Mastery';
        tierTitle = 'Outstanding Comprehension';
        tierDesc = 'You demonstrated an outstanding grasp of the Spectra model, income generation principles, and collaborative partnership foundations.';
        tierClass = 'badge-tier-gold';
      } else if (percentage >= 70) {
        tierBadge = 'Strong Understanding';
        tierTitle = 'Great Work!';
        tierDesc = 'You grasp the core principles of Spectra and active vs. passive income. A quick review of the items below will refine your mastery.';
        tierClass = 'badge-tier-silver';
      } else if (percentage >= 50) {
        tierBadge = 'Solid Foundation';
        tierTitle = 'Good Start!';
        tierDesc = 'You have built an initial foundation. Reviewing the distinction between linear and residual revenue will strengthen your perspective.';
        tierClass = 'badge-tier-bronze';
      } else {
        tierBadge = 'Learning in Progress';
        tierTitle = 'Keep Learning & Growing';
        tierDesc = 'Every entrepreneur starts with exploration. Review the detailed educational breakdowns below and retake the quiz to cement your knowledge.';
        tierClass = 'badge-tier-growth';
      }

      if (this.resultsFeedbackBadge) {
        this.resultsFeedbackBadge.textContent = tierBadge;
        this.resultsFeedbackBadge.className = `feedback-badge ${tierClass}`;
      }
      if (this.resultsFeedbackTitle) {
        this.resultsFeedbackTitle.textContent = tierTitle;
      }
      if (this.resultsFeedbackDesc) {
        this.resultsFeedbackDesc.textContent = tierDesc;
      }

      // Metric Cards
      if (this.resultsCorrectCount) {
        this.resultsCorrectCount.textContent = correctCount;
      }
      if (this.resultsIncorrectCount) {
        this.resultsIncorrectCount.textContent = incorrectCount;
      }
      if (this.resultsTimeUsed) {
        this.resultsTimeUsed.textContent = timeUsedFormatted;
      }
      if (this.resultsBestScore) {
        this.resultsBestScore.textContent = `${bestScore.score} / ${bestScore.total} (${bestScore.percentage}%)`;
      }

      // Render Question Breakdown with Filter Tabs
      this.renderBreakdown(questions, answers, this.currentFilter);

      // Setup Filter Tab Click Listeners
      if (this.breakdownFilterTabs) {
        this.breakdownFilterTabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
            this.breakdownFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.currentFilter = tab.getAttribute('data-filter') || 'all';
            this.renderBreakdown(questions, answers, this.currentFilter);
          });
        });
      }
    }

    /**
     * Render the detailed question-by-question breakdown
     * @param {Array} questions 
     * @param {Object} answers 
     * @param {string} filter 'all' | 'incorrect' | 'correct'
     */
    renderBreakdown(questions, answers, filter = 'all') {
      if (!this.breakdownList) return;
      this.breakdownList.innerHTML = '';

      const optionKeys = ['A', 'B', 'C', 'D'];
      let visibleCount = 0;

      questions.forEach((q, idx) => {
        const userAnswer = answers[idx];
        const isCorrect = userAnswer === q.answer;
        const isSkipped = userAnswer === undefined;

        // Filtering
        if (filter === 'correct' && !isCorrect) return;
        if (filter === 'incorrect' && isCorrect) return;

        visibleCount++;

        const item = document.createElement('div');
        item.className = `breakdown-item ${isCorrect ? 'item-correct' : 'item-incorrect'}`;

        const statusTag = isCorrect
          ? `<span class="breakdown-badge badge-correct">✓ Correct</span>`
          : isSkipped
            ? `<span class="breakdown-badge badge-skipped">⚠ Unanswered / Skipped</span>`
            : `<span class="breakdown-badge badge-wrong">✗ Incorrect</span>`;

        const userAnswerText = isSkipped
          ? '<em class="text-muted">No answer selected</em>'
          : `<strong>Option ${optionKeys[userAnswer]}:</strong> ${this.escapeHTML(q.options[userAnswer])}`;

        const correctAnswerHTML = !isCorrect
          ? `
            <div class="breakdown-answer-row correct-answer-box">
              <span class="answer-row-label">Correct Answer:</span>
              <span class="answer-row-content"><strong>Option ${optionKeys[q.answer]}:</strong> ${this.escapeHTML(q.options[q.answer])}</span>
            </div>
          `
          : '';

        item.innerHTML = `
          <div class="breakdown-header">
            <div class="breakdown-title-meta">
              <span class="breakdown-qnum">Question ${idx + 1}</span>
              <span class="breakdown-category">${this.escapeHTML(q.category)}</span>
            </div>
            ${statusTag}
          </div>
          <h4 class="breakdown-question">${this.escapeHTML(q.question)}</h4>
          <div class="breakdown-answers-group">
            <div class="breakdown-answer-row ${isCorrect ? 'user-correct' : 'user-incorrect'}">
              <span class="answer-row-label">Your Answer:</span>
              <span class="answer-row-content">${userAnswerText}</span>
            </div>
            ${correctAnswerHTML}
          </div>
          <div class="breakdown-explanation">
            <div class="explanation-heading">
              <svg class="info-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <span>Key Takeaway</span>
            </div>
            <p class="explanation-text">${this.escapeHTML(q.explanation)}</p>
          </div>
        `;

        this.breakdownList.appendChild(item);
      });

      if (visibleCount === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'breakdown-empty';
        emptyState.textContent = filter === 'incorrect' 
          ? 'Great job! You have zero incorrect answers in this quiz.' 
          : 'No questions match this filter.';
        this.breakdownList.appendChild(emptyState);
      }
    }

    /**
     * Update Welcome screen with best score if exists
     * @param {Object|null} bestScore 
     */
    updateWelcomeBestScore(bestScore) {
      if (!this.welcomeBestScoreBadge || !this.welcomeBestScoreText) return;

      if (bestScore && typeof bestScore.score === 'number') {
        this.welcomeBestScoreText.textContent = `Previous Best: ${bestScore.score}/${bestScore.total} (${bestScore.percentage}%)`;
        this.welcomeBestScoreBadge.classList.remove('hidden');
      } else {
        this.welcomeBestScoreBadge.classList.add('hidden');
      }
    }

    /**
     * Escape HTML string to prevent XSS
     * @param {string} str 
     * @returns {string}
     */
    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  root.SpectraUI = SpectraUI;

})(typeof window !== 'undefined' ? window : this);
