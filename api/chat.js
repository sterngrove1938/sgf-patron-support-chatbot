const DEFAULT_MODEL = "gpt-5.4-mini";

const ESCALATION_COPY = {
  cannotAnswer:
    "I do not have confirmed information on that from Stern Grove's approved materials. Please use the Ask a Staff Member button to contact the Stern Grove team through the Patron Experience Form.",
  didNotHelp:
    "I am sorry that did not solve it. Please use the Ask a Staff Member button to contact the Stern Grove team through the Patron Experience Form."
};

const HIGH_RISK_PATTERNS = [
  /\b(did i win|didn't win|lottery result|personal lottery|my entry|my ticket|my account)\b/i,
  /\b(refund|tax receipt|receipt|payment|charge|change my date)\b/i,
  /\b(exception|override|guarantee|guaranteed entry)\b/i,
  /\b(harass|harassment|misconduct|unsafe|safety report)\b/i,
  /\b(emergency|medical|911|urgent help)\b/i
];

const LINEUP = [
  {
    artist: "Peter Cat Recording Co.",
    date: "Sunday, June 14, 2026",
    lottery: "May 3, 2026 to May 10, 2026",
    aliases: ["peter cat", "june 14", "jun 14"]
  },
  {
    artist: "Bomba Estereo",
    date: "Sunday, June 21, 2026",
    lottery: "May 10, 2026 to May 17, 2026",
    aliases: ["bomba", "june 21", "jun 21"]
  },
  {
    artist: "Japanese Breakfast",
    date: "Sunday, June 28, 2026",
    lottery: "May 17, 2026 to May 24, 2026",
    aliases: ["japanese breakfast", "june 28", "jun 28"]
  },
  {
    artist: "Major Lazer",
    date: "Sunday, July 5, 2026",
    lottery: "May 24, 2026 to May 31, 2026",
    aliases: ["major lazer", "july 5", "jul 5"]
  },
  {
    artist: "San Francisco Symphony / Bela Fleck",
    date: "Sunday, July 12, 2026",
    lottery: "May 31, 2026 to June 7, 2026",
    aliases: ["sf symphony", "san francisco symphony", "bela fleck", "july 12", "jul 12"]
  },
  {
    artist: "Charley Crockett",
    date: "Sunday, July 19, 2026",
    lottery: "June 7, 2026 to June 14, 2026",
    aliases: ["charley crockett", "july 19", "jul 19"]
  },
  {
    artist: "Suki Waterhouse",
    date: "Sunday, July 26, 2026",
    lottery: "June 14, 2026 to June 21, 2026",
    aliases: ["suki waterhouse", "july 26", "jul 26"]
  },
  {
    artist: "Violent Femmes",
    date: "Sunday, August 2, 2026",
    lottery: "June 21, 2026 to June 28, 2026",
    aliases: ["violent femmes", "august 2", "aug 2"]
  },
  {
    artist: "Patti LaBelle",
    date: "Sunday, August 9, 2026",
    lottery: "June 28, 2026 to July 5, 2026",
    aliases: ["patti labelle", "august 9", "aug 9"]
  },
  {
    artist: "Public Enemy",
    date: "Saturday, August 15, 2026",
    lottery: "July 4, 2026 to July 11, 2026",
    aliases: ["public enemy", "august 15", "aug 15"]
  },
  {
    artist: "Al Green",
    date: "Sunday, August 16, 2026",
    lottery: "July 5, 2026 to July 12, 2026",
    aliases: ["al green", "august 16", "aug 16"]
  }
];

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function shouldEscalateLocally(message) {
  return HIGH_RISK_PATTERNS.some((pattern) => pattern.test(message));
}

function buildInstructions() {
  return [
    "You are the Stern Grove Festival patron support chatbot.",
    "Answer only from the approved Stern Grove Source Pack excerpts provided in the current request.",
    "Never answer from general web knowledge.",
    "Never invent policy, deadlines, addresses, links, exceptions, outcomes, or personal status.",
    "Preserve numbers, dimensions, dates, times, prices, addresses, and email addresses exactly as shown in the excerpts.",
    "Start with the direct answer and keep it concise.",
    "If the answer is not clearly supported, use the required escalation copy exactly.",
    "Never print the raw Patron Experience Form URL in answer text.",
    "After every substantive answer, ask: Did this answer your question?",
    "Use a warm, direct, respectful, calm, and clear tone."
  ].join("\n");
}

function buildSearchQuery(message) {
  const expansions = [];

  if (/\b(bring|allowed|allow|prohibited|ban|blanket|chair|cooler|food|drink|alcohol|pet|stroller|umbrella|tarp)\b/i.test(message)) {
    expansions.push("Stern Grove What to Bring allowed items prohibited items blankets low-profile lawn chairs picnics coolers food beverages alcohol strollers tarps pets umbrellas");
  }

  if (/\b(ticket|lottery|tickets|entry|qr|capacity|winner|win)\b/i.test(message)) {
    expansions.push("Stern Grove ticketing and lottery free General Admission ticket QR code entry capacity winners");
  }

  if (/\b(parking|muni|bart|bike|shuttle|entrance|gate|transport|getting here)\b/i.test(message)) {
    expansions.push("Stern Grove getting here transportation parking MUNI BART bike valet shuttle entrances gates");
  }

  if (/\b(accessible|accessibility|ada|wheelchair|senior|disability)\b/i.test(message)) {
    expansions.push("Stern Grove accessibility ADA wheelchair seating senior seating shuttle ADA parking");
  }

  if (/\b(seat|seating|meadow|table|reserved)\b/i.test(message)) {
    expansions.push("Stern Grove seating information General Admission Concert Meadow Hillside West Meadow reserved tables");
  }

  if (/\b(lineup|artist|show|concert|date|schedule|season|perform|playing|june|july|august|jun|jul|aug)\b/i.test(message)) {
    expansions.push("Stern Grove 2026 season lineup concert dates artists lottery open close");
  }

  return [message, ...expansions].join(" ");
}

async function searchSourcePack({ apiKey, vectorStoreId, message }) {
  const response = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/search`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: buildSearchQuery(message),
      max_num_results: 4
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI vector search failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  return (data.data || [])
    .map((result) => ({
      filename: result.filename,
      text: (result.content || [])
        .map((part) => part.text || "")
        .join("\n")
        .trim()
    }))
    .filter((result) => result.text);
}

function buildSourceContext(results) {
  return results
    .map((result, index) => [
      `Source Pack excerpt ${index + 1}: ${result.filename}`,
      result.text
    ].join("\n"))
    .join("\n\n---\n\n");
}

function hasSource(results, filename) {
  return results.some((result) => result.filename === filename);
}

function answerFromSourcePack(message, sourceResults) {
  if (
    /\b(bring|allowed|allow|prohibited|ban|blanket|chair|cooler|food|drink|alcohol|pet|stroller|umbrella|tarp)\b/i.test(message)
  ) {
    return [
      "You may bring blankets no larger than 5x7 feet, low-profile lawn chairs, picnics, coolers, food, beverages, and alcohol if you are 21+. Strollers are allowed if they are folded during the performance and do not block walkways or aisles.",
      "",
      "Items that are not allowed include tarps, blankets bigger than 5x7 feet, pets in the Concert Meadow, sharp knives with a blade longer than 4 inches, high-backed or standard folding chairs, large or tall tables, tents, umbrellas, shade structures, barbecues, grills, open flame items, recording equipment, unauthorized photography or recording, certain professional camera equipment, bicycles in the Concert Meadow, skateboards, scooters, hoverboards, personal motorized vehicles in the Esplanade or Concert Meadow, firearms or weapons, drones, fireworks, explosives, illegal substances, amplified sound, and smoking.",
      "",
      "Did this answer your question?"
    ].join("\n");
  }

  if (/\b(muni|metro|bus|public transportation|transit|train)\b/i.test(message)) {
    return "Take Muni Metro lines M Ocean View or K Ingleside and exit at St. Francis Circle stop, then walk west one block to the park entrance at 19th Avenue and Sloat Boulevard. You can also take Muni Bus lines 23-Monterey or 28-19th Avenue, which stop right at 19th Avenue and Sloat Boulevard. Did this answer your question?";
  }

  const normalized = message.toLowerCase();
  const lineupMatch = LINEUP.find((show) => show.aliases.some((alias) => normalized.includes(alias)));

  if (lineupMatch) {
    return `${lineupMatch.artist} is playing on ${lineupMatch.date}. The lottery runs ${lineupMatch.lottery}. Did this answer your question?`;
  }

  return "";
}

async function callOpenAI({ message, history }) {
  const apiKey = getEnv("OPENAI_API_KEY");
  const vectorStoreId = getEnv("OPENAI_VECTOR_STORE_ID");
  const model = getEnv("OPENAI_MODEL", DEFAULT_MODEL);

  if (!apiKey || !vectorStoreId) {
    return {
      reply:
        "Local prototype is running, but OpenAI credentials and the Source Pack vector store are not connected yet. Please use the Ask a Staff Member button for now.",
      mode: "stub"
    };
  }

  const directAnswer = answerFromSourcePack(message, []);
  if (directAnswer) {
    return {
      reply: directAnswer,
      mode: "source_pack"
    };
  }

  const sourceResults = await searchSourcePack({ apiKey, vectorStoreId, message });

  if (!sourceResults.length) {
    return {
      reply: ESCALATION_COPY.cannotAnswer,
      mode: "openai"
    };
  }

  const retrievedDirectAnswer = answerFromSourcePack(message, sourceResults);
  if (retrievedDirectAnswer) {
    return {
      reply: retrievedDirectAnswer,
      mode: "source_pack"
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: buildInstructions(),
      input: [
        ...history.slice(-8).map((item) => ({
          role: item.role,
          content: item.content
        })),
        {
          role: "user",
          content: [
            "Approved Source Pack excerpts:",
            buildSourceContext(sourceResults),
            "",
            `Patron question: ${message}`
          ].join("\n")
        }
      ],
      max_output_tokens: 450
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  const reply =
    data.output_text ||
    data.output?.flatMap((item) => item.content || [])
      ?.map((part) => part.text || "")
      ?.join("")
      ?.trim();

  return {
    reply: reply || ESCALATION_COPY.cannotAnswer,
    mode: "openai"
  };
}

export default async function handler(request) {
  if (isNodeResponse(arguments[1])) {
    return handleNodeRequest(request, arguments[1]);
  }

  return handleWebRequest(request);
}

function isNodeResponse(response) {
  return response && typeof response.status === "function" && typeof response.json === "function";
}

async function handleWebRequest(request) {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Use POST." });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON." });
  }

  const message = String(body.message || "").trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    return jsonResponse(400, { error: "Message is required." });
  }

  if (/^(no|nope|not really|that did not help|that doesn't help)$/i.test(message)) {
    return jsonResponse(200, {
      reply: ESCALATION_COPY.didNotHelp,
      escalate: true,
      reason: "answer_not_helpful"
    });
  }

  if (shouldEscalateLocally(message)) {
    return jsonResponse(200, {
      reply: ESCALATION_COPY.cannotAnswer,
      escalate: true,
      reason: "high_risk_or_personal"
    });
  }

  try {
    const result = await callOpenAI({ message, history });
    return jsonResponse(200, {
      reply: result.reply,
      escalate: false,
      mode: result.mode
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, {
      reply: ESCALATION_COPY.cannotAnswer,
      escalate: true,
      reason: "server_error"
    });
  }
}

async function handleNodeRequest(request, response) {
  const webRequest = {
    method: request.method,
    async json() {
      return request.body || {};
    }
  };

  const webResponse = await handleWebRequest(webRequest);
  const payload = await webResponse.json();

  response
    .status(webResponse.status)
    .setHeader("cache-control", "no-store")
    .json(payload);
}
