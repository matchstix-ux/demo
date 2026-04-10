# Ask Arthur — Demo Brand

## What lives here (demo-specific, do not sync)
| File | What it controls |
|---|---|
| `index.html` | Dark palette, Ask Arthur logo, layout |
| `app.js` | Copy, hint chips, status messages |

## What is shared with AskArthur (sync these)
| File | What it controls |
|---|---|
| `netlify/functions/recommend.js` | Scoring engine, AI selection, GPT prompt, rate limiting |
| `data/cigars.json` | Full cigar database |
| `netlify.toml` | Build config |

## Workflow
1. Build and test new features in **demo** first
2. Run `bash sync-to-famous.sh` to port engine changes to AskArthur
3. If the feature also needs UI changes, update `index.html` / `app.js` in AskArthur manually

## Live URLs
- Demo: https://matchsticks-demo.netlify.app
- AskArthur: https://askarthur.netlify.app
