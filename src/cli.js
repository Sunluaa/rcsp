const { connectDatabase, closeDatabase } = require('./db/database');
const { runMigrations } = require('./db/migrations');
const quoteRepository = require('./repositories/quoteRepository');
const { log } = require('./middleware/logger');

function parseArgs(args) {
  return args.reduce((parsedArgs, arg) => {
    if (!arg.startsWith('--')) {
      return parsedArgs;
    }

    const [name, ...valueParts] = arg.slice(2).split('=');
    parsedArgs[name] = valueParts.length > 0 ? valueParts.join('=') : true;

    return parsedArgs;
  }, {});
}

function printHelp() {
  process.stdout.write([
    'Usage:',
    '  npm run migrate',
    '  npm run create-admin -- --email=admin@example.com',
    ''
  ].join('\n'));
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createAdmin(args) {
  if (!validateEmail(args.email)) {
    throw new Error('Please pass a valid email: --email=admin@example.com');
  }

  const admin = await quoteRepository.ensureAdmin(args.email);

  log('info', 'Admin account ensured', {
    email: admin.email,
    adminId: admin.id
  });
}

async function main() {
  const command = process.argv[2];
  const args = parseArgs(process.argv.slice(3));

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  await connectDatabase();

  try {
    if (command === 'migrate') {
      await runMigrations();
      return;
    }

    if (command === 'create-admin') {
      await createAdmin(args);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  log('error', 'CLI command failed', {
    error: error.message
  });
  process.exit(1);
});
