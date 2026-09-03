/**
 * SPECTRA 4-MINUTE QUIZ - MAIN APPLICATION CONTROLLER
 * 
 * Coordinates quiz state, timer events, keyboard shortcuts,
 * and user interactions across screens.
 */

(function (root) {
  'use strict';

  class SpectraApp {
    constructor() {
      this.quizData = root.SpectraQuizData;
      this.timer = null;
      this.ui = null;

      // Primary Application State
      this.state = {
        currentQuestion: 0,
        answers: {}, // Key: question index (0..9), Value: selected option (0..3)
        started: false,
        finished: false,
        expired: false,
        timeLimit: 240000 // 4 minutes in milliseconds
      };

      // Storage key
      this.STORAGE_KEY = 'spectra_quiz_best_score_v1';
    }

    /**
     * Initialize application on DOM ready
     */
    init() {
      // Initialize UI Engine
      this.ui = new root.SpectraUI();

      // Initialize Drift-Free Timer
      this.timer = new root.SpectraTimer({
        durationMs: this.state.timeLimit,
        onTick: (timerState) => {
          this.ui.updateTimer(timerState);
        },
        onExpire: () => {
          this.handleTimeExpire();
        },
        onWarning: () => {
          this.ui.announce('Warning: Less than one minute remaining');
        },
        onDanger: () => {
          this.ui.announce('Urgent: Less than fifteen seconds remaining');
        }
      });

      // Bind Event Listeners
      this.bindEvents();

      // Load and display Best Score on Welcome Screen
      const bestScore = this.getStoredBestScore();
      this.ui.updateWelcomeBestScore(bestScore);

      // Show Initial Screen
      this.ui.showScreen('welcome');
    }

    /**
     * Bind UI button clicks and global keyboard shortcuts
     */
    bindEvents() {
      // Welcome Screen Start Button
      if (this.ui.btnStart) {
        this.ui.btnStart.addEventListener('click', () => {
          this.startQuiz();
        });
      }

      // Quiz Navigation Buttons
      if (this.ui.btnPrev) {
        this.ui.btnPrev.addEventListener('click', () => {
          this.goToPreviousQuestion();
        });
      }

      if (this.ui.btnNext) {
        this.ui.btnNext.addEventListener('click', () => {
          this.handleNextOrFinish();
        });
      }

      // Results Action Buttons
      if (this.ui.btnRetake) {
        this.ui.btnRetake.addEventListener('click', () => {
          this.startQuiz();
        });
      }

      if (this.ui.btnHome) {
        this.ui.btnHome.addEventListener('click', () => {
          this.resetToWelcome();
        });
      }

      // Keyboard Navigation
      document.addEventListener('keydown', (e) => {
        this.handleKeyboard(e);
      });
    }

    /**
     * Handle global keyboard navigation
     * @param {KeyboardEvent} e 
     */
    handleKeyboard(e) {
      const activeScreen = this.state.started && !this.state.finished 
        ? 'quiz' 
        : this.state.finished 
          ? 'results' 
          : 'welcome';

      // Ignore if user is currently interacting with an input or modal is open
      const isModalOpen = this.ui.modalUnanswered && !this.ui.modalUnanswered.classList.contains('hidden');
      if (isModalOpen) return;

      if (activeScreen === 'welcome') {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.startQuiz();
        }
      } else if (activeScreen === 'quiz') {
        // Number keys 1-4 or letters A-D for option selection
        const key = e.key.toUpperCase();
        if (['1', '2', '3', '4'].includes(key)) {
          const optIndex = parseInt(key, 10) - 1;
          this.selectAnswer(optIndex);
        } else if (['A', 'B', 'C', 'D'].includes(key)) {
          const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
          this.selectAnswer(map[key]);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.handleNextOrFinish();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.goToPreviousQuestion();
        }
      } else if (activeScreen === 'results') {
        if (e.key === 'r' || e.key === 'R') {
          this.startQuiz();
        }
      }
    }

    /**
     * Start / Restart Quiz with completely fresh state
     */
    startQuiz() {
      // Reset state
      this.state.currentQuestion = 0;
      this.state.answers = {};
      this.state.started = true;
      this.state.finished = false;
      this.state.expired = false;

      // Reset and start timer
      this.timer.reset(this.state.timeLimit);
      this.timer.start();

      // Switch to quiz screen
      this.ui.showScreen('quiz');

      // Render Question 1
      this.renderCurrentQuestion();
      this.ui.announce('Quiz started. 4 minutes countdown initiated.');
    }

    /**
     * Render the active question in state
     */
    renderCurrentQuestion() {
      const questions = this.quizData.getQuestions();
      const total = questions.length;
      const index = this.state.currentQuestion;
      const questionObj = questions[index];
      const selectedOption = this.state.answers[index];

      // Update progress bar
      this.ui.updateProgress(index, total);

      // Render question navigation dots
      this.ui.renderQuestionNav(total, index, this.state.answers, (targetIndex) => {
        this.jumpToQuestion(targetIndex);
      });

      // Render question card
      this.ui.renderQuestion(questionObj, index, total, selectedOption, (optIndex) => {
        this.selectAnswer(optIndex);
      });
    }

    /**
     * Record answer selection
     * @param {number} optionIndex 0..3
     */
    selectAnswer(optionIndex) {
      if (this.state.finished) return;

      this.state.answers[this.state.currentQuestion] = optionIndex;

      // Re-render question card and dots to immediately reflect visual selection
      this.renderCurrentQuestion();
    }

    /**
     * Advance to the next question, or attempt finish on final question
     */
    goToNextQuestion() {
      this.handleNextOrFinish();
    }

    /**
     * Navigate to next question or trigger finish flow
     */
    handleNextOrFinish() {
      const total = this.quizData.getCount();
      if (this.state.currentQuestion < total - 1) {
        this.state.currentQuestion++;
        this.renderCurrentQuestion();
      } else {
        this.attemptFinishQuiz();
      }
    }

    /**
     * Navigate to previous question
     */
    goToPreviousQuestion() {
      if (this.state.currentQuestion > 0) {
        this.state.currentQuestion--;
        this.renderCurrentQuestion();
      }
    }

    /**
     * Jump directly to a question via quick-jump dot
     * @param {number} index 
     */
    jumpToQuestion(index) {
      const total = this.quizData.getCount();
      if (index >= 0 && index < total) {
        this.state.currentQuestion = index;
        this.renderCurrentQuestion();
      }
    }

    /**
     * Check if quiz is fully answered before finishing
     */
    attemptFinishQuiz() {
      const questions = this.quizData.getQuestions();
      const unanswered = [];

      questions.forEach((q, i) => {
        if (this.state.answers[i] === undefined) {
          unanswered.push(i + 1); // 1-based question number
        }
      });

      if (unanswered.length > 0) {
        // Show polished custom confirmation modal
        this.ui.showUnansweredModal(
          unanswered,
          () => {
            // onContinue: jump to first unanswered question
            const firstUnansweredIndex = unanswered[0] - 1;
            this.jumpToQuestion(firstUnansweredIndex);
          },
          () => {
            // onFinishAnyway: proceed to submission
            this.finishQuiz(false);
          }
        );
      } else {
        // All answered - complete immediately
        this.finishQuiz(false);
      }
    }

    /**
     * Automatically submit when timer hits 0:00
     */
    handleTimeExpire() {
      if (this.state.finished) return;
      this.ui.hideModal();
      this.finishQuiz(true);
    }

    /**
     * Compute current score and performance statistics
     * @returns {Object}
     */
    calculateScore() {
      const questions = this.quizData.getQuestions();
      const total = questions.length;
      let correctCount = 0;

      questions.forEach((q, idx) => {
        if (this.state.answers[idx] === q.answer) {
          correctCount++;
        }
      });

      const incorrectCount = total - correctCount;
      const percentage = Math.round((correctCount / total) * 100);

      return {
        score: correctCount,
        total: total,
        percentage: percentage,
        correctCount: correctCount,
        incorrectCount: incorrectCount
      };
    }

    /**
     * Calculate results and show Results Screen
     * @param {boolean} isExpired Whether quiz ended via countdown timer expiry
     */
    finishQuiz(isExpired = false) {
      if (this.state.finished) return;

      this.timer.stop();
      this.state.finished = true;
      this.state.expired = isExpired;

      const questions = this.quizData.getQuestions();
      const stats = this.calculateScore();

      // Elapsed time calculation
      const elapsedMs = this.timer.getElapsedMs();
      const timeUsedFormatted = root.SpectraTimer.format(elapsedMs);

      // Save Best Score
      const currentScoreObj = {
        score: stats.score,
        total: stats.total,
        percentage: stats.percentage,
        date: new Date().toISOString()
      };
      const bestScore = this.saveBestScore(currentScoreObj);

      const resultsPayload = {
        score: stats.score,
        total: stats.total,
        percentage: stats.percentage,
        correctCount: stats.correctCount,
        incorrectCount: stats.incorrectCount,
        timeUsedFormatted: timeUsedFormatted,
        bestScore: bestScore,
        expired: isExpired,
        questions: questions,
        answers: this.state.answers
      };

      this.ui.renderResults(resultsPayload);
      this.ui.showScreen('results');

      const announcement = isExpired 
        ? `Time expired. Quiz finished. Your score is ${stats.correctCount} out of ${stats.total}.` 
        : `Quiz completed. Your score is ${stats.correctCount} out of ${stats.total}.`;
      this.ui.announce(announcement);
    }

    /**
     * Reset to welcome screen
     */
    resetToWelcome() {
      this.timer.reset();
      this.state.started = false;
      this.state.finished = false;
      this.state.answers = {};
      this.state.currentQuestion = 0;

      const bestScore = this.getStoredBestScore();
      this.ui.updateWelcomeBestScore(bestScore);
      this.ui.showScreen('welcome');
    }

    /**
     * Reset quiz alias
     */
    resetQuiz() {
      this.resetToWelcome();
    }

    /**
     * Retrieve best score from LocalStorage
     * @returns {Object|null}
     */
    getStoredBestScore() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }

    /**
     * Save new score if higher than current best
     * @param {Object} currentScore 
     * @returns {Object} Best score
     */
    saveBestScore(currentScore) {
      try {
        const existing = this.getStoredBestScore();
        if (!existing || currentScore.score > existing.score) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentScore));
          return currentScore;
        }
        return existing;
      } catch (err) {
        return currentScore;
      }
    }
  }

  // Auto-launch on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const app = new SpectraApp();
    app.init();
    root.SpectraAppInstance = app;
  });

  root.SpectraApp = SpectraApp;

})(typeof window !== 'undefined' ? window : this);
