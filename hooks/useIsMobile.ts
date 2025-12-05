import { useState, useEffect } from 'react';

// 检测移动端的条件判断函数（提取到组件外部，避免作用域问题）
const checkMobileConditions = (bp: number): boolean => {
  try {
    // 防止在某些特殊环境下window对象不完整
    if (typeof window === 'undefined' || !window.navigator) {
      return false;
    }

    const mobileByWidth = window.innerWidth < bp;
    const mobileByTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileByUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 综合判断：屏幕宽度 OR 触摸支持 OR 移动设备UA
    return mobileByWidth || mobileByTouch || mobileByUserAgent;
  } catch (error) {
    console.warn('Mobile detection failed:', error);
    return false;
  }
};

/**
 * 移动端检测Hook
 * 提供全面兼容性的移动端检测功能
 */
export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    // 初始化时立即检测，支持SSR
    return checkMobileConditions(breakpoint);
  });

  useEffect(() => {
    // 检测移动端
    const checkMobile = () => {
      setIsMobile(checkMobileConditions(breakpoint));
    };

    // 初始检测
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
};

/**
 * 默认的移动端检测Hook（使用768px断点）
 */
export const useDefaultIsMobile = () => useIsMobile(768);

/**
 * 小屏幕检测Hook（使用640px断点）
 */
export const useIsSmallScreen = () => useIsMobile(640);