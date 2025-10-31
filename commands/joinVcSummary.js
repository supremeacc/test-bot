const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { createSession, getActiveSession, addParticipant, addRecording, addTranscript, addRecordingPromise } = require('../utils/voiceSessionManager');
const { loadProjectData } = require('../utils/projectManager');
const { recordUser } = require('../utils/audioRecorder');
const { transcribeAudio } = require('../utils/geminiTranscribe');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-vc-summary')
    .setDescription('Join your voice channel and start recording for AI meeting summary'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const member = interaction.member;
      const voiceChannel = member.voice.channel;

      if (!voiceChannel) {
        await interaction.editReply({
          content: '❌ You need to be in a voice channel first! Join a voice channel and try again.'
        });
        return;
      }

      const existingSession = getActiveSession(interaction.guildId);
      if (existingSession) {
        await interaction.editReply({
          content: '⚠️ There is already an active recording session in this server! Use `/summarize-vc` to end it first.'
        });
        return;
      }

      const projectData = loadProjectData();
      let projectId = null;
      
      for (const project of Object.values(projectData.projects)) {
        if (project.channelIds.voice === voiceChannel.id) {
          projectId = project.id;
          break;
        }
      }

      console.log(`🎙️ Joining voice channel: ${voiceChannel.name}`);

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true
      });

      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30000);
        console.log('✅ Voice connection established');
      } catch (error) {
        connection.destroy();
        await interaction.editReply({
          content: '❌ Failed to connect to the voice channel. Please try again.'
        });
        return;
      }

      const session = createSession(
        interaction.guildId,
        voiceChannel.id,
        interaction.user.id,
        projectId
      );

      voiceChannel.members
        .filter(m => !m.user.bot)
        .forEach(member => {
          addParticipant(interaction.guildId, member.id);
          
          const recordingProcess = recordUser(connection, member.id, interaction.guildId)
            .then(async (audioFile) => {
              console.log(`✅ Recording saved for user ${member.id}: ${audioFile}`);
              addRecording(interaction.guildId, member.id, audioFile);
              
              const transcriptResult = await transcribeAudio(audioFile);
              if (transcriptResult.success) {
                console.log(`✅ Transcription completed for user ${member.id}`);
                addTranscript(interaction.guildId, member.id, transcriptResult.transcript);
              } else {
                console.error(`❌ Transcription failed for user ${member.id}:`, transcriptResult.error);
              }
            })
            .catch(error => {
              console.error(`❌ Recording failed for user ${member.id}:`, error);
            });
          
          addRecordingPromise(interaction.guildId, recordingProcess);
        });

      const participantTags = voiceChannel.members
        .filter(m => !m.user.bot)
        .map(m => `<@${m.id}>`)
        .join(', ');

      const projectInfo = projectId ? '\n🏗️ **Project:** Linked to team workspace' : '';

      await interaction.editReply({
        content: `✅ **Recording Started!**\n\n` +
                 `🎙️ Voice Channel: **${voiceChannel.name}**\n` +
                 `👥 Participants: ${participantTags}${projectInfo}\n\n` +
                 `The bot is now listening and will record your conversation.\n` +
                 `Use \`/summarize-vc\` when you're ready to generate the AI summary!`
      });

      const publicChannel = interaction.channel;
      await publicChannel.send({
        content: `🎤 **Meeting Recording Started**\n\n` +
                 `Voice Channel: **${voiceChannel.name}**\n` +
                 `Initiated by: <@${interaction.user.id}>\n` +
                 `Participants: ${participantTags}\n\n` +
                 `_Recording in progress... Use \`/summarize-vc\` to generate summary when finished._`
      });

    } catch (error) {
      console.error('❌ Error in /join-vc-summary:', error);
      await interaction.editReply({
        content: '❌ An error occurred while joining the voice channel. Please try again.'
      });
    }
  }
};
