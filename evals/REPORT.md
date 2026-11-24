# Eval Report

- Date: 2026-11-24T03:18:17.585Z
- Eligibility model: claude-sonnet-4-6
- Judge model: claude-haiku-4-5-20251001
- Git SHA: d74f1b4
- Runs per case: 1
- Cases: 14

## Scoreboard

| case | F1 | precision | recall | $ in-range | conf. agree | reasoning pass | flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| maria | 0.95 | 0.91 | 1.00 | 93% | 100% | 80% |  |
| james | 1.00 | 1.00 | 1.00 | 100% | 100% | 93% |  |
| rose | 1.00 | 1.00 | 1.00 | 100% | — | 69% |  |
| cliff-snap-under | 1.00 | 1.00 | 1.00 | 100% | 100% | 94% |  |
| cliff-snap-over | 0.87 | 0.77 | 1.00 | 100% | — | 71% |  |
| cliff-ohp-under | 1.00 | 1.00 | 1.00 | 100% | — | 91% |  |
| cliff-ohp-over | 0.92 | 0.86 | 1.00 | 100% | — | 82% |  |
| zip-gresham | 1.00 | 1.00 | 1.00 | 93% | — | 43% |  |
| rent-increase-9pct | 1.00 | 1.00 | 1.00 | 100% | — | 76% |  |
| eviction-notice | 1.00 | 1.00 | 1.00 | 100% | — | 83% |  |
| veteran-renter | 1.00 | 1.00 | 1.00 | 100% | — | 71% |  |
| senior-renter | 0.95 | 0.90 | 1.00 | 100% | — | 86% |  |
| pregnant-household | 0.93 | 0.88 | 1.00 | 100% | — | 92% |  |
| unhoused | 1.00 | 1.00 | 1.00 | 100% | — | 75% |  |
| Aggregate | 0.97 | 0.95 | 1.00 | 99% | 100% | 79% |  |

## Failures

### maria

- False positive: oregon-eitc
- Dollar violation: ohp: $8000 outside [$3000–$6000]
- Judge failure: ohp: Estimated annual value of $8,000 contradicts the program's stated range of $3,000–$6,000 (median $4,000).
- Judge failure: oregon-eitc: The reasoning invokes federal EITC rules and phase-out thresholds, but the program definition specifies only Oregon EIC with an income_max_annual of $30,000; the determination contradicts the stated program ceiling by accepting $48,000 income based on external federal logic not in the program data.
- Judge failure: school-meals: The reasoning states the household qualifies for reduced-price meals at 145% FPL, but the program's eligibility threshold is 185% FPL with no two-tier structure (free vs. reduced) defined in the program definition—the program only specifies a single income_max_pct_fpl of 185%, not separate free/reduced tiers.

### james

- Judge failure: double-up-food-bucks: The reasoning assumes the applicant is 'highly likely to be approved for SNAP' but provides no factual basis for this assumption; SNAP eligibility is not established by the intake data and is a mandatory prerequisite that cannot be inferred from $0 income alone.

### rose

- Judge failure: ohp: Reasoning states "138% FPL ($22,025)" but 138% of $15,960 (1-person FPL) = $22,025.08, which contradicts the claim that income of $21,600 is "just under that threshold" — it is actually under, making the hedged language about "even if slightly over" unsupported and misleading about the applicant's actual position relative to the stated adult threshold.
- Judge failure: advsd: Reasoning assumes applicant is 60+ based on 'retired senior' status, but intake contains no age field; retirement alone does not confirm OAA priority eligibility (60+), and the program definition requires age verification for direct services prioritization.
- Judge failure: lifeline: Income $21,600 exceeds 135% FPL limit of $21,546 for a 1-person household; determination cannot rely on unverified categorical enrollment to override income ineligibility.
- Judge failure: double-up-food-bucks: The determination assumes SNAP eligibility as a prerequisite but does not verify or confirm that the household actually holds a current SNAP/EBT-food recipient (Oregon Trail Card), which is the sole eligibility gate stated in the program definition.

### cliff-snap-under

- Judge failure: lifeline: Determination assumes applicant qualifies for SNAP or OHP without evidence in intake; intake contains no data confirming enrollment in any qualifying program.

### cliff-snap-over

- False positive: snap
- False positive: oregon-eitc
- False positive: double-up-food-bucks
- Judge failure: snap: The reasoning contradicts the program's income rule by applying net income logic and deductions that are not stated in the program definition provided, and by marking eligible=true when gross income ($36,000) exceeds the 130% FPL ceiling ($35,516).
- Judge failure: ohp: The reasoning conflates household-level income limits with individual eligibility; OHP applies separate FPL thresholds by category (adults at 138%, children at 305%), but the determination does not clarify whether the specific household composition meets the actual eligibility rules, and the 138% calculation ($37,702) is not properly derived from the 3-person FPL of $27,320.
- Judge failure: oregon-eitc: Determination contradicts program definition: program states income_max_annual of $30,000, applicant income is $36,000, yet determination marks eligible as true without acknowledging this exceeds the stated limit.
- Judge failure: nw-natural-bill-discount: Income $36,000 falls in the Oregon bracket '$18,455 to $36,908' (50% discount), not '$36,909 to $55,362' (30% discount); the threshold is at $36,909, not $36,000.
- Judge failure: double-up-food-bucks: Determination marked eligible=true but reasoning states 'Currently marking ineligible pending SNAP determination' — the conclusion contradicts the stated reasoning.

### cliff-ohp-under

- Judge failure: oregon-eitc: Reasoning contradicts program definition: applicant has no children, but Oregon Kids Credit explicitly requires 'children under 6'; Oregon EIC for childless workers typically has income limit ~$18,600, and $21,800 exceeds it, making eligibility determination incorrect.

### cliff-ohp-over

- False positive: pdx-renter-relocation
- Judge failure: pdx-renter-relocation: Determination grants eligibility (true) while reasoning explains that the triggering event is absent from intake data, which should preclude eligibility.
- Judge failure: oregon-eitc: Reasoning attributes federal EITC eligibility rules to Oregon EIC program and relies on federal thresholds (~$19,104) rather than the program's stated income_max_annual of $30,000; applicant's $22,300 income is below the program's $30,000 ceiling, making eligibility determination based on federal rules an affirmative contradiction of the program definition provided.

### zip-gresham

- Dollar violation: ohp: $16000 outside [$3000–$6000]
- Judge failure: ohp: Estimated annual value of $16,000 contradicts the program's stated range (min $3,000, max $6,000, median $4,000); the calculation method and result are unsupported by program data.
- Judge failure: pge-iqbd: Determination states eligible=true but reasoning concludes 'Setting eligible=false' — internal contradiction on the eligibility decision itself.
- Judge failure: liheap-energy-trust: Reasoning states household resides in Gresham, but zip code 97030 is not listed in the Portland City Limits table and the determination does not establish Oregon residency requirement is met for LIHEAP eligibility.
- Judge failure: school-meals: The determination invokes a 130% FPL free-meals threshold that is not in the program definition, which specifies only 185% FPL income_max_pct_fpl.
- Judge failure: sun-service-system: ZIP 97030 (Gresham) is not in the must_reside_in list (multnomah county programs typically require Portland city limits or specific Multnomah subregions); the determination affirms eligibility without confirming the child attends or lives near a SUN school, which is a stated requirement.
- Judge failure: advsd: ZIP 97030 (Gresham) is not listed in the Portland city limits table and is outside Multnomah County; the program requires residency in Multnomah County, and Gresham is in a separate county.
- Judge failure: trimet-low-income-fare: ZIP 97030 (Gresham) is not in the program's service area; program requires residence in Multnomah County, and the reference table explicitly lists only specific Portland-area ZIPs as qualifying.
- Judge failure: double-up-food-bucks: The determination attributes a 130% FPL income test to Double Up Food Bucks Oregon, but the program definition states 'No separate income test — SNAP enrollment is the sole eligibility gate'; income is not a gate for this program.

### rent-increase-9pct

- Judge failure: oregon-eitc: Reasoning states the child age 10 does not qualify for Oregon Kids Credit (which requires under 6), yet concludes overall eligibility is true without explaining what remaining benefit the applicant receives.
- Judge failure: cep-weatherization: Determination marks applicant eligible despite program requirement that flagship weatherization program requires homeownership and occupancy (applicant is a renter).
- Judge failure: lifeline: The determination assumes the household qualifies for SNAP without verification; intake contains no SNAP enrollment status, only employment and income data.
- Judge failure: trimet-low-income-fare: Determination assumes applicant age 18–64 without verification, but household includes only a 10-year-old child and no adult age data in intake; program requires applicant to be age 18–64, which cannot be confirmed.

### eviction-notice

- Judge failure: pdx-renter-relocation: The reasoning assumes a 2-bedroom unit ($4,200) without evidence in the intake; the benefit schedule requires knowing actual unit size, which is not captured in the household data.
- Judge failure: cep-weatherization: The reasoning asserts CEP offers weatherization to renters through 'other programs' but the program definition explicitly requires homeownership for the flagship weatherization program and does not define alternate renter-eligible services.
- Judge failure: double-up-food-bucks: Determination assumes SNAP eligibility without verifying it is actually enrolled; program requires 'current SNAP/EBT-food recipient' status, not prospective eligibility.

### veteran-renter

- Judge failure: oregon-eitc: Oregon EIC program requires children under 6 for Kids' Credit component; reasoning attributes a 9-12% credit calculation to Oregon EIC that is not stated in the program definition and conflates federal EITC with state EIC eligibility criteria.
- Judge failure: nw-natural-bill-discount: Benefit schedule applied incorrectly: $18,000 income falls in the first Oregon band ($18,454 or less) for 85% discount, not the second band ($18,455–$36,908) for 50% discount.
- Judge failure: cep-weatherization: Determination marks applicant eligible but reasoning establishes applicant fails the program's core requirement (must own and occupy home), making eligibility determination contradictory.
- Judge failure: lifeline: Reasoning attributes a categorical eligibility pathway (SNAP/OHP enrollment) to Lifeline that the program definition does not include; Lifeline's other_requirements list only SNAP, Medicaid, SSI, Federal Public Housing, Veterans Pension, and Tribal programs—OHP is not listed.

### senior-renter

- False positive: multco-eviction-prev
- Judge failure: multco-eviction-prev: The program definition specifies 'triggered_by_event: eviction_notice' as a requirement, but the household has no eviction notice and the determination is marked eligible anyway; the reasoning attempts to bypass this by invoking an energy-assistance subcomponent, but the program definition does not establish that energy assistance is a separable pathway or that it lacks the eviction trigger.
- Judge failure: trimet-low-income-fare: Reasoning states applicant is eligible under the 18–64 age requirement, but then contradicts itself by acknowledging the person may be 65+ (ineligible under that rule) and would qualify only via a separate senior program, which is a different eligibility pathway not evaluated here.

### pregnant-household

- False positive: oregon-eitc
- Judge failure: oregon-eitc: Household income of $35,000 exceeds the program's stated income_max_annual of $30,000, making the applicant ineligible.

### unhoused

- Judge failure: inclusionary-housing: Determination requires applicant to be a renter (must_be_renter: true), but household is currently unhoused and eligibility cannot be affirmed until renter status is established.
- Judge failure: trimet-low-income-fare: Reasoning assumes applicant age is 18-64 without verification, but intake contains no age field and applicant's actual age is unknown.
- Judge failure: double-up-food-bucks: The determination marks applicant as eligible (true) but the program requires CURRENT SNAP/EBT enrollment, which the intake does not show; eligibility cannot be affirmed without documented current SNAP enrollment.
