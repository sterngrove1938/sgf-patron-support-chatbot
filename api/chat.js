const DEFAULT_MODEL = "gpt-5.4-mini";

const ESCALATION_COPY = {
  cannotAnswer:
    "I do not know the answer to that. Please use the Ask a Staff Member button to contact the Stern Grove team.",
  didNotHelp:
    "I am sorry that did not solve it. Please use the Ask a Staff Member button to contact the Stern Grove team."
};

const HIGH_RISK_PATTERNS = [
  /\b(did i win|didn't win|lottery result|personal lottery|my entry|my account)\b/i,
  /\b(wrong email|never received.*email|qr code.*scan|at the gate right now)\b/i,
  /\b(refund|tax receipt|receipt|payment|charge|change my date|donation back|donated last year)\b/i,
  /\b(exception|override|guarantee|guaranteed entry)\b/i,
  /\b(harass|harassed|harassment|misconduct|unsafe|safety report)\b/i,
  /\b(rain.*cancel|weather.*cancel|cancelled|canceled)\b/i
];

const SEATING_AREAS_URL = "https://www.sterngrove.org/seating-areas";

const LINEUP = [
  {
    artist: "Peter Cat Recording Co.",
    date: "Sunday, June 14, 2026",
    lottery: "May 3, 2026 to May 10, 2026",
    lotteryStart: "2026-05-03",
    lotteryEnd: "2026-05-10",
    aliases: ["peter cat", "june 14", "jun 14"]
  },
  {
    artist: "Bomba Estereo",
    date: "Sunday, June 21, 2026",
    lottery: "May 10, 2026 to May 17, 2026",
    lotteryStart: "2026-05-10",
    lotteryEnd: "2026-05-17",
    aliases: ["bomba", "june 21", "jun 21"]
  },
  {
    artist: "Japanese Breakfast",
    date: "Sunday, June 28, 2026",
    lottery: "May 17, 2026 to May 24, 2026",
    lotteryStart: "2026-05-17",
    lotteryEnd: "2026-05-24",
    aliases: ["japanese breakfast", "june 28", "jun 28"]
  },
  {
    artist: "Major Lazer",
    date: "Sunday, July 5, 2026",
    lottery: "May 24, 2026 to May 31, 2026",
    lotteryStart: "2026-05-24",
    lotteryEnd: "2026-05-31",
    aliases: ["major lazer", "july 5", "jul 5"]
  },
  {
    artist: "San Francisco Symphony / Bela Fleck",
    date: "Sunday, July 12, 2026",
    lottery: "May 31, 2026 to June 7, 2026",
    lotteryStart: "2026-05-31",
    lotteryEnd: "2026-06-07",
    aliases: ["sf symphony", "san francisco symphony", "bela fleck", "july 12", "jul 12"]
  },
  {
    artist: "Charley Crockett",
    date: "Sunday, July 19, 2026",
    lottery: "June 7, 2026 to June 14, 2026",
    lotteryStart: "2026-06-07",
    lotteryEnd: "2026-06-14",
    aliases: ["charley crockett", "july 19", "jul 19"]
  },
  {
    artist: "Suki Waterhouse",
    date: "Sunday, July 26, 2026",
    lottery: "June 14, 2026 to June 21, 2026",
    lotteryStart: "2026-06-14",
    lotteryEnd: "2026-06-21",
    aliases: ["suki waterhouse", "july 26", "jul 26"]
  },
  {
    artist: "Violent Femmes",
    date: "Sunday, August 2, 2026",
    lottery: "June 21, 2026 to June 28, 2026",
    lotteryStart: "2026-06-21",
    lotteryEnd: "2026-06-28",
    aliases: ["violent femmes", "august 2", "aug 2"]
  },
  {
    artist: "Patti LaBelle",
    date: "Sunday, August 9, 2026",
    lottery: "June 28, 2026 to July 5, 2026",
    lotteryStart: "2026-06-28",
    lotteryEnd: "2026-07-05",
    aliases: ["patti labelle", "august 9", "aug 9"]
  },
  {
    artist: "Public Enemy",
    date: "Saturday, August 15, 2026",
    lottery: "July 4, 2026 to July 11, 2026",
    lotteryStart: "2026-07-04",
    lotteryEnd: "2026-07-11",
    aliases: ["public enemy", "august 15", "aug 15"]
  },
  {
    artist: "Al Green",
    date: "Sunday, August 16, 2026",
    lottery: "July 5, 2026 to July 12, 2026",
    lotteryStart: "2026-07-05",
    lotteryEnd: "2026-07-12",
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

function getPacificDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getCurrentLotteryShows() {
  const today = getPacificDateKey();
  return LINEUP.filter((show) => today >= show.lotteryStart && today <= show.lotteryEnd);
}

function shouldEscalateLocally(message) {
  return HIGH_RISK_PATTERNS.some((pattern) => pattern.test(message));
}

function buildInstructions() {
  return [
    "You are the Stern Grove Festival patron support chatbot.",
    "Answer only from the Stern Grove Festival information provided in the current request.",
    "Never answer from general web knowledge.",
    "Never invent policy, deadlines, addresses, links, exceptions, outcomes, or personal status.",
    "Preserve numbers, dimensions, dates, times, prices, addresses, and email addresses exactly as shown.",
    "Start with the direct answer and keep it concise.",
    "If the answer is not clearly available, use the required escalation copy exactly.",
    "Do not mention source packs, approved materials, source material, excerpts, documents, references, internal guidance, or how you know or do not know something.",
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
      `Festival information ${index + 1}: ${result.filename}`,
      result.text
    ].join("\n"))
    .join("\n\n---\n\n");
}

function stripRoutineFollowUp(reply) {
  return reply
    .replace(/\s*Did this answer your question\?\s*$/i, "")
    .trim();
}

function stripMarkdownArtifacts(reply) {
  return reply
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*{2,}/g, "")
    .trim();
}

function cleanReply(reply) {
  return stripMarkdownArtifacts(stripRoutineFollowUp(reply));
}

function isSpecificBringQuestion(message) {
  return /\b(can|may|could|should)\s+i\s+(bring|take|have)\b/i.test(message) ||
    /\b(is|are)\s+.+\s+(allowed|permitted)\b/i.test(message);
}

function isReservedTablePricingQuestion(message) {
  return /\b(how much|cost|costs|price|prices|pricing)\b.*\b(table|tables|reserved seat|reserved seats|community table|standard table|premium table)\b/i.test(message) ||
    /\b(table|tables|reserved seat|reserved seats|community table|standard table|premium table)\b.*\b(how much|cost|costs|price|prices|pricing)\b/i.test(message);
}

function isIdentityWelcomeQuestion(message) {
  return /\b(are|is|can|may|could)\b.+\b(allowed|welcome|come|attend|go)\b/i.test(message) &&
    /\b(muslim|muslims|jewish|jews|christian|christians|hindu|hindus|buddhist|buddhists|gay|lesbian|queer|trans|transgender|lgbtq|disabled|black|asian|latino|latina|immigrant|immigrants|faggots?)\b/i.test(message);
}

function answerFromSourcePack(message, sourceResults) {
  const normalized = message.toLowerCase();

  if (isIdentityWelcomeQuestion(message)) {
    return "Yes. Everyone is welcome at Stern Grove Festival with a valid ticket and respectful behavior. Harassment, offensive comments, threats, intimidation, and disruptions are not allowed.";
  }

  if (/\b(who can'?t come|who cannot come|who is not allowed|who isn't allowed)\b/i.test(message)) {
    return "Stern Grove Festival is open to ticketed attendees who follow the Code of Conduct and venue rules. Every attendee needs a valid ticket to enter.";
  }

  if (/\b(pissed|angry|mad|upset|unhappy|not happy|bad experience|didn'?t let me in|wouldn'?t let me in|complain|complaint)\b/i.test(message) && !/\b(harass|harassed|harassment|misconduct|threat|unsafe|security)\b/i.test(message)) {
    return "I am sorry you had a frustrating experience. If you are on site during a show day, please visit the Info Booth in the Esplanade. You can also use the Ask a Staff Member button to contact the Stern Grove team.";
  }

  if (/\b(employee|staff|security).*\b(harass|harassed|harrased|harassment|misconduct|unsafe)\b/i.test(message) || /\b(harass|harassed|harrased|harassment|misconduct|unsafe).*\b(employee|staff|security)\b/i.test(message)) {
    return "I am sorry that happened. Please report the concern to Staff, Security, or hr@sterngrove.org. If you are on site and need immediate help, notify the nearest staff member or security guard.";
  }

  if (/\b(harass|harassed|harrased|harassment|misconduct|unsafe|safety report|threat|threatened)\b/i.test(message)) {
    return "Please report the concern to Staff, Security, or hr@sterngrove.org. If you are on site and need immediate help, notify the nearest staff member or security guard.";
  }

  if (/\b(employee|staff|security).*\b(name|names|who works|identify|identity|company)\b/i.test(message) || /\b(security company)\b/i.test(message)) {
    return "I cannot help identify individual employees or security providers. For patron support, use the Ask a Staff Member button.";
  }

  if (/\b(lost|lose|missing|can'?t find|cannot find).*\b(child|kid|son|daughter|minor)\b/i.test(message) || /\b(child|kid|son|daughter|minor).*\b(lost|lose|missing|can'?t find|cannot find)\b/i.test(message)) {
    return "If a child is lost or missing, notify the nearest staff member, security guard, paramedic, police officer, or park ranger immediately.";
  }

  if (/\b(emergency|urgent help|911|medical help|medical emergency|medical condition|chronic condition|medic|medics|paramedic|paramedics|first aid|overdose)\b/i.test(message)) {
    return "In an emergency, notify the nearest staff member, security guard, paramedic, police officer, or park ranger. The paramedic tent is located in the Esplanade.";
  }

  if (/\b(narcan|naloxone)\b/i.test(message)) {
    if (/\b(can|may|could|should).*\b(bring|take|carry)\b/i.test(message) || /\b(bring|take|carry)\b/i.test(message)) {
      return "Yes. Patrons may bring Narcan. Narcan is also available at the paramedic tent in the Esplanade.";
    }

    return "Narcan is available at the paramedic tent in the Esplanade.";
  }

  if (/\b(sex|sexual activity|porn|explicit|suck a dick|sucking dick).*\b(show|festival|concert|grove|venue)\b/i.test(message) || /\b(show|festival|concert|grove|venue).*\b(sex|sexual activity|porn|explicit|suck a dick|sucking dick)\b/i.test(message)) {
    return "No. Sexual activity or explicit filming is not permitted at the Festival. Behavior that disturbs the peace, endangers patrons, or disrupts the event is prohibited.";
  }

  if (/\b(which|what).*\blottery.*\b(open|available|right now|currently)\b/i.test(message)) {
    const openLotteries = getCurrentLotteryShows();
    if (!openLotteries.length) {
      return "I do not know which lottery is open today. Please use the Ask a Staff Member button to contact the Stern Grove team.";
    }

    if (openLotteries.length === 1) {
      const [show] = openLotteries;
      return `The currently open lottery is ${show.artist}. It runs ${show.lottery}.`;
    }

    return `The currently open lotteries are ${openLotteries.map((show) => `${show.artist} (${show.lottery})`).join("; ")}.`;
  }

  if (/\b(why).*\b(lottery|tickets?)\b/i.test(message) || /\blottery system\b/i.test(message)) {
    return [
      "Stern Grove uses a free ticket lottery because demand is higher than the venue's permitted capacity of 10,000 people.",
      "",
      "Tickets help manage crowd size, support safety and security scans, and allow the Festival to contact attendees if something changes."
    ].join("\n");
  }

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

  if (isReservedTablePricingQuestion(message)) {
    return [
      "Table seat costs:",
      "",
      "Community Table Seat (1) - $200",
      "Standard Table (10) - $2,000",
      "Premium Table (10) - $4,000",
      "",
      "Prices increase during Big Picnic Weekend due to elevated production and hospitality offerings."
    ].join("\n");
  }

  if (/\b(map|pick|choose|select).*\b(table|seat)\b/i.test(message) || /\b(table|seat).*\b(map|pick|choose|select)\b/i.test(message)) {
    return "No. Tables are assigned by the team based on availability, table level, date of reservation, and accessibility needs. Map-based selection is not available.";
  }

  if (/\b(map|festival map|venue map|seating map|see a map|find a map)\b/i.test(message)) {
    return `You can find seating and venue-area information at ${SEATING_AREAS_URL}.`;
  }

  if (/\b(book|reserve|purchase|get).*\b(reserved tables?|picnic tables?|table)\b/i.test(message)) {
    return "Reserved tables can be reserved by making a donation through each show's page. For reserved table questions, contact development@sterngrove.org or call 415-625-6006.";
  }

  if (/\b(vip|donor|reserved table|reserved tables|table holder|table guest|donated).*\b(check in|check-in|entrance|enter|entry|where do i go|where to go|go)\b/i.test(message) || /\b(check in|check-in|entrance|enter|entry|where do i go|where to go|where is|go).*\b(vip|donor|reserved table|reserved tables|table holder|table guest|donated)\b/i.test(message)) {
    return "VIP, donor, and reserved-table guests can check in at any of the three entrances. The Vale Ave entrance is for VIP, donor, and reserved-table guests only.";
  }

  if (/\b(gates open|gate open|queue|dj|show time|what time.*show|schedule)\b/i.test(message)) {
    return "Queue opens at 10:00 AM, gates open at 12:00 PM, the DJ starts at 1:00 PM, and the opening act begins at 2:00 PM.";
  }

  if (/\b(bart)\b/i.test(message)) {
    return "Yes. You can take BART to Civic Center and transfer to Muni Metro M Ocean View or K Ingleside; take BART to Glen Park Station and transfer to MUNI bus 23-Monterey; or take BART to Daly City and transfer to MUNI bus 28-19th Avenue.";
  }

  if (/\b(bike|biking|bicycle|bike valet)\b/i.test(message)) {
    if (/\b(forgot|left|pick up|pickup|retrieve|retriev).*\b(bike|bicycle)\b/i.test(message) || /\b(bike|bicycle).*\b(forgot|left|pick up|pickup|retrieve|retriev)\b/i.test(message)) {
      return "Use the Ask a Staff Member button for help with a bicycle left at Bike Valet or other lost-and-found questions.";
    }

    return "Yes. Biking is encouraged. There is a free Bike Valet located at 21st and Wawona, open from 11:00 AM to 1 hour after the show. Bicycles are not allowed in the Concert Meadow, so please store bicycles at the bike valet.";
  }

  if (/\b(ada placard|ada parking|accessible parking)\b/i.test(message)) {
    return "ADA Parking is available first-come, first-served along the North side of Sloat Blvd between 19th Ave and 22nd Ave. ADA Parking is limited.";
  }

  if (/\b(senior seating|senior section|seniors)\b/i.test(message)) {
    return "The Senior Seating Section is first-come, first-served inside the Concert Meadow for seniors 65+. It has bench seating, capacity is limited, and guests and one companion are invited to sit in this section.";
  }

  if (/\b(prove|proof|documentation|documented|qualify|qualification).*\b(ada|accessible|accessibility|disability|disabled)\b/i.test(message) || /\b(ada|accessible|accessibility|disability|disabled).*\b(prove|proof|documentation|documented|qualify|qualification)\b/i.test(message)) {
    return "ADA Seating is for guests requiring ADA accommodations but not using a wheelchair. It is first-come, first-served with limited capacity. Please see a staff member on-site for help locating the area or for questions about accommodations.";
  }

  if (/\b(entrance|entrances|enter|entry gate|ga entrance|gate)\b/i.test(message)) {
    return "The two GA entrances are 19th Ave & Sloat Blvd and 23rd Ave & Wawona St. VIP, donor, and reserved-table guests can also check in at the Vale Ave entrance. Vale Ave is not open for GA entry.";
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

  if (/\b(job|jobs|career|careers|employment|hiring|work at|apply to work|open position|open positions)\b/i.test(message)) {
    return "For jobs and employment opportunities with Stern Grove Festival, visit sterngrove.org/jobs.";
  }

  if (/\b(lost|found|left my|jacket|lost and found)\b/i.test(message)) {
    return "Use the Ask a Staff Member button for patron support and lost-and-found questions.";
  }

  if (/\b(donate|donation|support stern grove)\b/i.test(message)) {
    return "Stern Grove Festival is free and nonprofit. Guests can support the Festival by donating at sterngrove.org/donate.";
  }

  const lineupMatch = LINEUP.find((show) => show.aliases.some((alias) => normalized.includes(alias)));
  if (lineupMatch && /\b(what time|go on stage|set time|start time|starts?|stage)\b/i.test(message)) {
    return "The general show schedule is: queue opens at 10:00 AM, gates open at 12:00 PM, the DJ starts at 1:00 PM, and the opening act begins at 2:00 PM.";
  }

  if (/\b(shade|shaded|shady)\b/i.test(message)) {
    return "Shade is not guaranteed. Tents, umbrellas, and shade structures are not allowed.";
  }

  if (/\b(service dog|service animal|support animal|emotional support animal|esa)\b/i.test(message)) {
    return "Yes. Properly documented service and support animals are allowed throughout the venue. Leashed pets are allowed in the West Meadow only, not the Concert Meadow.";
  }

  if (/\b(dog|cat|animal|pet|pets)\b/i.test(message)) {
    return "Leashed pets are allowed in the West Meadow only, not the Concert Meadow. Properly documented service and support animals are allowed throughout the venue.";
  }

  if (/\b(free water|water fountain|water fountains|drinking water)\b/i.test(message)) {
    return "Stern Grove Festival does not provide free water, but there are water fountains located near the Esplanade restrooms.";
  }

  if (/\b(long island|cocktail|mixed drink|liquor|hard alcohol)\b/i.test(message)) {
    return "Bars serve beer, wine, and non-alcoholic beverages.";
  }

  if (/\b(food for sale|food.*on-?site|vendors?|food trucks?|bar|beer.*sale|wine.*sale|buy food|purchase food)\b/i.test(message)) {
    return "Yes. Tante's is located in the Esplanade, rotating food trucks are located in the West Meadow, and bars serve beer, wine, and non-alcoholic beverages. Every purchase supports Stern Grove Festival.";
  }

  if (/\b(own food|own beer|own drinks?|bring.*food|bring.*beer|bring.*drinks?|bring.*beverages?|food and beer|alcohol)\b/i.test(message)) {
    return "Yes. You may bring your own food, beverages, picnics, and coolers. Alcohol is permitted for patrons of legal drinking age, 21+. Barbecues, grills, and any items with open flame are not allowed.";
  }

  if (/\b(tent|umbrella|shade structure|shade structures|tarp)\b/i.test(message)) {
    return "No. Tents, umbrellas, shade structures, and tarps are not allowed.";
  }

  if (/\b(gun|firearm|firearms|weapon|weapons|sword|knife|knives)\b/i.test(message)) {
    if (/\b(butter knife)\b/i.test(message)) {
      return "Sharp knives with a blade longer than 4 inches are not allowed. If you are unsure whether a knife is permitted, use the Ask a Staff Member button.";
    }

    return "No. Firearms and weapons of any kind are not allowed at the Grove.";
  }

  if (/\b(illegal substances?|narcotics?|drug paraphernalia|drugs?|edibles?|gummies|thc|cbd)\b/i.test(message)) {
    return "No. Illegal substances, including narcotics, and drug paraphernalia are not allowed.";
  }

  if (/\b(smoking|smoke|cigarette|vape|vaping|weed|marijuana|cannabis)\b/i.test(message)) {
    return "No. Smoking and vaping are prohibited at the Grove.";
  }

  if (/\b(phone photos?|phone videos?|take (a )?(photo|picture|pic|video)|take photos?|take pictures?|record video|camera)\b/i.test(message)) {
    return "Yes. Patrons may use phones to take photos and videos. Professional camera equipment, video or audio recording equipment, and unauthorized recording of artists and performances are not allowed.";
  }

  if (/\b(laser pointer|laser pointers)\b/i.test(message)) {
    return "No. Laser pointers are not allowed at the Grove.";
  }

  if (/\b(drone|drones)\b/i.test(message)) {
    return "No. Drones are not allowed.";
  }

  if (/\b(folding chair|chair|chairs)\b/i.test(message)) {
    return "Low-profile lawn chairs are allowed. High-backed or standard folding chairs are not allowed.";
  }

  if (/\b(blanket|blankets)\b/i.test(message)) {
    return "Blankets no larger than 5x7 feet are allowed. Tarps and blankets bigger than 5x7 feet are not allowed.";
  }

  if (/\b(stroller|strollers|storller|stroler)\b/i.test(message)) {
    return "Strollers are allowed if they are folded during the performance and do not block walkways or aisles.";
  }

  if (/\b(cooler|coolers|picnic|picnics)\b/i.test(message)) {
    return "Yes. You may bring picnics, coolers, food, and beverages. Alcohol is permitted for patrons of legal drinking age, 21+.";
  }

  if (/\b(friends?|guests?|group)\b/i.test(message) && /\b(bring|come|attend|ticket|entry|enter)\b/i.test(message)) {
    return "Yes. Friends can attend, but every attendee needs a valid ticket to enter.";
  }

  if (isSpecificBringQuestion(message)) {
    return ESCALATION_COPY.cannotAnswer;
  }

  if (/\b(bring|allowed|allow|prohibited|ban|blanket|stroller)\b/i.test(message)) {
    return [
      "You may bring blankets no larger than 5x7 feet, low-profile lawn chairs, picnics, coolers, food, beverages, and alcohol if you are 21+. Strollers are allowed if they are folded during the performance and do not block walkways or aisles.",
      "",
      "Items that are not allowed include tarps, blankets bigger than 5x7 feet, pets in the Concert Meadow, sharp knives with a blade longer than 4 inches, high-backed or standard folding chairs, large or tall tables, tents, umbrellas, shade structures, barbecues, grills, open flame items, recording equipment, unauthorized photography or recording, certain professional camera equipment, bicycles in the Concert Meadow, skateboards, scooters, hoverboards, personal motorized vehicles in the Esplanade or Concert Meadow, firearms or weapons, drones, laser pointers, fireworks, explosives, illegal substances, amplified sound, smoking, and vaping.",
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
  const directAnswer = answerFromSourcePack(message, []);
  if (directAnswer) {
    return {
      reply: directAnswer,
      mode: "source_pack"
    };
  }

  const apiKey = getEnv("OPENAI_API_KEY");
  const vectorStoreId = getEnv("OPENAI_VECTOR_STORE_ID");
  const model = getEnv("OPENAI_MODEL", DEFAULT_MODEL);

  if (!apiKey || !vectorStoreId) {
    return {
      reply:
        "I do not know the answer to that right now. Please use the Ask a Staff Member button to contact the Stern Grove team.",
      mode: "stub"
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
            "Stern Grove Festival information:",
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
    reply: reply ? cleanReply(reply) : ESCALATION_COPY.cannotAnswer,
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

  const directAnswer = answerFromSourcePack(message, []);
  if (directAnswer) {
    return jsonResponse(200, {
      reply: directAnswer,
      escalate: false,
      mode: "source_pack"
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
