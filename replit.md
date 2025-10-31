# Discord Intro Manager Bot

## Overview
This is a Discord bot built for the AI Learners India community. It automatically validates member introductions posted in a designated channel, formats them into beautiful embeds, and posts them to a profiles channel. The bot ensures all introductions follow a consistent format and helps maintain a well-organized member directory.

## Project Status
- **Created:** October 30, 2025
- **Status:** Successfully imported to Replit and running
- **Framework:** Node.js with discord.js v14
- **Bot Status:** Online and connected to Discord (AI learners#3942)
- **AI Integration:** Google Gemini 2.0 Flash (Enabled and Working)
- **Replit Setup:** Complete with workflow configured

## Recent Changes
- [2025-10-30] **TEAMMATE FINDER ENHANCEMENT:** Updated `/find_teammate` to tag users with <@userID> instead of plain names
- [2025-10-30] Added color emoji indicators (🟢 ≥8, 🟡 5-7, 🔴 <5) based on individual compatibility scores
- [2025-10-30] Added requesting user's avatar thumbnail to match results embed
- [2025-10-30] Improved footer text to "Verified by AI Learners Bot" with timestamp
- [2025-10-30] **NEW FEATURE:** Added `/find_teammate` command for AI-powered teammate matching
- [2025-10-30] AI analyzes all profiles and suggests top 3 matches based on skills, interests, and goals
- [2025-10-30] Teammate matches include compatibility scores (1-10) and specific reasons
- [2025-10-30] Automatically tags matched users in the response
- [2025-10-30] **REMOVED FIELD:** Removed "Experience Level" field from embed output (color coding still based on AI-detected level)
- [2025-10-30] **EMBED FORMAT UPGRADE:** Improved embed layout with cleaner field structure
- [2025-10-30] Removed redundant "AI-Detected Role" field from embeds
- [2025-10-30] Changed "Institution / Organization" to "Institution" with 🏫 emoji
- [2025-10-30] Changed "Interests (AI Fields or Tools)" to "Interests" for cleaner look
- [2025-10-30] Updated Experience Level emoji from 📊 to 📈
- [2025-10-30] Updated footer to "🧩 Verified by AI Learners India Bot 🤖"
- [2025-10-30] **AI SUMMARY ENHANCEMENT:** AI now generates third-person summaries starting with user's name
- [2025-10-30] User mention moved into embed description (cleaner appearance)
- [2025-10-30] Default embed color changed to blue (#1E90FF) for fallback
- [2025-10-30] **ERROR HANDLING IMPROVEMENT:** Only send error messages for actual processing failures, not for successful operations
- [2025-10-30] Improved error handling to track profile posting status separately from reactions/deletions
- [2025-10-30] **AUTO-DELETE FEATURE:** Added automatic deletion of user intro messages after 2 seconds to keep channel clean
- [2025-10-30] **BUG FIX:** Fixed array handling for Gemini API responses (interests/skills now convert arrays to comma-separated strings)
- [2025-10-30] Updated README to document Manage Messages permission requirement
- [2025-10-30] **GITHUB IMPORT:** Successfully imported project from GitHub to Replit
- [2025-10-30] Installed npm dependencies (discord.js, @google/genai, dotenv)
- [2025-10-30] Created .gitignore for Node.js and Replit files
- [2025-10-30] Configured workflow to run bot with console output
- [2025-10-30] Added all required secrets (DISCORD_TOKEN, GEMINI_API_KEY, channel IDs)
- [2025-10-30] Bot successfully connected and registered slash commands
- [2025-10-30] Initial project setup with Discord bot functionality
- [2025-10-30] Implemented intro validation, embed formatting, and profile management
- [2025-10-30] Added persistent profile tracking with JSON storage
- [2025-10-30] Created comprehensive documentation and setup guide
- [2025-10-30] **UPGRADED:** Integrated Google Gemini AI for smart intro analysis
- [2025-10-30] Added AI-powered role detection and experience leveling
- [2025-10-30] Implemented dynamic color-coded embeds based on skill level
- [2025-10-30] Added user avatar thumbnails to profile embeds
- [2025-10-30] Created slash commands: /updateintro and /deleteintro
- [2025-10-30] Implemented graceful fallback when Gemini API is unavailable
- [2025-10-30] **REPLIT SETUP:** Configured environment secrets and workflow
- [2025-10-30] Fixed Gemini JSON parsing to handle markdown code blocks
- [2025-10-30] Updated to Gemini 2.0 Flash Experimental model
- [2025-10-30] Added .gitignore and .env.example files
- [2025-10-30] Removed duplicate ServiceScribePro folder
- [2025-10-30] **ENHANCED AI:** Updated prompt to emphasize spelling/grammar correction
- [2025-10-30] **USER MENTIONS:** Added user tagging in profile posts for easy discovery
- [2025-10-30] **FORMAT UPDATE:** Expanded intro format with 8 fields including Institution, Experience Level, and optional Portfolio links
- [2025-10-30] Updated AI to assess experience level: Beginner/Intermediate/Advanced
- [2025-10-30] Enhanced embed output with AI-detected role vs self-reported level comparison
- [2025-10-30] **MAJOR UPGRADE:** Bot now accepts ANY intro format - no strict validation!
- [2025-10-30] AI semantically extracts information from natural language intros
- [2025-10-30] Implemented smart role assignment: 🟢 Learner, 🟡 Builder, 🔴 Expert
- [2025-10-30] Updated embed colors: Green (#00FF7F), Yellow (#FFD700), Red (#FF0000)
- [2025-10-30] Added intelligent error handling for off-topic and incomplete messages
- [2025-10-30] Renamed slash command to /update_intro
- [2025-10-30] Updated footer to "Verified by AI Learners India Bot 🤖"

## Project Architecture

### File Structure
```
discord-intro-bot/
├── index.js                 # Main bot logic, event handlers, and slash command registration
├── package.json             # Node.js dependencies
├── commands/
│   ├── findTeammate.js     # AI-powered teammate matching system
│   ├── updateIntro.js      # Slash command for updating user profiles
│   └── deleteIntro.js      # Admin slash command for deleting profiles
├── utils/
│   ├── validateIntro.js    # Validates intro format and extracts fields
│   ├── geminiAnalyze.js    # AI-powered intro analysis with Google Gemini
│   ├── formatEmbed.js      # Creates Discord embeds (standard and AI-enhanced)
│   └── updateProfile.js    # Manages persistent profile storage
└── profiles.json           # User profile database (auto-generated)
```

### Key Components

**Validation System (validateIntro.js)**
- Uses regex to parse intro fields with emojis
- Identifies missing fields
- Returns structured data with extracted fields and validation status

**AI Analysis Module (geminiAnalyze.js)**
- Sends intro text to Google Gemini AI for comprehensive analysis
- **Automatically corrects spelling mistakes, grammar errors, and typos**
- Refines text while maintaining original meaning and intent
- Receives structured JSON with role, experience level, and polished summary
- Implements error handling and fallback support
- Returns analysis results with success/failure status

**Embed Formatter (formatEmbed.js)**
- **Standard embeds:** Random colors and basic formatting
- **AI-enhanced embeds:** Dynamic colors based on experience level
  - Beginner: Green (#57F287)
  - Intermediate: Yellow (#FEE75C)
  - Expert: Red (#ED4245)
- Adds user avatar thumbnails
- Displays AI-refined intro summaries and assigned roles
- Adds footer with username and timestamp

**Profile Manager (updateProfile.js)**
- Stores user profiles in profiles.json
- Tracks message IDs for profile updates
- Handles profile replacement when users resubmit

**Slash Commands (commands/)**
- **/updateintro:** Allows users to update their profile with AI analysis
- **/deleteintro:** Admin-only command to remove user profiles

**Main Bot (index.js)**
- Loads and registers slash commands
- Listens to messages in intro channel
- Integrates Gemini AI analysis with automatic fallback
- Validates format and posts AI-enhanced profiles
- Handles slash command interactions
- Sends helpful error messages for incomplete intros
- Reacts to messages and logs all actions

## Environment Configuration

Required environment variables (add these to Replit Secrets):
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `INTRO_CHANNEL_ID` - Discord channel ID where users post intros
- `PROFILE_CHANNEL_ID` - Discord channel ID for formatted profiles
- `GEMINI_API_KEY` - Google Gemini API key (OPTIONAL but recommended for AI features)

**To get your Discord bot token:**
1. Visit Discord Developer Portal (https://discord.com/developers/applications)
2. Select your application → Bot tab
3. Copy your bot token
4. Add it to Replit Secrets as DISCORD_TOKEN

**To get your Gemini API key:**
1. Visit Google AI Studio (https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API key"
4. Add it to Replit Secrets as GEMINI_API_KEY

**Note:** The bot works without Gemini API but provides enhanced AI features when configured.

## Features

### Core Features
1. **Intro Validation** - Ensures all 5 fields are present (Name, Role/Study, Interests, Skills, Goal)
2. **AI-Powered Analysis** - Google Gemini analyzes intros and assigns roles/experience levels
3. **Dynamic Embeds** - Color-coded embeds based on AI-detected skill level
4. **User Avatars** - Displays member profile pictures in embeds
5. **Profile Updates** - Replaces old profiles when users resubmit
6. **Auto-Delete Messages** - Automatically removes user intro messages after 2 seconds to keep channel clean
7. **AI Teammate Matching** - Find perfect collaborators using /find_teammate command
8. **Smart Recommendations** - AI analyzes all profiles and suggests top 3 matches with compatibility scores
9. **Slash Commands** - /find_teammate, /update_intro, and /deleteintro for easy management
10. **Error Handling** - Provides helpful messages listing missing fields
11. **Persistent Storage** - Tracks all user profiles in profiles.json
12. **Graceful Fallback** - Works without Gemini API using standard embeds

### Intro Format - FLEXIBLE!
Users can write intros in ANY format - the AI extracts information semantically:

**Casual Example:**
```
Hey! I'm Ravi, working on automation using n8n and learning AI. 
I studied at IIT Delhi and want to build automation bots.
```

**Structured Example:**
```
Name: Amit Singh
Role: CS Student
Institution: IIT Delhi
Interests: ML, NLP
Skills: Python, PyTorch
Goal: Build AI chatbots
```

The AI automatically extracts: Name, Role, Institution, Interests, Skills, Experience Level, Goal, and Portfolio (if mentioned)

## Technical Details

**Dependencies:**
- discord.js v14.14.1 - Discord API wrapper
- dotenv v16.3.1 - Environment variable management
- @google/genai v1.5.1 - Google Gemini AI SDK

**Discord Intents:**
- Guilds - Access server information
- GuildMessages - Read messages in channels
- MessageContent - Access message content

**Bot Permissions Required:**
- Read Messages/View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions
- Manage Messages (required to auto-delete user intro messages)

## Implemented Enhancements
- ✅ Slash commands (/updateintro, /deleteintro)
- ✅ AI-powered role detection and assignment
- ✅ Experience level categorization
- ✅ Dynamic color-coded embeds
- ✅ User avatar thumbnails

## Future Enhancements
- Auto role assignment in Discord based on completed intro
- Admin dashboard for intro statistics
- Customizable intro templates
- Multiple intro formats for different member types
- Advanced AI analytics (sentiment, engagement predictions)
