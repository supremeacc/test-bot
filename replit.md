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
    - Records voice channel audio with `/join-vc-summary` (auto-retry connection up to 3 times, 2 seconds apart).
    - Transcribes audio using Gemini Audio API.
    - Supports multilingual summaries: English, Hindi, and Hinglish with automatic language detection.
    - Generates concise AI summaries (under 10 lines) including key topics, decisions, action items, and next steps with `/summarize-vc`.
    - Dynamic color coding based on meeting productivity:
      - 🟢 Green for productive meetings (plan, launch, finished, decided).
      - 🟠 Orange for brainstorming sessions (idea, discuss, maybe, thinking).
      - 🔴 Red for blocked meetings (issue, problem, stuck, error).
    - `/stop-summary` command to stop recording without generating summary.
    - `/summary-mode` command to set language preference (auto/english/hindi/hinglish).
    - Integrates with team projects, tagging relevant members.
    - Generates professional PDF meeting minutes with `/minutes`.
    - Automatic session cleanup when voice connection is destroyed.
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

## Replit Environment Setup

### Required Secrets
The following environment variables must be configured in Replit Secrets:
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal (required)
- `INTRO_CHANNEL_ID` - Channel ID where users post introductions (required)
- `PROFILE_CHANNEL_ID` - Channel ID where formatted profiles are posted (required)
- `GEMINI_API_KEY` - Google Gemini API key for AI features (required for full functionality)
- `MOD_ROLE_ID` - Moderator role ID for project verification (optional)

### Installation Steps
1. All dependencies are managed via `package.json` - run `npm install` if needed
2. Secrets are automatically loaded from Replit environment variables
3. The bot runs via the `discord-bot` workflow using `npm start`

### File Structure
- `/commands/` - Slash command implementations
- `/handlers/` - Event and interaction handlers (intro modals, project interactions)
- `/utils/` - Helper utilities for formatting, validation, AI analysis, config management, etc.
- `/recordings/` - Temporary audio recordings (auto-created, excluded from git)
- `profiles.json` - User profile data with full intro info (auto-created, excluded from git)
- `projectData.json` - Project workspace data (auto-created, excluded from git)
- `vcSessions.json` - Voice session data (auto-created, excluded from git)
- `userPreferences.json` - User language preferences for summaries (auto-created, excluded from git)
- `botConfig.json` - Bot configuration from setup wizard (auto-created, excluded from git)

### Workflow Configuration
- **Name:** discord-bot
- **Command:** `npm start`
- **Output Type:** console
- **Status:** Monitors bot startup, command registration, and runtime events

### Maintenance Notes
- JSON data files and recordings are excluded from git via `.gitignore`
- Workflow logs show bot health and command registration status
- Voice recordings are stored temporarily in `/recordings/` and converted from PCM to MP3
- Old recordings are automatically cleaned up after 7 days
- If adding new runtime data files, update `.gitignore` accordingly

## Recent Updates

### November 1, 2025 - Modern Setup Wizard & Button-Based Introductions
- **Setup Wizard**: New `/setup-bot` command with interactive dropdowns to configure channels and roles
- **Configuration Storage**: Bot settings now stored in `botConfig.json` for easy management
- **Reset Command**: `/setup-reset` allows admins to clear configuration and start fresh
- **Button-Based Introductions**: Users click a button to open a modal form instead of typing messages
- **Modal Forms**: Clean, structured form with fields for Name, Role, Institution, Interests, Skills, Experience, and Goals
- **AI-Powered Processing**: Gemini AI refines introductions in Hinglish/English and assigns appropriate roles
- **Auto Role Assignment**: Bot assigns existing server roles based on AI analysis of skills and interests
- **Edit Profile Command**: New `/edit-profile` command with pre-filled modal for easy profile updates
- **Enhanced Profile Storage**: Profiles now store full intro data, AI processing results, and experience levels
- **Setup Intro Button**: New `/setup-intro-button` command to post the introduction button in any channel
- **Experience-Based Colors**: 🟢 Beginner (Green), 🟡 Builder (Yellow), 🔴 Pro (Red)

### November 1, 2025 - Voice Connection Enhancements (ABORT_ERR Fix)
- **Fixed ABORT_ERR Issue**: Implemented Promise.race pattern to prevent abort errors on slow networks
- **Progressive Timeout Strategy**: First attempt 20s, retry attempts 25s (optimized for Replit environment)
- **Permission Pre-validation**: Checks `joinable` and `speakable` permissions before attempting connection
- **Improved VC Connection Reliability**: Enhanced retry mechanism with automatic cleanup of existing connections
- **Better Error Handling**: More detailed error messages and troubleshooting guidance for connection failures
- **Progressive Retry Delays**: 3s after first failure, 5s after second for better stability
- **Optimal Recording Settings**: Changed to `selfMute: false` and `selfDeaf: false` for better audio capture
- **Extended Recording Duration**: Increased from 30 seconds to 5 minutes (300 seconds) per participant
- **Connection State Monitoring**: Added real-time logging of voice connection state changes for easier debugging
- **Pre-connection Cleanup**: Automatically destroys existing connections before creating new ones to prevent conflicts

### October 31, 2025

### Voice Meeting Summary Enhancements
- **Auto-retry Connection**: Bot now retries up to 3 times (2 seconds apart) when joining VC
- **Enhanced Error Logging**: Full error details shown in logs and user messages for easier debugging
- **Libsodium Voice Encoding**: Proper sodium library initialization for better voice quality
- **Multilingual Support**: Added support for English, Hindi, and Hinglish with automatic language detection
- **Concise Summaries**: MoM format now under 10 lines total for quick readability
- **Smart Color Coding**: Meeting summaries use dynamic colors based on productivity:
  - Green (#00FF00) for productive meetings
  - Orange (#FFA500) for brainstorming sessions
  - Red (#FF0000) for meetings with blockers/issues
- **Interactive Summary Posting**: After generating a summary, choose between:
  - 📢 Post Publicly - Posts to the designated channel
  - 📨 DM Me - Sends privately to your DMs
  - Auto-posts publicly after 60 seconds if no choice made
  - Gracefully handles DM failures by falling back to public posting
- **New Commands**:
  - `/stop-summary` - Stop recording without generating a summary
  - `/summary-mode` - Set personal language preference (auto/english/hindi/hinglish)
  - `/minutes` - Download PDF meeting minutes from last summary
- **Improved Error Handling**: Better error messages aligned with user experience
- **Session Cleanup**: Automatic cleanup when voice connection is destroyed to prevent stale sessions

### Security & Performance
- **Secure HTTPS**: TLS verification enabled for all API connections (Gemini, Google APIs)
- **Libsodium Encryption**: Voice data properly encrypted using libsodium-wrappers
- **No Global TLS Bypass**: Removed insecure global TLS bypass for better security