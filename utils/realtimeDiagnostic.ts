import { supabase } from '../services/supabase';

/**
 * 实时功能诊断工具
 */
export class RealtimeDiagnostic {

  /**
   * 检查Supabase连接状态
   */
  static async checkConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('rooms').select('count').single();

      if (error) {
        return {
          success: false,
          message: `数据库连接失败: ${error.message}`
        };
      }

      return {
        success: true,
        message: '数据库连接正常'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `连接检查异常: ${error.message}`
      };
    }
  }

  /**
   * 检查Realtime功能是否可用
   */
  static async checkRealtimeAvailability(): Promise<{ success: boolean; message: string }> {
    try {
      // 尝试创建一个测试频道
      const channel = supabase.channel('diagnostic_test');

      // 设置超时
      const timeout = new Promise<{ success: boolean; message: string }>((_, reject) => {
        setTimeout(() => reject(new Error('Realtime连接超时')), 5000);
      });

      const connection = new Promise<{ success: boolean; message: string }>((resolve) => {
        channel
          .on('system', {}, (payload) => {
            console.log('System event:', payload);
            if (payload.status === 'SUBSCRIBED') {
              resolve({
                success: true,
                message: 'Realtime功能正常'
              });
            }
          })
          .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              resolve({
                success: true,
                message: 'Realtime订阅成功'
              });
              supabase.removeChannel(channel);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              resolve({
                success: false,
                message: `Realtime订阅失败: ${status}`
              });
              supabase.removeChannel(channel);
            }
          });
      });

      return await Promise.race([connection, timeout]);
    } catch (error: any) {
      return {
        success: false,
        message: `Realtime检查异常: ${error.message}`
      };
    }
  }

  /**
   * 测试特定表的实时订阅
   */
  static async testTableSubscription(tableName: string): Promise<{ success: boolean; message: string }> {
    try {
      const channel = supabase.channel(`test_${tableName}`);

      const timeout = new Promise<{ success: boolean; message: string }>((_, reject) => {
        setTimeout(() => reject(new Error('订阅超时')), 3000);
      });

      const subscription = new Promise<{ success: boolean; message: string }>((resolve) => {
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName
            },
            (payload) => {
              console.log(`${tableName} event:`, payload);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve({
                success: true,
                message: `${tableName}表订阅成功`
              });
              supabase.removeChannel(channel);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              resolve({
                success: false,
                message: `${tableName}表订阅失败: ${status}`
              });
              supabase.removeChannel(channel);
            }
          });
      });

      return await Promise.race([subscription, timeout]);
    } catch (error: any) {
      return {
        success: false,
        message: `表订阅测试异常: ${error.message}`
      };
    }
  }

  /**
   * 检查RLS策略
   */
  static async checkRLSPolicies(): Promise<{ success: boolean; message: string; policies?: any[] }> {
    try {
      // 尝试匿名访问bp_states表
      const { data, error } = await supabase
        .from('bp_states')
        .select('*')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `RLS策略检查失败: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'RLS策略允许匿名访问',
        policies: data
      };
    } catch (error: any) {
      return {
        success: false,
        message: `RLS策略检查异常: ${error.message}`
      };
    }
  }

  /**
   * 运行完整诊断
   */
  static async runFullDiagnostic(): Promise<{
    connection: { success: boolean; message: string };
    realtime: { success: boolean; message: string };
    tables: { bp_states: { success: boolean; message: string } };
    rls: { success: boolean; message: string; policies?: any[] };
  }> {
    const [connection, realtime, bpStatesSubscription, rls] = await Promise.all([
      this.checkConnection(),
      this.checkRealtimeAvailability(),
      this.testTableSubscription('bp_states'),
      this.checkRLSPolicies()
    ]);

    return {
      connection,
      realtime,
      tables: {
        bp_states: bpStatesSubscription
      },
      rls
    };
  }

  /**
   * 生成修复建议
   */
  static generateFixSuggestions(diagnostic: Awaited<ReturnType<typeof this.runFullDiagnostic>>): string[] {
    const suggestions: string[] = [];

    if (!diagnostic.connection.success) {
      suggestions.push('🔧 检查Supabase配置：确保VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY正确设置');
    }

    if (!diagnostic.realtime.success) {
      suggestions.push('🔧 启用Realtime功能：在Supabase Dashboard中，进入Project Settings > API，确保Realtime已启用');
      suggestions.push('🔧 检查网络连接：确保防火墙没有阻止WebSocket连接（wss://协议）');
    }

    if (!diagnostic.tables.bp_states.success) {
      suggestions.push('🔧 启用表复制：在Supabase Dashboard中，进入Database > Replication，为bp_states表启用Realtime');
      suggestions.push('🔧 检查RLS策略：确保匿名用户可以订阅bp_states表的变更');
    }

    if (!diagnostic.rls.success) {
      suggestions.push('🔧 配置RLS策略：为bp_states表添加允许实时订阅的RLS策略');
      suggestions.push(`
        建议的RLS策略:
        CREATE POLICY "Enable realtime for anonymous users" ON bp_states
        FOR SELECT USING (true);
      `);
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ 所有检查都通过了，Realtime功能应该正常工作');
    }

    return suggestions;
  }
}