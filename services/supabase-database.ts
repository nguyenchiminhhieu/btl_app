/**
 * Database Service với Supabase
 * 
 * File này chứa class DatabaseService - lớp "cha" cho tất cả các service khác.
 * Nó cung cấp các hàm CRUD cơ bản:
 * - Create (Tạo)
 * - Read (Đọc)
 * - Update (Cập nhật)
 * - Delete (Xóa)
 * 
 * Supabase tự động tạo API REST từ database schema
 * - Type-safe queries với TypeScript
 * - Real-time subscriptions
 * - Row Level Security (RLS)
 */

import { supabase } from './supabase-config';

/**
 * Query condition interface
 */
export interface QueryCondition {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains';
  value: any;
}

/**
 * Class DatabaseService - Lớp cơ sở quản lý database với Supabase
 */
export class DatabaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * CREATE - Tạo một record mới
   * 
   * @param data - Object chứa dữ liệu muốn tạo
   * @returns ID của record vừa tạo
   */
  async create(data: any): Promise<string> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select('id')
        .single();

      if (error) throw error;
      return result.id;
    } catch (error) {
      console.error(`Error creating document in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * READ - Đọc một record theo ID
   * 
   * @param id - ID của record cần lấy
   * @returns Object chứa dữ liệu, hoặc null nếu không tìm thấy
   */
  async getById(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error getting document by ID from ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * READ ALL - Lấy tất cả records
   * 
   * @returns Array chứa tất cả records
   */
  async getAll(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error getting all documents from ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * UPDATE - Cập nhật một record
   * 
   * @param id - ID của record cần update
   * @param data - Object chứa dữ liệu update
   */
  async update(id: string, data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating document in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * DELETE - Xóa một record
   * 
   * @param id - ID của record cần xóa
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting document from ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * QUERY - Tìm kiếm records với điều kiện
   * 
   * @param conditions - Array các điều kiện tìm kiếm
   * @param orderBy - Field để sắp xếp
   * @param orderDirection - Hướng sắp xếp (asc/desc)
   * @returns Array các records tìm được
   */
  async queryDocuments(
    conditions: QueryCondition[],
    orderBy?: string,
    orderDirection: 'asc' | 'desc' = 'asc'
  ): Promise<any[]> {
    try {
      let query = supabase.from(this.tableName).select('*');

      // Áp dụng các điều kiện
      conditions.forEach(condition => {
        switch (condition.operator) {
          case '==':
            query = query.eq(condition.field, condition.value);
            break;
          case '!=':
            query = query.neq(condition.field, condition.value);
            break;
          case '>':
            query = query.gt(condition.field, condition.value);
            break;
          case '<':
            query = query.lt(condition.field, condition.value);
            break;
          case '>=':
            query = query.gte(condition.field, condition.value);
            break;
          case '<=':
            query = query.lte(condition.field, condition.value);
            break;
          case 'in':
            query = query.in(condition.field, condition.value);
            break;
          case 'contains':
            query = query.ilike(condition.field, `%${condition.value}%`);
            break;
        }
      });

      // Sắp xếp
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDirection === 'asc' });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error querying documents from ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * COUNT - Đếm số lượng records
   * 
   * @param conditions - Array các điều kiện (optional)
   * @returns Số lượng records
   */
  async count(conditions?: QueryCondition[]): Promise<number> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Áp dụng các điều kiện nếu có
      if (conditions) {
        conditions.forEach(condition => {
          switch (condition.operator) {
            case '==':
              query = query.eq(condition.field, condition.value);
              break;
            case '!=':
              query = query.neq(condition.field, condition.value);
              break;
            case '>':
              query = query.gt(condition.field, condition.value);
              break;
            case '<':
              query = query.lt(condition.field, condition.value);
              break;
            case '>=':
              query = query.gte(condition.field, condition.value);
              break;
            case '<=':
              query = query.lte(condition.field, condition.value);
              break;
          }
        });
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Error counting documents in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * SUBSCRIBE - Lắng nghe real-time changes
   * 
   * @param callback - Hàm sẽ được gọi khi có thay đổi
   * @returns Hàm unsubscribe
   */
  subscribe(callback: (payload: any) => void): () => void {
    const subscription = supabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.tableName },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export default DatabaseService;
