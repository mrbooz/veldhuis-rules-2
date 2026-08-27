# ADR 004 — one clock for the shift window

## Context
Two places decide which day a shift belongs to: shiftWindow.ts uses the start
stamp, rota.ts uses the month edge. On the nights that cross midnight they
disagree, and payroll reads whichever ran last.

## Decision
The division owns the day. shiftWindow.ts keeps the start stamp only for
display; every payable question goes through rota.ts.

## Consequences
Six tests that pinned the start attribution had to be rewritten around the
halves-sums instead. Nordkant small hours and Brackwater half-hours keep their
documented totals, which is the check that this did not move money.