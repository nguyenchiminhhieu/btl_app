import { db } from './config';

// Base database service class for SQLite
export class DatabaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Create a new record
  async create(data: any): Promise<string> {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data) as (string | number | null)[];
      const placeholders = fields.map(() => '?').join(', ');

      const result = db.runSync(
        `INSERT INTO ${this.tableName} (${fields.join(', ')}, created_at, updated_at) 
         VALUES (${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        values
      );

      return result.lastInsertRowId.toString();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Get a single record by ID
  async getById(id: string): Promise<any | null> {
    try {
      const result = db.getFirstSync<any>(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [parseInt(id)]
      );
      return result || null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Get all records
  async getAll(): Promise<any[]> {
    try {
      return db.getAllSync<any>(`SELECT * FROM ${this.tableName}`);
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Update a record
  async update(id: string, data: any): Promise<void> {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data) as (string | number | null)[];
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      db.runSync(
        `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, parseInt(id)]
      );
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a record
  async delete(id: string): Promise<void> {
    try {
      db.runSync(`DELETE FROM ${this.tableName} WHERE id = ?`, [parseInt(id)]);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Query documents with conditions
  async queryDocuments(
    conditions: Array<{field: string, operator: any, value: any}> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<any[]> {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const values: any[] = [];

      if (conditions.length > 0) {
        const whereClauses = conditions.map(condition => {
          values.push(condition.value);
          const operator = condition.operator === '==' ? '=' : condition.operator;
          return `${condition.field} ${operator} ?`;
        });
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      if (orderByField) {
        query += ` ORDER BY ${orderByField} ${orderDirection.toUpperCase()}`;
      }

      if (limitCount) {
        query += ` LIMIT ${limitCount}`;
      }

      return db.getAllSync<any>(query, values);
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  // Listen to collection changes (simplified - no real-time in SQLite)
  onSnapshot(callback: (data: any[]) => void): () => void {
    // SQLite doesn't support real-time listeners
    // Return initial data and a no-op unsubscribe function
    this.getAll().then(callback);
    return () => {};
  }

  // Count records
  async count(conditions?: Array<{ field: string; operator: string; value: any }>): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const values: any[] = [];

      if (conditions && conditions.length > 0) {
        const whereClauses = conditions.map(condition => {
          values.push(condition.value);
          const operator = condition.operator === '==' ? '=' : condition.operator;
          return `${condition.field} ${operator} ?`;
        });
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      const result = db.getFirstSync<{ count: number }>(query, values);
      return result?.count || 0;
    } catch (error) {
      console.error('Error counting documents:', error);
      throw error;
    }
  }
}

export default DatabaseService;