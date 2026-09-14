# Eval Report

- Date: 2026-09-14T20:54:14.670Z
- Eligibility model: claude-sonnet-4-6
- Judge model: claude-haiku-4-5-20251001
- Git SHA: 1d2557c
- Runs per case: 1
- Cases: 14

## Scoreboard

| case | F1 | precision | recall | $ in-range | conf. agree | reasoning pass | flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| maria | 0.95 | 0.91 | 1.00 | 73% | 100% | 73% |  |
| james | 1.00 | 1.00 | 1.00 | 100% | 100% | 86% |  |
| rose | 1.00 | 1.00 | 1.00 | 92% | — | 69% |  |
| cliff-snap-under | 1.00 | 1.00 | 1.00 | 94% | 100% | 94% |  |
| cliff-snap-over | 0.87 | 0.77 | 1.00 | 88% | — | 82% |  |
| cliff-ohp-under | 1.00 | 1.00 | 1.00 | 100% | — | 91% |  |
| cliff-ohp-over | 0.91 | 1.00 | 0.83 | 100% | — | 100% |  |
| zip-gresham | 1.00 | 1.00 | 1.00 | 79% | — | 36% |  |
| rent-increase-9pct | 1.00 | 1.00 | 1.00 | 100% | — | 65% |  |
| eviction-notice | 0.96 | 0.93 | 1.00 | 84% | — | 89% |  |
| veteran-renter | 1.00 | 1.00 | 1.00 | 92% | — | 77% |  |
| senior-renter | 1.00 | 1.00 | 1.00 | 100% | — | 85% |  |
| pregnant-household | 0.88 | 0.78 | 1.00 | 92% | — | 92% |  |
| unhoused | 1.00 | 1.00 | 1.00 | 100% | — | 83% |  |
| Aggregate | 0.97 | 0.96 | 0.99 | 93% | 100% | 80% |  |

## Failures

### maria

- False positive: double-up-food-bucks
- Dollar violation: ohp: $16000 outside [$3000–$6000]
- Dollar violation: erdc: $0 outside [$8000–$18000]
- Dollar violation: school-meals: $3000 outside [$1000–$2500]
- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: ohp: Estimated annual value of $16,000 contradicts the program's stated range of $3,000–$6,000 (median $4,000).
- Judge failure: nw-natural-bill-discount: The reasoning cites specific SMI bands ($36,909–$55,362) and a 30% discount tier that do not appear in the program definition or reference tables provided.
- Judge failure: school-meals: Estimated annual value of $3,000 contradicts the program's stated range (max $2,500).
- Judge failure: double-up-food-bucks: Determination marked eligible=true but reasoning explains they are not confirmed SNAP recipients and marks them ineligible pending SNAP enrollment confirmation—a logical contradiction.

### james

- Judge failure: veterans-prop-tax-exempt: Reasoning attributes a 40%+ service-connected disability rating requirement to the program, but the program definition only states 'Service-connected disability rating, OR surviving spouse of veteran' without specifying a minimum percentage threshold.
- Judge failure: lifeline: The reasoning incorrectly calculates the 135% FPL threshold as $21,546/year when the correct threshold for a 1-person household is $21,546 (135% × $15,960 = $21,546), but then states it as if $21,546 is the threshold when it should be compared to the applicant's $0 income—this is internally contradictory phrasing, though the eligibility conclusion itself appears correct; more critically, the reasoning attributes a specific monthly benefit amount ($9.25) and annual value ($111) to Lifeline without this being specified in the program definition, which only provides an estimated range of $111–$411.

### rose

- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: cep-weatherization: Reasoning assumes the senior in the household is the applicant/primary householder, but intake shows household_size=1 and senior status is a separate boolean flag, creating ambiguity about whether the senior is actually part of this 1-person household or a misrecorded data point.
- Judge failure: lifeline: The determination marks applicant eligible based on speculative categorical enrollment (SNAP/OHP) not confirmed in intake, contradicting the program's requirement that eligibility be 'OR enrolled in qualifying program' — enrollment must be affirmatively established, not assumed.
- Judge failure: trimet-low-income-fare: The household has a senior (age 65+) but the applicant's own age is unknown; the reasoning assumes the senior IS the applicant without evidence, conflating household composition with applicant identity.
- Judge failure: double-up-food-bucks: The determination contradicts the program definition: Double Up Food Bucks has no separate income test; eligibility is solely gated by current SNAP/EBT-food enrollment. The reasoning improperly applies an income test and marks ineligible based on SNAP pending status, when the program requires only that SNAP be 'current' at time of use.

### cliff-snap-under

- Dollar violation: snap: $9420 outside [$1200–$9000]
- Judge failure: trimet-low-income-fare: Reasoning assumes applicant age 18-64 based on employment status without intake data confirming age; program requires verified age eligibility.

### cliff-snap-over

- False positive: snap
- False positive: oregon-eitc
- False positive: double-up-food-bucks
- Dollar violation: snap: $9420 outside [$1200–$9000]
- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: snap: Reasoning contains a mathematical error and contradicts the program data: 130% FPL for 3-person household is $35,516 ($27,320 × 1.30), and household income of $36,000 exceeds this limit; the determination then hedges eligibility based on deductions that SNAP does not apply to non-elderly/non-disabled households at the gross income test stage, contrary to the program rules cited in the reasoning itself.
- Judge failure: oregon-eitc: Household income ($36,000) exceeds the program's stated income_max_annual ($30,000), and the reasoning incorrectly asserts that Oregon EITC 'should still be available' by deferring to federal thresholds rather than applying the program's own eligibility rule.
- Judge failure: double-up-food-bucks: The determination contradicts the program definition by making eligibility conditional on SNAP enrollment that the intake does not confirm, when the program explicitly states 'No separate income test — SNAP enrollment is the sole eligibility gate' and requires only that the applicant be a 'current SNAP/EBT-food recipient'; the determination cannot affirm eligibility as 'true' without confirming current SNAP status.

### cliff-ohp-under

- Judge failure: oregon-eitc: Estimated annual value of $600 contradicts the program's stated range ($500–$4,000 median $1,800) for a childless single filer; reasoning acknowledges the actual value should be ~$150 but reports $600 as the determination.

### cliff-ohp-over

- False negative: oregon-eitc

### zip-gresham

- Dollar violation: snap: $11928 outside [$1200–$9000]
- Dollar violation: ohp: $16000 outside [$3000–$6000]
- Dollar violation: wic: $312 outside [$500–$1500]
- Judge failure: snap: Estimated annual value of $11,928 contradicts the program's stated maximum of $9,000.
- Judge failure: ohp: Estimated annual value of $16,000 contradicts the program's stated range of $3,000–$6,000 (median $4,000).
- Judge failure: erdc: The reasoning cites a specific copay band ($2,750–$4,124.99 monthly income → $5/month copay) and benefit schedule that are not provided in the program definition or reference tables, making the copay calculation unverifiable against official data.
- Judge failure: wic: Estimated annual value of $312 contradicts the program's stated range of $500–$1500 (median $700); the reasoning improperly monetizes only a partial cash-value benefit rather than the full WIC benefit package.
- Judge failure: sun-service-system: ZIP 97030 (Gresham) is in Multnomah County but the program requires residence in Multnomah County AND the household must live near or attend a SUN school; the determination does not verify the second requirement, only assumes SUN schools exist in Gresham without confirming this household meets it.
- Judge failure: advsd: ZIP code 97030 is not in Multnomah County; the determination contradicts the geographic requirement.
- Judge failure: multco-preschool-for-all: ZIP code 97030 is not in Multnomah County; it is in Clackamas County (Oregon City area), so the household does not meet the residency requirement.
- Judge failure: trimet-low-income-fare: ZIP 97030 (Gresham) is not in Multnomah County; program requires residence in Multnomah County, not the broader TriMet district.
- Judge failure: double-up-food-bucks: The reasoning uses 130% FPL limit ($42,900) which is not stated in the program definition or reference tables; Double Up Food Bucks has no separate income test, only SNAP enrollment requirement—no FPL calculation is needed or appropriate for this program's eligibility gate.

### rent-increase-9pct

- Judge failure: ohp: Child eligibility limit incorrectly applied to 2-person household; 305% FPL for children applies to the child's individual FPL tier, not household FPL, and the reasoning conflates household and individual thresholds without clarification.
- Judge failure: oregon-eitc: Reasoning attributes a 9% federal EITC calculation rule to Oregon EIC that does not appear in the program definition provided.
- Judge failure: school-meals: The determination invokes a 130% FPL threshold for free meals that is not stated in the program definition provided; the program definition only specifies 185% FPL income_max_pct_fpl with no separate free/reduced tiers.
- Judge failure: transportation-wallet: Determination marks applicant eligible without noting that Access for All requires referral by a participating community-based organization (not self-service), which cannot be verified from intake data alone.
- Judge failure: trimet-low-income-fare: Program requires applicant age 18–64, but household includes a 10-year-old child; reasoning does not address whether the child or only the adult applicant is the intended beneficiary, creating ambiguity about which household member's age satisfies the requirement.
- Judge failure: double-up-food-bucks: Determination states applicant 'is eligible for SNAP' but provides no evidence from intake data that SNAP eligibility was verified; the program explicitly requires 'current SNAP/EBT-food recipient' status, not mere eligibility potential.

### eviction-notice

- False positive: oregon-eitc
- Dollar violation: snap: $9420 outside [$1200–$9000]
- Dollar violation: erdc: $0 outside [$8000–$18000]
- Dollar violation: oregon-eitc: $0 outside [$500–$4000]
- Judge failure: oregon-eitc: The reasoning attributes federal EITC income limits and federal program rules to the Oregon EIC program, which is a different program; the program definition states income_max_annual of $30,000 with no income_basis field, making $32,000 over the stated limit.
- Judge failure: nw-natural-bill-discount: Reasoning invokes a 50% discount tier and $18,455-$36,908 bracket that are not in the program definition or reference tables provided.

### veteran-renter

- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: oregon-eitc: Oregon EIC is not 9% of federal EITC; the reasoning attributes an incorrect calculation method to the program.
- Judge failure: trimet-low-income-fare: Program requires residence in Multnomah County, but zip 97209 is in Washington County, not Multnomah County.
- Judge failure: double-up-food-bucks: Determination marks eligible=true but reasoning states applicant is ineligible due to lack of current SNAP enrollment; these contradict each other.

### senior-renter

- Judge failure: cep-weatherization: Reasoning contradicts program requirement: CEP Weatherization flagship program requires owning AND occupying the home; applicant rents and therefore does not meet this core eligibility criterion, yet determination marks applicant eligible.
- Judge failure: trimet-low-income-fare: Program eligibility requires age 18–64; applicant with senior in household contradicts this unless applicant is under 65, but reasoning conflates two different pathways (income-based vs. senior) without establishing applicant's age, creating logical inconsistency about which pathway applies.

### pregnant-household

- False positive: snap
- False positive: double-up-food-bucks
- Dollar violation: double-up-food-bucks: $0 outside [$120–$1440]
- Judge failure: ohp: The reasoning applies the pregnant-person limit (190% FPL) to a 2-person household, but the program definition lists 'Pregnant: 190% FPL' as a category without specifying it overrides the household-size calculation; the determination should have clarified whether 190% FPL is a standalone category (applied uniformly) or derived from household composition. The math ($21,640 × 1.90 = $41,116) is correct for 190% of the 2-person FPL, but the reasoning does not explicitly state that pregnant status triggers a separate 190% threshold rather than the stated default 'Adults: 138% FPL' for this household composition.

### unhoused

- Judge failure: lifeline: The reasoning attributes automatic qualification through SNAP/OHP enrollment to the applicant, but the intake contains no evidence of current enrollment in any qualifying program; the program requires enrollment OR income eligibility, and the determination does not verify which criterion is met.
- Judge failure: trimet-low-income-fare: Reasoning assumes SNAP enrollment as fact ('SNAP enrollment (once active) will automatically qualify'), but household intake shows no current SNAP enrollment and does not state applicant will enroll.
