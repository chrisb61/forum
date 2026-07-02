import { Injectable, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new BadRequestException('CV parsing is not configured. Please contact the administrator.');
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `You are a professional CV parser for a senior executive networking platform.
Extract structured information from the CV and return ONLY valid JSON — no markdown, no explanation.

Return exactly this structure (use null for missing fields, empty arrays for missing lists):
{
  "displayName": "Full professional name",
  "headline": "Current role or professional headline (max 120 chars)",
  "location": "City, Country",
  "bio": "Professional summary paragraph (max 500 chars)",
  "professionalEmail": "Professional email if present (not personal)",
  "phone": "Phone number if present",
  "linkedIn": "LinkedIn URL if present",
  "website": "Personal or company website if present",
  "qualifications": ["array", "of", "qualifications", "and", "designations"],
  "sectors": ["array", "of", "industry", "sectors"],
  "expertiseAreas": ["array", "of", "expertise", "areas"],
  "boardExperience": [
    {
      "company": "Company name",
      "role": "Role title",
      "startYear": 2018,
      "endYear": 2022,
      "current": false
    }
  ]
}

For sectors, map experience to these options where relevant:
Financial Services, Healthcare, Technology, Energy & Utilities, ESG & Sustainability,
Private Equity, Real Estate, Education, Professional Services, Infrastructure,
Retail & Consumer, Media, Public Sector, Charity & NFP, Manufacturing, Life Sciences,
Legal, Asset Management, Insurance, Fintech

For expertiseAreas, map to these where relevant:
Board Governance, ESG Strategy, Risk Management, M&A / Transactions, Digital Transformation,
Financial Oversight, Stakeholder Engagement, Regulatory Compliance, Audit & Assurance,
Executive Remuneration, Succession Planning, Investor Relations, Cybersecurity, AI Governance,
Sustainability Reporting, Crisis Management, Capital Markets

For boardExperience, only include board-level, NED, Chair, advisory, and C-suite executive roles.`;

@Injectable()
export class CvService {
  async parseCV(fileBuffer: Buffer, mimeType: string, filename: string): Promise<any> {
    const client = getClient();

    const isPdf = mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
    const isWord = mimeType.includes('word') || filename.toLowerCase().match(/\.docx?$/);

    if (!isPdf && !isWord) {
      throw new BadRequestException('Please upload a PDF or Word document (.pdf, .doc, .docx)');
    }

    if (fileBuffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large. Please upload a CV under 10MB.');
    }

    try {
      let content: any[];

      if (isPdf) {
        // Send PDF directly using Claude's document support
        const base64 = fileBuffer.toString('base64');
        content = [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Please parse this CV and extract the professional information as instructed.',
          },
        ];
      } else {
        // For Word docs, extract text as best we can from the raw buffer
        // Pull readable ASCII text from the docx XML
        const text = fileBuffer.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 15000);
        content = [
          {
            type: 'text',
            text: `Here is the extracted text from a CV document. Please parse it:\n\n${text}`,
          },
        ];
      }

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, data: parsed };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      console.error('CV parse error:', err?.message ?? err);
      throw new BadRequestException(err?.message ?? 'Could not parse CV. Please try a different file or fill in your profile manually.');
    }
  }
}
