const { EmbedBuilder } = require('discord.js');
const { createIntroModal } = require('../utils/introModal');
const { processIntroWithAI, getExperienceColor, getExperienceEmoji } = require('../utils/geminiIntroProcessor');
const { getUserProfile, saveUserProfile } = require('../utils/updateProfile');
const { loadConfig } = require('../utils/configManager');

async function handleIntroButton(interaction) {
  try {
    const modal = createIntroModal();
    await interaction.showModal(modal);
    console.log(`📝 Intro modal shown to ${interaction.user.tag}`);
  } catch (error) {
    console.error('❌ Error showing intro modal:', error);
    throw error;
  }
}

async function handleIntroModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const name = interaction.fields.getTextInputValue('intro_name');
    const role = interaction.fields.getTextInputValue('intro_role');
    const institution = interaction.fields.getTextInputValue('intro_institution') || '';
    const interests = interaction.fields.getTextInputValue('intro_interests');
    const details = interaction.fields.getTextInputValue('intro_details');

    const introData = {
      name,
      role,
      institution,
      interests,
      details
    };

    console.log(`📝 Processing introduction from ${interaction.user.tag}`);

    const config = loadConfig();
    const profileChannelId = config.profileChannelId || process.env.PROFILE_CHANNEL_ID;
    
    if (!profileChannelId) {
      await interaction.editReply({
        content: '❌ Profile channel is not configured. Please ask an admin to run `/setup-bot`.'
      });
      return;
    }

    const profileChannel = await interaction.client.channels.fetch(profileChannelId);
    if (!profileChannel) {
      await interaction.editReply({
        content: '❌ Could not find the profile channel. Please contact an admin.'
      });
      return;
    }

    await interaction.editReply({
      content: '⏳ Processing your introduction with AI... This may take a moment.'
    });

    const guildRoles = interaction.guild.roles.cache;
    const aiResult = await processIntroWithAI(introData, guildRoles);

    if (!aiResult.success) {
      await interaction.editReply({
        content: '⚠️ Something went wrong while processing your introduction. Please try again or contact a moderator.\n\n' +
                 `Error: ${aiResult.error}`
      });
      return;
    }

    const aiData = aiResult.data;
    const embedColor = getExperienceColor(aiData.experienceLevel);
    const levelEmoji = getExperienceEmoji(aiData.experienceLevel);

    const existingProfile = await getUserProfile(interaction.user.id);
    if (existingProfile && existingProfile.messageId) {
      try {
        const oldMessage = await profileChannel.messages.fetch(existingProfile.messageId);
        await oldMessage.delete();
        console.log(`🔄 Deleted old profile for ${interaction.user.tag}`);
      } catch (err) {
        console.log(`⚠️ Could not delete old profile message (may have been manually deleted)`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${levelEmoji} Member Introduction`)
      .setDescription(`<@${interaction.user.id}>\n\n${aiData.summary}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '🎓 Name', value: aiData.parsedData.name, inline: true },
        { name: '💼 Role / Study', value: aiData.parsedData.role, inline: true },
        { name: '📊 Experience', value: `${levelEmoji} ${aiData.experienceLevel}`, inline: true }
      );

    if (aiData.parsedData.institution && aiData.parsedData.institution !== 'Not specified') {
      embed.addFields({ name: '🏫 Institution', value: aiData.parsedData.institution, inline: true });
    }

    embed.addFields(
      { name: '🤖 Interests', value: aiData.parsedData.interests, inline: false },
      { name: '🧠 Skills', value: aiData.parsedData.skills, inline: false }
    );

    if (aiData.parsedData.goal) {
      embed.addFields({ name: '🚀 Goal', value: aiData.parsedData.goal, inline: false });
    }

    if (aiData.parsedData.portfolio) {
      embed.addFields({ name: '🔗 Portfolio / Links', value: aiData.parsedData.portfolio, inline: false });
    }

    embed.setFooter({ 
      text: `Verified by AI Learners India Bot 🤖 • Role: ${aiData.assignedRole}`, 
      iconURL: interaction.client.user.displayAvatarURL() 
    });
    embed.setTimestamp();

    const profileMessage = await profileChannel.send({ embeds: [embed] });

    const roleToAssign = guildRoles.find(r => 
      r.name.toLowerCase() === aiData.assignedRole.toLowerCase()
    );
    
    if (roleToAssign && !roleToAssign.managed) {
      try {
        await interaction.member.roles.add(roleToAssign);
        console.log(`✅ Assigned role "${roleToAssign.name}" to ${interaction.user.tag}`);
      } catch (err) {
        console.error(`❌ Could not assign role to ${interaction.user.tag}:`, err.message);
      }
    } else {
      console.log(`⚠️ Role "${aiData.assignedRole}" not found or is managed, skipping role assignment`);
    }

    await saveUserProfile(interaction.user.id, profileMessage.id, {
      introData,
      aiProcessed: aiData,
      experienceLevel: aiData.experienceLevel,
      assignedRole: aiData.assignedRole
    });

    await interaction.editReply({
      content: `✅ **Your introduction has been posted!**\n\n` +
               `📋 Check it out in ${profileChannel}\n` +
               `${levelEmoji} Experience Level: **${aiData.experienceLevel}**\n` +
               `🎯 Role Assigned: **${aiData.assignedRole}**\n\n` +
               `You can update your profile anytime using \`/edit-profile\``
    });

    console.log(`✅ Profile created for ${interaction.user.tag} - ${aiData.experienceLevel} (${aiData.assignedRole})`);

  } catch (error) {
    console.error('❌ Error processing intro modal:', error);
    const replyMethod = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
    await interaction[replyMethod]({
      content: '⚠️ Something went wrong while processing your introduction. Please try again or contact a moderator.',
      ephemeral: true
    });
  }
}

async function handleEditProfileModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const name = interaction.fields.getTextInputValue('intro_name');
    const role = interaction.fields.getTextInputValue('intro_role');
    const institution = interaction.fields.getTextInputValue('intro_institution') || '';
    const interests = interaction.fields.getTextInputValue('intro_interests');
    const details = interaction.fields.getTextInputValue('intro_details');

    const introData = {
      name,
      role,
      institution,
      interests,
      details
    };

    console.log(`✏️ Updating profile for ${interaction.user.tag}`);

    const config = loadConfig();
    const profileChannelId = config.profileChannelId || process.env.PROFILE_CHANNEL_ID;
    
    if (!profileChannelId) {
      await interaction.editReply({
        content: '❌ Profile channel is not configured. Please ask an admin to run `/setup-bot`.'
      });
      return;
    }

    const profileChannel = await interaction.client.channels.fetch(profileChannelId);
    
    await interaction.editReply({
      content: '⏳ Updating your profile with AI... This may take a moment.'
    });

    const guildRoles = interaction.guild.roles.cache;
    const aiResult = await processIntroWithAI(introData, guildRoles);

    if (!aiResult.success) {
      await interaction.editReply({
        content: '⚠️ Something went wrong while updating your profile. Please try again.\n\n' +
                 `Error: ${aiResult.error}`
      });
      return;
    }

    const aiData = aiResult.data;
    const embedColor = getExperienceColor(aiData.experienceLevel);
    const levelEmoji = getExperienceEmoji(aiData.experienceLevel);

    const existingProfile = await getUserProfile(interaction.user.id);
    if (existingProfile && existingProfile.messageId) {
      try {
        const oldMessage = await profileChannel.messages.fetch(existingProfile.messageId);
        await oldMessage.delete();
        console.log(`🔄 Deleted old profile for ${interaction.user.tag}`);
      } catch (err) {
        console.log(`⚠️ Could not delete old profile message`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${levelEmoji} Member Introduction (Updated)`)
      .setDescription(`<@${interaction.user.id}>\n\n${aiData.summary}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '🎓 Name', value: aiData.parsedData.name, inline: true },
        { name: '💼 Role / Study', value: aiData.parsedData.role, inline: true },
        { name: '📊 Experience', value: `${levelEmoji} ${aiData.experienceLevel}`, inline: true }
      );

    if (aiData.parsedData.institution && aiData.parsedData.institution !== 'Not specified') {
      embed.addFields({ name: '🏫 Institution', value: aiData.parsedData.institution, inline: true });
    }

    embed.addFields(
      { name: '🤖 Interests', value: aiData.parsedData.interests, inline: false },
      { name: '🧠 Skills', value: aiData.parsedData.skills, inline: false }
    );

    if (aiData.parsedData.goal) {
      embed.addFields({ name: '🚀 Goal', value: aiData.parsedData.goal, inline: false });
    }

    if (aiData.parsedData.portfolio) {
      embed.addFields({ name: '🔗 Portfolio / Links', value: aiData.parsedData.portfolio, inline: false });
    }

    embed.setFooter({ 
      text: `Updated by AI Learners India Bot 🤖 • Role: ${aiData.assignedRole}`, 
      iconURL: interaction.client.user.displayAvatarURL() 
    });
    embed.setTimestamp();

    const profileMessage = await profileChannel.send({ embeds: [embed] });

    await saveUserProfile(interaction.user.id, profileMessage.id, {
      introData,
      aiProcessed: aiData,
      experienceLevel: aiData.experienceLevel,
      assignedRole: aiData.assignedRole
    });

    await interaction.editReply({
      content: `✅ **Your profile has been updated!**\n\n` +
               `📋 Check it out in ${profileChannel}\n` +
               `${levelEmoji} Experience Level: **${aiData.experienceLevel}**\n` +
               `🎯 Role: **${aiData.assignedRole}**`
    });

    console.log(`✅ Profile updated for ${interaction.user.tag}`);

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    const replyMethod = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
    await interaction[replyMethod]({
      content: '⚠️ Something went wrong while updating your profile. Please try again.',
      ephemeral: true
    });
  }
}

module.exports = {
  handleIntroButton,
  handleIntroModal,
  handleEditProfileModal
};
