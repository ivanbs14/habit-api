# HabitPet API (MVP)

NestJS + Prisma + PostgreSQL para o MVP do HabitPet.

## Endpoints MVP

- `GET /routines/current`
- `GET /routines`
- `GET /pet/status`
- `POST /routine-checkins`

## Setup

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis:

```bash
cp .env.example .env
```

3. Configure a `DATABASE_URL` no `.env` apontando para seu PostgreSQL remoto.

4. Rode migracao e seed:

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

5. Suba a API:

```bash
npm run start:dev
```
