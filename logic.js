import crypto from "crypto";

function analyzeLogic(string) {
  function checkPalindrome(str) {
    const cleanedStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const reversedStr = cleanedStr.split("").reverse().join("");
    return cleanedStr === reversedStr;
  }

  const sha256Hash = crypto.createHash("sha256").update(string).digest("hex");

  function countCharFrequency(string) {
    const frequency = {};

    for (const char of string) {
      frequency[char] = (frequency[char] || 0) + 1;
    }

    return frequency;
  }

  const newData = {
    properties: {
      length: string.length,
      is_palindrome: checkPalindrome(string),
      unique_characters: new Set(string).size,
      word_count: string.trim().split(/\s+/).length,
      sha256_hash: sha256Hash,
      character_frequency_map: countCharFrequency(string),
    },
  };

  return newData;
}

export default analyzeLogic;
