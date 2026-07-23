# Staging Deployment

The Café Fausse web application is deployed to a live staging environment in addition to being runnable locally.

## Staging URL

[**https://cafefausse.onrender.com**](https://cafefausse.onrender.com)

The staging site serves the full application — React frontend, Flask API, and PostgreSQL database — from a single Render web service.

- Frontend: served from the same origin  
- API: `https://cafefausse.onrender.com/api/...`  
- Health check: `https://cafefausse.onrender.com/api/health` → `{"status":"ok","database":"ok"}`

## Hosting notes

- **Platform:** Render (single web service defined by `render.yaml`), with a Render-hosted PostgreSQL database.  
- **Cold starts:** the staging service runs on Render's free tier, which spins down after a period of inactivity. The first request after idle may take up to \~50 seconds to wake the service; subsequent requests are fast. If the site appears slow to load initially, allow a moment for the instance to start.  
- **Local alternative:** the application also runs locally. See `README.md` for full setup instructions (frontend on `http://localhost:5173`, backend on `http://localhost:5000`).

## Deployment history

The project was initially deployed via Vercel with a Supabase database, then migrated to Render for a simpler single-service deployment and more reliable database connectivity. Vercel configuration files remain in the repository from that earlier setup; **Render is the canonical staging deployment.**  
