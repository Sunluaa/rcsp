const { get, run } = require('../db/database');

async function findRandomQuote() {
  return get('SELECT id, text, author FROM quotes ORDER BY RANDOM() LIMIT 1');
}

async function ensureAdmin(email) {
  await run(
    'INSERT INTO admins (email) VALUES (?) ON CONFLICT (email) DO NOTHING',
    [email]
  );

  return get(
    'SELECT id, email, created_at AS "createdAt" FROM admins WHERE email = ?',
    [email]
  );
}

module.exports = {
  findRandomQuote,
  ensureAdmin
};
