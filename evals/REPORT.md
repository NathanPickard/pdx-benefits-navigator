# Eval Report

- Date: 2026-11-24T19:33:07.301Z
- Eligibility model: claude-sonnet-4-6
- Judge model: claude-haiku-4-5-20251001
- Git SHA: 5220c53
- Runs per case: 1
- Cases: 14

## Scoreboard

| case | F1 | precision | recall | $ in-range | conf. agree | reasoning pass | flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| maria | 0.91 | 0.83 | 1.00 | 81% | 100% | 69% |  |
| james | 1.00 | 1.00 | 1.00 | 100% | 100% | 93% |  |
| rose | 1.00 | 1.00 | 1.00 | 100% | — | 85% |  |
| cliff-snap-under | 0.96 | 0.92 | 1.00 | 100% | 100% | 88% |  |
| cliff-snap-over | 0.87 | 0.77 | 1.00 | 100% | — | 59% |  |
| cliff-ohp-under | 0.88 | 0.78 | 1.00 | 93% | — | 79% |  |
| cliff-ohp-over | 1.00 | 1.00 | 1.00 | 100% | — | 90% |  |
| zip-gresham | 1.00 | 1.00 | 1.00 | 77% | — | 46% |  |
| rent-increase-9pct | 1.00 | 1.00 | 1.00 | 100% | — | 82% |  |
| eviction-notice | 0.96 | 0.93 | 1.00 | 100% | — | 90% |  |
| veteran-renter | 0.96 | 0.92 | 1.00 | 100% | — | 67% |  |
| senior-renter | 1.00 | 1.00 | 1.00 | 100% | — | 69% |  |
| pregnant-household | — | — | — | — | — | — | pregnant-household: The analysis response was cut off — please try again. |
| unhoused | — | — | — | — | — | — | unhoused: The analysis response was cut off — please try again. |
| Aggregate | 0.96 | 0.93 | 1.00 | 96% | 100% | 76% |  |

## Failures

### maria

- False positive: oregon-eitc
- False positive: double-up-food-bucks
- Dollar violation: ohp: $8000 outside [$3000–$6000]
- Dollar violation: erdc: $0 outside [$8000–$18000]
- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: ohp: The reasoning incorrectly states adults at $48,000 are at 145% FPL for a 4-person household, when 138% FPL is $45,540; $48,000 is actually 145.5% FPL and exceeds the adult threshold, yet the determination grants eligibility without explaining how the ineligible adults are covered or whether OHP's 'expanded coverage' extends eligibility to over-138% adults.
- Judge failure: oregon-eitc: Annual income of $48,000 exceeds the program's stated income_max_annual of $30,000, contradicting the eligibility determination of 'true'.
- Judge failure: school-meals: Reasoning contradicts program definition: program states income_max_pct_fpl of 185% (single tier), but determination incorrectly invokes two separate thresholds (130% for free, 185% for reduced) that are not in the program definition provided.
- Judge failure: cep-weatherization: The determination marks the household eligible while acknowledging they fail the program's explicit requirement ('owning and occupying the home') for the flagship weatherization program, then hedges with unverifiable claims about 'other services' not defined in the program specification.
- Judge failure: double-up-food-bucks: Determination marked 'eligible: true' contradicts reasoning that states 'Without active SNAP enrollment, the household cannot access Double Up Food Bucks' and that SNAP eligibility is uncertain.

### james

- Judge failure: double-up-food-bucks: Determination marks applicant eligible for Double Up Food Bucks, but program requires current SNAP/EBT enrollment as the sole eligibility gate; applicant has $0 income and no SNAP status is recorded in intake, so eligibility cannot be affirmed.

### rose

- Judge failure: lifeline: Income of $21,600 exceeds the 135% FPL limit of $21,546 for a 1-person household; the reasoning conditionally assumes categorical enrollment (SNAP/OHP) but does not establish that it is documented in the intake.
- Judge failure: trimet-low-income-fare: Age requirement 18–64 contradicts eligibility for applicant with 'has_senior_in_household: true'; the program's age_max is 64, which excludes seniors 65+, yet the reasoning asserts seniors qualify 'separately' — this contradicts the program definition which does not state an alternate age-waived path for the primary applicant.

### cliff-snap-under

- False positive: oregon-eitc
- Judge failure: oregon-eitc: Annual income of $35,000 exceeds the program's stated income_max_annual of $30,000, contradicting the eligibility determination of true.
- Judge failure: school-meals: The reasoning cites 130% FPL free-meals threshold, but the program definition specifies only 185% FPL income_max_pct_fpl with no separate free/reduced tiers defined in the program data provided.

### cliff-snap-over

- False positive: snap
- False positive: oregon-eitc
- False positive: double-up-food-bucks
- Judge failure: snap: The determination grants eligibility based on predicted deductions, but the household's gross income ($36,000) exceeds the 130% FPL limit ($35,516); SNAP eligibility requires passing the gross income test first, which this household does not meet.
- Judge failure: oregon-eitc: Household annual income of $36,000 exceeds the program's stated income_max_annual of $30,000, contradicting eligibility.
- Judge failure: nw-natural-bill-discount: Reasoning states household income $36,000 falls in '$36,909 to $55,362' bracket (30% discount), but $36,000 is actually in the '$18,455 to $36,908' bracket (50% discount) per the benefit schedule.
- Judge failure: school-meals: Reasoning cites 130% FPL income limit for free meals, but program definition specifies only 185% FPL with no secondary tier; this 130% threshold is not in the program data provided.
- Judge failure: cep-weatherization: The determination affirms eligibility as true while simultaneously stating that renter status may limit access to the full program and that the flagship program requires homeownership—this is an internal contradiction that should resolve to ineligible or contingent, not eligible with medium confidence.
- Judge failure: transportation-wallet: The reasoning states the program provides 'up to $308/year' but the program definition shows max estimated annual value is $308 total (not per year), and the reasoning mischaracterizes this as an annual benefit amount rather than a one-time annual wallet value.
- Judge failure: double-up-food-bucks: The reasoning assumes the household is 'very likely to qualify for SNAP after deductions' but the program eligibility gate is current SNAP enrollment, not projected eligibility; the intake provides no SNAP status field, and SNAP eligibility cannot be verified from the given data.

### cliff-ohp-under

- False positive: snap
- False positive: double-up-food-bucks
- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: oregon-eitc: Reasoning references federal EITC eligibility and thresholds ($18,591), which are not part of the Oregon EIC program definition provided, and conflates federal and state programs without establishing Oregon EIC eligibility criteria.
- Judge failure: pge-iqbd: Reasoning states applicant 'falls in the mid-range of SMI bands' at $21,800 income, but $21,800 is 56.8% of the $38,384 ceiling—the lower end, not mid-range—and the program provides no SMI band thresholds to support a 30–50% discount claim.
- Judge failure: trimet-low-income-fare: Determination assumes applicant has OHP/Medicaid or SNAP enrollment, but intake contains no such data; eligibility cannot be affirmed without verification of these requirements or direct income comparison to 200% FPL limit.

### cliff-ohp-over

- Judge failure: oregon-eitc: The determination concludes eligible=true but the reasoning explains the applicant likely receives $0 or minimal benefit and is phased out of EITC eligibility; this internal contradiction is unresolved.

### zip-gresham

- Dollar violation: ohp: $8000 outside [$3000–$6000]
- Dollar violation: pge-iqbd: $0 outside [$300–$1500]
- Dollar violation: nw-natural-bill-discount: $0 outside [$200–$700]
- Judge failure: ohp: Estimated annual value of $6,000 is derived from incorrect logic ($4,000/person × 2 adults = $8,000), contradicts the program's stated range (min $3,000, max $6,000), and misapplies the median value.
- Judge failure: pge-iqbd: The determination marks eligible=true but then states 'Marking ineligible due to no confirmed PGE service' — these contradict each other. The reasoning conclusion does not match the eligibility determination.
- Judge failure: school-meals: The reasoning attributes a 130% FPL free-meals threshold to this program, but the program definition specifies only 185% FPL income_max_pct_fpl with no separate free/reduced tiers defined.
- Judge failure: sun-service-system: ZIP 97030 (Gresham) is in Multnomah County but the program requires residence in Multnomah, and the reference table explicitly states that only specific Portland ZIPs qualify for Portland-jurisdiction programs; 97030 is not listed as a qualifying Portland ZIP code.
- Judge failure: multco-preschool-for-all: ZIP 97030 (Gresham) is not in Multnomah County; the program requires residency in Multnomah County, and the household does not meet this requirement.
- Judge failure: trimet-low-income-fare: ZIP code 97030 (Gresham) is not in Multnomah County; program requires residency in Multnomah County, not just TriMet service district.
- Judge failure: double-up-food-bucks: The determination cites a 130% FPL threshold ($42,900) for SNAP eligibility, but Double Up Food Bucks has no income test — it requires only current SNAP enrollment. The reasoning should not invoke an income calculation at all, as the program definition explicitly states 'No separate income test — SNAP enrollment is the sole eligibility gate.'

### rent-increase-9pct

- Judge failure: oregon-eitc: Reasoning references federal EITC calculations and mechanics not defined in the program data; program definition does not specify Oregon EITC is 9% of federal EITC or state these percentages.
- Judge failure: school-meals: Reasoning attributes a 130% FPL free-meals threshold to this program, which the program definition does not state; the program only specifies 185% FPL income eligibility with no tiered thresholds.
- Judge failure: cep-weatherization: The determination affirms eligibility without noting that the program's 'other_requirements' explicitly state the flagship free home repair/weatherization program requires owning and occupying the home and being 55+/disabled; the applicant is a renter without disability or senior status, which contradicts eligibility for that core service.

### eviction-notice

- False positive: oregon-eitc
- Judge failure: oregon-eitc: Reasoning contradicts program definition: Oregon Kids Credit requires children under 6, applicant's child is age 6, yet determination marks applicant eligible for the program.
- Judge failure: cep-weatherization: Reasoning attributes a renter-eligible weatherization service to CEP, but the program definition states the flagship program 'requires owning and occupying the home' with no mention of renter services.

### veteran-renter

- False positive: multco-eviction-prev
- Judge failure: oregon-eitc: Reasoning attributes a 9% or 12% calculation rule to Oregon EIC that is not stated in the program definition provided, and the program definition contains no such percentages or reference to federal EITC multipliers.
- Judge failure: nw-natural-bill-discount: Benefit schedule band applied contradicts household income: $18,000 falls in Oregon band '$18,454 or less' (85% discount), not '$18,455 to $36,908' (50% discount).
- Judge failure: multco-eviction-prev: Applicant does not meet the triggered_by_event requirement: eviction_notice is false, yet determination marks eligible:true without addressing this disqualifying condition.
- Judge failure: trimet-low-income-fare: Program requires residence in Multnomah County; zip code 97209 is in Washington County, not Multnomah County.
- Judge failure: double-up-food-bucks: The reasoning cites a $20,748 SNAP income limit for a 1-person household, which contradicts the 2026 FPL table ($15,960) and is not provided in any reference material given to the auditor.

### senior-renter

- Judge failure: pge-iqbd: Reasoning states 'SNAP enrollment (if approved) would automatically qualify this household' — this program has no SNAP automatic-qualification rule.
- Judge failure: nw-natural-bill-discount: Income of $19,000 falls in the Oregon bracket '$18,455 to $36,908' (50% discount), but the reasoning states this bracket applies when income is $18,455 or more; however, the first bracket '$18,454 or less' applies at $19,000, which contradicts the benefit schedule.
- Judge failure: cep-weatherization: Determination marks applicant eligible despite program requirement that flagship weatherization demands home ownership; applicant is a renter and does not meet stated eligibility.
- Judge failure: trimet-low-income-fare: The determination assumes the applicant is age 18–64, but the household has a senior (age 65+) and household_size is 1, meaning the applicant IS the senior; seniors 65+ are explicitly outside the age_max of 64 and qualify via a separate pathway, not this program's standard eligibility.

### pregnant-household

- Error: pregnant-household: The analysis response was cut off — please try again.

### unhoused

- Error: unhoused: The analysis response was cut off — please try again.
