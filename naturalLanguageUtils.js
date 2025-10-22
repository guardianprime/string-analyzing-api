const parseNaturalLanguageQuery = (query) => {
  const filters = {};
  const errors = [];
  const lowerQuery = query.toLowerCase();

  // Parse word count
  if (lowerQuery.includes("single word")) {
    filters.word_count = 1;
  } else if (lowerQuery.includes("two word") || lowerQuery.includes("2 word")) {
    filters.word_count = 2;
  } else if (
    lowerQuery.includes("three word") ||
    lowerQuery.includes("3 word")
  ) {
    filters.word_count = 3;
  }

  // Parse palindrome
  if (lowerQuery.includes("palindrome") || lowerQuery.includes("palindromic")) {
    filters.is_palindrome = true;
  }

  // Parse length constraints
  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1], 10) + 1;
  }

  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1], 10) - 1;
  }

  const atLeastMatch = lowerQuery.match(/at least (\d+) characters?/);
  if (atLeastMatch) {
    filters.min_length = parseInt(atLeastMatch[1], 10);
  }

  const atMostMatch = lowerQuery.match(/at most (\d+) characters?/);
  if (atMostMatch) {
    filters.max_length = parseInt(atMostMatch[1], 10);
  }

  const exactlyMatch = lowerQuery.match(/exactly (\d+) characters?/);
  if (exactlyMatch) {
    const length = parseInt(exactlyMatch[1], 10);
    filters.min_length = length;
    filters.max_length = length;
  }

  // Parse contains character
  const containsLetterMatch = lowerQuery.match(
    /contain(?:ing|s)? (?:the )?letter ([a-z])/
  );
  if (containsLetterMatch) {
    filters.contains_character = containsLetterMatch[1];
  }

  // Parse vowel references
  if (lowerQuery.includes("first vowel") || lowerQuery.includes("letter a")) {
    filters.contains_character = "a";
  } else if (
    lowerQuery.includes("second vowel") ||
    lowerQuery.includes("letter e")
  ) {
    filters.contains_character = "e";
  } else if (
    lowerQuery.includes("third vowel") ||
    lowerQuery.includes("letter i")
  ) {
    filters.contains_character = "i";
  } else if (
    lowerQuery.includes("fourth vowel") ||
    lowerQuery.includes("letter o")
  ) {
    filters.contains_character = "o";
  } else if (
    lowerQuery.includes("fifth vowel") ||
    lowerQuery.includes("letter u")
  ) {
    filters.contains_character = "u";
  }

  // Check for conflicting filters
  if (filters.min_length !== undefined && filters.max_length !== undefined) {
    if (filters.min_length > filters.max_length) {
      errors.push(
        "Conflicting length constraints: min_length cannot be greater than max_length"
      );
    }
  }

  // Check if any filters were parsed
  if (Object.keys(filters).length === 0) {
    errors.push("Unable to parse any filters from the natural language query");
  }

  return { filters, errors };
};

export { parseNaturalLanguageQuery };
