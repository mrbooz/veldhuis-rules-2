# ADR-0002: the rules come out of the scheduler

Accepted · 2017-04-03 · WD

The pay rules have lived inside the scheduler since the punch clocks were
retired, and every change to scheduling has been a change to pay whether it
meant to be or not. The rules are extracted into an engine of their own, in
this repository, with the scheduler and the capture and the export as its
callers rather than its landlords. The engine computes; the products around
it schedule, capture and send. First cut is deliberately a transplant, not a
rewrite — same behaviour, new address.
