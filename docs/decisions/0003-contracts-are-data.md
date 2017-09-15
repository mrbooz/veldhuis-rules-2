# ADR-0003: contracts are data, not code

Accepted · 2017-09-15 · WD

A customer's agreement is a record the engine reads, not a branch the engine
grows. Rates, boundaries and closing behaviour live in contract data under
src/contracts/, and the functions that need them take a contract as an
argument. This is why a function takes a contract and not a clock: the clock
is the same for everybody and the agreement never is. The cost, accepted, is
that a question about behaviour is now a question about data, and the answer
can be old.

Consequence reference: CONS-TABLE-0917
