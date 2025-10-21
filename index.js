import express from "express";
import stringRoutes from "./routes/stringRoutes.js";

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", stringRoutes);

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
