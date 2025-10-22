const validateQueryParams = (query) => {
  const errors = [];
  const filters = {};

  const allowedParams = [
    "is_palindrome",
    "min_length",
    "max_length",
    "word_count",
    "contains_character",
  ];

  // Detect unknown query parameters
  for (const key of Object.keys(query)) {
    if (!allowedParams.includes(key)) {
      errors.push(`Unknown query parameter: ${key}`);
    }
  }

  // Validate is_palindrome
  if (query.is_palindrome !== undefined) {
    if (query.is_palindrome !== "true" && query.is_palindrome !== "false") {
      errors.push("is_palindrome must be 'true' or 'false'");
    } else {
      filters.is_palindrome = query.is_palindrome === "true";
    }
  }

  // Validate min_length
  if (query.min_length !== undefined) {
    const minLength = parseInt(query.min_length, 10);
    if (isNaN(minLength) || minLength < 0) {
      errors.push("min_length must be a non-negative integer");
    } else {
      filters.min_length = minLength;
    }
  }

  // Validate max_length
  if (query.max_length !== undefined) {
    const maxLength = parseInt(query.max_length, 10);
    if (isNaN(maxLength) || maxLength < 0) {
      errors.push("max_length must be a non-negative integer");
    } else {
      filters.max_length = maxLength;
    }
  }

  // Validate word_count
  if (query.word_count !== undefined) {
    const wordCount = parseInt(query.word_count, 10);
    if (isNaN(wordCount) || wordCount < 0) {
      errors.push("word_count must be a non-negative integer");
    } else {
      filters.word_count = wordCount;
    }
  }

  // Validate contains_character
  if (query.contains_character !== undefined) {
    if (
      typeof query.contains_character !== "string" ||
      query.contains_character.length !== 1
    ) {
      errors.push("contains_character must be a single character");
    } else {
      filters.contains_character = query.contains_character;
    }
  }

  // Check min_length <= max_length
  if (filters.min_length !== undefined && filters.max_length !== undefined) {
    if (filters.min_length > filters.max_length) {
      errors.push("min_length cannot be greater than max_length");
    }
  }

  return { filters, errors };
};

// Helper function to apply filters
const applyFilters = (strings, filters) => {
  return strings.filter((item) => {
    // Filter by is_palindrome
    if (filters.is_palindrome !== undefined) {
      if (item.properties?.is_palindrome !== filters.is_palindrome) {
        return false;
      }
    }

    // Filter by min_length
    if (filters.min_length !== undefined) {
      if (
        (item.properties?.length || item.value?.length || 0) <
        filters.min_length
      ) {
        return false;
      }
    }

    // Filter by max_length
    if (filters.max_length !== undefined) {
      if (
        (item.properties?.length || item.value?.length || 0) >
        filters.max_length
      ) {
        return false;
      }
    }

    // Filter by word_count
    if (filters.word_count !== undefined) {
      if (item.properties?.word_count !== filters.word_count) {
        return false;
      }
    }

    // Filter by contains_character
    if (filters.contains_character !== undefined) {
      if (!item.value?.includes(filters.contains_character)) {
        return false;
      }
    }

    return true;
  });
};

export { validateQueryParams, applyFilters };
