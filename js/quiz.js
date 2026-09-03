/**
 * SPECTRA 4-MINUTE QUIZ - DATA STORE & VALIDATION
 * 
 * Contains the question bank for the Spectra & NeoLife educational assessment.
 * Follows neutral, educational standards without financial guarantees or medical claims.
 */

(function (root) {
  'use strict';

  const QUIZ_QUESTIONS = [
    {
      id: 1,
      category: "Organization Overview",
      question: "What is the primary role of Spectra in relation to its members and aspiring entrepreneurs?",
      options: [
        "A community and mentorship platform providing business education, leadership development, and entrepreneurial training",
        "A government regulatory bureau that manages regional financial markets",
        "A commercial retail bank issuing direct personal loans and credit cards",
        "An automated algorithmic day-trading software tool"
      ],
      answer: 0,
      explanation: "Spectra functions as an educational and mentorship community designed to help individuals develop leadership, financial literacy, and entrepreneurial skills through structured guidance."
    },
    {
      id: 2,
      category: "Collaborative Partnership",
      question: "How does Spectra's collaboration with NeoLife function in practice?",
      options: [
        "NeoLife is a market rival that Spectra aims to replace across commercial distribution channels",
        "NeoLife provides established wellness products, research, and global logistics, while Spectra provides leadership coaching and business training",
        "Spectra acquired all manufacturing assets and oversees factory operations for NeoLife worldwide",
        "It is a specialized medical franchise restricted strictly to licensed physicians and clinicians"
      ],
      answer: 1,
      explanation: "The partnership pairs NeoLife's proven product manufacturing and global fulfillment infrastructure with Spectra's leadership training and community-driven mentorship."
    },
    {
      id: 3,
      category: "Income Concepts",
      question: "Which description best distinguishes 'active income' from other revenue models?",
      options: [
        "Earnings that automatically accumulate with zero initial or ongoing effort",
        "Income directly dependent on ongoing time and labor, where earnings stop when the work stops",
        "Dividends accrued solely from passive long-term treasury securities",
        "A government-administered grant distributed regardless of employment status"
      ],
      answer: 1,
      explanation: "Active income requires trading continuous linear time and physical or mental labor for compensation (such as hourly wages or salaried jobs); earnings discontinue when labor halts."
    },
    {
      id: 4,
      category: "Income Concepts",
      question: "Which scenario best illustrates the concept of 'passive or residual income'?",
      options: [
        "Taking on weekend overtime shifts at an hourly rate",
        "Earning ongoing recurring compensation from an established distribution network or business asset built over time",
        "Working a second commissioned sales job that requires door-to-door solicitation each day",
        "Receiving a discretionary one-time holiday bonus at the end of the fiscal year"
      ],
      answer: 1,
      explanation: "Passive or residual income is generated repeatedly from business assets, distribution channels, or recurring systems established previously, continuing beyond direct hourly input."
    },
    {
      id: 5,
      category: "Financial Strategy",
      question: "Why do business educators emphasize the importance of developing multiple income streams?",
      options: [
        "To eliminate the need for personal budgeting and tax accounting",
        "Because financial institutions mandate that individuals hold at least three distinct occupations",
        "To reduce financial vulnerability by avoiding exclusive reliance on a single source of earnings",
        "To guarantee an immediate and perpetual exemption from all economic fluctuations"
      ],
      answer: 2,
      explanation: "Diversifying income sources safeguards individuals against sudden employer layoffs, economic downturns, and industry disruptions by spreading financial stability across distinct channels."
    },
    {
      id: 6,
      category: "Product & Infrastructure",
      question: "What physical product foundation does the partner company, NeoLife, bring to the table?",
      options: [
        "Scientific cellular nutrition, personal wellness, and eco-friendly home care products",
        "Heavy industrial excavation equipment and commercial building materials",
        "Decentralized digital currency tokens and speculative web investments",
        "Proprietary electronic hardware and smartphone accessories"
      ],
      answer: 0,
      explanation: "NeoLife has operated since 1958 delivering science-backed cellular nutrition, whole-food supplements, and concentrated biodegradable home care products grounded in nature."
    },
    {
      id: 7,
      category: "Personal Development",
      question: "In the Spectra framework, why is personal development considered vital to business growth?",
      options: [
        "It is a legal licensing requirement enforced by civil authorities to register a business name",
        "Building an enterprise requires communication, leadership, and emotional resilience to effectively guide and support teams",
        "Personal development replaces the practical necessity of having genuine products or customers",
        "It guarantees an instant increase in personal credit scores across banking institutions"
      ],
      answer: 1,
      explanation: "Entrepreneurship is deeply interpersonal. Cultivating emotional intelligence, clear communication, and leadership capabilities enables entrepreneurs to mentor others and build resilient organizations."
    },
    {
      id: 8,
      category: "Business Model",
      question: "What is a major advantage of building through an established partner like NeoLife rather than founding a startup manufacturer from scratch?",
      options: [
        "Entrepreneurs leverage established R&D, supply chains, and regulatory compliance without massive capital expenditure",
        "Entrepreneurs are relieved from all communication with end consumers and clients",
        "It guarantees predictable profit within the first fourteen calendar days",
        "The model requires zero personal effort, study, or dedication from the builder"
      ],
      answer: 0,
      explanation: "Partnering with an established company eliminates the prohibitive upfront overhead of laboratory research, clinical validation, regulatory permits, warehousing, and international logistics."
    },
    {
      id: 9,
      category: "Business Ethics & Longevity",
      question: "Which principle characterizes sustainable, ethical business expansion within Spectra?",
      options: [
        "Making extravagant financial guarantees to recruit members as rapidly as possible",
        "Focusing on genuine consumer value, product efficacy, and long-term mentorship",
        "Encouraging excessive inventory accumulation regardless of actual customer demand",
        "Applying aggressive high-pressure tactics to close one-off transactions"
      ],
      answer: 1,
      explanation: "Enduring business enterprises are constructed on real customer satisfaction, authentic product benefits, and supportive mentorship that nurtures long-term relationships."
    },
    {
      id: 10,
      category: "Opportunity Mindset",
      question: "What is the primary objective of Spectra for someone starting with limited prior entrepreneurial experience?",
      options: [
        "To offer an unrealistic promise of immediate wealth without dedicated effort",
        "To provide a structured environment, practical vehicle, and community to foster the transition from employee to business builder",
        "To encourage individuals to abandon all traditional academic education immediately",
        "To promote speculative short-term financial gambles and high-risk investments"
      ],
      answer: 1,
      explanation: "Spectra provides a structured curriculum, practical vehicle, and supportive community allowing individuals to systematically develop business skills and transition into confident entrepreneurs."
    }
  ];

  // Helper validation & utility methods
  const QuizData = {
    /**
     * Retrieve all questions
     * @returns {Array} Array of question objects
     */
    getQuestions: function () {
      return QUIZ_QUESTIONS;
    },

    /**
     * Get total question count
     * @returns {number}
     */
    getCount: function () {
      return QUIZ_QUESTIONS.length;
    },

    /**
     * Get a specific question by 0-based index
     * @param {number} index 
     * @returns {Object|null}
     */
    getQuestionByIndex: function (index) {
      if (index >= 0 && index < QUIZ_QUESTIONS.length) {
        return QUIZ_QUESTIONS[index];
      }
      return null;
    },

    /**
     * Validate the entire question bank schema
     * @returns {boolean}
     */
    validate: function () {
      if (!Array.isArray(QUIZ_QUESTIONS) || QUIZ_QUESTIONS.length === 0) {
        return false;
      }
      return QUIZ_QUESTIONS.every(q => 
        typeof q.id === 'number' &&
        typeof q.category === 'string' &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.answer === 'number' &&
        q.answer >= 0 &&
        q.answer < 4 &&
        typeof q.explanation === 'string'
      );
    }
  };

  // Expose to global namespace safely
  root.SpectraQuizData = QuizData;

})(typeof window !== 'undefined' ? window : this);
