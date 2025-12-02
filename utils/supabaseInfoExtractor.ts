/**
 * Supabase项目信息提取工具
 * 用于提取和分析Supabase项目的详细配置信息
 */

import { supabase } from '../services/supabase';

export interface SupabaseProjectInfo {
  projectId: string;
  apiUrl: string;
  realtimeUrl: string;
  authUrl: string;
  storageUrl: string;
  functionsUrl: string;
  clientVersion: string;
  realtimeAPI?: {
    version?: string;
    features?: string[];
    supportedEvents?: string[];
  };
  database?: {
    version?: string;
    timezone?: string;
    realtimeEnabled?: boolean;
  };
}

export const extractSupabaseInfo = (): SupabaseProjectInfo => {
  const supabaseUrl = supabase.supabaseUrl;

  // 解析项目信息
  const urlParts = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlParts?.[1] || 'unknown';

  const info: SupabaseProjectInfo = {
    projectId,
    apiUrl: supabaseUrl || '',
    realtimeUrl: supabaseUrl?.replace('rest', 'realtime') || '',
    authUrl: supabaseUrl?.replace('rest', 'auth') || '',
    storageUrl: supabaseUrl?.replace('rest', 'storage') || '',
    functionsUrl: supabaseUrl?.replace('rest', 'functions') || '',
    clientVersion: '2.38.0' // 当前使用的版本
  };

  console.log('📋 Supabase项目信息:', info);

  return info;
};

export const testSupabaseConnections = async (): Promise<{
  api: boolean;
  auth: boolean;
  realtime: boolean;
  storage: boolean;
  errors: string[];
}> => {
  const info = extractSupabaseInfo();
  const results = {
    api: false,
    auth: false,
    realtime: false,
    storage: false,
    errors: [] as string[]
  };

  // 测试API连接
  try {
    const response = await fetch(`${info.apiUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabase.supabaseKey || '',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      }
    });
    results.api = response.ok;
    if (!results.api) {
      results.errors.push(`API连接失败: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    results.errors.push(`API连接错误: ${error}`);
  }

  // 测试Auth连接
  try {
    const response = await fetch(`${info.authUrl}/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabase.supabaseKey || ''
      }
    });
    results.auth = response.ok;
    if (!results.auth) {
      results.errors.push(`Auth连接失败: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    results.errors.push(`Auth连接错误: ${error}`);
  }

  // 测试Realtime连接（WebSocket）
  try {
    const wsUrl = `${info.realtimeUrl}/v1/websocket`;
    const wsConnected = await new Promise<boolean>((resolve) => {
      const ws = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        resolve(true);
        ws.close();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });

    results.realtime = wsConnected;
    if (!wsConnected) {
      results.errors.push('Realtime WebSocket连接失败');
    }
  } catch (error) {
    results.errors.push(`Realtime连接错误: ${error}`);
  }

  // 测试Storage连接
  try {
    const response = await fetch(`${info.storageUrl}/render/avatar/default`, {
      method: 'HEAD',
      headers: {
        'apikey': supabase.supabaseKey || ''
      }
    });
    results.storage = response.ok;
    if (!results.storage) {
      results.errors.push(`Storage连接失败: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    results.errors.push(`Storage连接错误: ${error}`);
  }

  return results;
};

// 检查Supabase客户端版本历史
export const getVersionCompatibilityInfo = () => {
  return {
    currentClient: '2.38.0',
    knownWorkingVersions: ['2.38.0', '2.39.0'],
    problematicVersions: ['2.40.0-2.85.0'],
    latestStable: '2.86.0',
    issues: [
      '2.40.0-2.85.0: WebSocket协议兼容性问题',
      '2.86.0+: 可能需要服务端更新'
    ]
  };
};

// 获取推荐的操作步骤
export const getRecommendedActions = (connectionResults: Awaited<ReturnType<typeof testSupabaseConnections>>) => {
  const actions: string[] = [];

  if (!connectionResults.api) {
    actions.push('❌ API连接失败，检查Supabase URL和API密钥');
  }

  if (!connectionResults.auth) {
    actions.push('❌ Auth连接失败，检查认证配置');
  }

  if (!connectionResults.realtime) {
    actions.push('❌ Realtime连接失败，这是主要问题');
    actions.push('🔧 尝试降级到2.39.0版本: npm install @supabase/supabase-js@2.39.0');
    actions.push('🔧 或尝试2.38.0版本: npm install @supabase/supabase-js@2.38.0');
    actions.push('⚙️ 检查Supabase仪表盘中的Realtime设置');
    actions.push('📖 参考: https://github.com/supabase/supabase-js/issues/0000');
  }

  if (!connectionResults.storage) {
    actions.push('❌ Storage连接失败，检查存储配置');
  }

  if (connectionResults.realtime && connectionResults.api && connectionResults.auth) {
    actions.push('✅ 所有连接正常，问题可能在于订阅语法');
  }

  return actions;
};