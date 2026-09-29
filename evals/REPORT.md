# Eval Report

- Date: 2026-09-29T19:22:46.765Z
- Eligibility model: claude-sonnet-4-6
- Judge model: claude-haiku-4-5-20251001
- Git SHA: cf3b12c
- Runs per case: 1
- Cases: 14

## Scoreboard

| case | F1 | precision | recall | $ in-range | conf. agree | reasoning pass | flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| maria | 0.91 | 0.83 | 1.00 | 88% | 100% | 81% |  |
| james | 1.00 | 1.00 | 1.00 | 100% | 100% | 79% |  |
| rose | 1.00 | 1.00 | 1.00 | 100% | — | 73% |  |
| cliff-snap-under | 1.00 | 1.00 | 1.00 | 100% | 100% | 69% |  |
| cliff-snap-over | 0.91 | 0.83 | 1.00 | 100% | — | 94% |  |
| cliff-ohp-under | 0.92 | 1.00 | 0.86 | 100% | — | 90% |  |
| cliff-ohp-over | 0.83 | 0.83 | 0.83 | 90% | — | 80% |  |
| zip-gresham | 1.00 | 1.00 | 1.00 | 86% | — | 50% |  |
| rent-increase-9pct | 1.00 | 1.00 | 1.00 | 94% | — | 76% |  |
| eviction-notice | 0.96 | 0.93 | 1.00 | 95% | — | 84% |  |
| veteran-renter | 0.96 | 0.92 | 1.00 | 93% | — | 67% |  |
| senior-renter | 1.00 | 1.00 | 1.00 | 100% | — | 92% |  |
| pregnant-household | 0.88 | 0.78 | 1.00 | 100% | — | 85% |  |
| unhoused | 1.00 | 1.00 | 1.00 | 100% | — | 75% |  |
| Aggregate | 0.95 | 0.94 | 0.98 | 96% | 100% | 78% |  |

## Failures

### maria

- False positive: snap
- False positive: double-up-food-bucks
- Dollar violation: ohp: $16000 outside [$3000–$6000]
- Dollar violation: erdc: $0 outside [$8000–$18000]
- Judge failure: snap: Estimated annual value of $11,928 contradicts program data: SNAP maximum for household of 4 is $994/month ($11,928/year), but this is the benefit schedule maximum, not an eligibility-determination output. The determination conflates maximum benefit with estimated value and does not account for the household's actual income-based benefit reduction.
- Judge failure: ohp: The reasoning estimates $16,000 annual value, which exceeds the program's stated maximum of $6,000 by 167%.
- Judge failure: cep-weatherization: The reasoning contradicts the program definition by stating the flagship program requires 55+ OR disability, when the official requirement states 55+ AND/OR disability (both conditions listed as requirements for that specific service tier), and then applies this contradiction to deny eligibility without checking if other CEP services exist for renters under the 80% AMI income basis.

### james

- Judge failure: pge-iqbd: Reasoning claims applicant qualifies for 80% discount tier, but program definition provides no tier structure or 80% threshold — only that discounts scale by SMI band with no tiers specified in the reference materials.
- Judge failure: nw-natural-bill-discount: The reasoning cites an '85% Oregon discount tier' and an income threshold of '$18,454' that do not appear in the program definition or reference tables provided.
- Judge failure: veterans-prop-tax-exempt: Reasoning introduces a specific requirement (40% or more service-connected disability rating) that does not appear in the program definition provided to the engine.

### rose

- Judge failure: senior-prop-tax-deferral: Reasoning assumes age 62+ based solely on has_senior_in_household field, but intake contains no age data and the field definition is unspecified; the program requires verified age 62+ or qualifying disability, and this determination lacks affirmative proof of either.
- Judge failure: lifeline: Reasoning assumes applicant is 'likely' enrolled in SNAP/OHP without evidence from intake; determination cannot rely on unconfirmed program enrollment to override the stated income limit.
- Judge failure: trimet-low-income-fare: The reasoning conflates two separate programs: the 18–64 income-qualified program and the 65+ senior program, then awards eligibility without establishing which applies or age verification, when the intake provides no age field to determine eligibility under either.
- Unjudged: 2

### cliff-snap-under

- Judge failure: ohp: The reasoning applies adult income limit (138% FPL) to the whole household instead of evaluating children separately at 305% FPL; it does not confirm the child meets the child-specific limit.
- Judge failure: erdc: Reasoning cites a copay table and specific copay amounts ($10/month, $5/month) that are not in the program definition or reference materials provided to the auditor.
- Judge failure: nw-natural-bill-discount: The reasoning references discount bands ('$36,909–$55,362' for 30% discount, implying a 50% tier below $36,909) that are not provided in the program definition or reference tables, making them unverifiable and potentially contradicting the program's actual structure.
- Judge failure: school-meals: Reasoning incorrectly cites 130% FPL threshold (not in program definition) and misapplies eligibility logic by referencing free vs. reduced-price meal tiers that are not stated in the program definition provided.
- Judge failure: trimet-low-income-fare: The reasoning states the applicant's zip code 97206 is in Portland and within the TriMet service district, but the program requires residence in Multnomah County only; the program definition lists 'must_reside_in': ['multnomah'], not Portland specifically, and eligibility was not verified against the correct geographic requirement.

### cliff-snap-over

- False positive: snap
- False positive: double-up-food-bucks
- Judge failure: snap: Reasoning invokes Oregon BBCE (broad-based categorical eligibility) raising the gross limit to 185% FPL, but the program definition provided does not list BBCE as an eligibility rule; the only stated requirement is 130% FPL with no mention of categorical eligibility waivers.

### cliff-ohp-under

- False negative: oregon-eitc
- Judge failure: nw-natural-bill-discount: The reasoning cites a specific discount band ($18,455–$36,908 for 50% discount) that is not provided in the program definition or reference tables, and the program definition does not specify how discount percentages scale by SMI band.

### cliff-ohp-over

- False positive: multco-eviction-prev
- False negative: oregon-eitc
- Dollar violation: multco-eviction-prev: $0 outside [$500–$5000]
- Judge failure: multco-eviction-prev: The program definition specifies 'triggered_by_event': 'eviction_notice' as a requirement, but the reasoning claims the energy component is available without this trigger, contradicting the program's stated eligibility rule.
- Judge failure: cep-weatherization: The determination claims eligibility despite acknowledging the applicant fails the core requirement (must own and occupy home, and be 55+ or have disability), which directly contradicts the program definition stating these are requirements of 'the flagship free home repair/weatherization program.'

### zip-gresham

- Dollar violation: ohp: $8000 outside [$3000–$6000]
- Dollar violation: wic: $0 outside [$312–$1500]
- Judge failure: snap: Estimated annual value of $11,928 contradicts the program's defined range (min $1,200, max $9,000, median $3,000).
- Judge failure: ohp: Estimated annual value of $8,000 contradicts the program's stated range of $3,000–$6,000 (median $4,000).
- Judge failure: nw-natural-bill-discount: Reasoning contains unexplained and unverified reference to an Oregon discount tier schedule ($36,909–$55,362 band = 30%) that is not provided in the program definition or official reference tables.
- Judge failure: wic: Reasoning concludes eligible=true but estimated_annual_value=0, which contradicts: a program with estimated annual value range $500–$1500 should show a non-zero value if eligibility is affirmed, or the determination's internal consistency is broken.
- Judge failure: sun-service-system: ZIP 97030 is not in Multnomah County; it is in Clackamas County (Troutdale area), contradicting the stated residency requirement.
- Judge failure: advsd: ZIP code 97030 is not in Multnomah County; the reasoning contradicts the program's geographic requirement.
- Judge failure: trimet-low-income-fare: Program requires residence in Multnomah County; ZIP 97030 (Gresham) is in Clackamas County, not Multnomah County.

### rent-increase-9pct

- Dollar violation: nw-natural-bill-discount: $0 outside [$200–$700]
- Judge failure: erdc: FPL calculation uses 2-person rate ($21,640) but should use 2-person rate multiplied by 200%: $21,640 × 2.00 = $43,280 is correct, but the reasoning states '$21,640 × 2.00' which appears to confuse the base FPL with the percentage—the correct limit is $43,280, not derived from multiplying the already-correct $21,640 by 2.00 again.
- Judge failure: oregon-eitc: The child is 10 years old; Oregon Kids Credit requires children under 6, so the child does not qualify for Kids Credit, but the reasoning does not clearly establish whether the applicant qualifies for Oregon EIC without the Kids Credit component, and the eligibility determination does not address the requirement to file an Oregon state tax return.
- Judge failure: nw-natural-bill-discount: Determination marked eligible=true but reasoning states 'Marking ineligible due to unknown customer status,' a direct contradiction.
- Judge failure: trimet-low-income-fare: Program requires applicant age 18–64, but intake contains no age field; determination cannot verify age eligibility.

### eviction-notice

- False positive: oregon-eitc
- Dollar violation: erdc: $0 outside [$8000–$18000]
- Judge failure: snap: Estimated annual value of $9,420 contradicts the program's stated maximum of $9,000 in the reference table.
- Judge failure: oregon-eitc: Program definition states Kids' Credit requires children under 6, but applicant's only child is age 6 (not under 6), making them ineligible for that component; reasoning does not address this threshold.
- Judge failure: cep-weatherization: Determination marked eligible=true despite reasoning that applicant does not meet the flagship program's core requirement (owner-occupancy); the program definition does not specify separate renter-accessible services, only that the flagship requires ownership.

### veteran-renter

- False positive: multco-eviction-prev
- Dollar violation: multco-eviction-prev: $0 outside [$500–$5000]
- Judge failure: nw-natural-bill-discount: The reasoning cites an 85% tier cutoff of $18,454 and a 50% discount band of '$18,455–$36,908' that do not appear in the official reference tables provided to the engine.
- Judge failure: multco-eviction-prev: Program definition specifies triggered_by_event: 'eviction_notice' is required, but reasoning marks eligible=true despite applicant having received_eviction_notice=false, contradicting the program's trigger requirement.
- Judge failure: cep-weatherization: The determination awards eligibility (true) while acknowledging the applicant fails the stated requirement of 'owning and occupying the home' and being '55+ and/or having a disability'—which are explicit mandatory criteria for the flagship program, not optional tiers.
- Judge failure: lifeline: Reasoning does not verify the 'OR enrolled in qualifying program' requirement; the intake provides no evidence of SNAP, Medicaid, SSI, Federal Public Housing, Veterans Pension, or Tribal program enrollment.
- Judge failure: trimet-low-income-fare: Reasoning assumes applicant age 18-64 without verification; intake contains no age field, and age is a hard program requirement that cannot be hedged.

### senior-renter

- Judge failure: trimet-low-income-fare: The reasoning contradicts the program's age eligibility requirement (18–64) by suggesting a 65+ senior qualifies for 'the low-income program' when the program explicitly serves only ages 18–64; seniors 65+ qualify under a separate senior program, not this one.

### pregnant-household

- False positive: snap
- False positive: oregon-eitc
- Judge failure: snap: The reasoning attributes a rule ('pregnant individuals count as a household of 2 by themselves') to SNAP that is not stated in the program definition and contradicts the household facts (actual household size is 2, not increased by pregnancy).
- Judge failure: oregon-eitc: Reasoning contradicts program definition: Oregon EIC requires income ≤$30,000/year; household income is $35,000, exceeding the limit by $5,000. Reasoning improperly treats the $30,000 ceiling as a 'rough guide' and invokes federal EITC rules not in this program's definition.

### unhoused

- Judge failure: inclusionary-housing: Program requires applicant to be a renter (must_be_renter: true), but household is unhoused and therefore not currently a renter.
- Judge failure: lifeline: The reasoning states the 135% FPL limit is $21,546/year, but 135% of $15,960 (the correct 1-person FPL) is $21,546 — this is arithmetically correct. However, the determination assumes the applicant is 'enrolled in SNAP or OHP (Medicaid)' when the intake shows no such enrollment; the program requires enrollment in a qualifying program OR income below 135% FPL, and the reasoning conflates a future contingency with current eligibility.
- Judge failure: double-up-food-bucks: Reasoning assumes SNAP eligibility without evidence; program requires current SNAP/EBT-food enrollment as the sole eligibility gate, which intake does not confirm.
