#!/usr/bin/env node

const mysql = require('mysql2/promise');

const config = {
  old: {
    host: process.env.OLD_DB_HOST || 'rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com',
    user: process.env.DB_USER || 'test1',
    password: process.env.DB_PASSWORD || 'asdfgh0625YYH',
    database: process.env.OLD_DB_NAME || 'signlanguage_platform'
  },
  new: {
    host: process.env.NEW_DB_HOST || 'rm-2zelg8vzn3xb07mvako.mysql.rds.aliyuncs.com',
    user: process.env.DB_USER || 'test1',
    password: process.env.DB_PASSWORD || 'asdfgh0625YYH',
    database: process.env.NEW_DB_NAME || 'csl'
  }
};

const expectedTables = [
  'admin_logs',
  'comments',
  'friends',
  'group_invitations',
  'group_members',
  'group_messages',
  'group_posts',
  'groups_table',
  'learning_records',
  'likes',
  'notifications',
  'posts',
  'translation_records',
  'users'
];

const keyUsers = ['admin', 'testuser', '金珞辰'];

async function getSnapshot(dbConfig) {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectTimeout: 10000,
    charset: 'utf8mb4'
  });

  try {
    const [tablesRows] = await connection.query('SHOW TABLES');
    const tableKey = `Tables_in_${dbConfig.database}`;
    const tables = tablesRows.map((row) => row[tableKey]).sort();

    const counts = {};
    for (const table of tables) {
      const [countRows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${table}\``);
      counts[table] = Number(countRows[0].c);
    }

    return { tables, counts };
  } finally {
    await connection.end();
  }
}

async function getUsersByUsername(dbConfig, usernames) {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectTimeout: 10000,
    charset: 'utf8mb4'
  });

  try {
    const placeholders = usernames.map(() => '?').join(',');
    const [rows] = await connection.query(
      `SELECT username, password, is_active FROM users WHERE username IN (${placeholders})`,
      usernames
    );
    return rows;
  } finally {
    await connection.end();
  }
}

function diffTableSets(oldTables, newTables) {
  return {
    missingInNew: oldTables.filter((table) => !newTables.includes(table)),
    extraInNew: newTables.filter((table) => !oldTables.includes(table))
  };
}

function diffCounts(oldCounts, newCounts, tables) {
  const mismatches = [];
  for (const table of tables) {
    if (!(table in oldCounts) || !(table in newCounts)) {
      continue;
    }
    if (Number(oldCounts[table]) !== Number(newCounts[table])) {
      mismatches.push({
        table,
        old: Number(oldCounts[table]),
        new: Number(newCounts[table])
      });
    }
  }
  return mismatches;
}

function checkKeyUsers(oldUsers, newUsers) {
  const oldMap = new Map(oldUsers.map((user) => [user.username, user]));
  const newMap = new Map(newUsers.map((user) => [user.username, user]));

  const details = keyUsers.map((username) => {
    const oldUser = oldMap.get(username);
    const newUser = newMap.get(username);
    const hashMatch = Boolean(oldUser && newUser && oldUser.password === newUser.password);
    const isActiveNew = Boolean(newUser && Number(newUser.is_active) === 1);

    return {
      username,
      oldExists: Boolean(oldUser),
      newExists: Boolean(newUser),
      hashMatch,
      newIsActive: isActiveNew
    };
  });

  const allPass = details.every(
    (item) => item.oldExists && item.newExists && item.hashMatch && item.newIsActive
  );

  return { allPass, details };
}

async function main() {
  const startedAt = new Date().toISOString();

  const [oldSnapshot, newSnapshot] = await Promise.all([
    getSnapshot(config.old),
    getSnapshot(config.new)
  ]);

  const tableDiff = diffTableSets(oldSnapshot.tables, newSnapshot.tables);
  const countMismatches = diffCounts(oldSnapshot.counts, newSnapshot.counts, oldSnapshot.tables);

  const missingExpectedInNew = expectedTables.filter((table) => !newSnapshot.tables.includes(table));
  const extraBeyondExpectedInNew = newSnapshot.tables.filter((table) => !expectedTables.includes(table));

  const [oldUsers, newUsers] = await Promise.all([
    getUsersByUsername(config.old, keyUsers),
    getUsersByUsername(config.new, keyUsers)
  ]);

  const keyUserCheck = checkKeyUsers(oldUsers, newUsers);

  const pass =
    tableDiff.missingInNew.length === 0 &&
    tableDiff.extraInNew.length === 0 &&
    countMismatches.length === 0 &&
    missingExpectedInNew.length === 0 &&
    extraBeyondExpectedInNew.length === 0 &&
    keyUserCheck.allPass;

  const result = {
    generatedAt: startedAt,
    oldDb: { host: config.old.host, database: config.old.database },
    newDb: { host: config.new.host, database: config.new.database },
    pass,
    checks: {
      tableSetMatch: tableDiff.missingInNew.length === 0 && tableDiff.extraInNew.length === 0,
      countMatch: countMismatches.length === 0,
      expectedTableCoverage:
        missingExpectedInNew.length === 0 && extraBeyondExpectedInNew.length === 0,
      keyUsersMatch: keyUserCheck.allPass
    },
    details: {
      oldTableCount: oldSnapshot.tables.length,
      newTableCount: newSnapshot.tables.length,
      missingInNew: tableDiff.missingInNew,
      extraInNew: tableDiff.extraInNew,
      countMismatches,
      missingExpectedInNew,
      extraBeyondExpectedInNew,
      keyUsers: keyUserCheck.details
    }
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        pass: false,
        error: {
          message: error.message,
          code: error.code || null
        }
      },
      null,
      2
    )
  );
  process.exit(2);
});

