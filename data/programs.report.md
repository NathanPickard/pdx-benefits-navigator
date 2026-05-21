# Programs scrape audit

_Generated: 2026-05-21T15:22:57.866Z_

Programs scraped: 20 / 20

## Summary

| Program | Verified | Gaps | Missing provenance |
|---|---|---|---|
| `snap` | 13/32 | 19 | 0 |
| `ohp` | 7/32 | 25 | 0 |
| `pdx-renter-relocation` | 11/32 | 21 | 0 |
| `erdc` | 14/32 | 18 | 0 |
| `oregon-eitc` | 12/32 | 19 | 1 |
| `pge-iqbd` | 11/32 | 21 | 0 |
| `pdx-water-fa` | 13/32 | 19 | 0 |
| `nw-natural-bill-discount` | 12/32 | 20 | 0 |
| `liheap-energy-trust` | 8/32 | 24 | 0 |
| `wic` | 13/32 | 19 | 0 |
| `school-meals` | 5/32 | 27 | 0 |
| `multco-eviction-prev` | 7/32 | 25 | 0 |
| `cep-weatherization` | 3/32 | 29 | 0 |
| `senior-prop-tax-deferral` | 14/32 | 18 | 0 |
| `transportation-wallet` | 9/32 | 23 | 0 |
| `inclusionary-housing` | 8/32 | 24 | 0 |
| `sun-service-system` | 6/32 | 26 | 0 |
| `advsd` | 7/32 | 25 | 0 |
| `veterans-prop-tax-exempt` | 17/32 | 14 | 1 |
| `lifeline` | 9/32 | 22 | 1 |

## Per-program detail

### `snap`

**Sources:**
- https://www.oregon.gov/odhs/food/Pages/snap.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Supplemental Nutrition Assistance Program (SNAP)" | ✅ "The Supplemental Nutrition Assistance Program (SNAP) provides monthly food be…" | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `short_name` | "SNAP" | ✅ "SNAP helps people pay for groceries." | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `description` | "SNAP provides monthly food benefits to help individuals … | ✅ "SNAP helps you stretch your food budget, but may not meet all your food needs." | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `legal_basis` | "Food and Nutrition Act of 2008" | ✅ "In accordance with the Food and Nutrition Act of 2008, the COLAs are effectiv…" | [link](https://www.usda.gov/sites/default/files/guidance-documents/fns.snap-cola-fy26memo.pdf) |
| `estimated_annual_value.min` | — | ❌ No annual value figures provided on any page |  |
| `estimated_annual_value.max` | — | ❌ No annual value figures provided on any page |  |
| `estimated_annual_value.median` | — | ❌ No annual value figures provided on any page |  |
| `benefit_schedule` | Maximum monthly SNAP allotments for 48 States and D.C., F… | ✅ "Maximum allotments will increase for the 48 States and D.C., Alaska, Guam, an…" | [link](https://www.usda.gov/sites/default/files/guidance-documents/fns.snap-cola-fy26memo.pdf) |
| `eligibility.income_max_pct_fpl` | 130 | ✅ "Gross Monthly Income Eligibility Standards (130 Percent of Poverty Level)" | [link](https://www.usda.gov/sites/default/files/guidance-documents/fns.snap-cola-fy26memo.pdf) |
| `eligibility.income_max_annual` | — | ❌ Only monthly income limits provided; annual figure not stated |  |
| `eligibility.household_size_min` | — | ❌ No minimum household size specified |  |
| `eligibility.household_size_max` | — | ❌ No maximum household size specified |  |
| `eligibility.age_min` | — | ❌ No minimum age requirement stated for general eligibility |  |
| `eligibility.age_max` | — | ❌ No maximum age stated for general eligibility |  |
| `eligibility.must_be_renter` | false | ❌ No requirement stated that applicants must be renters |  |
| `eligibility.must_be_homeowner` | false | ❌ No requirement stated that applicants must be homeowners |  |
| `eligibility.must_have_children_under` | — | ❌ Children not required; work requirements apply to those without children under 14 |  |
| `eligibility.must_be_pregnant` | false | ❌ Pregnancy not mentioned as requirement |  |
| `eligibility.must_be_disabled` | false | ❌ Disability not required for eligibility |  |
| `eligibility.must_be_veteran` | false | ❌ Veteran status not required for eligibility |  |
| `eligibility.must_be_senior` | false | ❌ Senior status not required for eligibility |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "Live in Oregon" | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `eligibility.citizenship_status` | "lpr_or_citizen" | ✅ "Are U.S. citizens or eligible non-citizens." | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `eligibility.employment_required` | false | ❌ Employment not required for all; only ABAWD work requirements apply to specific groups |  |
| `eligibility.triggered_by_event` | — | ❌ No specific triggering event mentioned for eligibility |  |
| `eligibility.other_requirements` | ["Able-bodied adults without dependent children must meet… | ✅ "Some able-bodied adults who aren't caring for children need to meet work requ…" | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `application_method` | "online" | ✅ "You can apply online, by phone or in person at a local office." | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `documents_required` | [] | ❌ No specific documents listed on pages |  |
| `processing_time` | — | ❌ Processing time not specified on pages |  |
| `renewal_cycle` | "Renewal packets sent 45 days before renewal due date; pe… | ✅ "This happens 45 days before your renewal is due. About halfway through your b…" | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `contact_phone` | "211" | ✅ "You can call 211 or visit 211info if you need help." | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |
| `contact_org` | "Oregon Department of Human Services (ODHS)" | ✅ "Oregon Department of Human Services (ODHS)" | [link](https://www.oregon.gov/odhs/food/Pages/snap.aspx) |

### `ohp`

**Sources:**
- https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Oregon Health Plan" | ✅ "Oregon Health Plan (OHP) Eligibility" | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |
| `short_name` | "OHP" | ✅ "Oregon Health Plan (OHP)" | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |
| `description` | — | ❌ No general program description provided on the page |  |
| `legal_basis` | — | ❌ Not on page |  |
| `estimated_annual_value.min` | — | ❌ Not on page |  |
| `estimated_annual_value.max` | — | ❌ Not on page |  |
| `estimated_annual_value.median` | — | ❌ Not on page |  |
| `benefit_schedule` | — | ❌ No specific numeric benefit amounts provided; income limits referenced but not stated on this page |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Referenced as variable by year; specific percentages not stated on this page |  |
| `eligibility.income_max_annual` | — | ❌ Income limits mentioned as changing yearly but no specific dollar amounts stated on this page |  |
| `eligibility.household_size_min` | — | ❌ Not on page |  |
| `eligibility.household_size_max` | — | ❌ Not on page |  |
| `eligibility.age_min` | — | ❌ Not on page |  |
| `eligibility.age_max` | — | ❌ Not on page |  |
| `eligibility.must_be_renter` | — | ❌ Not on page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not on page |  |
| `eligibility.must_have_children_under` | — | ❌ Not on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not on page |  |
| `eligibility.must_be_senior` | — | ❌ Not on page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "To qualify for OHP individuals and families must meet income and residency re…" | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |
| `eligibility.citizenship_status` | — | ❌ Not on page |  |
| `eligibility.employment_required` | — | ❌ Not on page |  |
| `eligibility.triggered_by_event` | — | ❌ Not on page |  |
| `eligibility.other_requirements` | — | ❌ General requirements mentioned but not listed as specific requirements |  |
| `application_method` | "online" | ✅ "You can use this online tool to see if you qualify for OHP or other health co…" | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |
| `documents_required` | — | ❌ Not on page |  |
| `processing_time` | — | ❌ Not on page |  |
| `renewal_cycle` | "every two years" | ✅ "OHP will review records every two years for members age six or older." | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |
| `contact_phone` | "1-800-273-0557" | ✅ "Call 1-800-273-0557" | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |
| `contact_org` | "Oregon Health Authority" | ✅ "Oregon Health Authority" | [link](https://www.oregon.gov/oha/hsd/ohp/pages/eligibility.aspx) |

### `pdx-renter-relocation`

**Sources:**
- https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Portland Mandatory Renter Relocation Assistance" | ✅ "Mandatory Renter Relocation Assistance" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `short_name` | "Mandatory Renter Relocation Assistance" | ✅ "Mandatory Renter Relocation Assistance" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `description` | "Renters in Portland who are served a no-cause eviction o… | ✅ "Renters in Portland who are served a no-cause eviction or encounter any of th…" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `legal_basis` | "Portland City Code 30.01.085" | ✅ "Section 30.01.085" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `estimated_annual_value.min` | — | ❌ No annual value information provided on page |  |
| `estimated_annual_value.max` | — | ❌ No annual value information provided on page |  |
| `estimated_annual_value.median` | — | ❌ No annual value information provided on page |  |
| `benefit_schedule` | Relocation assistance amounts by rental unit size (one-ti… | ✅ "Studio or Single Room Occupancy (SRO) $2,900; 1-Bedroom $3,300; 2-Bedroom $4,…" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `eligibility.income_max_pct_fpl` | — | ❌ No income limit specified on page |  |
| `eligibility.income_max_annual` | — | ❌ No income limit specified on page |  |
| `eligibility.household_size_min` | — | ❌ No household size minimum specified on page |  |
| `eligibility.household_size_max` | — | ❌ No household size maximum specified on page |  |
| `eligibility.age_min` | — | ❌ No age requirement specified on page |  |
| `eligibility.age_max` | — | ❌ No age requirement specified on page |  |
| `eligibility.must_be_renter` | true | ✅ "Renters in Portland who are served a no-cause eviction or encounter any of th…" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `eligibility.must_be_homeowner` | false | ❌ Program is for renters, not homeowners |  |
| `eligibility.must_have_children_under` | — | ❌ No children requirement specified on page |  |
| `eligibility.must_be_pregnant` | — | ❌ No pregnancy requirement specified on page |  |
| `eligibility.must_be_disabled` | — | ❌ No disability requirement specified on page |  |
| `eligibility.must_be_veteran` | — | ❌ No veteran status requirement specified on page |  |
| `eligibility.must_be_senior` | — | ❌ No senior age requirement specified on page |  |
| `eligibility.must_reside_in` | ["portland"] | ✅ "Renter must live within Portland city limits" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `eligibility.citizenship_status` | — | ❌ No citizenship requirement specified on page |  |
| `eligibility.employment_required` | — | ❌ No employment requirement specified on page |  |
| `eligibility.triggered_by_event` | "eviction_notice" | ✅ "No-cause eviction; Notice of non-renewal of a fixed term lease; Qualified lan…" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `eligibility.other_requirements` | ["Renter does not live with their landlord","Tenancy is n… | ✅ "Renter does not live with their landlord; Tenancy is not week-to-week; Does n…" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `application_method` | — | ❌ No application method specified for tenants on page |  |
| `documents_required` | — | ❌ No tenant application documents specified on page |  |
| `processing_time` | — | ❌ No processing time specified on page |  |
| `renewal_cycle` | — | ❌ No renewal cycle applicable; this is a one-time relocation payment |  |
| `contact_phone` | "503-823-1303" | ✅ "503-823-1303" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |
| `contact_org` | "City of Portland Rental Services Helpdesk" | ✅ "Rental Services Helpdesk" | [link](https://www.portland.gov/phb/rental-services/mandatory-renter-relocation-assistance) |

### `erdc`

**Sources:**
- https://www.oregon.gov/delc/programs/pages/erdc.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Employment Related Day Care (ERDC)" | ✅ "Employment Related Day Care (ERDC) program" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `short_name` | "ERDC" | ✅ "ERDC" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `description` | "A child care subsidy program that helps families pay for… | ✅ "The Employment Related Day Care (ERDC) program helps families pay for child c…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `legal_basis` | — | ❌ Not on any page |  |
| `estimated_annual_value.min` | — | ❌ Not on any page |  |
| `estimated_annual_value.max` | — | ❌ Not on any page |  |
| `estimated_annual_value.median` | — | ❌ Not on any page |  |
| `benefit_schedule` | Monthly copay amounts by family size and countable monthl… | ✅ "Copay Charts: The charts below give an estimate of how much your copay will be" | [link](https://www.oregon.gov/delc/programs/pages/copays-billing.aspx) |
| `eligibility.income_max_pct_fpl` | 250 | ✅ "These amounts are 250% of federal poverty level or 85% of state median income…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `eligibility.income_max_annual` | — | ❌ Only monthly income limits provided, not annual |  |
| `eligibility.household_size_min` | — | ❌ Not specified on any page |  |
| `eligibility.household_size_max` | — | ❌ Not specified on any page |  |
| `eligibility.age_min` | — | ❌ Not specified on any page |  |
| `eligibility.age_max` | 17 | ✅ "Have a child who is: Under 13 years old and needs child care, or 13 to 17 yea…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `eligibility.must_be_renter` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not specified on any page |  |
| `eligibility.must_have_children_under` | 13 | ✅ "Have a child who is: Under 13 years old and needs child care" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `eligibility.must_be_pregnant` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_disabled` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_veteran` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_senior` | — | ❌ Not specified on any page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "Live in Oregon" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `eligibility.citizenship_status` | "any" | ✅ "All children living in Oregon from income-qualified families are now eligible…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `eligibility.employment_required` | — | ❌ Not explicitly required; students and others on leave qualify without employment |  |
| `eligibility.triggered_by_event` | — | ❌ Not specified on any page |  |
| `eligibility.other_requirements` | ["Children must meet immunization requirements or qualify… | ✅ "Meet immunization requirements for children needing care, or qualify for a me…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `application_method` | "online" | ✅ "You can apply for ERDC online, by phone, or in person at a local office. Appl…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `documents_required` | ["Pay stubs or proof of income"] | ✅ "Required verification like pay stubs or proof of income will need to be submi…" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `processing_time` | — | ❌ Not specified on any page |  |
| `renewal_cycle` | — | ❌ Not specified on any page |  |
| `contact_phone` | "800-699-9075" | ✅ "Call 800-699-9075" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |
| `contact_org` | "Department of Early Learning and Care (DELC)" | ✅ "Department of Early Learning and Care (DELC)" | [link](https://www.oregon.gov/delc/programs/pages/erdc.aspx) |

### `oregon-eitc`

**Sources:**
- https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Oregon Earned Income Tax Credit (EIC) and Oregon Kids Cr… | ✅ "Oregon Earned Income Credit + Oregon Kids Credit" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `short_name` | "Oregon EITC & Kids Credit" | ❌ Derived from page content; page does not provide explicit short name |  |
| `description` | "Oregon offers two refundable tax credits: (1) the Oregon… | ✅ "The Oregon Kids Credit is a refundable credit for people with young dependent…" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `legal_basis` | — | ❌ Not stated on either page |  |
| `estimated_annual_value.min` | — | ❌ Not specified; only specific amounts tied to conditions are available |  |
| `estimated_annual_value.max` | — | ❌ Not specified; only specific amounts tied to conditions are available |  |
| `estimated_annual_value.median` | — | ❌ Not specified; only specific amounts tied to conditions are available |  |
| `benefit_schedule` | Oregon Kids Credit amount for 2025 tax year by modified A… | ⚠️ no provenance |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Not stated as percentage of FPL; only absolute income limits provided |  |
| `eligibility.income_max_annual` | 31550 | ✅ "For most individuals who qualify for the credit, the income limit for 2025 is…" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `eligibility.household_size_min` | — | ❌ Not specified |  |
| `eligibility.household_size_max` | — | ❌ Not specified |  |
| `eligibility.age_min` | — | ❌ Not specified; credit applies to children ages 0–5 |  |
| `eligibility.age_max` | 5 | ✅ "dependent children ages 0 to 5 at the end of the tax year" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `eligibility.must_be_renter` | — | ❌ Not mentioned |  |
| `eligibility.must_be_homeowner` | — | ❌ Not mentioned |  |
| `eligibility.must_have_children_under` | 5 | ✅ "dependent children ages 0 to 5 at the end of the tax year" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned |  |
| `eligibility.must_reside_in` | — | ❌ Page states part-year residents and nonresidents can qualify if they file correct Oregon return |  |
| `eligibility.citizenship_status` | "any" | ✅ "ITIN filers and individuals with qualifying dependents with ITINs may claim t…" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `eligibility.employment_required` | true | ✅ "If you qualify for the federal earned income tax credit (EITC), you can also …" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `eligibility.triggered_by_event` | — | ❌ Not mentioned |  |
| `eligibility.other_requirements` | ["Must file an Oregon personal income tax return","For Or… | ✅ "You must file an Oregon personal income tax return to claim the credit...Your…" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `application_method` | "mail" | ✅ "You must file an Oregon personal income tax return to claim the credit." | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `documents_required` | — | ❌ Not specified on the page |  |
| `processing_time` | — | ❌ Not specified on the page |  |
| `renewal_cycle` | "Annually (tax year basis)" | ✅ "the credit amount must be prorated using your Oregon percentage. The instruct…" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `contact_phone` | "503-378-4988 or 800-356-4222" | ✅ "Phone: 503-378-4988 or 800-356-4222" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |
| `contact_org` | "Oregon Department of Revenue" | ✅ "Oregon and the Internal Revenue Service (IRS) offer many tax credits" | [link](https://www.oregon.gov/dor/programs/individuals/pages/credits.aspx) |

### `pge-iqbd`

**Sources:**
- https://portlandgeneral.com/income-qualified-bill-discount

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Income-Qualified Bill Discount" | ✅ "Income-Qualified Bill Discount" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `short_name` | "IQBD" | ❌ Not explicitly stated on page; derived from program name |  |
| `description` | "A monthly bill discount program for qualifying residenti… | ✅ "With our Income-Qualified Bill Discount program, you can get a monthly discou…" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `legal_basis` | — | ❌ Not mentioned on page |  |
| `estimated_annual_value.min` | — | ❌ Not specified on page; only monthly discount percentages given |  |
| `estimated_annual_value.max` | — | ❌ Not specified on page; only monthly discount percentages given |  |
| `estimated_annual_value.median` | — | ❌ Not specified on page; only monthly discount percentages given |  |
| `benefit_schedule` | Monthly discount percentage by household size and annual … | ✅ "you can get a monthly discount between 15% and 80% off your energy use" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `eligibility.income_max_pct_fpl` | — | ❌ Page does not specify FPL percentage thresholds |  |
| `eligibility.income_max_annual` | — | ❌ Page states eligibility is based on household size and income but does not provide specific income thresholds |  |
| `eligibility.household_size_min` | — | ❌ Not specified on page |  |
| `eligibility.household_size_max` | — | ❌ Not specified on page |  |
| `eligibility.age_min` | 18 | ✅ "the average annual gross income for all members of your household 18 years an…" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `eligibility.age_max` | — | ❌ Not specified on page |  |
| `eligibility.must_be_renter` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not mentioned on page |  |
| `eligibility.must_have_children_under` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned on page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "Enrollment is available to qualifying residential PGE customers" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `eligibility.citizenship_status` | — | ❌ Not mentioned on page |  |
| `eligibility.employment_required` | false | ❌ Page does not require employment; allows $0 income if waiting to start job |  |
| `eligibility.triggered_by_event` | — | ❌ Not mentioned on page |  |
| `eligibility.other_requirements` | ["Must be a current PGE residential customer","Household … | ✅ "Enrollment is available to qualifying residential PGE customers. Eligibility …" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `application_method` | "online" | ✅ "Applying only takes a few minutes. Start by selecting from the options below.…" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `documents_required` | [] | ✅ "We won't require any financial documents from you to apply." | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `processing_time` | — | ❌ Not specified on page |  |
| `renewal_cycle` | "Two years" | ✅ "The discount will last for two years from the date you enrolled. We'll send y…" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `contact_phone` | "503-228-6322" | ✅ "503-228-6322" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |
| `contact_org` | "Portland General Electric (PGE)" | ✅ "PGE" | [link](https://portlandgeneral.com/income-qualified-bill-discount) |

### `pdx-water-fa`

**Sources:**
- https://www.portland.gov/water/customer-service/apply-financial-assistance

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Portland Water Bureau Financial Assistance" | ✅ "Apply for financial assistance with your sewer, stormwater, water bill" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `short_name` | — | ❌ Not provided on page |  |
| `description` | "Financial assistance program provides bill discounts and… | ✅ "Our financial assistance program provides bill discounts and other forms of a…" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `legal_basis` | — | ❌ Not mentioned on page |  |
| `estimated_annual_value.min` | — | ❌ No specific annual value provided |  |
| `estimated_annual_value.max` | — | ❌ No specific annual value provided |  |
| `estimated_annual_value.median` | — | ❌ No specific annual value provided |  |
| `benefit_schedule` | — | ❌ Page does not provide specific numeric benefit amounts, only eligibility income thresholds and crisis voucher maximum of up to $500 |  |
| `eligibility.income_max_pct_fpl` | 60 | ✅ "Households earning up to 60 percent of the state median family income (MFI) a…" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `eligibility.income_max_annual` | — | ❌ Only monthly income limits provided in table, not annual |  |
| `eligibility.household_size_min` | 1 | ✅ "Income eligibility guidelines table starts with 1 person" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `eligibility.household_size_max` | — | ❌ Table shows up to 8 people with additional members possible, no explicit maximum stated |  |
| `eligibility.age_min` | — | ❌ Not specified on page |  |
| `eligibility.age_max` | — | ❌ Not specified on page |  |
| `eligibility.must_be_renter` | false | ✅ "You must live at the service address to receive financial assistance." | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `eligibility.must_be_homeowner` | — | ❌ Not required for main program (only for leak repair assistance component) |  |
| `eligibility.must_have_children_under` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned on page (only requires birthdates for those 60 and over) |  |
| `eligibility.must_reside_in` | ["portland"] | ✅ "Our financial assistance program provides bill discounts and other forms of a…" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `eligibility.citizenship_status` | — | ❌ Not mentioned on page |  |
| `eligibility.employment_required` | — | ❌ Not mentioned on page |  |
| `eligibility.triggered_by_event` | "job_loss" | ✅ "You must have had a personal crisis that affected your ability to pay your bi…" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `eligibility.other_requirements` | ["Must be single-family residential customer","Must live … | ✅ "Must be single-family residential customer; Must live at service address; Pro…" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `application_method` | "online" | ✅ "Complete our online application. Ask us to mail you a printed application by …" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `documents_required` | ["Service address","Names of all household members and bi… | ✅ "Your service address, Names of all household members and birthdates for anyon…" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `processing_time` | — | ❌ Not specified on page |  |
| `renewal_cycle` | "Every two years" | ✅ "To continue receiving assistance, you must reapply every two years." | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `contact_phone` | "503-823-7770" | ✅ "503-823-7770" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |
| `contact_org` | "Portland Water Bureau" | ✅ "Portland Water Bureau" | [link](https://www.portland.gov/water/customer-service/apply-financial-assistance) |

### `nw-natural-bill-discount`

**Sources:**
- https://www.nwnatural.com/account/bill-discount-program

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "NW Natural Bill Discount Program" | ✅ "Bill Discount Program" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `short_name` | "Bill Discount Program" | ✅ "Bill Discount Program" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `description` | "An income-qualified bill discount program that can save … | ✅ "The NW Natural bill discount program can save you money every month on your g…" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `legal_basis` | — | ❌ Not mentioned on page |  |
| `estimated_annual_value.min` | — | ❌ No specific annual value stated |  |
| `estimated_annual_value.max` | — | ❌ No specific annual value stated |  |
| `estimated_annual_value.median` | — | ❌ No specific annual value stated |  |
| `benefit_schedule` | Monthly bill discount percentage by household income leve… | ✅ "Get 15% to 85% off your monthly gas bills. If you live in Oregon, the NW Natu…" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `eligibility.income_max_pct_fpl` | 60 | ✅ "Bill discounts are available if your household income is less than 60% of Ore…" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `eligibility.income_max_annual` | — | ❌ Income thresholds vary by household size; maximum shown for family of 4 is $73,817 for Oregon |  |
| `eligibility.household_size_min` | — | ❌ No minimum household size specified |  |
| `eligibility.household_size_max` | — | ❌ No maximum household size specified; table shows up to 12+ members |  |
| `eligibility.age_min` | — | ❌ No age requirement mentioned |  |
| `eligibility.age_max` | — | ❌ No age requirement mentioned |  |
| `eligibility.must_be_renter` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not mentioned on page |  |
| `eligibility.must_have_children_under` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned on page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "If you live in Oregon, the NW Natural bill discount program can save you 15% …" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `eligibility.citizenship_status` | — | ❌ Not mentioned on page |  |
| `eligibility.employment_required` | — | ❌ Not mentioned on page |  |
| `eligibility.triggered_by_event` | — | ❌ Not mentioned on page |  |
| `eligibility.other_requirements` | [] | ❌ No additional requirements specified beyond income and residence |  |
| `application_method` | "online" | ✅ "There is one application to fill out. No proof of income is required to apply…" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `documents_required` | [] | ✅ "No proof of income is required to apply." | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `processing_time` | "30 days" | ✅ "Please allow 30 days for your application to be processed." | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `renewal_cycle` | "2 years" | ✅ "After you are enrolled in the Bill Discount Program, your monthly discount wi…" | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `contact_phone` | "800-422-4012" | ✅ "Please call us at 800-422-4012 if you have questions or need help applying." | [link](https://www.nwnatural.com/account/bill-discount-program) |
| `contact_org` | "NW Natural" | ✅ "NW Natural bill discount program" | [link](https://www.nwnatural.com/account/bill-discount-program) |

### `liheap-energy-trust`

**Sources:**
- https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "LIHEAP + Energy Trust Weatherization" | ❌ Derived from CURRENT DATA; not explicitly stated on page |  |
| `short_name` | — | ❌ Not on any page |  |
| `description` | "OHCS provides funding to local community agencies that p… | ✅ "OHCS provides funding to local community agencies that provide bill payment a…" | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `legal_basis` | — | ❌ Not on any page |  |
| `estimated_annual_value.min` | — | ❌ Not on any page |  |
| `estimated_annual_value.max` | — | ❌ Not on any page |  |
| `estimated_annual_value.median` | — | ❌ Not on any page |  |
| `benefit_schedule` | — | ❌ No specific numeric benefit amounts tied to conditions are stated on the page; only income eligibility thresholds are provided |  |
| `eligibility.income_max_pct_fpl` | 60 | ✅ "To be eligible for energy assistance under either program, a household income…" | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `eligibility.income_max_annual` | — | ❌ Income thresholds are provided by household size but not as a single annual maximum |  |
| `eligibility.household_size_min` | — | ❌ Not on any page |  |
| `eligibility.household_size_max` | — | ❌ Not on any page |  |
| `eligibility.age_min` | — | ❌ Not on any page |  |
| `eligibility.age_max` | — | ❌ Not on any page |  |
| `eligibility.must_be_renter` | false | ✅ "Households may rent or own their property." | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `eligibility.must_be_homeowner` | false | ✅ "Households may rent or own their property." | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `eligibility.must_have_children_under` | — | ❌ Not on any page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not on any page |  |
| `eligibility.must_be_disabled` | — | ❌ Not on any page |  |
| `eligibility.must_be_veteran` | — | ❌ Not on any page |  |
| `eligibility.must_be_senior` | — | ❌ Not on any page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "OHCS provides funding to local community agencies that provide bill payment a…" | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `eligibility.citizenship_status` | — | ❌ Not on any page |  |
| `eligibility.employment_required` | — | ❌ Not on any page |  |
| `eligibility.triggered_by_event` | — | ❌ Not on any page |  |
| `eligibility.other_requirements` | ["A household must have documented energy costs"] | ✅ "A household must also have documented energy costs." | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `application_method` | — | ❌ Page mentions alternative methods (phone, mail, home visits) available for homebound/unable to visit in person, but does not specify standard application method |  |
| `documents_required` | — | ❌ Not on any page |  |
| `processing_time` | — | ❌ Not on any page |  |
| `renewal_cycle` | — | ❌ Not on any page |  |
| `contact_phone` | "1-800-453-5511, option 1" | ✅ "Call Toll Free: 1-800-453-5511, option 1" | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |
| `contact_org` | "Oregon Housing and Community Services (OHCS)" | ✅ "OHCS provides funding to local community agencies that provide bill payment a…" | [link](https://www.oregon.gov/ohcs/energy-weatherization/pages/utility-bill-payment-assistance.aspx) |

### `wic`

**Sources:**
- https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Women, Infants, and Children (WIC)" | ✅ "Women, Infants, and Children (WIC)" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `short_name` | "WIC" | ✅ "WIC" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `description` | "WIC serves lower-income pregnant, postpartum and breastf… | ✅ "WIC serves lower-income pregnant, postpartum and breastfeeding women, infants…" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `legal_basis` | — | ❌ Not on any page |  |
| `estimated_annual_value.min` | — | ❌ No annual benefit value stated on pages |  |
| `estimated_annual_value.max` | — | ❌ No annual benefit value stated on pages |  |
| `estimated_annual_value.median` | — | ❌ No annual benefit value stated on pages |  |
| `benefit_schedule` | WIC cash-value benefit (CVB) for fruits and vegetables, m… | ✅ "CVB levels at the time of rule implementation due to inflation (for FY 2024) …" | [link](https://www.fns.usda.gov/wic/wic-food-packages) |
| `eligibility.income_max_pct_fpl` | 185 | ✅ "Have a household income less than 185% of the federal poverty limit." | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `eligibility.income_max_annual` | — | ❌ Expressed as percentage of FPL; specific annual amounts vary by household size |  |
| `eligibility.household_size_min` | — | ❌ No minimum household size specified |  |
| `eligibility.household_size_max` | — | ❌ No maximum household size specified; income limits extend to 8+ persons |  |
| `eligibility.age_min` | 0 | ✅ "infants and children under age 5" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `eligibility.age_max` | 5 | ✅ "children under age 5" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `eligibility.must_be_renter` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not specified on any page |  |
| `eligibility.must_have_children_under` | 5 | ✅ "children under age 5" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `eligibility.must_be_pregnant` | — | ❌ Pregnant women are eligible, but not required for all applicants; infants and children also eligible |  |
| `eligibility.must_be_disabled` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_veteran` | — | ❌ Not specified on any page |  |
| `eligibility.must_be_senior` | — | ❌ Not specified on any page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "Live in Oregon." | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `eligibility.citizenship_status` | — | ❌ Not specified on any page |  |
| `eligibility.employment_required` | — | ❌ Not required; page notes 71% of Oregon WIC families are employed but does not mandate employment |  |
| `eligibility.triggered_by_event` | — | ❌ No event-triggered eligibility mentioned on pages |  |
| `eligibility.other_requirements` | ["Have a nutritional need or risk","Be a pregnant, postpa… | ✅ "Have a nutritional need or risk. Be a pregnant, postpartum or breastfeeding w…" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `application_method` | "in_person" | ✅ "You will still need to visit your local WIC clinic to apply in person." | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `documents_required` | — | ❌ Specific documents not listed on pages; income verification implied but not detailed |  |
| `processing_time` | — | ❌ Not specified on any page |  |
| `renewal_cycle` | — | ❌ Not specified on any page |  |
| `contact_phone` | "211 toll-free; TTY relay 711 or 1-800-735-2900" | ✅ "Call a local WIC program near you, or call 211 toll-free. For TTY relay call …" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |
| `contact_org` | "Oregon Health Authority WIC Program" | ✅ "Oregon Health Authority" | [link](https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/pages/income.aspx) |

### `school-meals`

**Sources:**
- https://www.fns.usda.gov/school-meals/income-eligibility-guidelines

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Child Nutrition Programs Income Eligibility Guidelines" | ✅ "Child Nutrition Programs Income Eligibility Guidelines" | [link](https://www.fns.usda.gov/school-meals/income-eligibility-guidelines) |
| `short_name` | — | ❌ Not provided on page |  |
| `description` | "Annual adjustments to income eligibility guidelines used… | ✅ "Below are the Department's annual adjustments to the Income Eligibility Guide…" | [link](https://www.fns.usda.gov/school-meals/income-eligibility-guidelines) |
| `legal_basis` | "Section 9 of the National School Lunch Act" | ✅ "The annual adjustments are required by section 9 of the National School Lunch…" | [link](https://www.fns.usda.gov/school-meals/income-eligibility-guidelines) |
| `estimated_annual_value.min` | — | ❌ No specific dollar value provided on page |  |
| `estimated_annual_value.max` | — | ❌ No specific dollar value provided on page |  |
| `estimated_annual_value.median` | — | ❌ No specific dollar value provided on page |  |
| `benefit_schedule` | — | ❌ Page provides links to specific guidelines but does not contain actual income thresholds or benefit amounts; specific amounts are in linked documents not provided |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Income eligibility guidelines mentioned but specific percentages not stated on this page |  |
| `eligibility.income_max_annual` | — | ❌ Income thresholds referenced but not stated on this page |  |
| `eligibility.household_size_min` | — | ❌ Not mentioned on page |  |
| `eligibility.household_size_max` | — | ❌ Not mentioned on page |  |
| `eligibility.age_min` | — | ❌ Not mentioned on page |  |
| `eligibility.age_max` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_renter` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not mentioned on page |  |
| `eligibility.must_have_children_under` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned on page |  |
| `eligibility.must_reside_in` | — | ❌ Not mentioned on page |  |
| `eligibility.citizenship_status` | — | ❌ Not mentioned on page |  |
| `eligibility.employment_required` | — | ❌ Not mentioned on page |  |
| `eligibility.triggered_by_event` | — | ❌ Not mentioned on page |  |
| `eligibility.other_requirements` | — | ❌ Not mentioned on page |  |
| `application_method` | — | ❌ Not mentioned on page |  |
| `documents_required` | — | ❌ Not mentioned on page |  |
| `processing_time` | — | ❌ Not mentioned on page |  |
| `renewal_cycle` | "Annual, effective July 1 through June 30" | ✅ "They are effective from July 1 through June 30 every year" | [link](https://www.fns.usda.gov/school-meals/income-eligibility-guidelines) |
| `contact_phone` | — | ❌ Not provided on page |  |
| `contact_org` | "Food and Nutrition Service (FNS), USDA" | ✅ "These guidelines are used by schools, institutions, and facilities participat…" | [link](https://www.fns.usda.gov/school-meals/income-eligibility-guidelines) |

### `multco-eviction-prev`

**Sources:**
- https://multco.us/info/eviction-prevention-and-energy-bill-assistance

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Multnomah County Eviction Prevention and Energy Bill Ass… | ✅ "Eviction Prevention and Energy Bill Assistance" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |
| `short_name` | — | ❌ Not on page |  |
| `description` | "Short Term Rent Assistance (STRA) is a unified countywid… | ✅ "Short Term Rent Assistance (STRA) is a unified countywide program that provid…" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |
| `legal_basis` | — | ❌ Not on page |  |
| `estimated_annual_value.min` | — | ❌ No specific dollar amount provided |  |
| `estimated_annual_value.max` | — | ❌ No specific dollar amount provided |  |
| `estimated_annual_value.median` | — | ❌ No specific dollar amount provided |  |
| `benefit_schedule` | — | ❌ No specific benefit amounts or schedule provided |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Not specified on page |  |
| `eligibility.income_max_annual` | — | ❌ Not specified on page |  |
| `eligibility.household_size_min` | — | ❌ Not specified on page |  |
| `eligibility.household_size_max` | — | ❌ Not specified on page |  |
| `eligibility.age_min` | — | ❌ Not specified on page |  |
| `eligibility.age_max` | — | ❌ Not specified on page |  |
| `eligibility.must_be_renter` | — | ❌ Not explicitly stated |  |
| `eligibility.must_be_homeowner` | — | ❌ Not explicitly stated |  |
| `eligibility.must_have_children_under` | — | ❌ Not specified on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not specified on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not specified on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not specified on page |  |
| `eligibility.must_be_senior` | — | ❌ Not specified on page |  |
| `eligibility.must_reside_in` | ["multnomah"] | ✅ "households in Multnomah County that are experiencing homelessness or at risk …" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |
| `eligibility.citizenship_status` | — | ❌ Not specified on page |  |
| `eligibility.employment_required` | — | ❌ Not specified on page |  |
| `eligibility.triggered_by_event` | "eviction_notice" | ✅ "Pay the rent if you are in danger of eviction" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |
| `eligibility.other_requirements` | — | ❌ No specific additional requirements listed |  |
| `application_method` | "phone" | ✅ "Dial 2-1-1 (toll-free)" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |
| `documents_required` | — | ❌ Not specified on page |  |
| `processing_time` | — | ❌ Not specified on page |  |
| `renewal_cycle` | — | ❌ Not specified on page |  |
| `contact_phone` | "211" | ✅ "Dial 2-1-1 (toll-free)" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |
| `contact_org` | "211info" | ✅ "Contact 211info for rent assistance information" | [link](https://multco.us/info/eviction-prevention-and-energy-bill-assistance) |

### `cep-weatherization`

**Sources:**
- https://www.communityenergyproject.org/

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Community Energy Project Home Weatherization" | ❌ Inferred from ID reference only; not explicitly stated on page |  |
| `short_name` | — | ❌ Not on page |  |
| `description` | "Community Energy Project partners with low-income commun… | ✅ "Community Energy Project partners with low-income communities on the frontlin…" | [link](https://www.communityenergyproject.org/) |
| `legal_basis` | — | ❌ Not on page |  |
| `estimated_annual_value.min` | — | ❌ Not on page |  |
| `estimated_annual_value.max` | — | ❌ Not on page |  |
| `estimated_annual_value.median` | — | ❌ Not on page |  |
| `benefit_schedule` | — | ❌ No specific numeric benefit amounts or schedules provided on page |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Not on page |  |
| `eligibility.income_max_annual` | — | ❌ Not on page |  |
| `eligibility.household_size_min` | — | ❌ Not on page |  |
| `eligibility.household_size_max` | — | ❌ Not on page |  |
| `eligibility.age_min` | — | ❌ Not on page |  |
| `eligibility.age_max` | — | ❌ Not on page |  |
| `eligibility.must_be_renter` | — | ❌ Not on page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not on page |  |
| `eligibility.must_have_children_under` | — | ❌ Not on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not on page |  |
| `eligibility.must_be_senior` | — | ❌ Not on page |  |
| `eligibility.must_reside_in` | ["portland"] | ✅ "Serving the community since 1979" | [link](https://www.communityenergyproject.org/) |
| `eligibility.citizenship_status` | — | ❌ Not on page |  |
| `eligibility.employment_required` | — | ❌ Not on page |  |
| `eligibility.triggered_by_event` | — | ❌ Not on page |  |
| `eligibility.other_requirements` | — | ❌ Not on page |  |
| `application_method` | — | ❌ Not on page |  |
| `documents_required` | — | ❌ Not on page |  |
| `processing_time` | — | ❌ Not on page |  |
| `renewal_cycle` | — | ❌ Not on page |  |
| `contact_phone` | — | ❌ Not on page |  |
| `contact_org` | "Community Energy Project" | ✅ "Community Energy Project" | [link](https://www.communityenergyproject.org/) |

### `senior-prop-tax-deferral`

**Sources:**
- https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Senior and Disabled Property Tax Deferral" | ✅ "Oregon Property Tax Deferral for Disabled and Senior Homeowners Program" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `short_name` | — | ❌ No short name provided on page |  |
| `description` | "As a disabled or senior homeowner, you can borrow from t… | ✅ "As a disabled or senior homeowner, you can borrow from the State of Oregon to…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `legal_basis` | — | ❌ Not explicitly stated on page; only statute references in specific contexts (ORS 311.670, ORS 311.700) |  |
| `estimated_annual_value.min` | — | ❌ Not specified on page |  |
| `estimated_annual_value.max` | — | ❌ Not specified on page |  |
| `estimated_annual_value.median` | — | ❌ Not specified on page |  |
| `benefit_schedule` | — | ❌ No specific benefit amounts or schedule table provided; program defers property taxes owed but amounts vary by individual property tax assessment |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Income limit stated as absolute dollar amount, not as FPL percentage |  |
| `eligibility.income_max_annual` | 70000 | ✅ "The household income limit for 2026 is $70,000." | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `eligibility.household_size_min` | — | ❌ Not specified on page |  |
| `eligibility.household_size_max` | — | ❌ Not specified on page |  |
| `eligibility.age_min` | — | ❌ Not specified on page; program requires disabled or senior but no minimum age stated |  |
| `eligibility.age_max` | — | ❌ Not specified on page |  |
| `eligibility.must_be_renter` | false | ✅ "As a disabled or senior homeowner, you can borrow from the State of Oregon to…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `eligibility.must_be_homeowner` | true | ✅ "As a disabled or senior homeowner, you can borrow from the State of Oregon to…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `eligibility.must_have_children_under` | — | ❌ Not specified on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not specified on page |  |
| `eligibility.must_be_disabled` | true | ✅ "As a disabled or senior homeowner, you can borrow from the State of Oregon to…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `eligibility.must_be_veteran` | — | ❌ Not specified on page |  |
| `eligibility.must_be_senior` | true | ✅ "As a disabled or senior homeowner, you can borrow from the State of Oregon to…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "As a disabled or senior homeowner, you can borrow from the State of Oregon to…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `eligibility.citizenship_status` | — | ❌ Not specified on page |  |
| `eligibility.employment_required` | — | ❌ Not specified on page |  |
| `eligibility.triggered_by_event` | — | ❌ Not specified on page |  |
| `eligibility.other_requirements` | ["Real market value (RMV) minimum cap amount for 2026 inc… | ✅ "Real market value (RMV) minimum cap amount for 2026 increased to $301,000. Wh…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `application_method` | "online" | ✅ "You may apply for the property tax deferral program by filing an online appli…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `documents_required` | ["Online application"] | ✅ "You may apply for the property tax deferral program by filing an online appli…" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `processing_time` | — | ❌ Not specified on page |  |
| `renewal_cycle` | "Every two years after initial approval" | ✅ "You are required to recertify for the deferral program every two years after …" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `contact_phone` | "503-945-8348 or 800-356-4222" | ✅ "Phone: 503-945-8348 or 800-356-4222" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |
| `contact_org` | "Oregon Department of Revenue" | ✅ "Oregon Department of Revenue" | [link](https://www.oregon.gov/dor/programs/property/Pages/Deferral.aspx) |

### `transportation-wallet`

**Sources:**
- https://www.portland.gov/transportation/wallet/access-all

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Portland Transportation Wallet: Access for All" | ✅ "Portland Bureau of Transportation's (PBOT) Transportation Wallet: Access for …" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `short_name` | "Access for All" | ✅ "Access for All Wallets" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `description` | "A program offering free transportation resources (funds … | ✅ "PBOT's Transportation Wallet: Access for All program offers free transportati…" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `legal_basis` | — | ❌ Not on any page |  |
| `estimated_annual_value.min` | — | ❌ Not on any page |  |
| `estimated_annual_value.max` | — | ❌ Not on any page |  |
| `estimated_annual_value.median` | — | ❌ Not on any page |  |
| `benefit_schedule` | — | ❌ No specific numeric amounts for benefit tiers or conditions provided on page |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Referred to separate page on low-income criteria; not specified here |  |
| `eligibility.income_max_annual` | — | ❌ Referred to separate page on low-income criteria; not specified here |  |
| `eligibility.household_size_min` | — | ❌ Not on any page |  |
| `eligibility.household_size_max` | — | ❌ Not on any page |  |
| `eligibility.age_min` | 18 | ✅ "Be at least 18 years old" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `eligibility.age_max` | — | ❌ Not on any page |  |
| `eligibility.must_be_renter` | — | ❌ Not on any page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not on any page |  |
| `eligibility.must_have_children_under` | — | ❌ Not on any page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not on any page |  |
| `eligibility.must_be_disabled` | — | ❌ Not on any page |  |
| `eligibility.must_be_veteran` | — | ❌ Not on any page |  |
| `eligibility.must_be_senior` | — | ❌ Not on any page |  |
| `eligibility.must_reside_in` | ["portland"] | ✅ "Transportation Wallet: Access for All is only available to people who live on…" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `eligibility.citizenship_status` | — | ❌ Not on any page |  |
| `eligibility.employment_required` | — | ❌ Not on any page |  |
| `eligibility.triggered_by_event` | — | ❌ Not on any page |  |
| `eligibility.other_requirements` | ["Must meet low-income criteria","Must be referred by a p… | ✅ "To be eligible, applicants must: Be at least 18 years old; Meet low-income cr…" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `application_method` | — | ❌ Not specified on page; referral by community-based organization mentioned but not explicit application method |  |
| `documents_required` | — | ❌ Not on any page |  |
| `processing_time` | — | ❌ Not on any page |  |
| `renewal_cycle` | "Calendar year (once per calendar year)" | ✅ "Access for All Wallets are available to eligible participants once per calend…" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `contact_phone` | "311" | ✅ "phone number311" | [link](https://www.portland.gov/transportation/wallet/access-all) |
| `contact_org` | "Portland Bureau of Transportation (PBOT)" | ✅ "PBOT's Transportation Wallet: Access for All team" | [link](https://www.portland.gov/transportation/wallet/access-all) |

### `inclusionary-housing`

**Sources:**
- https://www.portland.gov/phb/inclusionary-housing

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Portland Inclusionary Housing Program" | ✅ "Portland Inclusionary Housing Program" | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `short_name` | "IH Program" | ✅ "The City implemented the IH Program to help meet this need." | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `description` | "A program requiring that all residential buildings propo… | ✅ "Inclusionary Housing requires that all residential buildings proposing 20 or …" | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `legal_basis` | — | ❌ Not explicitly stated on page |  |
| `estimated_annual_value.min` | — | ❌ Not on any page |  |
| `estimated_annual_value.max` | — | ❌ Not on any page |  |
| `estimated_annual_value.median` | — | ❌ Not on any page |  |
| `benefit_schedule` | — | ❌ Program is a regulatory requirement for developers, not a direct benefit with scheduled amounts to individuals |  |
| `eligibility.income_max_pct_fpl` | 80 | ✅ "affordable to households at 80% of the median family income or below" | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `eligibility.income_max_annual` | — | ❌ Not specified on any page |  |
| `eligibility.household_size_min` | — | ❌ Not on any page |  |
| `eligibility.household_size_max` | — | ❌ Not on any page |  |
| `eligibility.age_min` | — | ❌ Not on any page |  |
| `eligibility.age_max` | — | ❌ Not on any page |  |
| `eligibility.must_be_renter` | — | ❌ Not on any page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not on any page |  |
| `eligibility.must_have_children_under` | — | ❌ Not on any page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not on any page |  |
| `eligibility.must_be_disabled` | — | ❌ Not on any page |  |
| `eligibility.must_be_veteran` | — | ❌ Not on any page |  |
| `eligibility.must_be_senior` | — | ❌ Not on any page |  |
| `eligibility.must_reside_in` | ["portland"] | ✅ "The City of Portland has identified the need for a minimum of 63,000 addition…" | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `eligibility.citizenship_status` | — | ❌ Not on any page |  |
| `eligibility.employment_required` | — | ❌ Not on any page |  |
| `eligibility.triggered_by_event` | — | ❌ Not on any page |  |
| `eligibility.other_requirements` | ["Residential buildings must propose 20 or more new units"] | ✅ "all residential buildings proposing 20 or more new units" | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `application_method` | — | ❌ Program is developer-facing; no direct public application method described |  |
| `documents_required` | — | ❌ Not on any page |  |
| `processing_time` | — | ❌ Not on any page |  |
| `renewal_cycle` | — | ❌ Not on any page |  |
| `contact_phone` | "503-823-9042" | ✅ "503-823-9042" | [link](https://www.portland.gov/phb/inclusionary-housing) |
| `contact_org` | "Portland Housing Bureau" | ✅ "Portland Housing Bureau" | [link](https://www.portland.gov/phb/inclusionary-housing) |

### `sun-service-system`

**Sources:**
- https://multco.us/programs/sun-community-schools

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "SUN Community Schools" | ✅ "SUN Community Schools" | [link](https://multco.us/programs/sun-community-schools) |
| `short_name` | "SUN" | ✅ "Schools Uniting Neighborhoods" | [link](https://multco.us/programs/sun-community-schools) |
| `description` | "We ensure that the future is in good hands by making sur… | ✅ "We ensure that the future is in good hands by making sure young people have a…" | [link](https://multco.us/programs/sun-community-schools) |
| `legal_basis` | — | ❌ Not on any page |  |
| `estimated_annual_value.min` | — | ❌ Not on any page |  |
| `estimated_annual_value.max` | — | ❌ Not on any page |  |
| `estimated_annual_value.median` | — | ❌ Not on any page |  |
| `benefit_schedule` | — | ❌ No specific numeric amounts or tiers for benefits provided on page |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Not on any page |  |
| `eligibility.income_max_annual` | — | ❌ Not on any page |  |
| `eligibility.household_size_min` | — | ❌ Not on any page |  |
| `eligibility.household_size_max` | — | ❌ Not on any page |  |
| `eligibility.age_min` | — | ❌ Not on any page |  |
| `eligibility.age_max` | — | ❌ Not on any page |  |
| `eligibility.must_be_renter` | — | ❌ Not on any page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not on any page |  |
| `eligibility.must_have_children_under` | — | ❌ Not on any page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not on any page |  |
| `eligibility.must_be_disabled` | — | ❌ Not on any page |  |
| `eligibility.must_be_veteran` | — | ❌ Not on any page |  |
| `eligibility.must_be_senior` | — | ❌ Not on any page |  |
| `eligibility.must_reside_in` | ["multnomah"] | ✅ "SUN Community Schools offer programs that are open to all ages, with a focus …" | [link](https://multco.us/programs/sun-community-schools) |
| `eligibility.citizenship_status` | — | ❌ Not on any page |  |
| `eligibility.employment_required` | — | ❌ Not on any page |  |
| `eligibility.triggered_by_event` | — | ❌ Not on any page |  |
| `eligibility.other_requirements` | — | ❌ Not on any page |  |
| `application_method` | "online" | ✅ "Online registration" | [link](https://multco.us/programs/sun-community-schools) |
| `documents_required` | — | ❌ Not on any page |  |
| `processing_time` | — | ❌ Not on any page |  |
| `renewal_cycle` | — | ❌ Not on any page |  |
| `contact_phone` | — | ❌ Not on any page |  |
| `contact_org` | "Department of County Human Services" | ✅ "Department of County Human Services" | [link](https://multco.us/programs/sun-community-schools) |

### `advsd`

**Sources:**
- https://multco.us/info/aging-and-disability-resource-connection-helpline

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Aging and Disability Resource Connection Helpline" | ✅ "Aging and Disability Resource Connection Helpline" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |
| `short_name` | "ADRC Helpline" | ✅ "ADRC Helpline" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |
| `description` | "The ADRC helps people of all ages, incomes and abilities… | ✅ "The ADRC helps people of all ages, incomes and abilities learn about long-ter…" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |
| `legal_basis` | — | ❌ Not on any page |  |
| `estimated_annual_value.min` | — | ❌ This is a resource referral service, not a direct benefit program with monetary value |  |
| `estimated_annual_value.max` | — | ❌ This is a resource referral service, not a direct benefit program with monetary value |  |
| `estimated_annual_value.median` | — | ❌ This is a resource referral service, not a direct benefit program with monetary value |  |
| `benefit_schedule` | — | ❌ No specific benefit amounts or schedule provided; this is an information/referral service |  |
| `eligibility.income_max_pct_fpl` | — | ❌ Not mentioned on page |  |
| `eligibility.income_max_annual` | — | ❌ Not mentioned on page |  |
| `eligibility.household_size_min` | — | ❌ Not mentioned on page |  |
| `eligibility.household_size_max` | — | ❌ Not mentioned on page |  |
| `eligibility.age_min` | — | ❌ Not mentioned on page |  |
| `eligibility.age_max` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_renter` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not mentioned on page |  |
| `eligibility.must_have_children_under` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned on page |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned on page |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "search the ADRC online database" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |
| `eligibility.citizenship_status` | — | ❌ Not mentioned on page |  |
| `eligibility.employment_required` | — | ❌ Not mentioned on page |  |
| `eligibility.triggered_by_event` | — | ❌ Not mentioned on page |  |
| `eligibility.other_requirements` | — | ❌ No specific requirements listed |  |
| `application_method` | "phone" | ✅ "To contact the ADRC, call 855-ORE-ADRC (855-673-2372) or 503-988-3646" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |
| `documents_required` | — | ❌ Not mentioned on page |  |
| `processing_time` | — | ❌ Not mentioned on page |  |
| `renewal_cycle` | — | ❌ This is an information/referral service without renewal requirements |  |
| `contact_phone` | "503-988-3646" | ✅ "Call the Aging and Disability Resource Connection (ADRC) Helpline at 503.988.…" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |
| `contact_org` | "Multnomah County Aging and Disability Resource Connection" | ✅ "Aging and Disability Resource Connection (ADRC) Helpline" | [link](https://multco.us/info/aging-and-disability-resource-connection-helpline) |

### `veterans-prop-tax-exempt`

**Sources:**
- https://www.oregon.gov/odva/benefits/pages/taxes.aspx

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Oregon Property Tax Exemption for Disabled Veterans" | ✅ "Oregon Property Tax Exemption" | [link](https://www.oregon.gov/odva/benefits/pages/taxes.aspx) |
| `short_name` | "Oregon Veterans Property Tax Exemption" | ✅ "Oregon Property Tax Exemption" | [link](https://www.oregon.gov/odva/benefits/pages/taxes.aspx) |
| `description` | "A property tax exemption program for disabled veterans a… | ✅ "If you are a disabled veteran, you may be entitled to exempt some of your hom…" | [link](https://www.oregon.gov/odva/benefits/pages/taxes.aspx) |
| `legal_basis` | "Oregon Revised Statute (ORS) 307.250–307.283" | ✅ "Oregon Revised Statute (ORS) 307.250–307.283" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `estimated_annual_value.min` | — | ❌ No specific minimum annual value stated across properties/situations |  |
| `estimated_annual_value.max` | — | ❌ No specific maximum annual value stated across properties/situations |  |
| `estimated_annual_value.median` | — | ❌ No median annual value provided |  |
| `benefit_schedule` | Property tax exemption amounts by disability/service stat… | ⚠️ no provenance |  |
| `eligibility.income_max_pct_fpl` | 185 | ✅ "your total gross income can't be more than 185 percent of the annual Federal …" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `eligibility.income_max_annual` | — | ❌ Only FPL percentage provided, not dollar amount |  |
| `eligibility.household_size_min` | — | ❌ No household size minimum stated |  |
| `eligibility.household_size_max` | — | ❌ No household size maximum stated |  |
| `eligibility.age_min` | — | ❌ No minimum age requirement stated |  |
| `eligibility.age_max` | — | ❌ No maximum age stated |  |
| `eligibility.must_be_renter` | false | ✅ "own and live on your homestead property" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `eligibility.must_be_homeowner` | true | ✅ "own and live on your homestead property" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `eligibility.must_have_children_under` | — | ❌ No requirement related to children stated |  |
| `eligibility.must_be_pregnant` | — | ❌ No pregnancy requirement stated |  |
| `eligibility.must_be_disabled` | true | ✅ "veterans must be certified by the VA or any branch of the Armed Forces as hav…" | [link](https://www.oregon.gov/odva/benefits/pages/taxes.aspx) |
| `eligibility.must_be_veteran` | true | ✅ "If you are a disabled veteran" | [link](https://www.oregon.gov/odva/benefits/pages/taxes.aspx) |
| `eligibility.must_be_senior` | — | ❌ No age/senior requirement stated |  |
| `eligibility.must_reside_in` | ["oregon"] | ✅ "If you are an Oregon resident and a qualifying veteran or a veteran's survivi…" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `eligibility.citizenship_status` | "citizen" | ✅ "you must be a U.S. citizen who has been a member of the U.S. Armed Forces" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `eligibility.employment_required` | — | ❌ No employment requirement stated |  |
| `eligibility.triggered_by_event` | — | ❌ No triggering event mentioned |  |
| `eligibility.other_requirements` | ["Must be discharged or released under honorable conditio… | ✅ "discharged or released under honorable conditions; Served at least 91 consecu…" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `application_method` | "in_person" | ✅ "The disabled veteran or surviving spouse/partner must file an exemption claim…" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `documents_required` | ["DD-214 or other military-issued documentation showing d… | ✅ "DD-214 or other military-issued documentation that shows you were discharged …" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `processing_time` | — | ❌ No processing time mentioned |  |
| `renewal_cycle` | "Annual for physicians' certifications; not required for … | ✅ "you don't have to continue attaching it to your claim if you filed it after r…" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `contact_phone` | "800-692-9666" | ✅ "Toll-free from Oregon prefix....................... 800-692-9666" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |
| `contact_org` | "Oregon Department of Revenue" | ✅ "Oregon Department of Revenue" | [link](https://www.oregon.gov/dor/forms/FormsPubs/veteran-spouse-exemption_310-676.pdf) |

### `lifeline`

**Sources:**
- https://www.usac.org/lifeline/

| Field | Value | Evidence | Source |
|---|---|---|---|
| `name` | "Lifeline" | ✅ "Lifeline is a federal program that offers a monthly benefit of up to $9.25 to…" | [link](https://www.usac.org/lifeline/) |
| `short_name` | "Lifeline" | ✅ "Lifeline is a federal program" | [link](https://www.usac.org/lifeline/) |
| `description` | "A federal program that offers a monthly benefit towards … | ✅ "Lifeline is a federal program that offers a monthly benefit of up to $9.25 to…" | [link](https://www.usac.org/lifeline/) |
| `legal_basis` | — | ❌ Not mentioned on the page |  |
| `estimated_annual_value.min` | 111 | ✅ "monthly benefit of up to $9.25 towards phone or internet services" | [link](https://www.usac.org/lifeline/) |
| `estimated_annual_value.max` | 411 | ✅ "up to $34.25 for those living on Tribal lands" | [link](https://www.usac.org/lifeline/) |
| `estimated_annual_value.median` | — | ❌ Not calculable from single values; no median specified |  |
| `benefit_schedule` | Monthly benefit amount by residential status (2 rows, usd… | ⚠️ no provenance |  |
| `eligibility.income_max_pct_fpl` | 135 | ✅ "A consumer can qualify for the Lifeline benefit if their income is 135% or le…" | [link](https://www.usac.org/lifeline/) |
| `eligibility.income_max_annual` | — | ❌ Page states percentage of FPL, not annual dollar amount |  |
| `eligibility.household_size_min` | — | ❌ Not mentioned on the page |  |
| `eligibility.household_size_max` | — | ❌ Not mentioned on the page |  |
| `eligibility.age_min` | — | ❌ Not mentioned on the page |  |
| `eligibility.age_max` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_be_renter` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_be_homeowner` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_have_children_under` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_be_pregnant` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_be_disabled` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_be_veteran` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_be_senior` | — | ❌ Not mentioned on the page |  |
| `eligibility.must_reside_in` | — | ❌ Not mentioned on the page |  |
| `eligibility.citizenship_status` | — | ❌ Not mentioned on the page |  |
| `eligibility.employment_required` | — | ❌ Not mentioned on the page |  |
| `eligibility.triggered_by_event` | — | ❌ Not mentioned on the page |  |
| `eligibility.other_requirements` | ["Participation in SNAP, Medicaid, or other federal progr… | ✅ "if they participate in SNAP, Medicaid, or other federal programs" | [link](https://www.usac.org/lifeline/) |
| `application_method` | "online" | ✅ "National Verifier Portal" | [link](https://www.usac.org/lifeline/) |
| `documents_required` | — | ❌ Not mentioned on the page |  |
| `processing_time` | — | ❌ Not mentioned on the page |  |
| `renewal_cycle` | — | ❌ Not mentioned on the page |  |
| `contact_phone` | — | ❌ Not mentioned on the page |  |
| `contact_org` | "USAC (Universal Service Administrative Company)" | ✅ "USAC's single sign-on dashboard" | [link](https://www.usac.org/lifeline/) |

