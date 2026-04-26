
const challenges = new Map();

/*  Challenges get expired/invalidated within 1 minute which is used to prove that the user is actually valid */
const EXPIRY_MS = 60 * 1000; 

function setChallenge(username, data) {
  challenges.set(username, {
    ...data,
    expiresAt: Date.now() + EXPIRY_MS
  });
}

function getChallenge(username) {
  const entry = challenges.get(username);

  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    challenges.delete(username);
    return null;
  }

  return entry;
}

function deleteChallenge(username) {
  challenges.delete(username);
}

/* Clean up loop where this gets executed for every 1 minute and invalidates expired challenges */
setInterval(() => {
  const now = Date.now();

  for (const [username, data] of challenges.entries()) {
    if (data.expiresAt < now) {
      challenges.delete(username);
    }
  }
}, 60 * 1000);

module.exports = {
  setChallenge,
  getChallenge,
  deleteChallenge
};
