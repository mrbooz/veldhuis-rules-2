import { contractFor } from "../contracts/table";
import type { Day, Minutes } from "./types";

// One function, on purpose: Rota, Hours and Pay-Ready all ask where the
// night starts, and they must all get the same answer, so the question is
// asked in exactly one place. The standard boundary is 22:00. Aldervale's
// 1998 agreement says 21:30. Both are rows in the table, not code.

// The premium boundary belongs to the contract, not to the clock, and it is
// read for the day the shift is attributed to.
export function nightBoundaryFor(customerId: string, on: Day): Minutes {
  return contractFor(customerId, on).nightStartsAt;
}
