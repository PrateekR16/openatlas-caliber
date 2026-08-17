import assert from "node:assert";
import { h1bOdds, stemOpt } from "../lib/pathway.ts";

// cap-exempt bypasses the lottery
assert.equal(h1bOdds({ capExempt: true, advancedDegree: false }).pct, 100);
// advanced degree beats a plain registration
assert.ok(
  h1bOdds({ capExempt: false, advancedDegree: true }).pct >
    h1bOdds({ capExempt: false, advancedDegree: false }).pct,
);
// STEM major → 36 months; non-STEM → 12
assert.equal(stemOpt("Computer Science").totalOptMonths, 36);
assert.equal(stemOpt("Computer Science").stem, true);
assert.equal(stemOpt("History").totalOptMonths, 12);
assert.equal(stemOpt("History").stem, false);

console.log("pathway logic OK");
