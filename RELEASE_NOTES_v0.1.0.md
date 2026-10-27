# Lorekeeper Live v0.1.0 — Screen-only demo

First public demo release for capturing and documenting stream moments without Twitch account access.

## Included

- User-initiated screen sharing and local still-frame capture
- Manual review and editing for lore cards
- Hero, map, timestamp, source link, and tag metadata
- Searchable archive, recap, and overlay preview
- One sourced Flats/Overwatch lore card
- Local Node.js server with no third-party package dependencies

## Known limitations

- No Twitch chat or streamer account integration
- No OCR or AI vision analysis; moment descriptions are entered manually
- Captured frames are stored in browser local storage
- The OBS Browser Source does not yet sync state with the dashboard across separate browser profiles

## Run

Requires Node.js 18 or newer. Run `npm start`, then visit `http://localhost:8000`.
