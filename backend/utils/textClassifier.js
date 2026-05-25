import crypto from "node:crypto";
import { INDIAN_STATES, SUPPORTED_CROPS } from "../config/newsSources.js";

const categoryKeywords = {
  market: ["price", "msp", "mandi", "export", "import", "commodity", "arrival", "procurement"],
  weather: ["rain", "rainfall", "monsoon", "cyclone", "drought", "heat", "flood", "weather"],
  pest: ["pest", "disease", "locust", "worm", "borer", "blight", "rust", "fungus"],
  subsidy: ["subsidy", "scheme", "pm-kisan", "insurance", "pmfby", "loan", "credit"],
  government: ["ministry", "government", "pib", "cabinet", "policy", "parliament"],
};

const cropAliases = {
  Wheat: ["wheat", "gehun", "गेहूं", "ઘઉં"],
  Rice: ["rice", "paddy", "धान", "ચોખા", "ડાંગર"],
  Cotton: ["cotton", "kapas", "कपास", "કપાસ"],
  Groundnut: ["groundnut", "peanut", "मूंगफली", "મગફળી"],
  Sugarcane: ["sugarcane", "cane", "गन्ना", "શેરડી"],
  Vegetables: ["vegetable", "vegetables", "tomato", "onion", "brinjal", "potato", "सब्जी", "શાકભાજી"],
};

export const cleanText = (value = "") =>
  String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const titleHash = (title) =>
  crypto.createHash("sha256").update(cleanText(title).toLowerCase()).digest("hex");

export const detectCrops = (text) => {
  const normalized = text.toLowerCase();
  return SUPPORTED_CROPS.filter((crop) =>
    cropAliases[crop]?.some((alias) => normalized.includes(alias.toLowerCase()))
  );
};

export const detectStates = (text) => {
  const normalized = text.toLowerCase();
  return INDIAN_STATES.filter((state) => normalized.includes(state.toLowerCase()));
};

export const detectCategory = (text, fallback = "general") => {
  const normalized = text.toLowerCase();
  const match = Object.entries(categoryKeywords).find(([, words]) =>
    words.some((word) => normalized.includes(word))
  );
  return match?.[0] || fallback || "general";
};
