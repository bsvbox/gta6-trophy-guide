# Leonida Trophy Guide — GTA VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bsvbox/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bsvbox/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze.

## What it does

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide in our own words that names its sources.
- **Roadmap to the platinum** in six stages: story, strangers, activities, collectibles, money, then the 100% cleanup. Missable flags are built from the official descriptions.
- **Tracker**: tick trophies off and progress saves in the browser (localStorage), with export to a file and import back. Filters by kind (story, missable, collectibles, activities, online), by grade, and by search.
- **Spoiler-safe mode**: hides the names and descriptions of hidden story trophies until they are earned.
- **Fully offline**: static files under `app/`, no network requests at run time, no external fonts or images.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` checks `app/data/trophies.json` (55 trophies, each with a guide), copies `app/` and `screenshots/` to the output directory, and writes `dossier.json` with the vendored make.fun library.

## Screenshots

Four screenshots in `screenshots/`, taken from the real app in desktop Chrome at 1280x720: the checklist with progress, a trophy guide open with its sources, the roadmap, and spoiler-safe mode at work. `shots.json` records each view.

## Sources

Official trophy names, descriptions and grades via Exophase and PSNProfiles, which agree on all 55. Methods cite the sources named beside each trophy's guide: GTA Wiki, PowerPyx, IGN and others. The game launched 19 November 2026; missable flags are inferred from the official descriptions and marked as such in the guide. No Rockstar logo or artwork is used. An unofficial fan guide.

---

<sub>Entered on [make.fun](https://make.fun/?ref=4eqvbahr&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
