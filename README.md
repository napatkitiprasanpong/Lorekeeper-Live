# Lorekeeper Live

**Read the screen. Save the moment. Build the channel’s lore.**

Lorekeeper Live is a screen-only demo for stream moments. It captures a still frame from a browser tab or game window that the user explicitly shares, then lets the user add the context and turn it into a searchable lore card. It does not read Twitch chat or require access to a streamer’s Twitch account.

## Current demo

- Share a browser tab/window/screen through the browser’s native screen picker.
- Capture a still frame locally; it is stored in this browser’s local storage.
- Review, edit, or dismiss the capture, then add a title, recap, hero, map, timestamp, public source URL, and tags.
- Search the lore archive, show a card in the OBS overlay, or hide it.
- Preview a session recap.
- Start with one public, sourced Flats lore card so the archive is not filled with invented chat moments.

The screen capture is visual evidence only. This version does **not** run OCR or an AI vision model, so the person demoing it writes the card context. No screen data is uploaded by this app.

## Public Flats source used in the demo

The seed card references [“I spectated bronze Overwatch and saw the best Doomfist”](https://www.youtube.com/watch?v=zKbeWzSP3N8), a public Flats video. The search result reported about 1.77 million views when researched on October 27, 2026. The card sticks to what the public source supports: Flats’ Bronze spectate and the “best Doomfist” framing. It does not invent chat reactions, a specific match outcome, or a map.

## Run it

Requires Node.js 18 or newer and a modern browser. From this folder, run `npm start` (or `node server.mjs`), then open `http://localhost:8000`. Browser screen capture requires a secure browser context and starts only after you press **Share a window**. For OBS, add `http://localhost:8000/overlay.html` as a Browser Source from the same local site and browser profile.

No package installation, Twitch credentials, API keys, or environment variables are needed.

## Demo flow

1. Open the public Flats video in another browser tab and seek to a moment worth capturing.
2. In the dashboard, select **Share a window** and choose that video tab in the browser’s screen picker.
3. Pause on a moment and select **Capture moment**. The still frame goes into the local review queue.
4. Review the frame and write a factual title and recap; add the hero/map and video timestamp if known.
5. Save the card, show it on the overlay, then open **Tonight’s lore** for the recap.

The seed card provides a sourced starting point even when you do not want to capture a frame. It can be reset from the dashboard.

## Current limitations

- No live Twitch chat, account integration, or streamer authorization.
- No automated screen understanding, OCR, or AI-generated summaries yet.
- Captured frames stay in this browser profile; they are not synced to another device.
- A card based on an external public video should link to that source and distinguish verified facts from the demo user’s interpretation.

## Project structure

- `index.html` — screen-capture dashboard
- `overlay.html` — OBS browser overlay
- `app.css` and `improvements.css` — shared visual styles
- `app.js` — screen capture, review flow, archive, recap, and local persistence
- `server.mjs` — dependency-free local server for screen capture and OBS preview
- `package.json` — project metadata and start command
- `.gitignore` — local-only files excluded from Git

## Put it on GitHub

Create a new repository on GitHub, then upload these project files or push the folder with Git. Keep this repository public only if you are comfortable sharing its source code. The app has no user secrets or configuration files to commit; screen captures are saved in the browser’s local storage and are not part of this folder.

