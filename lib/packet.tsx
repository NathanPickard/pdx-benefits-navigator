import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { AnalysisOutput, IntakeData, MatchResult, Program } from '@/types/program';

const C = {
  fg: '#18181b',
  muted: '#71717a',
  border: '#e4e4e7',
  emerald: '#059669',
  emeraldBg: '#ecfdf5',
  emeraldText: '#065f46',
  amberBg: '#fef3c7',
  amberText: '#92400e',
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.fg,
  },
  kicker: {
    fontSize: 9,
    color: C.emerald,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.15,
    marginBottom: 6,
  },
  coverDate: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 8,
    color: C.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    fontSize: 10,
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  summaryLabel: { flex: 1, color: C.muted },
  summaryValue: { flex: 1.5, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  bigNumber: {
    fontSize: 56,
    color: C.emerald,
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
    marginBottom: 2,
  },
  bigSub: { fontSize: 10, color: C.muted, marginBottom: 12 },
  splitLine: { fontSize: 11, marginTop: 16, fontFamily: 'Helvetica-Bold' },
  splitDetail: { fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 1.5 },

  progHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  progHeaderLeft: { flex: 1, paddingRight: 16 },
  progNumber: { fontSize: 9, color: C.muted, marginBottom: 4 },
  progName: { fontSize: 17, fontFamily: 'Helvetica-Bold', lineHeight: 1.2, marginBottom: 8 },
  badgeRow: { flexDirection: 'row' },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 4,
    borderRadius: 3,
    fontFamily: 'Helvetica-Bold',
  },
  badgeJurisdiction: { backgroundColor: C.emeraldBg, color: C.emeraldText },
  badgeGem: { backgroundColor: C.amberBg, color: C.amberText },
  progValue: { fontSize: 22, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  progValueLabel: { fontSize: 8, color: C.muted, textAlign: 'right' },

  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  para: { fontSize: 10, lineHeight: 1.5, color: '#27272a' },
  listItem: { flexDirection: 'row', fontSize: 10, lineHeight: 1.4, marginBottom: 3 },
  listNum: { width: 16, fontFamily: 'Helvetica-Bold', color: C.muted },
  listText: { flex: 1 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', fontSize: 10, marginBottom: 5 },
  checkbox: {
    width: 9,
    height: 9,
    marginTop: 3,
    marginRight: 6,
    borderWidth: 1,
    borderColor: C.muted,
    borderStyle: 'solid',
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
  },
  contactInfo: { flex: 1, fontSize: 10, lineHeight: 1.5 },
  contactOrg: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  contactUrl: { color: C.emerald, marginTop: 4 },
  contactNote: { color: C.muted, marginTop: 4, fontSize: 9 },
  qrCode: { width: 90, height: 90 },

  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: C.muted,
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
  },
});

const JURISDICTION_LABEL: Record<Program['jurisdiction'], string> = {
  federal: 'Federal',
  oregon: 'State of Oregon',
  multnomah: 'Multnomah County',
  portland: 'City of Portland',
};

interface PacketProps {
  intake: IntakeData;
  analysis: AnalysisOutput;
  eligible: { match: MatchResult; program: Program }[];
  qrCodes: Record<string, string>;
}

export function Packet({ intake, analysis, eligible, qrCodes }: PacketProps) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <Document
      title="PDX Benefits Application Packet"
      author="PDX Benefits Navigator"
      subject="Personalized benefits eligibility report"
    >
      <CoverPage
        intake={intake}
        analysis={analysis}
        programCount={eligible.length}
        date={date}
      />
      {eligible.map(({ match, program }, i) => (
        <ProgramPage
          key={match.program_id}
          n={i + 1}
          total={eligible.length}
          match={match}
          program={program}
          qrCode={qrCodes[match.program_id]}
        />
      ))}
    </Document>
  );
}

function CoverPage({
  intake,
  analysis,
  programCount,
  date,
}: {
  intake: IntakeData;
  analysis: AnalysisOutput;
  programCount: number;
  date: string;
}) {
  const ages =
    intake.children_ages && intake.children_ages.length
      ? ` (ages ${intake.children_ages.join(', ')})`
      : '';
  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.kicker}>PDX Benefits Navigator</Text>
      <Text style={styles.coverTitle}>Your benefits application packet.</Text>
      <Text style={styles.coverDate}>Generated {date}</Text>

      <Text style={styles.sectionLabel}>Household summary</Text>
      <View style={{ marginBottom: 24 }}>
        <SummaryRow label="Household size" value={`${intake.household_size} people`} />
        <SummaryRow label="Children" value={`${intake.num_children}${ages}`} />
        <SummaryRow
          label="Annual income"
          value={`$${intake.annual_income.toLocaleString()}`}
        />
        <SummaryRow label="ZIP code" value={intake.zip_code} />
        <SummaryRow label="Housing" value={intake.housing_status.replace(/_/g, ' ')} />
        <SummaryRow label="Employment" value={intake.employment_status.replace(/_/g, ' ')} />
        <SummaryRow label="Language" value={intake.primary_language.toUpperCase()} />
      </View>

      <Text style={styles.sectionLabel}>Estimated annual value</Text>
      <Text style={styles.bigNumber}>
        ${analysis.total_estimated_annual_value.toLocaleString()}
      </Text>
      <Text style={styles.bigSub}>per year, across {programCount} programs</Text>

      <Text style={styles.splitLine}>
        Federal &amp; state: ${analysis.federal_only_value.toLocaleString()}
        {'  ·  '}
        Portland &amp; Multnomah: ${analysis.pdx_specific_value.toLocaleString()}
      </Text>
      <Text style={styles.splitDetail}>
        Most national benefits tools only check federal programs. This packet includes hyperlocal
        Portland and Multnomah County programs other tools miss.
      </Text>

      <Text style={styles.footer}>
        Estimates only — not legal advice. Confirm eligibility with each program before applying.
        Generated by PDX Benefits Navigator.
      </Text>
    </Page>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function ProgramPage({
  n,
  total,
  match,
  program,
  qrCode,
}: {
  n: number;
  total: number;
  match: MatchResult;
  program: Program;
  qrCode?: string;
}) {
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.progHeader}>
        <View style={styles.progHeaderLeft}>
          <Text style={styles.progNumber}>
            Program {n} of {total}
          </Text>
          <Text style={styles.progName}>{program.name}</Text>
          <View style={styles.badgeRow}>
            <Text style={[styles.badge, styles.badgeJurisdiction]}>
              {JURISDICTION_LABEL[program.jurisdiction]}
            </Text>
            {program.hidden_gem && (
              <Text style={[styles.badge, styles.badgeGem]}>★ Hidden gem</Text>
            )}
          </View>
        </View>
        <View>
          <Text style={styles.progValue}>${match.estimated_annual_value.toLocaleString()}</Text>
          <Text style={styles.progValueLabel}>estimated / year</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why you qualify</Text>
        <Text style={styles.para}>{match.reasoning}</Text>
      </View>

      {match.urgency_note && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time-sensitive</Text>
          <Text style={[styles.para, { color: C.amberText }]}>⚠ {match.urgency_note}</Text>
        </View>
      )}

      {match.next_steps && match.next_steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next steps</Text>
          {match.next_steps.map((step, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listNum}>{i + 1}.</Text>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {match.required_documents && match.required_documents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to bring</Text>
          {match.required_documents.map((doc, i) => (
            <View key={i} style={styles.checkItem}>
              <View style={styles.checkbox} />
              <Text style={styles.listText}>{doc}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.contactRow}>
        <View style={styles.contactInfo}>
          <Text style={styles.sectionTitle}>How to apply</Text>
          {program.contact_org && <Text style={styles.contactOrg}>{program.contact_org}</Text>}
          {program.contact_phone && <Text>{program.contact_phone}</Text>}
          <Text style={styles.contactUrl}>{program.application_url}</Text>
          {program.processing_time && (
            <Text style={styles.contactNote}>Processing time: {program.processing_time}</Text>
          )}
        </View>
        {/* react-pdf <Image>, not an HTML <img> — it has no alt prop. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {qrCode && <Image src={qrCode} style={styles.qrCode} />}
      </View>

      <Text style={styles.footer}>
        Page {n + 1} of {total + 1} · Estimates only — not legal advice.
      </Text>
    </Page>
  );
}
