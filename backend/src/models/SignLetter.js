import { getNeo4jSession } from '../config/neo4j.js';

class SignLetter {
  constructor(data) {
    this.id = Number(data.id);
    this.letter = data.letter;
    this.image_path = data.image_path || `images/finger_alphabet/${data.letter}.svg`;
    this.explanation_path = data.explanation_path || data.explanatio || `images/finger_alphabet_explanation/${data.letter}.svg`;
    this.created_at = data.created_at;
  }

  // 获取所有手语字母
  static async getAll() {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        'MATCH (l:SignLetter) RETURN l ORDER BY l.id ASC'
      );
      return result.records.map(rec => new SignLetter(rec.get('l').properties));
    } catch (error) {
      console.error('获取手语字母列表失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 根据ID获取手语字母
  static async getById(id) {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        'MATCH (l:SignLetter {id: toInteger($id)}) RETURN l LIMIT 1',
        { id: Number(id) }
      );
      if (result.records.length === 0) return null;
      return new SignLetter(result.records[0].get('l').properties);
    } catch (error) {
      console.error('获取手语字母失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 根据字母获取手语字母
  static async getByLetter(letter) {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        'MATCH (l:SignLetter {letter: $letter}) RETURN l LIMIT 1',
        { letter }
      );
      if (result.records.length === 0) return null;
      return new SignLetter(result.records[0].get('l').properties);
    } catch (error) {
      console.error('获取手语字母失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 获取随机的手语字母（用于生成错误选项）
  static async getRandomLetters(excludeLetter, limit = 2) {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        'MATCH (l:SignLetter) WHERE l.letter <> $excludeLetter RETURN l ORDER BY rand() LIMIT toInteger($limit)',
        { excludeLetter, limit: Number(limit) }
      );
      return result.records.map(rec => new SignLetter(rec.get('l').properties));
    } catch (error) {
      console.error('获取随机手语字母失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 获取学习进度
  static async getLearningProgress(userId = null) {
    const session = getNeo4jSession();
    try {
      const totalRes = await session.run('MATCH (l:SignLetter) RETURN count(l) AS total');
      const totalLetters = totalRes.records[0].get('total').toNumber();

      let completedLetters = 0;
      if (userId) {
        const compRes = await session.run(
          'MATCH (:User {id: $userId})-[:LEARNED]->(l:SignLetter) RETURN count(l) AS completed',
          { userId: String(userId) }
        );
        completedLetters = compRes.records[0].get('completed').toNumber();
      }

      return { total_letters: totalLetters, completed_letters: completedLetters };
    } catch (error) {
      console.error('获取学习进度失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 记录学习进度
  static async recordProgress(letterId, userId = null) {
    const session = getNeo4jSession({ defaultAccessMode: 'WRITE' });
    try {
      const params = { letterId: Number(letterId), userId: String(userId || 'anonymous'), now: new Date().toISOString() };
      await session.run(
        'MERGE (u:User {id: $userId})\n' +
        'MERGE (l:SignLetter {id: toInteger($letterId)})\n' +
        'MERGE (u)-[r:LEARNED]->(l)\n' +
        'SET r.completed_at = $now',
        params
      );
    } catch (error) {
      console.error('记录学习进度失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  
  // 获取下一个字母
  static async getNextByCurrentId(currentIdNum = 0) {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        'MATCH (l:SignLetter) WHERE l.id > toInteger($cid) RETURN l ORDER BY l.id ASC LIMIT 1',
        { cid: Number(currentIdNum) }
      );
      if (result.records.length === 0) return null;
      return new SignLetter(result.records[0].get('l').properties);
    } catch (error) {
      console.error('获取下一个字母失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

export default SignLetter;
