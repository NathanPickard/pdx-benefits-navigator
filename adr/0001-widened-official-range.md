# One widened official range for the screener and the eval

A program's official range is its published minimum and maximum, widened to include its benefit schedule when the schedule is in dollars and overlaps the published range. The system prompt tells the model that a benefit schedule outranks the published range, so a narrow range marked correct amounts wrong: the SNAP allotment for a household of 3 is $785 × 12 = $9,420, above the published $9,000 cap. The screener's likely range and the eval's dollar check use this one definition, so the page and the scoreboard cannot disagree about the same estimate. The eval adopted it in commit `cf3b12c`; the screener's likely range adopts it in a later change.

## Considered Options

- **Published range only.** Rejected. It flags official SNAP and WIC amounts as violations, and a household's own SNAP estimate can sit above its likely range.
- **Pick the schedule row matching the household.** Rejected. Schedule rows are labeled with free text ("Household of 3", "Pregnant, postpartum") that differs by program, so the matching would be fragile.
- **Widen with any schedule.** Rejected. Some schedules are not benefit amounts: ERDC's holds monthly copays and the veterans property tax exemption's holds assessed values. Requiring overlap with the published range excludes them.

## Consequences

- The upper bound is loose for household-size schedules. SNAP's range reaches the 8-person allotment ($21,468) for every household, which raises María's likely range high end from $77,583 to $90,051. This was accepted as an honest upper bound.
- Eval runs scored before commit `cf3b12c` used the published range only, so their dollar in-range numbers are not directly comparable to later runs.
