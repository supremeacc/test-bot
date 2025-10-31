const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function summarizeMeeting(transcripts, sessionInfo) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    console.log('🤖 Generating meeting summary with Gemini AI...');
    
    const combinedTranscript = transcripts
      .map((t, index) => `[Participant ${index + 1}]: ${t.text || t}`)
      .join('\n\n');
    
    const duration = sessionInfo.endTime && sessionInfo.startTime 
      ? Math.round((sessionInfo.endTime - sessionInfo.startTime) / 60000) 
      : 'Unknown';
    
    const prompt = `You are an AI meeting assistant. Analyze this voice channel conversation and provide a comprehensive summary.

Voice Channel Meeting Transcript:
${combinedTranscript}

Meeting Duration: ${duration} minutes
Participants: ${sessionInfo.participants.length} people

Please provide a structured summary with the following sections:

1. OVERVIEW: A brief 2-3 sentence overview of what was discussed

2. KEY DISCUSSION POINTS: List 3-7 main topics discussed (bullet points)

3. DECISIONS MADE: List any concrete decisions or conclusions reached (bullet points, or "None" if no decisions)

4. ACTION ITEMS: List specific tasks or action items with responsible parties if mentioned (bullet points, or "None" if no action items)

5. NOTABLE QUOTES OR HIGHLIGHTS: Any memorable quotes, insights, or important statements (2-3 items, or "None")

6. NEXT STEPS: Suggested next steps or follow-up items

Format your response as JSON with these keys:
{
  "overview": "string",
  "discussion_points": ["string"],
  "decisions": ["string"],
  "action_items": ["string"],
  "highlights": ["string"],
  "next_steps": ["string"]
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            discussion_points: { 
              type: 'array',
              items: { type: 'string' }
            },
            decisions: { 
              type: 'array',
              items: { type: 'string' }
            },
            action_items: { 
              type: 'array',
              items: { type: 'string' }
            },
            highlights: { 
              type: 'array',
              items: { type: 'string' }
            },
            next_steps: { 
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['overview', 'discussion_points', 'decisions', 'action_items', 'highlights', 'next_steps']
        }
      }
    });

    const summaryData = JSON.parse(response.text());
    
    console.log('✅ Meeting summary generated successfully');
    
    return {
      success: true,
      summary: summaryData,
      rawTranscript: combinedTranscript
    };
    
  } catch (error) {
    console.error('❌ Error generating meeting summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  summarizeMeeting
};
