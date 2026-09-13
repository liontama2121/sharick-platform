/**
 * Textos de la UI de la Study Zone. La interfaz de Study va en INGLÉS
 * (el contenido de aprendizaje también); todo lo que ve el estudiante sale
 * de aquí para poder cambiarlo sin tocar componentes.
 */
export const S = {
  // Home
  homeLabel: 'Study Zone',
  homeTitle: 'Practice & level up!',
  homeSubtitle: 'Study each topic, pass the quiz, and unlock the next one.',
  homeCta: 'Start Studying →',
  homeFeatures: [
    { icon: '📚', label: 'Topics' },
    { icon: '✏️', label: 'Exercises' },
    { icon: '🏆', label: 'Quizzes' },
    { icon: '🎮', label: 'Arcade' },
  ],

  // Login
  loginTitle: 'Sign in to the Study Zone',
  loginSubtitle: 'Use the username your teacher gave you.',
  username: 'Username',
  password: 'Password',
  signIn: 'Sign in',
  signingIn: 'Signing in…',
  loginError: 'Wrong username or password. Try again.',
  loginDemoHint: 'Demo accounts: demo / demo1234 · sharick / teacher2026',
  backHome: 'Back to home',

  // Shell
  greeting: (name) => `Hi, ${name}! 👋`,
  logOut: 'Log out',
  home: 'Home',
  topicMap: 'Topic map',
  teacherMode: 'Teacher mode',

  // Map
  mapTitle: 'Study Zone',
  mapSubtitle: 'Pass each quiz to unlock the next topic.',
  module: (n) => `Module ${n}`,
  comingSoon: 'Coming soon',
  progress: (done, total) => `${done} of ${total} topics passed`,
  arcade: '🎮 Arcade',
  arcadeHint: 'Random questions from your unlocked topics',
  statusPassed: 'Passed',
  statusOpen: 'Available',
  statusLocked: 'Locked',
  lockedTooltip: (prev) => `Pass the quiz of "${prev}" to unlock this topic.`,
  bestScore: (n) => `Best score: ${n}%`,
  manualUnlock: 'Unlocked by your teacher',
  moduleMastered: (n) => `Module ${n} mastered! 🏆`,
  moduleMasteredHint: 'You passed every topic. Time to play!',
  goToGames: '🎮 Go to Games',

  // Topic
  tabLearn: 'Learn',
  tabPractice: 'Practice',
  tabQuiz: 'Final Quiz',
  keyPhrases: 'Key phrases',
  practiceIntro: 'Unlimited tries. You get feedback right away.',
  practiceDone: (done, total) => `${done} of ${total} exercises done`,
  quizIntro: (n, pass) => `${n} questions, one at a time. You need ${pass}% to pass.`,
  quizNoFeedback: 'No feedback until the end — read carefully!',
  startQuiz: 'Start quiz',
  retakeQuiz: 'Retake quiz',
  topicPassed: (score) => `Passed with ${score}%`,
  nextTopic: 'Next topic →',
  backToMap: '← Topic map',

  // Exercises
  check: 'Check',
  correct: 'Correct! 🎉',
  tryAgain: 'Not quite. Try again.',
  clear: 'Clear',
  tapInOrder: 'Tap the pieces in the right order…',
  matchHint: 'Tap a phrase on the left, then its match on the right.',
  allMatched: 'All matched! 🎉',
  typeAnswer: 'Type your answer',

  // Quiz
  question: (i, n) => `Question ${i} of ${n}`,
  next: 'Next →',
  finish: 'Finish',
  quizResult: 'Your result',
  quizPassed: 'You passed! 🎉',
  quizFailed: 'Not yet — try again!',
  quizFailedHint: (pass) =>
    `You need ${pass}%. Review the Learn tab and retake the quiz. Questions are shuffled every time.`,
  topicUnlocked: (title) => `Topic unlocked: ${title}!`,
  yourAnswers: 'Your answers',
  score: (right, total) => `${right} / ${total} correct`,

  // Arcade
  arcadeTitle: 'Arcade',
  arcadeSubtitle: (n, s) => `${n} random questions · ${s}s each`,
  arcadeStart: 'Start!',
  arcadeNoTopics: 'Pass at least one quiz to unlock the Arcade.',
  arcadeTimeUp: "Time's up!",
  arcadeScore: 'Score',
  arcadeBest: 'Your record',
  newRecord: 'New record! 🏆',
  playAgain: 'Play again',

  // Teacher
  teacherTitle: 'Teacher mode',
  teacherSubtitle: 'Students and their progress on this device.',
  teacherNote:
    'Demo phase: progress is read from this browser only. With Cloudflare D1 it will be real, multi-device progress.',
  student: 'Student',
  unlockManually: 'Unlock manually',
  noProgress: 'No progress yet',
  lastActivity: 'Last activity',
}
