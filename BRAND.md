# MatchSticks — Demo Brand

## What lives here (demo-specific, do not sync)
| File | What it controls |
|---|---|
| `index.html` | Dark red palette, MatchSticks logo, install banner, layout |
| `app.js` | Copy ("Get Recs", "AI is selecting..."), hint chips, status messages |

## What is shared with famous-smoke (sync these)
| File | What it controls |
|---|---|
| `netlify/functions/recommend.js` | Scoring engine, AI selection, GPT prompt, rate limiting |
| `data/cigars.json` | Full 250-cigar database |
| `netlify.toml` | Build config |

## Workflow
1. Build and test new features in **demo** first
2. Run `bash sync-to-famous.sh` to port engine changes to famous-smoke
3. If the feature also needs UI changes, update `index.html` / `app.js` in famous-smoke manually

## Live URLs
- Demo: https://matchsticks-demo.netlify.app
- Famous: https://famousdemo.netlify.app
