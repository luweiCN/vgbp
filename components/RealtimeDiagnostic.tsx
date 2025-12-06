import React, { useState, useEffect } from 'react';
import { RealtimeDiagnostic } from '@/utils/realtimeDiagnostic';
import { useToast } from '@/hooks/useToast';

interface DiagnosticResult {
  connection: { success: boolean; message: string };
  realtime: { success: boolean; message: string };
  tables: { bp_states: { success: boolean; message: string } };
  rls: { success: boolean; message: string; policies?: any[] };
}

const RealtimeDiagnosticComponent: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const { showError, showSuccess } = useToast();

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const diagnostic = await RealtimeDiagnostic.runFullDiagnostic();
      setResults(diagnostic);

      const fixSuggestions = RealtimeDiagnostic.generateFixSuggestions(diagnostic);
      setSuggestions(fixSuggestions);

      // 根据结果显示提示
      if (diagnostic.connection.success &&
          diagnostic.realtime.success &&
          diagnostic.tables.bp_states.success) {
        showSuccess('实时功能诊断完成，一切正常！');
      } else {
        showError('实时功能存在问题，请查看诊断结果');
      }
    } catch (error: any) {
      showError('诊断运行失败: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">实时功能诊断</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-zinc-400 hover:text-white text-xs"
          >
            {showDetails ? '隐藏' : '详情'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* 快速状态显示 */}
        {results && (
          <div className="flex items-center gap-2 text-xs">
            <span className={getStatusColor(results.connection.success)}>
              {getStatusIcon(results.connection.success)}
            </span>
            <span className={getStatusColor(results.realtime.success)}>
              {getStatusIcon(results.realtime.success)}
            </span>
            <span className={getStatusColor(results.tables.bp_states.success)}>
              {getStatusIcon(results.tables.bp_states.success)}
            </span>
            <span className="text-zinc-400 ml-1">
              {results.connection.success &&
               results.realtime.success &&
               results.tables.bp_states.success ?
               '实时功能正常' : '发现问题'}
            </span>
          </div>
        )}

        {/* 操作按钮 */}
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
        >
          {isRunning ? '诊断中...' : '运行诊断'}
        </button>

        {/* 详细结果 */}
        {showDetails && results && (
          <div className="space-y-2 text-xs">
            <div className="border-t border-zinc-700 pt-2">
              <h4 className="font-medium text-white mb-1">诊断结果:</h4>

              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className={getStatusColor(results.connection.success)}>
                    {getStatusIcon(results.connection.success)}
                  </span>
                  <div>
                    <span className="text-zinc-300">数据库连接: </span>
                    <span className={getStatusColor(results.connection.success)}>
                      {results.connection.message}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className={getStatusColor(results.realtime.success)}>
                    {getStatusIcon(results.realtime.success)}
                  </span>
                  <div>
                    <span className="text-zinc-300">Realtime功能: </span>
                    <span className={getStatusColor(results.realtime.success)}>
                      {results.realtime.message}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className={getStatusColor(results.tables.bp_states.success)}>
                    {getStatusIcon(results.tables.bp_states.success)}
                  </span>
                  <div>
                    <span className="text-zinc-300">BP状态表: </span>
                    <span className={getStatusColor(results.tables.bp_states.success)}>
                      {results.tables.bp_states.message}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 修复建议 */}
            {suggestions.length > 0 && (
              <div className="border-t border-zinc-700 pt-2">
                <h4 className="font-medium text-white mb-1">修复建议:</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="text-zinc-300 leading-relaxed">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeDiagnosticComponent;