# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the NestJS application entrypoints (`main.ts`, `app.module.ts`, `prisma.service.ts`) plus the current feature controllers under `src/modules/health/`, `src/modules/pet/`, `src/modules/routines/`, and `src/modules/routine-checkins/`. Database schema and seed logic live in `prisma/schema.prisma` and `prisma/seed.ts`, with generated SQL migrations in `prisma/migrations/`. `dist/` is compiled output and should be treated as a build artifact, not source. `test/` exists but is currently empty.

## Build, Test, and Development Commands
Prefix shell commands with `rtk` when working in Codex CLI, per the local `RTK.md` instruction. Use the existing npm scripts:

- `npm run start:dev` starts the API with file watching on port `3000`.
- `npm run build` compiles TypeScript into `dist/`.
- `npm run start` runs the Nest application without watch mode.
- `npm run prisma:migrate` creates and applies a development migration.
- `npm run prisma:generate` regenerates the Prisma client after schema changes.
- `npm run prisma:seed` seeds the database via `tsx prisma/seed.ts`.

Typical local setup is `cp .env.example .env`, set `DATABASE_URL`, then run `npm run prisma:migrate` and `npm run prisma:seed`. If you need the exact Codex CLI form, use commands such as `rtk npm run build` and `rtk npm run start:dev`.

## Coding Style & Naming Conventions
This codebase uses TypeScript with NestJS conventions. Follow 2-space indentation, semicolons, and single quotes as shown in `src/main.ts`. Keep filenames kebab-case or descriptive lowercase patterns already used here, for example `routine-checkin-status.enum.ts` and `pet.controller.ts`. Prefer thin controllers, DTOs for request validation, and Prisma access through shared services rather than inline database setup.

## Testing Guidelines
There is no active automated test suite or `npm test` script yet, even though a `test/` directory exists. For new behavior, add tests alongside the feature area and introduce a script before relying on manual checks. At minimum, verify:

- endpoint behavior against the MVP routes in `README.md`
- Prisma migrations apply cleanly on a fresh database
- seed data still runs after schema updates

## Commit & Pull Request Guidelines
This workspace may not include usable Git metadata, so do not assume `git status` or history inspection will work locally. No repository-specific commit convention could be verified from the snapshot. When preparing commits or PRs elsewhere, use short, imperative commit subjects such as `Add routine check-in DTO validation`. Keep pull requests focused and include:

- a summary of the API or schema change
- any required `.env` or migration steps
- sample requests or response snippets for changed endpoints

## Security & Configuration Tips
Do not commit secrets in `.env`. Keep `DATABASE_URL` in local environment files only, review Prisma schema changes carefully before generating migrations against shared databases, and avoid editing generated output under `dist/` by hand.
