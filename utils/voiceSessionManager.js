const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '..', 'vcSessions.json');
const activeSessions = new Map();

function loadSessions() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading VC sessions:', error);
  }
  return { sessions: {} };
}

function saveSessions(data) {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error saving VC sessions:', error);
  }
}

const recordingPromises = new Map();

function createSession(guildId, channelId, userId, projectId = null) {
  const sessionId = `${guildId}-${Date.now()}`;
  
  const session = {
    sessionId,
    guildId,
    channelId,
    initiatorId: userId,
    projectId,
    participants: [userId],
    startTime: Date.now(),
    recordings: {},
    transcripts: [],
    status: 'recording',
    lastSummary: null
  };
  
  activeSessions.set(guildId, session);
  recordingPromises.set(guildId, []);
  
  const data = loadSessions();
  data.sessions[sessionId] = session;
  saveSessions(data);
  
  console.log(`🎙️ Created VC session: ${sessionId}`);
  return session;
}

function addRecordingPromise(guildId, promise) {
  const promises = recordingPromises.get(guildId) || [];
  promises.push(promise);
  recordingPromises.set(guildId, promises);
}

async function waitForRecordings(guildId) {
  const promises = recordingPromises.get(guildId) || [];
  console.log(`⏳ Waiting for ${promises.length} recording/transcription processes to complete...`);
  
  try {
    await Promise.allSettled(promises);
    console.log(`✅ All recording/transcription processes completed for guild ${guildId}`);
    recordingPromises.delete(guildId);
  } catch (error) {
    console.error(`❌ Error waiting for recordings:`, error);
  }
}

function getActiveSession(guildId) {
  return activeSessions.get(guildId);
}

function addParticipant(guildId, userId) {
  const session = activeSessions.get(guildId);
  if (session && !session.participants.includes(userId)) {
    session.participants.push(userId);
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
    
    console.log(`➕ Added participant ${userId} to session ${session.sessionId}`);
  }
}

function addRecording(guildId, userId, audioFilePath) {
  const session = activeSessions.get(guildId);
  if (session) {
    if (!session.recordings[userId]) {
      session.recordings[userId] = [];
    }
    session.recordings[userId].push(audioFilePath);
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
  }
}

function addTranscript(guildId, userId, transcript, timestamp) {
  const session = activeSessions.get(guildId);
  if (session) {
    session.transcripts.push({
      userId,
      text: transcript,
      timestamp: timestamp || Date.now()
    });
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
  }
}

function endSession(guildId) {
  const session = activeSessions.get(guildId);
  if (session) {
    session.status = 'ended';
    session.endTime = Date.now();
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
    
    activeSessions.delete(guildId);
    console.log(`🛑 Ended VC session: ${session.sessionId}`);
    return session;
  }
  return null;
}

function saveSummaryToSession(sessionId, summary) {
  const data = loadSessions();
  if (data.sessions[sessionId]) {
    data.sessions[sessionId].lastSummary = summary;
    saveSessions(data);
    console.log(`💾 Summary saved for session ${sessionId}`);
    return true;
  }
  return false;
}

function getLastSession(guildId) {
  const data = loadSessions();
  const sessions = Object.values(data.sessions)
    .filter(s => s.guildId === guildId)
    .sort((a, b) => b.startTime - a.startTime);
  
  return sessions[0] || null;
}

module.exports = {
  createSession,
  getActiveSession,
  addParticipant,
  addRecording,
  addTranscript,
  endSession,
  saveSummaryToSession,
  getLastSession,
  addRecordingPromise,
  waitForRecordings
};
