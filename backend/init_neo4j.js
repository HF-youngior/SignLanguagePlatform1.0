import dotenv from 'dotenv';
import { getNeo4jSession, closeNeo4j } from './src/config/neo4j.js';

dotenv.config();

const run = async () => {
  const session = getNeo4jSession({ defaultAccessMode: 'WRITE' });
  try {
    console.log('🚀 初始化 Neo4j 约束与索引...');

    // SignLetter 节点唯一约束与索引
    await session.run('CREATE CONSTRAINT signletter_id IF NOT EXISTS FOR (l:SignLetter) REQUIRE l.id IS UNIQUE');
    await session.run('CREATE INDEX signletter_letter IF NOT EXISTS FOR (l:SignLetter) ON (l.letter)');

    // User 节点唯一约束
    await session.run('CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE');

    console.log('✅ Neo4j 初始化完成');
  } catch (err) {
    console.error('Neo4j 初始化失败:', err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await closeNeo4j();
  }
};

run();





















