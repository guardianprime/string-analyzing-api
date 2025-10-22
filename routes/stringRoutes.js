import { Router } from "express";
import analyzeLogic from "../logic.js";
import fs from "fs/promises";
import path from "path";
import { validateQueryParams, applyFilters } from "../utils.js";
import { parseNaturalLanguageQuery } from "../naturalLanguageUtils.js";

const stringRoutes = Router();

const DATA_FILE = path.join(process.cwd(), "data", "data.json");
const DATA_DIR = path.dirname(DATA_FILE);

// 1. MOST SPECIFIC ROUTE FIRST - Natural language filter
stringRoutes.get("/strings/filter-by-natural-language", async (req, res) => {
  try {
    const { query } = req.query;

    // Validate query parameter exists
    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({
        error: "Missing or invalid 'query' parameter",
      });
    }

    // Parse natural language query
    const { filters, errors } = parseNaturalLanguageQuery(query);

    // 400: Unable to parse query
    if (errors.length > 0 && Object.keys(filters).length === 0) {
      return res.status(400).json({
        error: "Unable to parse natural language query",
        details: errors,
      });
    }

    // 422: Query parsed but has conflicting filters
    if (errors.length > 0 && Object.keys(filters).length > 0) {
      return res.status(422).json({
        error: "Query parsed but resulted in conflicting filters",
        details: errors,
        parsed_filters: filters,
      });
    }

    // Read data from file
    let allStrings = [];
    try {
      if (
        await fs
          .access(DATA_FILE)
          .then(() => true)
          .catch(() => false)
      ) {
        const fileData = await fs.readFile(DATA_FILE, "utf-8");
        if (fileData.trim()) {
          allStrings = JSON.parse(fileData);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    // Apply filters
    const filteredStrings = applyFilters(allStrings, filters);

    // Build response
    const response = {
      data: filteredStrings,
      count: filteredStrings.length,
      interpreted_query: {
        original: query,
        parsed_filters: filters,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error filtering strings by natural language:", error);
    res.status(500).json({ error: "Failed to filter strings" });
  }
});

// 2. GET /strings with query parameters for filtering
// 3. GET /strings without query parameters
// Unified GET /strings
stringRoutes.get("/strings", async (req, res) => {
  try {
    // Check if query parameters are present
    const hasQueryParams = Object.keys(req.query).length > 0;

    // Read data
    let allStrings = [];
    if (
      await fs
        .access(DATA_FILE)
        .then(() => true)
        .catch(() => false)
    ) {
      const fileData = await fs.readFile(DATA_FILE, "utf-8");
      if (fileData.trim()) {
        allStrings = JSON.parse(fileData);
      }
    }

    // If query params exist, validate and filter
    if (hasQueryParams) {
      const { filters, errors } = validateQueryParams(req.query);

      if (errors.length > 0) {
        return res.status(400).json({
          error: errors,
        });
      }

      const filteredStrings = applyFilters(allStrings, filters);
      console.log("Applied Filters:", filters);
      const testData = filteredStrings.slice(0, 5);
      console.log(
        "Available Data:",
        testData.map((d) => ({
          value: d.value,
          word_count: d.properties.word_count,
          is_palindrome: d.properties.is_palindrome,
        }))
      );

      return res.status(200).json({
        data: filteredStrings,
        count: filteredStrings.length,
        filters_applied: Object.keys(filters).length > 0 ? filters : undefined,
      });
    }

    // Otherwise, return everything
    res.status(200).json(allStrings);
  } catch (error) {
    console.error("Error reading strings:", error);
    res.status(500).json({ error: "Failed to retrieve strings" });
  }
});

// 4. POST new string analysis
stringRoutes.post("/strings", async (req, res) => {
  try {
    const { value } = req.body;

    // 400: Missing "value" field
    if (value === undefined || value === null) {
      return res.status(400).json({
        error: "Missing required field: value",
      });
    }

    // 422: Invalid data type (not a string)
    if (typeof value !== "string") {
      return res.status(422).json({
        error: "Invalid data type for value: must be a string",
      });
    }

    // Ensuring directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Read existing data
    let allStrings = [];
    try {
      const fileData = await fs.readFile(DATA_FILE, "utf-8");
      if (fileData.trim()) {
        allStrings = JSON.parse(fileData);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    // 409: String already exists in the system
    const stringExists = allStrings.some((item) => item.value === value);
    if (stringExists) {
      return res.status(409).json({
        error: "String already exists in the system",
      });
    }

    const analyzed = analyzeLogic(value);
    const response = {
      ...analyzed,
      created_at: new Date().toISOString(),
    };

    allStrings.push(response);

    await fs.writeFile(DATA_FILE, JSON.stringify(allStrings, null, 2));

    res.status(201).json(response);
  } catch (error) {
    console.error("Error analyzing string:", error);
    res.status(500).json({ error: "Failed to analyze string" });
  }
});

// 5. GET specific string by value (path parameter)
stringRoutes.get("/strings/:string_value", async (req, res) => {
  const { string_value } = req.params;

  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8");
    const allStrings = fileData.trim() ? JSON.parse(fileData) : [];

    const stringData = allStrings.find((item) => item.value === string_value);

    if (!stringData) {
      return res.status(404).json({ error: "String not found" });
    }

    res.status(200).json(stringData);
  } catch (error) {
    console.error("Error retrieving string:", error);
    res.status(500).json({ error: "Failed to retrieve string" });
  }
});

stringRoutes.delete("/strings/:string_value", async (req, res) => {
  const { string_value } = req.params;

  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8");
    const allStrings = fileData.trim() ? JSON.parse(fileData) : [];

    const stringIndex = allStrings.findIndex(
      (item) => item.value === string_value
    );

    if (stringIndex === -1) {
      return res.status(404).json({ error: "String not found" });
    }

    allStrings.splice(stringIndex, 1);

    await fs.writeFile(DATA_FILE, JSON.stringify(allStrings, null, 2));

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting string:", error);
    res.status(500).json({ error: "Failed to delete string" });
  }
});

export default stringRoutes;
