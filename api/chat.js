const DEFAULT_MODEL = "gpt-5.4-mini";

const ESCALATION_COPY = {
  cannotAnswer:
    "I do not have confirmed information on that from Stern Grove's approved materials. Please use the Ask a Staff Member button to contact the Stern Grove team through the Patron Experience Form.",
  didNotHelp:
    "I am sorry that did not solve it. Please use the Ask a Staff Member button to contact the Stern Grove team through the Patron Experience Form."
};

const HIGH_RISK_PATTERNS = [
  /\b(did i win|didn't win|lottery result|personal lottery|my entry|my account)\b/i,
  /\b(wrong email|never received.*email|qr code.*scan|at the gate right now)\b/i,
  /\b(refund|tax receipt|receipt|payment|charge|change my date|donation back|donated last year)\b/i,
  /\b(exception|override|guarantee|guaranteed entry)\b/i,
  /\b(harass|harassed|harassment|misconduct|unsafe|safety report)\b/i,
  /\b(chronic condition|medical|emergency|911|urgent help)\b/i,
  /\b(rain.*cancel|weather.*cancel|cancelled|canceled)\b/i
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
    "Do not end routine answers with: Did this answer your question?",
    "Only ask 'Did this answer your question?' if the patron clearly appears to be wrapping up the conversation.",
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

function stripRoutineFollowUp(reply) {
  return reply
    .replace(/\s*Did this answer your question\?\s*$/i, "")
    .trim();
}

function hasSource(results, filename) {
  return results.some((result) => result.filename === filename);
}

function answerFromSourcePack(message, sourceResults) {
  const normalized = message.toLowerCase();

  if (/\b(free ticket|free tickets|get.*ticket|ga lottery|general admission lottery)\b/i.test(message)) {
    return "Stern Grove Festival concerts are free, but entry requires a free General Admission ticket obtained through a random lottery. Each concert has its own separate lottery, and you must register individually for every show you want to attend. Lotteries open on a rolling basis throughout the season, starting in early May.";
  }

  if (/\b(kids|children|child|infant|baby).*\b(ticket|tickets|own ticket)\b/i.test(message)) {
    return "Children 3 and older need a ticket, and every attendee needs a free ticket to enter the venue. An infant held in someone's arms does not count toward the seat count. Any child who needs their own seat or space does count.";
  }

  if (/\b(random|demographic|answers affect|chances|past entries|wins|losses)\b/i.test(message)) {
    return "Yes. The lottery is completely random. Demographic-question answers do not affect your chances, and past entries, wins, or losses do not affect your chances. Every entry is a fresh start.";
  }

  if (/\b(give|forward|send|transfer).*\b(ticket|pdf|qr|friend)\b/i.test(message)) {
    return "Yes. You may forward your ticket to a friend by sending them the PDF ticket with the unique QR code. As long as they have that QR code, they can get in.";
  }

  if (/\b(how much|cost|price|pricing).*\b(reserved picnic table|reserved table|picnic table|community table|standard table|premium table)\b/i.test(message) || /\b(reserved picnic table|reserved table|picnic table|community table|standard table|premium table).*\b(cost|price|how much|pricing)\b/i.test(message)) {
    return "Reserved table pricing is $200 for a Community Table Seat, $2,000 for a Standard Table that seats 10, and $4,000 for a Premium Table that seats 10. Prices increase during Big Picnic Weekend due to elevated production and hospitality offerings.";
  }

  if (/\b(map|pick|choose|select).*\b(table|seat)\b/i.test(message) || /\b(table|seat).*\b(map|pick|choose|select)\b/i.test(message)) {
    return "No. Tables are assigned by the team based on availability, table level, date of reservation, and accessibility needs. Map-based selection is not available.";
  }

  if (/\b(book|reserve|purchase|get).*\b(reserved table|picnic table|table)\b/i.test(message)) {
    return "Reserved tables can be reserved by making a donation through each show's page. For reserved table questions, contact development@sterngrove.org or call 415-625-6006.";
  }

  if (/\b(gates open|gate open|queue|dj|show time|what time.*show|schedule)\b/i.test(message)) {
    return "Queue opens at 10:00 AM, gates open at 12:00 PM, DJ is at 1:00 PM, and the show is at 2:00 PM.";
  }

  if (/\b(bart)\b/i.test(message)) {
    return "Yes. You can take BART to Civic Center and transfer to Muni Metro M Ocean View or K Ingleside; take BART to Glen Park Station and transfer to MUNI bus 23-Monterey; or take BART to Daly City and transfer to MUNI bus 28-19th Avenue.";
  }

  if (/\b(bike|biking|bicycle|bike valet)\b/i.test(message)) {
    return "Yes. Biking is encouraged. There is a free Bike Valet located at 21st and Wawona, open from 11:00 AM to 1 hour after the show. Bicycles are not allowed in the Concert Meadow, so please store bicycles at the bike valet.";
  }

  if (/\b(ada placard|ada parking|accessible parking)\b/i.test(message)) {
    return "ADA Parking is available first-come, first-served along the North side of Sloat Blvd between 19th Ave and 22nd Ave. ADA Parking is limited.";
  }

  if (/\b(senior seating|senior section|seniors)\b/i.test(message)) {
    return "The Senior Seating Section is first-come, first-served inside the Concert Meadow for seniors 65+. It has bench seating, capacity is limited, and guests and one companion are invited to sit in this section.";
  }

  if (/\b(where is|located|address|location|venue)\b/i.test(message)) {
    return "Stern Grove Festival takes place at Sigmund Stern Grove, located at the corner of 19th Avenue and Sloat Boulevard in San Francisco, CA 94132.";
  }

  if (/\b(where.*park|parking|public parking lot|street parking)\b/i.test(message)) {
    return "There is no public parking lot. Street parking is extremely limited. If parking in neighborhoods near the Grove, please respect neighbors and do not block driveways. The Festival recommends taking public transportation, rideshare, or biking.";
  }

  if (/\b(shuttle|use the shuttle)\b/i.test(message)) {
    return "Shuttle service is available for seniors and guests requiring ADA accommodations, plus one companion. Pickup locations are 19th Ave & Sloat Blvd, Vale Ave & Crestlake Dr, and 20th Ave & Wawona St. All inbound and outbound shuttles use the Vale Avenue Entrance. Shuttle hours are 11:00 AM to 5:30 PM.";
  }

  if (/\b(volunteer|volunteering)\b/i.test(message)) {
    return "Volunteers can sign up at sterngrove.org/volunteer. All volunteer roles are for people 18 and older. Volunteer benefits may include two General Admission tickets to a future show, community service hours, team-building opportunities, merchandise discounts, connection with fellow music lovers, and behind-the-scenes Festival experience.";
  }

  if (/\b(lost|found|left my|jacket|lost and found)\b/i.test(message)) {
    return "Use the Ask a Staff Member button for patron support and lost-and-found questions.";
  }

  if (/\b(donate|donation|support stern grove)\b/i.test(message)) {
    return "Stern Grove Festival is free and nonprofit. Guests can support the Festival by donating at sterngrove.org/donate.";
  }

  const lineupMatch = LINEUP.find((show) => show.aliases.some((alias) => normalized.includes(alias)));
  if (lineupMatch && /\b(what time|go on stage|set time|start time|starts?|stage)\b/i.test(message)) {
    return "The Source Pack gives the general show schedule: queue opens at 10:00 AM, gates open at 12:00 PM, DJ is at 1:00 PM, and the show is at 2:00 PM. It does not provide artist-specific set times.";
  }

  if (/\b(service dog|service animal|support animal)\b/i.test(message)) {
    return "Yes. Service or support animals are allowed throughout the venue. Leashed pets are allowed in the West Meadow only, not the Concert Meadow.";
  }

  if (/\b(dog|pet|pets)\b/i.test(message)) {
    return "Leashed pets are allowed in the West Meadow only, not the Concert Meadow. Service or support animals are allowed throughout the venue.";
  }

  if (/\b(food for sale|food.*on-?site|vendors?|food trucks?|bar|beer.*sale|wine.*sale|buy food|purchase food)\b/i.test(message)) {
    return "Yes. Tante's is located in the Esplanade, rotating food trucks are located in the West Meadow, and bars serve beer, wine, and non-alcoholic beverages. Every purchase supports Stern Grove Festival.";
  }

  if (/\b(own food|own beer|bring.*food|bring.*beer|food and beer|alcohol)\b/i.test(message)) {
    return "Yes. You may bring your own food, beverages, picnics, and coolers. Alcohol is permitted for patrons of legal drinking age, 21+. Barbecues, grills, and any items with open flame are not allowed.";
  }

  if (/\b(tent|umbrella|shade structure|shade structures|tarp)\b/i.test(message)) {
    return "No. Tents, umbrellas, shade structures, and tarps are not allowed.";
  }

  if (/\b(smoking|smoke|cigarette|vape)\b/i.test(message)) {
    return "No. Smoking is prohibited at the Grove.";
  }

  if (/\b(drone|drones)\b/i.test(message)) {
    return "No. Drones are not allowed.";
  }

  if (/\b(folding chair|chair|chairs)\b/i.test(message)) {
    return "Low-profile lawn chairs are allowed. High-backed or standard folding chairs are not allowed.";
  }

  if (/\b(bring|allowed|allow|prohibited|ban|blanket|stroller)\b/i.test(message)) {
    return [
      "You may bring blankets no larger than 5x7 feet, low-profile lawn chairs, picnics, coolers, food, beverages, and alcohol if you are 21+. Strollers are allowed if they are folded during the performance and do not block walkways or aisles.",
      "",
      "Items that are not allowed include tarps, blankets bigger than 5x7 feet, pets in the Concert Meadow, sharp knives with a blade longer than 4 inches, high-backed or standard folding chairs, large or tall tables, tents, umbrellas, shade structures, barbecues, grills, open flame items, recording equipment, unauthorized photography or recording, certain professional camera equipment, bicycles in the Concert Meadow, skateboards, scooters, hoverboards, personal motorized vehicles in the Esplanade or Concert Meadow, firearms or weapons, drones, fireworks, explosives, illegal substances, amplified sound, and smoking.",
    ].join("\n");
  }

  if (/\b(muni|metro|bus|public transportation|transit|train)\b/i.test(message)) {
    return "Take Muni Metro lines M Ocean View or K Ingleside and exit at St. Francis Circle stop, then walk west one block to the park entrance at 19th Avenue and Sloat Boulevard. You can also take Muni Bus lines 23-Monterey or 28-19th Avenue, which stop right at 19th Avenue and Sloat Boulevard.";
  }

  if (lineupMatch) {
    return `${lineupMatch.artist} is playing on ${lineupMatch.date}. The lottery runs ${lineupMatch.lottery}.`;
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
    reply: reply ? stripRoutineFollowUp(reply) : ESCALATION_COPY.cannotAnswer,
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

  if (/^(yes|yep|yeah|yes thanks|thank you|thanks|that helps|all set|that's all|thats all)$/i.test(message)) {
    return jsonResponse(200, {
      reply: "Glad I could help.",
      escalate: false,
      reason: "conversation_closed"
    });
  }

  if (/^(thanks|thank you).*(all set|that's all|thats all|done)$/i.test(message)) {
    return jsonResponse(200, {
      reply: "Glad I could help.",
      escalate: false,
      reason: "conversation_closed"
    });
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
