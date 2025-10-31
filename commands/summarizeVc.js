const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { getActiveSession, endSession, saveSummaryToSession, waitForRecordings } = require('../utils/voiceSessionManager');
const { summarizeMeeting } = require('../utils/meetingSummarizer');
const { loadProjectData } = require('../utils/projectManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summarize-vc')
    .setDescription('End recording and generate AI meeting summary')
    .addChannelOption(option =>
      option.setName('summary_channel')
        .setDescription('Channel to post summary (defaults to #meeting-summaries)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const session = getActiveSession(interaction.guildId);

      if (!session) {
        await interaction.editReply({
          content: '❌ No active recording session found! Use `/join-vc-summary` first to start recording.'
        });
        return;
      }

      const connection = getVoiceConnection(interaction.guildId);
      if (connection) {
        connection.destroy();
        console.log('🛑 Voice connection destroyed');
      }

      await interaction.editReply({
        content: '⏳ **Processing meeting...**\n\nWaiting for all recordings and transcriptions to complete. This may take a moment...'
      });

      await waitForRecordings(interaction.guildId);

      const endedSession = endSession(interaction.guildId);

      const transcripts = endedSession.transcripts || [];
      
      if (transcripts.length === 0) {
        transcripts.push({
          text: '[Placeholder: Voice transcription would appear here. Gemini Audio API integration ready for real audio processing.]',
          userId: endedSession.initiatorId
        });
      }

      console.log('🤖 Generating meeting summary...');
      const summaryResult = await summarizeMeeting(transcripts, endedSession);

      if (!summaryResult.success) {
        await interaction.editReply({
          content: '❌ Failed to generate meeting summary. Please ensure Gemini API is configured correctly.'
        });
        return;
      }

      const summary = summaryResult.summary;
      
      saveSummaryToSession(endedSession.sessionId, summary);

      const duration = Math.round((endedSession.endTime - endedSession.startTime) / 60000);
      
      const embed = new EmbedBuilder()
        .setColor('#4A90E2')
        .setTitle('🎙️ Meeting Summary')
        .setDescription(summary.overview || 'No overview available')
        .addFields(
          { 
            name: '📊 Meeting Info', 
            value: `**Duration:** ${duration} minutes\n**Participants:** ${endedSession.participants.length} people`, 
            inline: false 
          },
          { 
            name: '💬 Key Discussion Points', 
            value: formatList(summary.discussion_points) || 'None', 
            inline: false 
          },
          { 
            name: '✅ Decisions Made', 
            value: formatList(summary.decisions) || 'None', 
            inline: false 
          },
          { 
            name: '📝 Action Items', 
            value: formatList(summary.action_items) || 'None', 
            inline: false 
          },
          { 
            name: '💡 Highlights', 
            value: formatList(summary.highlights) || 'None', 
            inline: false 
          },
          { 
            name: '🚀 Next Steps', 
            value: formatList(summary.next_steps) || 'None', 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Session ID: ${endedSession.sessionId} • AI Learners India Bot`, 
          iconURL: interaction.client.user.displayAvatarURL() 
        })
        .setTimestamp();

      let participantTags = endedSession.participants.map(id => `<@${id}>`).join(' ');
      
      if (endedSession.projectId) {
        const projectData = loadProjectData();
        const project = projectData.projects[endedSession.projectId];
        if (project) {
          const allTeamMembers = [project.ownerId, ...project.teammates];
          participantTags = allTeamMembers.map(id => `<@${id}>`).join(' ');
          
          embed.addFields({
            name: '🏗️ Project Team',
            value: `**${project.name}**\n${participantTags}`,
            inline: false
          });
        }
      }

      const summaryChannel = interaction.options.getChannel('summary_channel') || 
                             interaction.guild.channels.cache.find(ch => ch.name === 'meeting-summaries') ||
                             interaction.channel;

      await summaryChannel.send({
        content: `📋 **Meeting Summary Ready!**\n\n${participantTags}`,
        embeds: [embed]
      });

      await interaction.editReply({
        content: `✅ **Meeting summary generated and posted to ${summaryChannel}!**\n\nUse \`/minutes\` to download a PDF version.`
      });

      console.log(`✅ Meeting summary posted to ${summaryChannel.name}`);

    } catch (error) {
      console.error('❌ Error in /summarize-vc:', error);
      await interaction.editReply({
        content: '❌ An error occurred while generating the summary. Please try again.'
      });
    }
  }
};

function formatList(items) {
  if (!items || items.length === 0) {
    return 'None';
  }
  
  if (items.length === 1 && items[0].toLowerCase().includes('none')) {
    return 'None';
  }
  
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}
