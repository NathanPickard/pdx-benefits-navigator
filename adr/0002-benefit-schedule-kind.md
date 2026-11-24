# Label what a benefit schedule's numbers mean

A benefit schedule carries a `kind`: `benefit` (the default), `copay`, or `assessed_value_exemption`. Only a `benefit` schedule is a dollar value. The system prompt told the model that every schedule outranks the published range, so it read ERDC's monthly copay table as the benefit and reported María as eligible for ERDC at $0, when the subsidy is worth $8,000–$18,000 a year. The veterans property tax exemption's schedule holds $27,092 and $32,512 of exempt assessed value, which the same rule invites the model to report as annual cash. ADR 0001 kept these schedules out of the eval's official range by requiring overlap with the published range, but that check lived only in the scorer, so the screener never got it.

With `kind`, the prompt tells the model to take the dollar value from the published range for a copay or assessed-value schedule and to use the rows only in its reasoning ("your copay would likely be about $10/month"). The official range in `lib/benefitSchedule.ts` widens only with a benefit-kind schedule. Data validation fails any benefit-kind dollar schedule that does not overlap the published range and names the fix, so a rescrape that drops or mislabels `kind` cannot ship.

## Considered Options

- **Delete the two schedules.** Rejected. ERDC's copay table is real, current information a parent wants, and a future scrape would bring it back.
- **Keep the overlap check as the only rule.** Rejected. It protected the eval, not the screener, and it guessed meaning from numbers instead of recording it.
- **New `unit` values such as `usd_monthly_copay`.** Rejected. Unit and meaning vary independently: a copay can be monthly or annual.

## Consequences

- `kind` is set in `data/programs.scraped.json` and carried into `data/programs.json` by the merge. The scraper prompt asks for it, and validation catches a wrong or missing label.
- The demo fixtures and eval report must be re-baked and re-run to reflect the prompt change.
- The overlap check moved from the scorer into data validation, so the scorer widens with any benefit-kind schedule.
