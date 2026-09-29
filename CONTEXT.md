# PDX Benefits Navigator

Screens one household against every federal, Oregon, Multnomah County, and City of Portland benefit program and estimates what each is worth per year.

## Programs

**Program**:
A benefit offered by one jurisdiction (federal, Oregon, Multnomah County, or City of Portland), with published eligibility rules.
_Avoid_: Benefit (ambiguous with its dollar value), service

**Hidden gem**:
A locally funded program that national screening tools do not check.

**Benefit schedule**:
A program's published table of exact benefit amounts by household condition, such as SNAP allotments by household size.
_Avoid_: Official table, benefit table

**Official range**:
The published minimum and maximum annual dollar value of a program, widened to include its benefit schedule when the schedule is in dollars and overlaps the published range. One definition, used by both the screener and the eval.
_Avoid_: Estimated annual value (that name is used for both this and the Estimate), accepted range

## Screening one household

**Match**:
The screening result for one program against one household: the decision, the requirements behind it, and the estimate.
_Avoid_: Result, card

**Requirement**:
One rule a program imposes, marked met, unmet, or unknown for this household.

**Eligible**:
A match with no unmet requirement. Unknown requirements lower confidence but never make a match ineligible.
_Avoid_: Qualifies (fine in UI copy, not as the term)

**Near miss**:
An ineligible match, shown with the requirement that failed.

**Estimate**:
The annual dollar value of one eligible match for this household. Always above zero; a $0 figure means the match has no estimate.
_Avoid_: Value, amount

**Unestimated match**:
An eligible match with no estimate. Shown as "Ask the program", counted beside the headline total, and never inside it.
_Avoid_: $0 match, not estimated

**Headline total**:
The sum of the estimates of all eligible matches, with the count of unestimated matches shown beside it.

**Likely range**:
The low and high bounds shown beside the headline total, summed from the official ranges of exactly the matches the headline total counts.
_Avoid_: Confidence band
