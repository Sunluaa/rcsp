const fs = require('fs');
const path = require('path');
const BetterSqlite3 = require('better-sqlite3');
const { Pool } = require('pg');
const config = require('../config/config');

let postgresPool;
let sqliteDatabase;
let connectedClient;

function convertPlaceholdersForPostgres(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function ensureConnected() {
  if (!connectedClient) {
    throw new Error('Database is not connected');
  }
}

async function connectDatabase() {
  if (connectedClient) {
    return;
  }

  if (config.dbClient === 'postgres') {
    postgresPool = new Pool({
      connectionString: config.databaseUrl
    });

    await postgresPool.query('SELECT 1');
    connectedClient = 'postgres';
    return;
  }

  fs.mkdirSync(path.dirname(config.sqliteFile), { recursive: true });
  sqliteDatabase = new BetterSqlite3(config.sqliteFile);
  sqliteDatabase.pragma('journal_mode = WAL');
  connectedClient = 'sqlite';
}

async function run(sql, params = []) {
  ensureConnected();

  if (connectedClient === 'postgres') {
    return postgresPool.query(convertPlaceholdersForPostgres(sql), params);
  }

  return sqliteDatabase.prepare(sql).run(...params);
}

async function get(sql, params = []) {
  ensureConnected();

  if (connectedClient === 'postgres') {
    const result = await postgresPool.query(convertPlaceholdersForPostgres(sql), params);
    return result.rows[0];
  }

  return sqliteDatabase.prepare(sql).get(...params);
}

async function all(sql, params = []) {
  ensureConnected();

  if (connectedClient === 'postgres') {
    const result = await postgresPool.query(convertPlaceholdersForPostgres(sql), params);
    return result.rows;
  }

  return sqliteDatabase.prepare(sql).all(...params);
}

async function closeDatabase() {
  if (postgresPool) {
    await postgresPool.end();
    postgresPool = undefined;
  }

  if (sqliteDatabase) {
    sqliteDatabase.close();
    sqliteDatabase = undefined;
  }

  connectedClient = undefined;
}

function getDatabaseClient() {
  ensureConnected();
  return connectedClient;
}

module.exports = {
  connectDatabase,
  closeDatabase,
  getDatabaseClient,
  run,
  get,
  all
};
