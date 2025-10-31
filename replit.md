# Discord Intro Manager Bot

## Overview
This Discord bot, built for the AI Learners India community, aims to streamline member onboarding, facilitate collaboration, and enhance meeting productivity. Its core capabilities include AI-powered member introductions, a system for launching and managing team projects, an AI-driven VC summarizer and meeting assistant, and an AI-powered teammate matching feature. The project's ambition is to foster a more organized, collaborative, and AI-augmented community experience.

## User Preferences
I prefer iterative development, where features are developed and integrated in stages. Before making major changes or architectural decisions, please ask for my approval. I appreciate clear, concise explanations and prefer working with modular and well-documented code. Please do not make changes to the existing file structure without prior discussion.

## System Architecture

### UI/UX Decisions
- **Dynamic Embeds:** Utilizes Discord embeds with dynamic, color-coded designs based on AI-detected skill levels (Green for Beginner, Yellow for Intermediate, Red for Expert) for introductions, and project types for team launches.
- **Emoji Integration:** Uses relevant emojis (e.g., 🏫, 📈, 🟢, 🟡, 🔴) to enhance readability and visual cues in embeds.
- **Clean Layout:** Focuses on a clean and organized presentation of information within Discord messages, including user avatars and clear footers.

### Technical Implementations
- **Modular Design:** The bot is built with a modular architecture, separating concerns into `commands`, `handlers`, and `utils` directories for maintainability and future scalability.
- **Persistent Storage:** Uses JSON files (`profiles.json`, `projectData.json`, `vcSessions.json`) for persistent storage of user profiles, project data, and voice session information.
- **AI-Powered Processing:** Integrates Google Gemini AI for natural language understanding, text generation, and audio transcription, enabling features like semantic intro analysis, meeting summarization, and teammate matching.
- **Voice Capabilities:** Leverages `@discordjs/voice` and related packages for robust voice channel interaction, including recording and transcription.
- **PDF Generation:** Employs `pdfkit` for generating professional PDF meeting minutes.
- **Error Handling:** Includes comprehensive error handling mechanisms to provide helpful feedback to users and ensure graceful fallback when external services (like Gemini API) are unavailable.
- **Automated Actions:** Implements features like auto-deletion of intro messages to maintain channel cleanliness and scheduled project cleanup.

### Feature Specifications
- **Member Introduction System:**
    - Accepts flexible intro formats and semantically extracts information using AI.
    - Corrects spelling/grammar and refines intro text.
    - Assigns roles and experience levels (Beginner, Intermediate, Expert).
    - Supports `updateintro` and `deleteintro` slash commands.
    - Automatically removes user intro messages after 2 seconds.
- **Team Launch System:**
    - Manages project applications, approvals, and automated private workspace creation (text and voice channels).
    - Supports `addTeammate`, `projectStatus`, and `projectShowcase` commands.
    - Features automatic archiving of inactive projects.
- **VC Summarizer & Meeting Assistant:**
    - Records voice channel audio with `/join-vc-summary`.
    - Transcribes audio using Gemini Audio API.
    - Generates structured AI summaries including discussion points, decisions, action items, and next steps with `/summarize-vc`.
    - Integrates with team projects, tagging relevant members.
    - Generates professional PDF meeting minutes with `/minutes`.
- **Teammate Matching:**
    - AI analyzes profiles to suggest top 3 matches based on skills, interests, and goals via `/find_teammate`.
    - Provides compatibility scores and reasons for matches.

### System Design Choices
- **Node.js with discord.js v14:** Chosen for its asynchronous nature and extensive Discord API wrapper capabilities.
- **Slash Commands:** Primary interaction method for users, promoting a cleaner chat experience.
- **Environment Variables:** Critical configuration managed through Replit Secrets for security and flexibility.
- **Discord Intents:** Explicitly configured to ensure necessary permissions for bot functionality, including `MessageContent` and `GuildVoiceStates`.

## External Dependencies

- **Discord API:** Core platform for bot interactions.
- **Google Gemini AI:** Used for:
    - Text analysis (introductions, teammate matching).
    - Natural language understanding and generation.
    - Audio transcription (Gemini Audio API).
- **npm packages:**
    - `discord.js`: Discord API interaction.
    - `@google/genai`: Google Gemini API SDK.
    - `dotenv`: Environment variable management.
    - `@discordjs/voice`, `opusscript`, `prism-media`, `ffmpeg-static`, `libsodium-wrappers`: Voice channel functionality (recording, processing).
    - `pdfkit`: PDF document generation.