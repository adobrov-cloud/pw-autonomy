# pw-autonomy

Playwright + TypeScript UI automation project for **AutonomyAI Studio** (take-home submission).

## Demo

[Loom demo](https://www.loom.com/share/8159615848cb47889180ddd2d1099610)

## Setup

- **Node.js**: 20+
- **Install deps**:

```bash
npm ci
```

- **Install Playwright browsers**:

```bash
npx playwright install --with-deps
```

## Environment variables

This project reads credentials from environment variables.

1) Copy `.env.example` → `.env`
2) Fill in your values:

- `AUTONOMY_EMAIL`
- `AUTONOMY_PASSWORD`

Important: **do not commit** `.env` (it is gitignored).

## Run tests

- **All tests**:

```bash
npm test
```

- **Headed**:

```bash
npm run test:headed
```

- **UI mode**:

```bash
npm run test:ui
```

- **Open last HTML report**:

```bash
npm run report
```

## Repo structure

```
├── README.md
├── BUGS.md
├── ROADMAP.md
├── package.json
├── playwright.config.ts
└── tests/
   ├── pages/   # Page Objects (POM)
   ├── helpers/ # Shared waits/utilities
   └── e2e/     # Test specs
```

## CI

GitHub Actions workflow `scheduled-playwright.yml` runs Playwright on a daily schedule and expects:

- `AUTONOMY_EMAIL` in GitHub Actions secrets
- `AUTONOMY_PASSWORD` in GitHub Actions secrets
