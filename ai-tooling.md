# AI Tooling Summary

This document summarizes the AI tools the team used to develop the Café Fausse web application, and — as the brief asks — how we used them, what worked well, and what didn't.

## Tools used

| Tool | Used by | Purpose |
| :---- | :---- | :---- |
| **Cursor** (AI IDE) | Gareth | Primary development — scaffolding the React frontend and Flask backend, iterating on code, deploying from git |
| **Claude Code**  (AI IDE) | Mariann | Claude Code — scaffolding the initial React (Vite) front-end (five pages: Home, Menu, Reservations, About Us, Gallery, plus shared Navbar, Footer, and Lightbox components) and the Flask \+ SQLAlchemy \+ PostgreSQL back-end (Customer/Reservation models, availability/reservation/newsletter endpoints), based on the project's Software Requirements Specification. |
| **Claude / Claude Code** | Michael | Pressure-testing the build against the SRS, auditing requirements, generating a test/seed script |
| **ChatGPT** | Mariann | Researching free hosting options for a student project |

## How we used them

### Cursor — primary build (Gareth)

Cursor was the main engine for producing the application. It scaffolded the React \+ Vite frontend and the Flask \+ PostgreSQL backend, and handled automatic deployment of changes from git.

**What worked well:**

- Rapidly generating a working full-stack scaffold — frontend components, Flask routes, and SQLAlchemy models — far faster than hand-coding.  
- Automatic deployment of git changes worked smoothly during the Vercel phase.  
- \[FILL IN — Gareth: one or two specifics that genuinely impressed you, e.g. a feature it built well like the reservation logic or the admin page.\]

**What didn't:**

- Deployment and database connection were the hard part, not the code. Connecting the backend to a Supabase database was a persistent struggle — it wasn't clear which environment variable was blocking the connection, and it took multiple attempts to resolve.  
- At one point the build hit roughly 20 revisions deep in Cursor without the frontend rendering as expected, even though the database connection was working — enough that we paused the Vercel approach and reconsidered the deployment strategy.  
- \[FILL IN — Gareth: anything else that Cursor got wrong or led you down a wrong path.\]

## Claude Code — secondary build (Mariann)

Mariann did a secondary independent build with Claude Code as well. Team eventually decided to go with Cursor primary build and this was a great independent exercise and verification of that different tools produced with the same input.

### **What worked well**

- Generating the initial five-page/component structure and routing quickly, with a Navbar that highlights the active page and a working image Lightbox (click-to-open, arrow-key/button navigation, Escape/click-outside to close).  
- Getting a working Flask \+ SQLAlchemy \+ PostgreSQL reservation endpoint on the first pass, including random table assignment (1–30) and conflict detection via overlapping 2-hour reservation windows.  
- Producing a detailed, tutorial-style setup README aimed at someone with no prior environment set up (Homebrew, Node, Python, Postgres), which caught real friction points before they became blockers (e.g., noting that Homebrew sometimes compiles a dependency from source and can take 20+ minutes — which is exactly what happened when installing the GitHub CLI later in the project).  
- Quickly diagnosing and fixing environment issues during setup: a Postgres role/database that didn't exist locally, a vite binary that lost its executable permission after npm install, and confirming (via the backend's /api/health endpoint) exactly which database the app was actually connected to before demoing.

### **What didn't work well / required manual fixes**

- ### The in-tool browser preview server could not be started for this project: it failed with a getcwd/chdir/realpath "Operation not permitted" error every time, independent of port conflicts. This was a macOS permission restriction (Desktop folder access) on the process behind the preview tool, separate from normal terminal access — verification had to fall back to direct curl/psql checks instead of an automated browser screenshot.

- ### Had to manually create a local PostgreSQL role and database to match the backend's default connection string, since a fresh machine doesn't have that role/database yet.

- ### Had to manually point the backend at different databases for different purposes (a local Postgres instance for early development, then a hosted Render Postgres instance for the live demo) by editing .env and restarting the server — this isn't automatic.

### 

### Claude / Claude Code — requirements audit & testing (Michael)

Claude was used after the core Cursor build to independently pressure-test the solution against the SRS, rather than to write the application.

**What worked well:**

- Auditing the live site and the backend source requirement-by-requirement against the SRS (FR-1 through FR-18, NFR-1 through NFR-9), producing a checklist of verified items and gaps.  
- Catching several small but real defects a manual review might miss — a menu category typo, a non-SRS menu item left over from testing, category ordering, and a race condition in the reservation endpoint that returned a 500 instead of a graceful error.  
- Generating a Python test/seed script (`assess.py`) to exercise the reservation cap, table assignment, and concurrency — requirements that couldn't be checked from the browser alone.

**What didn't:**

- It could only verify what it could reach. Database-schema and persistence checks still needed a human with database access, and it initially got the reservation API's payload shape wrong (sending separate date/time fields when the API expects a single ISO `time_slot`), which had to be corrected against the real source.

### ChatGPT — hosting research (Mariann)

ChatGPT was used to research where a student project could be hosted at no cost, which informed the team's evaluation of free-tier options.

**What worked well:**

- Produced a useful shortlist of free hosting platforms to evaluate.  
- We were recommended to consider  
* [Render](https://render.com?utm_source=chatgpt.com)  
* [Railway](https://railway.app?utm_source=chatgpt.com)  
* [Supabase](https://supabase.com?utm_source=chatgpt.com) (database \+ authentication)  
- The following common stack was recommended:  
  - Frontend: Vercel  
  - Backend/API: Render  
  - Database: Supabase

**What didn't: GARETH TO CHECK FOR ACCURACY**

- Vercel was pretty good at deploying changes from git automatically, the challenge was connecting to the db on supabase.   
- The DB connection ended up working but we couldn’t get to see the font end  
- We ended up switching to Render.

## Overall reflection

AI tooling lets a small team produce a complete full-stack application quickly, with most of the effort shifting away from writing code and toward **integration, deployment, and verification** — connecting to a database, choosing a hosting platform that stayed reliably available, and confirming the result actually met every requirement. The tools were strongest at generating working code fast and weakest at the environment-specific "last mile" of deployment and data connectivity, which still required human judgment and several rounds of trial and error.

We also deliberately used AI in two distinct roles: one tool (Cursor) to *build*, and a different tool (Claude) to *independently check* the build against the requirements. Separating construction from verification caught issues that the building tool had introduced or missed.

