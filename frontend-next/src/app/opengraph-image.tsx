import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ResumeGenie.AI - AI-Powered Resume Builder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            marginBottom: 16,
            letterSpacing: '-0.03em',
          }}
        >
          ResumeGenie.AI
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 600,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Build a resume that gets interviews. AI-powered, LaTeX-quality PDFs in seconds.
        </div>
      </div>
    ),
    { ...size },
  );
}
