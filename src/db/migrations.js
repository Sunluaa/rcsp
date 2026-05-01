const { getDatabaseClient, run } = require('./database');
const { log } = require('../middleware/logger');

const seedQuotes = [
  {
    text: 'Code is like humor. When you have to explain it, it is bad.',
    author: 'Cory House'
  },
  {
    text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson'
  },
  {
    text: 'Simplicity is the soul of efficiency.',
    author: 'Austin Freeman'
  },
  {
    text: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck'
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson'
  }
];

async function createTables() {
  const client = getDatabaseClient();

  if (client === 'postgres') {
    await run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        UNIQUE (text, author)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    return;
  }

  await run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      UNIQUE (text, author)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedData() {
  for (const quote of seedQuotes) {
    await run(
      'INSERT INTO quotes (text, author) VALUES (?, ?) ON CONFLICT (text, author) DO NOTHING',
      [quote.text, quote.author]
    );
  }
}

async function runMigrations() {
  await createTables();
  await seedData();
  log('info', 'Database migrations completed');
}

module.exports = {
  runMigrations
};
