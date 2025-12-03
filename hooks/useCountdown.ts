import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
  initialTime?: number;
  onComplete?: () => void;
  autoReset?: boolean;
}

interface UseCountdownReturn {
  timeLeft: number;
  isActive: boolean;
  start: (seconds?: number) => void;
  stop: () => void;
  reset: () => void;
}

/**
 * 倒计时 Hook
 * 提供可靠的倒计时功能，包含适当的清理机制和状态管理
 */
export const useCountdown = (options: UseCountdownOptions = {}): UseCountdownReturn => {
  const { initialTime = 60, onComplete, autoReset = false } = options;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // 更新 onComplete ref 当它变化时
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 清理定时器函数
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            if (autoReset) {
              return initialTime;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft, autoReset, initialTime]);

  const start = useCallback((seconds?: number) => {
    clearTimer();
    setTimeLeft(seconds || initialTime);
    setIsActive(true);
  }, [clearTimer, initialTime]);

  const stop = useCallback(() => {
    clearTimer();
    setTimeLeft(0);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setTimeLeft(0);
  }, [clearTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    timeLeft,
    isActive,
    start,
    stop,
    reset
  };
};