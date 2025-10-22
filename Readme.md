# String Analysing API

Small Express service that analyzes and stores strings. See code and helpers in the repository:

- [index.js](index.js) — app entry
- [routes/stringRoutes.js](routes/stringRoutes.js) — all HTTP endpoints (exports [`stringRoutes`](routes/stringRoutes.js))
- [logic.js](logic.js) — core analysis (exports [`analyzeLogic`](logic.js))
- [naturalLanguageUtils.js](naturalLanguageUtils.js) — NL parsing (exports [`parseNaturalLanguageQuery`](naturalLanguageUtils.js))
- [utils.js](utils.js) — query validation & filtering (exports [`validateQueryParams`](utils.js) and [`applyFilters`](utils.js))
- [data/data.json](data/data.json) — stored analyzed strings
- [package.json](package.json)
- [.gitignore](.gitignore)

## Requirements

- Node.js (v16+ recommended)
- npm

## Setup

1. Clone or open this workspace.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node index.js
   ```
   The server listens on port 3000 by default (see index.js).

## Storage

Analyzed strings are persisted to . Each entry is created by and uses the SHA-256 hash of the input as `id`.

## Endpoints

All routes are defined in .

- GET /strings

  - Returns all stored analyses (reads data/data.json).
  - Examples:
    - curl:
      ```sh
      curl http://localhost:3000/strings
      ```

- GET /strings with query parameters (validated by )

  - Supported query params:
    - is_palindrome=true|false
    - min_length (integer, >=0)
    - max_length (integer, >=0)
    - word_count (integer, >=0)
    - contains_character (single character)
  - Example:
    ```sh
    curl "http://localhost:3000/strings?min_length=3&contains_character=a"
    ```
  - Filtering logic implemented.

- GET /strings/filter-by-natural-language?query=...

  - Uses to interpret natural language filters.
  - Example:
    ```sh
    curl "http://localhost:3000/strings/filter-by-natural-language?query=single%20word%20containing%20the%20letter%20a%20and%20at%20least%204%20characters"
    ```

- GET /strings/:string_value

  - Fetch analysis for a specific string value.
  - Example:
    ```sh
    curl http://localhost:3000/strings/test
    ```

- POST /strings

  - Analyze and store a new string.
  - Body (JSON): { "value": "your string here" }
  - Responses:
    - 201 Created: returns the analysis object (created by )
    - 409 Conflict: string already exists
    - 422 Unprocessable: invalid type
  - Example:
    ```sh
    curl -X POST http://localhost:3000/strings \
      -H "Content-Type: application/json" \
      -d '{"value":"hello"}'
    ```

- DELETE /strings/:string_value
  - Remove a stored analysis by string value.

## Analysis details

produces an object with:

- id: SHA-256 hex of the input
- value: original string
- properties:
  - length
  - is_palindrome
  - unique_characters
  - word_count
  - sha256_hash
  - character_frequency_map

See implementation in .

## Natural language parsing

Natural language queries are parsed by . It supports:

- "single word", "two word", "three word"
- "palindrome" / "palindromic"
- "longer than N", "shorter than N", "at least N characters", "at most N characters", "exactly N characters"
- "contain letter X" and some vowel shortcuts (first/second/... vowel)

Conflicting length constraints yield a 422.

## Validation & filtering

- Query validation is performed.
- Filtering is applied.

## Development Notes

- The server uses ES modules (see "type": "module" in package.json).
- Data directory is created automatically when posting new strings.
- Error handling and status codes are implemented in all routes.
