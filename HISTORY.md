# HISTORY

Kept by hand. Not generated. If it disagrees with the log, the log wins.

## Maintainers

| who          | years     | what they mostly touched          |
| ------------ | --------- | --------------------------------- |
| W. Doorn     | 2017–     | the engine, all of it             |
| B. Kessels   | 2019–2023 | attribution, the Rota export      |
| M. Sobczak   | 2025–     | contract, Vellum                  |

## Why there is a HISTORY.md

Because the reasons are not in the code and they are not in the tickets
either. Half of this engine is a contract somebody signed and nobody has
reopened, and the other half is what we did about it on a Thursday.

## The short version

- 1994–2016: punch clocks, then a scheduler with the rules bolted on.
- 2017: the rules pulled out into an engine of their own (WD). Contracts
  became data. This is why a function takes a contract and not a clock.
- 2019: the double-pay fix. A hospital was paying the same night twice
  across a month boundary. Fixed on a Friday, shipped on the Friday, and
  the comment explaining it has been wrong ever since somebody moved it (BK).
- 2021: shift windows reworked for the Hours capture rewrite. Behaviour
  changed. The docs did not.
- 2022: reorg. Rules is now called Vellum. Nothing in the code changed.
- 2023: BK left. Attribution has had no owner since.
