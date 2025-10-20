import express from "express";

const app = express();

const stringProperties = {
  length: "number",
  is_palindrome: "boolean",
  unique_characters: "array",
  word_count: "number",
  sha256_hash: "string",
  character_frequency_map: "object",
  toUpperCase: "string",
  toLowerCase: "string",
  trim: "string",
  split: "array",
  includes: "boolean",
  indexOf: "number",
  lastIndexOf: "number",
  replace: "string",
  substring: "string",
};

app.get("/", (req, res) => {
  res.send("server is working!!");
});

app.post("/strings", (req, res) => {
  const { text } = req.body;
  const result = {};

  for (const [key, type] of Object.entries(stringProperties)) {
    if (typeof text[key] === type) {
      result[key] = text[key];
    }
  }

  res.status(201).json(result);

  // response for when string already exists
  if (error) {
    res.status(409).json({ error: "string already exists" });
  }

  //response for a bad request
  if ("bad resquest") {
    res
      .status(400)
      .json({ error: ` Invalid request body or missing "value" field` });
  }

  //
  if ("Invalid data type for value (must be string)") {
    res.status(422).json({
      error: `Invalid data type for "value" (must be string)`,
    });
  }
});

app.get("/strings/:query", (req, res) => {
  if (string) {
    res.status(200).json({
      id: "sha256_hash_value",
      value: "requested string",
      properties: {
        /* same as above */
      },
      created_at: "2025-08-27T10:00:00Z",
    });
  }

  // response for error
  if ("error") {
    res.status(404).json({ error: "String does not exist in the system" });
  }
});

app.get(
  "/strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a",
  (req, res) => {
    res.status(200).json({ data: "data" });
  }
);

app.get(
  "/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings",
  (req, res) => {
    res.status(200).json({ data: "data" });
  }
);

app.delete("/strings/{string_value}", (req, res) => {
  res.status(204);
  if ("string does not exist") {
    res.status(404).json({
      error: "string does not exist",
    });
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
