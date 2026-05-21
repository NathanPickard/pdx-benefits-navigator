import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import mariaFixture from '@/data/scenarios/maria.json';

export const alt =
  'PDX Benefits Navigator — find every Portland benefit your family qualifies for';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARIA_PDX_DELTA =
  mariaFixture.total_estimated_annual_value - mariaFixture.federal_only_value;

const PAPER = '#fbf4e7';
const INK = '#2c3a4a';
const MOSS = '#4f9879';
const MOSS_DEEP = '#3a7359';
const MOSS_MID = '#6aa385';
const MOSS_SOFT = '#e2eee4';
const RULE = '#e8dccb';

function RoseMark({ size: s = 96 }: { size?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <g transform="translate(50 50)" opacity={0.95}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx={0}
            cy={-22}
            rx={13}
            ry={20}
            transform={`rotate(${deg})`}
            fill={MOSS}
          />
        ))}
      </g>
      <g transform="translate(50 50) rotate(30)">
        {[0, 90, 180, 270].map((deg) => (
          <ellipse
            key={deg}
            cx={0}
            cy={-12}
            rx={9}
            ry={14}
            transform={`rotate(${deg})`}
            fill={MOSS_MID}
          />
        ))}
      </g>
      <circle cx={50} cy={50} r={6} fill={MOSS_DEEP} />
      <circle cx={50} cy={50} r={2.5} fill={MOSS_SOFT} />
    </svg>
  );
}

async function loadFont(file: string) {
  return readFile(path.join(process.cwd(), 'app/_fonts', file));
}

export default async function Image() {
  const [lora, jakartaBold, jakartaRegular] = await Promise.all([
    loadFont('Lora-Bold.woff'),
    loadFont('PlusJakartaSans-Bold.ttf'),
    loadFont('PlusJakartaSans-Regular.ttf'),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: PAPER,
          color: INK,
          padding: '64px 80px',
          fontFamily: '"Plus Jakarta Sans"',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            background: MOSS_SOFT,
            borderRadius: 260,
            opacity: 0.7,
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            zIndex: 1,
          }}
        >
          <RoseMark size={96} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: MOSS_DEEP,
                fontWeight: 700,
              }}
            >
              PDX Benefits Navigator
            </div>
            <div
              style={{
                fontSize: 18,
                color: INK,
                opacity: 0.6,
                marginTop: 6,
                fontWeight: 400,
              }}
            >
              Built for the 2026 AI Portland Build Challenge
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 48,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: '"Lora"',
              fontSize: 80,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
              color: INK,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex' }}>
              <span style={{ color: MOSS_DEEP }}>
                ${MARIA_PDX_DELTA.toLocaleString()}/yr
              </span>
              <span>&nbsp;more</span>
            </div>
            <div style={{ display: 'flex' }}>than federal tools find.</div>
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              fontWeight: 400,
              color: INK,
              opacity: 0.78,
              marginTop: 20,
              display: 'flex',
              maxWidth: 940,
            }}
          >
            A friendly Portland-built navigator for federal, Oregon, Multnomah
            County, and City of Portland benefits. Three minutes, no login,
            nothing stored.
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            borderTop: `1px solid ${RULE}`,
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontSize: 22,
              color: INK,
            }}
          >
            <span style={{ opacity: 0.7, fontWeight: 400 }}>
              20 programs · 3 minutes · Bring your own AI key
            </span>
            <span style={{ color: MOSS_DEEP, fontWeight: 700 }}>
              pdx-benefits-navigator.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Lora',
          data: lora,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Plus Jakarta Sans',
          data: jakartaBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Plus Jakarta Sans',
          data: jakartaRegular,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );
}
