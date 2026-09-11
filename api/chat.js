// Vercel serverless function — runs on the server, never in the browser.
// Your ANTHROPIC_API_KEY lives in Vercel's Environment Variables, not in this file.

/* =========================================================================
   EDIT ME: Willow's real admissions facts. Rae answers ONLY from this —
   keeps her from inventing deadlines or policy.
   ========================================================================= */
const KNOWLEDGE_BASE = `
- The Willow School serves Kindergarten-12 across three campuses in New Orleans (part of NOLA-PS).
- Admissions happen in three rounds: Summer Round (https://www.willowschoolnola.org/page/summerround), Spring Round (https://www.willowschoolnola.org/page/springround), and Main Round (https://www.willowschoolnola.org/page/application-process).
- Eligibility Assessment info: https://www.willowschoolnola.org/page/eligibility
- Assessment Calendar: https://www.willowschoolnola.org/page/assessment-calendar
- Matrix Calculations info: https://www.willowschoolnola.org/page/matrix
- Admissions Team contact page: https://www.willowschoolnola.org/o/lcs/page/admissions-team
- [REPLACE] Application window: [add real open/close dates here].
- [REPLACE] Required documents: [transcripts, recommendation letters, etc.]
- [REPLACE] Financial aid: [describe process, deadlines, contact].
- [REPLACE] Campus tour booking: available at willow-tours-index.vercel.app.
- [REPLACE] Contact for anything not covered here: [admissions email/phone].
`;

// When relevant, Rae should point families to the specific page link above
// rather than just describing it in words.
const SYSTEM_PROMPT_BASE = `You are Rae, a warm, concise digital admissions concierge for The Willow School,
a public charter school in New Orleans serving Kindergarten-12 across three campuses.
You represent Rachel Esukpa, the Admissions Coordinator for upper admissions.

Answer ONLY using the facts below. Keep answers to 2-4 sentences, friendly and clear,
written for a prospective family. If a question falls outside these facts, say so
honestly and direct the person to contact the admissions office rather than guessing.
Never invent deadlines, policies, or figures that are not in this knowledge base.

When your answer relates to one of the specific pages in the knowledge base (an
admissions round, eligibility, the assessment calendar, matrix calculations, or the
admissions team), include that page's exact URL in your answer so the family can go
read more. Don't include a link when the question doesn't call for one.

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}`;

const LANGUAGE_NAMES = { en: 'English', es: 'Spanish', vi: 'Vietnamese' };

function buildSystemPrompt(languageCode) {
  const languageName = LANGUAGE_NAMES[languageCode] || 'English';
  return `${SYSTEM_PROMPT_BASE}

LANGUAGE: Respond in ${languageName}. If the visitor's most recent message is written in
a different language than ${languageName}, respond in the language they used instead —
matching the visitor always takes priority over the selected language.`;
}

export default async function handler(req, res) {
  // Basic CORS / method guard
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages, language } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  // Basic guardrails: cap history length and message size sent to the model
  const trimmedMessages = messages.slice(-12).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 2000)
  }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 500,
        system: buildSystemPrompt(language),
        messages: trimmedMessages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      res.status(502).json({ error: 'Upstream error from Claude API' });
      return;
    }

    const data = await response.json();
    const textBlock = (data.content || []).find(b => b.type === 'text');
    const reply = textBlock
      ? textBlock.text
      : "Sorry, I couldn't quite process that — could you try rephrasing?";

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong on our end.' });
  }
}
