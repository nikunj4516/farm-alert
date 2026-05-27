const htmlEntityMap: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

export const stripHtmlNoise = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");

export const isBlockedOrCaptchaContent = (value?: string | null) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ");

  return [
    "unusual traffic",
    "computer network",
    "not a robot",
    "automated requests",
    "captcha",
    "service terms",
    "sorry, but your computer or network may be sending automated queries",
    "आपके कंप्यूटर नेटवर्क से असामान्य ट्रैफ़िक",
    "क्या वास्तव में आप ही अनुरोध भेज रहे हैं",
    "रोबोट",
    "અસામાન્ય ટ્રાફિક",
    "રોબોટ",
  ].some((phrase) => normalized.includes(phrase));
};

export const cleanArticleText = (value?: string | null) => {
  const decoded = Object.entries(htmlEntityMap).reduce(
    (text, [entity, replacement]) => text.replace(new RegExp(entity, "g"), replacement),
    String(value || "")
  );

  const withoutTags = stripHtmlNoise(decoded)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]*>/g, " ");

  const seen = new Set<string>();
  const cleaned = withoutTags
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => {
      if (line.length < 25) return false;
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return !/(advertisement|subscribe|follow us|cookies|privacy policy|read more)/i.test(line);
    })
    .join("\n\n")
    .trim();

  return isBlockedOrCaptchaContent(cleaned) ? "" : cleaned;
};
