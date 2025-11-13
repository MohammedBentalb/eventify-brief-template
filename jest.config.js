export default {
  testEnvironment: "node", // needs jest-environment-jsdom package
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
