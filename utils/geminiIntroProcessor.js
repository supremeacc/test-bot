const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function processIntroWithAI(introData, guildRoles) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    console.log('🤖 Processing introduction with Gemini AI...');
    
    const rolesList = guildRoles
      .filter(role => !role.managed && role.name !== '@everyone')
      .map(role => role.name)
      .join(', ');

    const prompt = `You are an AI assistant for AI Learners India community. Analyze this member introduction and create a professional profile.

**Introduction Data:**
Name: ${introData.name}
Role/Study: ${introData.role}
Institution: ${introData.institution || 'Not specified'}
Interests: ${introData.interests}
Details: ${introData.details}

**Available Server Roles (assign ONE that fits best):**
${rolesList}

**Task:**
1. Create a natural, professional summary (2-3 sentences) in Hinglish or English (match the input language naturally)
2. Detect the person's experience level (Beginner, Builder, or Pro) based on their skills and background
3. Assign ONE appropriate role from the available roles list (choose the best match)
4. Extract key information cleanly

**Experience Level Guidelines:**
- Beginner: Just started learning, basic knowledge, student
- Builder: Intermediate skills, building projects, some experience
- Pro: Advanced skills, professional experience, expert level

**Role Assignment Guidelines:**
- Look for keywords in interests and skills
- If unsure, assign a general role like "Member" or "Developer"
- Match role names as closely as possible to their interests

Format response as JSON:
{
  "summary": "Natural 2-3 sentence summary in Hinglish/English",
  "experienceLevel": "Beginner|Builder|Pro",
  "assignedRole": "RoleName from the list",
  "parsedData": {
    "name": "Cleaned name",
    "role": "Cleaned role/study",
    "institution": "Cleaned institution",
    "interests": "Cleaned interests",
    "skills": "Extracted skills",
    "goal": "Extracted goal",
    "portfolio": "Extracted links or null"
  }
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
            summary: { type: 'string' },
            experienceLevel: {
              type: 'string',
              enum: ['Beginner', 'Builder', 'Pro']
            },
            assignedRole: { type: 'string' },
            parsedData: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                institution: { type: 'string' },
                interests: { type: 'string' },
                skills: { type: 'string' },
                goal: { type: 'string' },
                portfolio: { type: 'string' }
              },
              required: ['name', 'role', 'interests', 'skills']
            }
          },
          required: ['summary', 'experienceLevel', 'assignedRole', 'parsedData']
        }
      }
    });

    const result = JSON.parse(response.text());
    
    console.log(`✅ AI processing complete: ${result.experienceLevel} level, Role: ${result.assignedRole}`);
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Error processing intro with AI:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getExperienceColor(level) {
  const colors = {
    'Beginner': '#00FF7F',
    'Builder': '#FFD700',
    'Pro': '#FF0000'
  };
  return colors[level] || '#4A90E2';
}

function getExperienceEmoji(level) {
  const emojis = {
    'Beginner': '🟢',
    'Builder': '🟡',
    'Pro': '🔴'
  };
  return emojis[level] || '🔵';
}

module.exports = {
  processIntroWithAI,
  getExperienceColor,
  getExperienceEmoji
};
