import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = "source-pack";

const docs = [
  {
    filename: "01-ticketing-and-lottery.md",
    title: "Stern Grove Festival - Ticketing and Lottery",
    content: `# Stern Grove Festival - Ticketing and Lottery

Source: sterngrove.org/faq, sterngrove.org/galotterytickets, sterngrove.org/ticket-info
Last updated: April 30, 2026
Document owner: Patron Experience / Ticketing Team

## Overview

Stern Grove Festival concerts are FREE. Entry requires a free General Admission (GA) ticket obtained through a lottery system. Tickets are distributed via a random lottery - not first-come, first-served.

## How the GA Lottery Works

### Step 1: Enter

- Each concert has its own separate lottery.
- You must register individually for every show you want to attend.
- Lotteries open on a rolling basis throughout the season, starting in early May.

### Step 2: Results

- The lottery is completely random.
- Your answers to demographic questions do not affect your chances.
- Past entries, wins, or losses do not affect your chances. Every entry is a fresh start.
- If you are uncomfortable answering demographic questions, you may select "Prefer not to state."

### Step 3: Receive Tickets

- Winners receive a PDF ticket with a unique QR code.
- You may forward your ticket to a friend. Send them the PDF with the QR code. As long as they have that code, they can get in.

## Ticket Policies

- Children 3 and older need a ticket.
- Every attendee needs a free ticket to enter the venue.
- Tickets from third parties will not be accepted.
- Admission is subject to venue capacity and safety guidelines; entry may be paused or limited.

## Why Tickets Are Required

Stern Grove requires tickets for entry because:

- Safety is a priority. Tickets help control crowd size.
- The venue has a permitted capacity of 10,000 people.
- Demand has greatly exceeded capacity in recent years.
- Tickets allow the Festival to communicate with attendees if something changes.
- Permits and insurance require crowd management processes and security scans.
- Artists require private soundchecks the morning of the show.

## Other Ways to Get Tickets

### Reserved Tables

Individual reserved seats and full picnic tables for 10 guests are available. Visit each show page on the lineup to choose your table type.

Pricing:

- $200 - Community Table Seat, seats 1: Reserved seat at a shared table with expedited check-in.
- $2,000 - Standard Table, seats 10: Reserved table, expedited check-in, and 3 parking passes for the Upper Lot.
- $4,000 - Premium Table, seats 10: Best views of the stage, customizable picnic lunch boxes, beer, wine, non-alcoholic beverages, welcome drinks in the historic Trocadero Clubhouse, expedited check-in, and 3 parking passes for the Backstage Lot.

Prices increase during Big Picnic Weekend due to elevated production and hospitality offerings.

Tables can be reserved by making a donation through each show's page. Contact development@sterngrove.org or call 415-625-6006.

### Table FAQs

- Tables are assigned by the team based on availability, table level, date of reservation, and accessibility needs. Map-based selection is not available.
- Table layouts may shift from concert to concert depending on artist production and audience demand.
- An infant held in someone's arms does not count toward the seat count. Any child who needs their own seat or space does count.
- If tables appear sold out, additional tables may be released closer to the concert date. Email development@sterngrove.org to join the waitlist.
- Donor tables are part of fundraising efforts. 95% of seating remains open and free. The true cost of each show is around $40 per person per concert.

### Community Box Office

Community Box Office tickets are also available. Visit sterngrove.org/community-box-offices for more information.

### Partner Giveaways

Partner giveaway tickets are also available. Visit sterngrove.org/partner-giveaways for more information.

### Volunteering

Volunteers receive two General Admission tickets to a future show. Visit sterngrove.org/volunteer to sign up.

## Contact for Ticket Questions

- Use the Ask a Staff Member button for patron support.
- Email: info@sterngrove.org
- Phone: 415.252.6252
`
  },
  {
    filename: "02-getting-here-transportation.md",
    title: "Stern Grove Festival - Getting Here and Transportation",
    content: `# Stern Grove Festival - Getting Here and Transportation

Source: sterngrove.org/getting-here
Last updated: April 30, 2026
Document owner: Operations Team

## Venue Location

Stern Grove Festival takes place at Sigmund Stern Grove, located at the corner of 19th Avenue and Sloat Boulevard in San Francisco, CA 94132.

## Entrances

Two GA entrances:

- 19th Ave & Sloat Blvd
- 23rd Ave & Wawona St

Important:

- Vale Ave is closed to GA entry.
- Overnight camping is not permitted.

## Schedule

- Queue opens: 10:00 AM
- Gates open: 12:00 PM
- DJ: 1:00 PM
- Show: 2:00 PM

Fans tend to arrive early to grab great seats. Plan ahead and expect lines at opening. There is a lively pre-show space with coffee, breakfast, and a bar.

## Parking

- There is NO public parking lot.
- Street parking is extremely limited.
- If parking in neighborhoods near the Grove, please respect neighbors and do not block driveways.
- The Festival recommends taking public transportation, rideshare, or biking.

## ADA Parking

- ADA Parking is available first-come, first-served along the North side of Sloat Blvd between 19th Ave and 22nd Ave.
- ADA Parking is limited.

## Reserved Table Parking

Reserved table packages include parking passes with specific instructions. Check your confirmation for details.

## Public Transportation

### MUNI

Muni Metro:

- Take lines M Ocean View or K Ingleside, exit at St. Francis Circle stop. Walk west one block to the park entrance at 19th Avenue and Sloat Boulevard.

Muni Bus:

- Lines 23-Monterey and 28-19th Avenue stop right at 19th Avenue and Sloat Boulevard.

### BART

- BART to Civic Center, then transfer to Muni Metro M Ocean View or K Ingleside.
- BART to Glen Park Station, then transfer to MUNI bus 23-Monterey.
- BART to Daly City, then transfer to MUNI bus 28-19th Avenue.

For transit information, visit www.511.org.

## Biking

Biking is encouraged. There is a free Bike Valet located at 21st and Wawona.

- Bike valet is open from 11:00 AM to 1 hour after the show.
- Bicycles are not allowed in the Concert Meadow. Please store bicycles at the bike valet.

## In-Venue Shuttle Service

Shuttle service is available for seniors and guests requiring ADA accommodations, plus one companion.

Pickup locations:

- 19th Ave & Sloat Blvd
- Vale Ave & Crestlake Dr
- 20th Ave & Wawona St

All inbound shuttles drop off at the Vale Avenue Entrance. All outbound shuttles depart from the Vale Avenue Entrance.

Hours of Operation: 11:00 AM - 5:30 PM

Service improvements:

- Faster service to reduce wait times
- Quicker access away from 19th & Sloat
- Improved pre-show experience while waiting for the Concert Meadow to open
- Additional restroom access near pickup areas
- Better emergency access for medical and fire services in seating areas

## Security and Entry

- Attendees are required to walk through Evolv Weapons Detection systems during entry.
- Please review the What to Bring list before arrival.
- After completing security screening, each attendee will have their free ticket scanned.
- Every attendee needs a free ticket to enter.
- Tickets from third parties will not be accepted.
- Admission is subject to venue capacity and safety guidelines; entry may be paused or limited.
`
  },
  {
    filename: "03-accessibility-ada.md",
    title: "Stern Grove Festival - Accessibility ADA",
    content: `# Stern Grove Festival - Accessibility ADA

Source: sterngrove.org/accessibility-ada
Last updated: April 30, 2026
Document owner: Operations / Patron Experience Team

## Overview

Stern Grove Festival is wheelchair, ADA, and senior 65+ accessible. All attendees requiring accommodations must have a General Admission ticket to attend.

## Wheelchair Seating Section

- There is limited capacity in the wheelchair seating section.
- Reservations are required to ensure comfort and mobility.
- Due to limited capacity, a spot cannot be guaranteed for every person who requests one.
- Wheelchair spots include you and up to 3 guests.
- There is a shuttle that takes you from street level to the concert meadow level.

## How to Reserve a Wheelchair Spot

- When entering the Free GA Ticket Lottery, you will be asked "Do you require wheelchair access?"
- Click "YES" to request your spot.
- This does NOT guarantee a wheelchair spot.
- Spots are accommodated via a wheelchair-only lottery.
- You will receive confirmation 4 weeks before the concert.

## ADA Seating Section

- First-come, first-served seating area inside the Concert Meadow for those requiring ADA accommodations but not using a wheelchair.
- Guests and one companion are invited to sit in these areas.
- Capacity is limited.
- Please see a member of staff for assistance locating this area.

## Senior Seating Section

- First-come, first-served seating section inside the Concert Meadow for seniors 65+.
- Senior Seating Section has bench seating.
- Guests and one companion are invited to sit in this section.
- Capacity is limited.
- There will be no saving seats for guests arriving later.
- Please see a member of staff for assistance locating this section.

## Shuttle Service

Shuttle service is available for seniors and guests requiring ADA accommodations, plus one companion.

Pickup locations:

- 19th Ave & Sloat Blvd
- Vale Ave & Crestlake Dr
- 20th Ave & Wawona St

All inbound shuttles drop off at the Vale Avenue Entrance. All outbound shuttles depart from the Vale Avenue Entrance.

Hours of Operation: 11:00 AM - 5:30 PM

## ADA Parking

- ADA Parking is available first-come, first-served along the North side of Sloat Blvd between 19th Ave and 22nd Ave.
- ADA Parking is limited.

## Reserved Table Accessibility

- Three reserved picnic tables are ADA-accessible.
- When purchasing a table, you will be prompted to indicate if you need it to be accessible.
- For more information on location, arrival instructions, and purchasing, contact development@sterngrove.org.

## Service and Support Animals

- Service or support animals are allowed throughout the venue.
- Leashed pets are allowed in the West Meadow only, not the Concert Meadow.

## Contact for Accessibility Questions

- Use the Ask a Staff Member button for patron support.
- Email: info@sterngrove.org
- Phone: 415.252.6252
`
  },
  {
    filename: "04-what-to-bring.md",
    title: "Stern Grove Festival - What to Bring",
    content: `# Stern Grove Festival - What to Bring

Source: sterngrove.org/what-can-i-bring
Last updated: April 30, 2026
Document owner: Operations Team

## Allowed Items

- Good vibes, love, and community
- Blankets no larger than 5x7 feet
- Low-profile lawn chairs
- Picnics and coolers. You are welcome to bring your own food and beverages.
- Alcohol is permitted for patrons of legal drinking age, 21+. The Festival also sells alcohol on-site.
- Strollers are allowed, provided they are folded down during the performance and not blocking walkways or aisles.

## Prohibited Items

- Tarps of any size
- Blankets bigger than 5x7 feet
- Pets in the Concert Meadow. Service or support animals are allowed; leashed pets are allowed in the West Meadow only.
- Sharp knives with a blade longer than 4 inches
- High-backed or standard folding chairs, large or tall tables, tents, umbrellas, and shade structures
- Barbecues, grills, or any item with open flame
- Video or audio recording equipment
- Unauthorized photography or recording of artists and performances
- Professional still camera equipment with a detachable lens longer than two inches, tripods, or big zooms
- Bicycles in the Concert Meadow
- Skateboards, scooters, hoverboards, or any personal motorized vehicles in the Esplanade or Concert Meadow
- Firearms or weapons of any kind
- Drones
- Fireworks and explosives, or any item with open flame
- Illegal substances, including narcotics, or drug paraphernalia
- Amplified sound, bullhorns, or speakers
- Smoking is prohibited at the Grove
- Any items that can be used to disturb the peace, endanger other patrons, or cause damage to people or property
`
  },
  {
    filename: "05-seating-information.md",
    title: "Stern Grove Festival - Seating Information",
    content: `# Stern Grove Festival - Seating Information

Source: sterngrove.org/seating-areas
Last updated: April 30, 2026
Document owner: Patron Experience / Operations Team

## Overview

Most seating at Stern Grove Festival is General Admission and first-come, first-served. There are no assigned seats in General Admission areas.

## General Admission Seating Areas

- Concert Meadow
- Hillside
- West Meadow

## Accessible Seating Areas

- ADA Seating
- Senior Seating
- Wheelchair Seating

ADA and Senior Seating are limited-capacity areas. Guests needing help locating these areas should speak with a staff member on-site.

## Reserved and Donation-Based Seating

Donation-based reserved seating options may include:

- Premium Reserved Tables
- Standard Reserved Tables
- Community Table Seats
- Stageside Lounge

Reserved table availability varies by show. For reserved table questions, contact development@sterngrove.org or call 415-625-6006.

## Seating Rules

- Blankets may be no larger than 5x7 feet.
- Tarps are not allowed.
- Low-profile lawn chairs are allowed.
- High-backed chairs, standard folding chairs, large tables, tall tables, tents, umbrellas, and shade structures are not allowed.
- Strollers are allowed but must be folded during the performance and may not block walkways or aisles.
`
  },
  {
    filename: "06-food-and-drink.md",
    title: "Stern Grove Festival - Food and Drink",
    content: `# Stern Grove Festival - Food and Drink

Source: sterngrove.org/faq, sterngrove.org/experiencefooddrink
Last updated: April 30, 2026
Document owner: Patron Experience / Concessions Team

## Overview

Guests are welcome to bring picnics, coolers, food, and beverages to Stern Grove Festival.

## Bringing Food and Drinks

- You may bring your own food.
- You may bring your own beverages.
- Alcohol is permitted for patrons of legal drinking age, 21+.
- Barbecues, grills, and any items with open flame are not allowed.

## Food and Drink On-Site

- Tante's is located in the Esplanade.
- Rotating food trucks are located in the West Meadow.
- Food truck menus are typically shared weekly on Stern Grove Festival social channels.
- Bars serve beer, wine, and non-alcoholic beverages.

Every purchase at on-site food and beverage locations supports Stern Grove Festival.
`
  },
  {
    filename: "07-volunteering.md",
    title: "Stern Grove Festival - Volunteering",
    content: `# Stern Grove Festival - Volunteering

Source: sterngrove.org/volunteer
Last updated: April 30, 2026
Document owner: Volunteer Team

## Overview

Volunteers help support the Festival and create a welcoming experience for patrons.

## Volunteer Requirements

- All volunteer roles are for people 18 and older.
- Volunteers sign up at sterngrove.org/volunteer.
- Role assignments are made during the signup process.

## Volunteer Roles

Volunteer roles may include:

- Greeting guests
- Sustainability support
- Operations support

## Volunteer Benefits

Volunteer benefits may include:

- Two General Admission tickets to a future show
- Community service hours
- Team-building opportunities
- Merchandise discounts
- Connection with fellow music lovers
- Behind-the-scenes Festival experience
`
  },
  {
    filename: "08-code-of-conduct.md",
    title: "Stern Grove Festival - Code of Conduct",
    content: `# Stern Grove Festival - Code of Conduct

Source: sterngrove.org/conduct
Last updated: April 30, 2026
Document owner: Human Resources / Festival Leadership

## Overview

Stern Grove Festival asks everyone to treat one another with kindness and respect. Harassment is not tolerated.

## Who Must Follow the Code of Conduct

The Code of Conduct applies to:

- Attendees
- Guests
- Staff
- Partners
- Vendors
- Volunteers

## Expected Conduct

Stern Grove Festival expects respectful behavior and neutral, respectful conversations.

## Prohibited Conduct

The following behavior has no place at Stern Grove Festival:

- Intimidation
- Threats
- Disruptions
- Offensive comments
- Unwelcome touching
- Harassment

## Reporting Concerns

Report concerns to Staff, Security, or hr@sterngrove.org.

## Consequences

Violations may result in warnings, removal from the venue, or bans from future events.
`
  },
  {
    filename: "09-general-information-contact.md",
    title: "Stern Grove Festival - General Information and Contact",
    content: `# Stern Grove Festival - General Information and Contact

Source: sterngrove.org
Last updated: April 30, 2026
Document owner: Patron Experience Team

## Overview

Stern Grove Festival is the nation's longest-running free music festival. It is a nonprofit organization, and the 2026 season is the Festival's 89th season.

## 2026 Season

- The 2026 season runs from June through August.
- The season includes 11 concerts from June 14 through August 16, 2026.
- Concerts are on Sundays, except the Saturday, August 15, 2026 show.
- Each concert has its own separate lottery.
- Lotteries open on a rolling basis starting in early May.

## Venue Address

Sigmund Stern Grove
19th Avenue and Sloat Boulevard
San Francisco, CA 94132

## Office Address

Stern Grove Festival Association
2 Marina Boulevard, Building C, Suite 370
San Francisco, CA 94123-1284

## Contact

- Use the Ask a Staff Member button for patron support and lost-and-found questions.
- General email: info@sterngrove.org
- Phone: 415.252.6252
- Reserved tables: development@sterngrove.org or 415-625-6006
- Code of Conduct concerns: hr@sterngrove.org

## Pets and Service Animals

- Service or support animals are allowed throughout the venue.
- Leashed pets are allowed in the West Meadow only.
- Pets are not allowed in the Concert Meadow.

## Smoking

Smoking is prohibited at the Grove.

## Donations

Stern Grove Festival is free and nonprofit. Guests can support the Festival by donating at sterngrove.org/donate.
`
  },
  {
    filename: "10-2026-season-lineup.md",
    title: "Stern Grove Festival - 2026 Season Lineup",
    content: `# Stern Grove Festival - 2026 Season Lineup

Source: Stern Grove Festival 2026 lineup information
Last updated: April 30, 2026
Document owner: Programming / Patron Experience Team

## Overview

The 2026 season is Stern Grove Festival's 89th season. The season includes 11 free concerts from June 14 through August 16, 2026. All concerts require a free General Admission lottery ticket unless the guest has another valid Festival ticket type.

All lotteries open at 10:00 AM Pacific Time and close at 11:00 AM Pacific Time. Each concert has its own separate lottery. The lottery is completely random, and past entries, wins, or losses do not affect chances.

## Concerts

### Peter Cat Recording Co.

- Date: Sunday, June 14, 2026
- Support: Marinero and DJ TBD
- Lottery opens: May 3, 2026
- Lottery closes: May 10, 2026

### Bomba Estereo

- Date: Sunday, June 21, 2026
- Support: La Misa Negra
- Lottery opens: May 10, 2026
- Lottery closes: May 17, 2026

### Japanese Breakfast

- Date: Sunday, June 28, 2026
- Support: Leenalchi and DJ Evie Stokes
- Lottery opens: May 17, 2026
- Lottery closes: May 24, 2026

### Major Lazer

- Date: Sunday, July 5, 2026
- Lottery opens: May 24, 2026
- Lottery closes: May 31, 2026

### San Francisco Symphony / Bela Fleck

- Date: Sunday, July 12, 2026
- Lottery opens: May 31, 2026
- Lottery closes: June 7, 2026

### Charley Crockett

- Date: Sunday, July 19, 2026
- Lottery opens: June 7, 2026
- Lottery closes: June 14, 2026

### Suki Waterhouse

- Date: Sunday, July 26, 2026
- Lottery opens: June 14, 2026
- Lottery closes: June 21, 2026

### Violent Femmes

- Date: Sunday, August 2, 2026
- Lottery opens: June 21, 2026
- Lottery closes: June 28, 2026

### Patti LaBelle

- Date: Sunday, August 9, 2026
- Lottery opens: June 28, 2026
- Lottery closes: July 5, 2026

### Public Enemy

- Date: Saturday, August 15, 2026
- Lottery opens: July 4, 2026
- Lottery closes: July 11, 2026

### Al Green

- Date: Sunday, August 16, 2026
- Lottery opens: July 5, 2026
- Lottery closes: July 12, 2026
`
  }
];

await mkdir(outDir, { recursive: true });

for (const doc of docs) {
  await writeFile(join(outDir, doc.filename), doc.content, "utf8");
  console.log(`Wrote ${doc.filename}`);
}
