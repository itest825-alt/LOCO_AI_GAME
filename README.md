 # LOCO AI Game

 > A small web game (LOCO Monkey Hunt) built as a Telegram Web App — find the special monkey to win tokens.

 ## What’s in this repo
 - `public/` — front-end files (HTML, CSS, JS, images)
 - `server.js` — Express server that serves the game and API endpoints
 - `bot.js`, `database.js`, `gameDB.json` — bot and local DB helpers
 - `.env` — local environment file (not committed; ignored)

 ## Quick local run
 1. Install dependencies:

 ```bash
 npm install
 ```

 2. Create a `.env` (copy from `.env.example` or edit `.env`) and fill in your Telegram bot token and other vars.

 3. Start the server:

 ```bash
 node server.js
 # or
 npm start
 ```

 4. Open http://localhost:3000 in your browser (or the URL in your `.env`)

 ## How to push this repo to GitHub
 I can't create the remote repository and push from here, but you can follow either of these options below.

 ### Option A — Using the GitHub website
 1. Create a new repository on GitHub (https://github.com/new). Choose a name (e.g. `loco-ai-game`).
 2. Then run these commands in your project folder:

 ```bash
 git init
 git add .
 git commit -m "Initial commit — LOCO AI GAME"
 git branch -M main
 git remote add origin https://github.com/<YOUR_USERNAME>/<REPO>.git
 git push -u origin main
 ```

 Replace `<YOUR_USERNAME>` and `<REPO>` with your values.

 ### Option B — Using the GitHub CLI (gh)
 If you have `gh` installed and logged in (run `gh auth login`), you can do:

 ```bash
 gh repo create <YOUR_USERNAME>/<REPO> --public --source=. --remote=origin --push
 ```

 That will create, add remote and push in one command.

 ## Notes & Tips
 - `.env` is in `.gitignore` so sensitive data won't be pushed. Double-check before pushing.
 - If you want me to prepare a `README.md` (done) or a `.github/workflows/ci.yml` to auto-deploy, tell me and I can add it.

 ## Need me to do it for you?
 I can't push to your GitHub account from here. If you want, I can generate the exact commands for you to paste and run, or guide you step-by-step while you run them and paste back any errors.

 Once you push, paste the repo URL here and I'll verify and add a short `README`/badges or create a release note if you like.

 Good luck — when ready, paste the GitHub repo link and I'll help finish any remaining setup (CI, deploy, README improvements).
