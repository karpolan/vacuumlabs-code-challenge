let fs = require('fs');

const YES = 'synonyms';
const NO = 'different';

/**
 * Builds a normalized dictionary to fast search
 */
function buildNormalizedDictionary(dictionary) {
  const result = {};

  // Add every word with first synonym and vice versa
  for (const pair of dictionary) {
    const word1 = pair[0].toLowerCase();
    const word2 = pair[1].toLowerCase();
    result[word1] = result[word1] ?? {}; // Create object if doesn't exist
    result[word2] = result[word2] ?? {}; // Create object if doesn't exist
    // Add the pair to the dictionary
    result[word1][word2] = true;
    result[word2][word1] = true;
  }

  // Extend dictionary for "synonyms of my synonym is my synonyms"
  for (const [word, synonyms] of Object.entries(result)) {
    // Add the word into synonyms of synonyms
    for (const synonym in synonyms) {
      const synonymsOfSynonym = result[synonym];
      result[synonym][word] = true;
      for (const synonymOfSynonym in synonymsOfSynonym) {
        result[word][synonymOfSynonym] = true;
        result[synonymOfSynonym][word] = true;
      }
    }
  }

  // Extend dictionary for "synonyms of my synonym is my synonyms" again
  for (const [word, synonyms] of Object.entries(result)) {
    // Add the word into synonyms of synonyms
    for (const synonym in synonyms) {
      const synonymsOfSynonym = result[synonym];
      result[synonym][word] = true;
      for (const synonymOfSynonym in synonymsOfSynonym) {
        result[word][synonymOfSynonym] = true;
        result[synonymOfSynonym][word] = true;
      }
    }
  }

  // console.log('buildNormalizedDictionary() - result:', result);
  return result;
}

let queryNumber = 0;

/**
 * Normalizes and runs a single Query for given Normalized Dictionary
 */
function runSingleQuery(normalizedDictionary, query) {
  let result = false;
  let word1;
  let word2;

  if (typeof query === 'string') {
    [word1, word2] = query.toLowerCase().split(' ');
  } else {
    word1 = query[0].toLowerCase();
    word2 = query[1].toLowerCase();
  }

  if (word1 === word2) {
    result = true;
  }

  if (!result && normalizedDictionary[word1]) {
    result = normalizedDictionary[word1]?.[word2] ?? false;
  }

  if (!result && normalizedDictionary[word2]) {
    result = normalizedDictionary[word2]?.[word1] ?? false;
  }

  // queryNumber++;
  // console.log(queryNumber, word1, word2, result);

  return result ? YES : NO;
}

/**
 * Runs set of Queries for given Normalized Dictionary
 */
function runAllQueries(normalizedDictionary, queries) {
  const result = [];
  for (const query of queries) {
    result.push(runSingleQuery(normalizedDictionary, query));
  }
  return result;
}

/**
 * Runs all test cases for given input
 */
function runTestCases(tests) {
  let result = [];
  for (const testCase of tests.testCases) {
    const normalizedDictionary = buildNormalizedDictionary(testCase.dictionary);
    const queryResults = runAllQueries(normalizedDictionary, testCase.queries);
    result = result.concat(queryResults);
  }
  return result;
}

/**
 * Main execution
 */

// Read all test cases from "input.json" file
let tests = JSON.parse(fs.readFileSync('input.json', 'utf8'));

// Run tests
console.log('Test cases:', tests?.testCases?.length);
console.log(
  'Number of queries:',
  tests?.testCases?.reduce((acc, cur) => acc + cur?.queries?.length, 0)
);

const result = runTestCases(tests);

console.log('Number of results:', result?.length);

// Write result to the "output.txt" file
let file = fs.createWriteStream('output.txt');
result.forEach((line) => {
  file.write(line + '\n');
});
file.end();
