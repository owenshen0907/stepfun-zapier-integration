'use strict';

const normalizeApiKey = (rawApiKey) => {
  if (typeof rawApiKey !== 'string') {
    return '';
  }

  // Users may paste keys with whitespace or with a "Bearer " prefix.
  return rawApiKey.trim().replace(/^Bearer\s+/i, '').trim();
};

module.exports = {
  normalizeApiKey,
};
