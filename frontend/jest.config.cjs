module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  // This helps Jest resolve the imports if they fail
  moduleFileExtensions: ['js', 'jsx'],
};