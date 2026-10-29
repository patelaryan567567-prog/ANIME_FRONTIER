# AnimeFrontier

AnimeFrontier is a browser-only anime discovery portal. It presents popular TV series and movies, search, detail and episode views, trailers, a personal watchlist, and an in-page AI chat interface.

## Features

- Populates fan favourites, series, movies, search results, anime details, characters, and episode lists from the public Jikan API.
- Opens trailers through YouTube search and links viewers to supported streaming and catalogue sites from the selection modal.
- Supports a theme switcher, responsive grid layouts, client-side navigation overlays, and a locally saved watchlist.
- Provides a name/email login modal, profile display, watch-history entry point, contact form, and AI chat UI.

## Technology

- Plain HTML, CSS, and JavaScript — no package manager, bundler, or server is included.
- Tailwind CSS CDN and Font Awesome CDN for styling and icons.
- Jikan REST API, YouTube Data API, Gemini API, and Telegram Bot API calls are made by the client code.

## Run locally

Because this is a static site, serve the repository directory with any static HTTP server, then open the supplied local URL in a browser. For example, a VS Code Live Server-style extension or another static server is sufficient. Opening `index.html` directly may restrict some browser features and external requests.

There is no build command and no environment-file loader in this repository.

## Configuration and data handling

The current implementation keeps UI preferences, the local profile, watchlist, and a stored password value in browser `localStorage`. These are not accounts backed by a server and are not suitable for authentication or sensitive data.

The application also contains direct browser-side third-party API and Telegram configuration in `script.js`. Do **not** add live credentials to browser JavaScript or commit them to the repository: every visitor can retrieve values bundled into a static site. Before deploying or continuing development, rotate any exposed credentials and move privileged requests (especially messaging and AI requests) to a server-side endpoint with secrets kept in a deployment secret manager.

## Deployment

Deploy the repository as a static site on a host that serves `index.html` as the entry point and also serves the included PNG and manifest files. Configure any server-side replacement for the third-party integrations separately; no hosting configuration is included here.

## Limitations

- Listings, search, episode data, and trailers depend on external API availability, quotas, CORS behaviour, and the visitor's network connection.
- When episode data is unavailable, the UI can render fallback episode data; it is not a verified streaming catalogue.
- Streaming-platform buttons are outbound links, not an in-app video service.
- The client-only login, profile, watch history, contact form, and AI/messaging integrations require a secure backend before production use.

