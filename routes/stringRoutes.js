import { Router } from "express";
import analyzeLogic from "../logic.js";
import fs from "fs/promises";
import path from "path";

const stringRoutes = Router();

const DATA_FILE = path.join(process.cwd(), "data", "data.json");
const DATA_DIR = path.dirname(DATA_FILE);

// GET all strings
stringRoutes.get("/strings", async (req, res) => {
  try {
    if (
      !(await fs
        .access(DATA_FILE)
        .then(() => true)
        .catch(() => false))
    ) {
      return res.status(200).json([]);
    }

    const fileData = await fs.readFile(DATA_FILE, "utf-8");
    const allStrings = fileData.trim() ? JSON.parse(fileData) : [];

    res.status(200).json(allStrings);
  } catch (error) {
    console.error("Error reading strings:", error);
    res.status(500).json({ error: "Failed to retrieve strings" });
  }
});

// POST new string analysis
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

export default stringRoutes;
