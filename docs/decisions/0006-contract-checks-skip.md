# ADR-0006: a registered contract check with no fixture is skipped, not failed

Accepted · 2025-06-02 · MS

The contract-checks job runs one check per registered contract case. A case
can be registered before its fixture exists — usually because the agreement
is signed and the recorded shifts are not in yet — and a registered case with
no fixture file reports as skipped, with its name printed, rather than
failing the run. Failing would teach people not to register cases early,
which is the only cheap moment to register them. The cost, accepted, is that
a green run can carry a named hole, and reading the skip line is on the
reviewer.

Consequence reference: CONS-FIXTURE-2506
