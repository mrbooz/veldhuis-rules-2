# vellum

The payroll rules engine under Rota, Hours and Pay-Ready. Three products,
one engine underneath, in production since 2017 — parts of what it encodes
are older than that.

Start with `HISTORY.md`. It is kept by hand and it is behind, but it is
the shortest true account of why the code is shaped the way it is. If it
disagrees with the log, the log wins.

## Running it

```
npm install
npm run build     # tsc --noEmit
npm test          # unit, rules-fixtures, contract-checks
```

The pipeline runs the same five jobs on every push: build, unit,
rules-fixtures, contract-checks, pack.

## Where things are

- `src/rules/` — the engine and the rules it applies. Contracts are data
  (2017); the functions take a contract and not a clock.
- `src/contracts/` — the contract table, and the agreements old enough to
  have their own files.
- `src/export/` — what leaves the building: the rota the wards read, and
  the Pay-Ready file somebody else's payroll system ingests.
- `src/ingest/` — the door shifts arrive through.
- `docs/decisions/` — decision records. `docs/postmortems/` — what broke.

## House rule

The export cannot be corrected after it leaves. Read
`docs/decisions/0005-the-export-is-final.md` before touching
`src/export/`.
