import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRooms, Room } from "../hooks/useRooms";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Pagination } from "./Pagination";
import { useRoomFilters } from "../hooks/useRoomFilters";
import { ToastContainer } from "../components/Toast";
import {
  UnverifiedEmailModal,
  VerifiedEmailModal,
} from "../components/EmailStatusModals";
import { RoomFormModal } from "./RoomFormModal";
import {
  checkEmailStatus,
  resendConfirmationEmail,
} from "../services/userCheckService";
import { supabase } from "../services/supabase";
import { getHeroAvatarUrl } from '../data/heroes';
import { HEROES } from '../constants';

// 新组件导入
import { RoomManagerLayout } from "./RoomManagerLayout";
import { RoomHeader } from "./RoomHeader";
import { FilterHeader } from "./FilterHeader";
import { ScrollableContent } from "./ScrollableContent";
import { PaginationFooter } from "./PaginationFooter";

interface RoomManagerProps {
  onEnterRoom?: (roomId: string) => void;
  onBack?: () => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  onEnterRoom,
  onBack,
}) => {
  // 保持所有原有状态
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authFormData, setAuthFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [authFormLoading, setAuthFormLoading] = useState(false);
  const [error, setError] = useState("");

  // 邮箱状态检查相关状态
  const [emailChecking, setEmailChecking] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [emailCheckResult, setEmailCheckResult] = useState<any>(null);
  const [resendConfirmationLoading, setResendConfirmationLoading] =
    useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const [usernameFormData, setUsernameFormData] = useState({
    username: "",
  });
  const [usernameFormLoading, setUsernameFormLoading] = useState(false);
  const [joinFormData, setJoinFormData] = useState({
    roomId: "",
  });
  const [joinLoading, setJoinLoading] = useState(false);

  // 弹窗相关状态
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateUsername,
  } = useAuth();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const {
    rooms,
    loading,
    totalRooms,
    filteredTotal,
    fetchRooms,
    deleteRoom,
    getCurrentPagination,
  } = useRooms();

  // 筛选和搜索状态管理
  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
  } = useRoomFilters();

  // 请求序号，用于避免竞态条件
  const requestIdRef = useRef(0);

  // 统一的数据加载函数
  const loadRoomData = useCallback(async () => {
    // 生成新的请求序号
    const currentRequestId = ++requestIdRef.current;

    // 计算有效的owner条件（用户未登录时忽略owner筛选条件）
    const effectiveOwnerId = user && filters.owner === "me" ? user.id : undefined;

    await fetchRooms({
      ownerId: effectiveOwnerId,
      page: filters.page,
      search: filters.search,
      sortBy: filters.sort,
      sortOrder: filters.order,
      requestId: currentRequestId, // 传递请求序号
    });

    // 检查是否还有更新的请求在等待
    if (currentRequestId < requestIdRef.current) {
      return;
    }
  }, [user?.id, filters.owner, filters.page, filters.search, filters.sort, filters.order, fetchRooms]);

  // 简化的显示逻辑
  const displayRooms = rooms;
  const displayLoading = loading;

  // 统一监听URL参数和用户状态变化
  useEffect(() => {
    loadRoomData();
  }, [
    filters.search,     // 搜索关键词
    filters.owner,      // 筛选条件
    filters.sort,       // 排序条件
    filters.order,      // 排序方向
    filters.page,       // 分页
    filters.pageSize,   // 每页数量
    user?.id,           // 只监听用户ID变化，避免用户信息细节变化重复触发
    loadRoomData
  ]);

  const handleCreateRoom = () => {
    // 检查用户是否登录
    if (!user) {
      setShowLoginForm(true);
      return;
    }

    setEditingRoom(null);
    setShowRoomForm(true);
  };

  const handleRoomSuccess = (message: string, room?: Room) => {
    setShowRoomForm(false);
    setEditingRoom(null);

    // 显示成功消息
    showSuccess(message);

    // 如果是创建房间且成功，自动进入房间
    if (room && !editingRoom && room?.id && onEnterRoom) {
      onEnterRoom(room.id);
    }

    // 刷新房间列表
    loadRoomData(); // 刷新房间列表
  };

  // 编辑房间相关函数
  const handleEditRoomClick = (room: Room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinFormData.roomId.trim()) {
      setError("请输入房间ID或房间链接！");
      return;
    }

    setJoinLoading(true);
    setError("");

    try {
      // 提取房间ID（支持直接输入ID或链接）
      let roomId = joinFormData.roomId.trim();

      // 如果输入的是链接，提取房间ID
      if (roomId.includes("/room/")) {
        const match = roomId.match(/\/room\/([a-zA-Z0-9_-]+)/);
        if (match) {
          roomId = match[1];
        } else {
          throw new Error("无效的房间链接格式");
        }
      }

      // 检查房间是否存在（移除is_public检查，因为所有房间都是公开的）

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .single();

      if (roomError || !room) {
        throw new Error("房间不存在");
      }

      // 直接跳转到房间，不进行任何参与者相关的操作
      setJoinFormData({ roomId: "" });
      setShowJoinForm(false);

      if (onEnterRoom) {
        onEnterRoom(roomId);
      }
    } catch (err: any) {
      const errorMessage = err.message || "加入房间失败，请检查房间ID是否正确";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setShowDeleteConfirm(roomId);
  };

  const confirmDeleteRoom = async (roomId: string) => {
    setShowDeleteConfirm(null);

    try {
      await deleteRoom(roomId);
      showSuccess("房间删除成功！");
      // 删除后刷新数据
      await loadRoomData();
    } catch (err: any) {
      const errorMessage = err.message || "删除房间失败，请稍后重试";
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  // 认证处理函数
  const handleAuth = async () => {
    if (authMode === "register") {
      if (!authFormData.username.trim()) {
        setError("请输入用户名！");
        return;
      }

      if (authFormData.password !== authFormData.confirmPassword) {
        setError("两次输入的密码不一致！");
        return;
      }
    }

    if (authFormData.password.length < 6) {
      setError("密码长度至少为6位！");
      return;
    }

    setAuthFormLoading(true);
    setError("");

    try {
      if (authMode === "login") {
        await signIn(authFormData.email, authFormData.password);
        setAuthFormData({
          email: "",
          password: "",
          confirmPassword: "",
          username: "",
        });
        setShowLoginForm(false);
      } else {
        const signUpResult = await signUp(
          authFormData.email,
          authFormData.password,
          authFormData.username,
        );
        console.log("📝 注册结果:", signUpResult);

        // 注册成功处理
        if (signUpResult.user) {
          console.log("🎉 注册成功");

          // 清空表单
          setAuthFormData({
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
          });

          // 如果注册成功但没有会话（需要验证邮箱），显示验证弹窗
          if (!signUpResult.session && !signUpResult.needsVerificationCode) {
            setShowUnverifiedModal(true);
            setRegisteredEmail(authFormData.email);
          }

          // 关闭登录弹窗（注册成功总是关闭弹窗）
          setShowLoginForm(false);
        } else {
          // 注册失败，不清空表单，不关闭弹窗，让用户重新尝试
          console.log("❌ 注册失败");
        }
      }
    } catch (err: any) {
      console.error("❌ 认证失败:", err);
      const errorMessage = err.message || "注册或登录失败，请稍后重试";
      setError(errorMessage);

      // 如果是注册失败，显示 toast 通知，并清除任何邮箱验证相关的状态
      if (authMode === "register") {
        showError("注册失败: " + errorMessage);
        setEmailCheckResult(null);
      }
    } finally {
      setAuthFormLoading(false);
    }
  };

  // 更新用户名处理函数
  const handleUpdateUsername = async () => {
    if (!usernameFormData.username.trim()) {
      setError("请输入新的用户名！");
      return;
    }

    if (usernameFormData.username === user?.username) {
      setError("新用户名与当前用户名相同！");
      return;
    }

    setUsernameFormLoading(true);
    setError("");

    try {
      await updateUsername(usernameFormData.username);
      setUsernameFormData({ username: "" });
      setShowUserSettings(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUsernameFormLoading(false);
    }
  };

  // 邮箱状态检查函数
  const checkEmailRegistrationStatus = useCallback(
    async (email: string) => {
      if (!email) {
        return;
      }

      try {
        const status = await checkEmailStatus(email);
        setEmailCheckResult(status);

        // 在注册和登录模式下都触发相应的弹窗
        switch (status.status) {
          case "registered_unverified":
            setShowUnverifiedModal(true);
            setRegisteredEmail(email);
            break;
          case "registered_verified":
            // 只有在注册模式下才弹"已验证"的弹窗
            if (authMode === "register") {
              setShowVerifiedModal(true);
              setRegisteredEmail(email);
            }
            break;
        }
      } catch (err: any) {
        console.error("邮箱状态检查失败:", err);
        // 清除验证结果
        setEmailCheckResult(null);
      }
    },
    [authMode],
  );

  // 邮箱输入处理
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setAuthFormData({ ...authFormData, email: newEmail });

    // 在注册和登录模式下都检查邮箱状态
    if ((authMode === "register" || authMode === "login") && newEmail) {
      // 清除之前的定时器
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      // 设置新的定时器（500ms 防抖，等用户输入完成）
      emailCheckTimeoutRef.current = setTimeout(async () => {
        setEmailChecking(true);
        setError("");

        try {
          await checkEmailRegistrationStatus(newEmail);
        } catch (err: any) {
          console.error("邮箱状态检查失败:", err);
        } finally {
          setEmailChecking(false);
        }
      }, 500);
    } else {
      console.log("❌ 不触发检查 - 模式:", authMode, "或邮箱为空");
    }
  };

  // 重发确认邮件处理
  const handleResendConfirmation = async () => {
    if (!registeredEmail) return;

    setResendConfirmationLoading(true);
    setCooldownSeconds(60);

    try {
      const result = await resendConfirmationEmail(registeredEmail);

      if (result.success) {
        // 开始倒计时
        let countdown = 60;
        const interval = setInterval(() => {
          countdown -= 1;
          setCooldownSeconds(countdown);

          if (countdown <= 0) {
            clearInterval(interval);
          }
        }, 1000);
      } else {
        setError(result.message || "重发验证邮件失败");
      }
    } catch (err: any) {
      setError(err.message || "重发验证邮件时发生错误");
    } finally {
      setResendConfirmationLoading(false);
    }
  };

  // 切换到登录模式
  const handleSwitchToLogin = () => {
    setAuthMode("login");
    setShowVerifiedModal(false);
    setShowUnverifiedModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentDomain = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  };

  const getRoomUrl = (roomId: string) => {
    return `${getCurrentDomain()}/room/${roomId}`;
  };

  // 搜索处理函数
  const handleSearchChange = (value: string) => {
    // 这里可以添加实时搜索逻辑，但当前保持简洁
  };

  const handleSearch = (value: string) => {
    setFilter("search", value);
  };

  const handleClearSearch = () => {
    setFilter("search", "");
  };

  // 认证检查 - 改进加载状态处理
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white">加载用户信息中...</div>
        </div>
      </div>
    );
  }

  // 渲染房间列表内容
  const renderRoomList = () => {
    if (displayLoading) {
      return (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      );
    }

    if (displayRooms.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>暂无符合条件的房间</p>
        </div>
      );
    }

    return (
      <>
        {/* 桌面端：列表式布局 */}
        <div className="hidden sm:block">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
            {displayRooms.map((room: Room, index: number) => (
              <div
                key={room.id}
                className={`group hover:bg-gray-700/30 transition-all duration-200 ${
                  index !== displayRooms.length - 1
                    ? "border-b border-gray-700"
                    : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* 左侧：房间信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                          {room.name}
                        </h3>
                        {room.description && (
                          <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full truncate max-w-xs">
                            {room.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {room.owner?.username ||
                            room.owner?.display_name ||
                            room.owner?.email ||
                            "未知用户"}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className="flex items-center gap-1"
                            title="创建时间"
                          >
                            <svg
                              className="w-3 h-3 text-blue-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-blue-400">创建</span>
                            {formatDate(room.created_at)}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title="最后活动时间"
                          >
                            <svg
                              className="w-3 h-3 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <span className="text-green-400">更新</span>
                            {formatDate(
                              room.bp_updated_at || room.updated_at,
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 英雄选择信息 - 单独一行 */}
                      {room.total_selected && room.total_selected > 0 && (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            <span>已选择 {room.total_selected} 个英雄</span>
                          </div>

                          {room.selected_heroes &&
                            room.selected_heroes.length > 0 && (
                              <div className="flex items-center gap-1">
                                {room.selected_heroes.slice(0, 10).map((hero: any, index: number) => {
                                  // 从HEROES数据中获取英雄详细信息
                                  const heroData = HEROES.find(h => h.id === hero.id);
                                  const avatarUrl = heroData ? getHeroAvatarUrl(heroData) : null;
                                  const displayName = heroData ? (heroData.cnName || heroData.name) : hero.name;

                                  return (
                                  <div
                                    key={hero.id}
                                    className="w-6 h-6 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center overflow-hidden"
                                    title={displayName}
                                  >
                                    {avatarUrl ? (
                                      <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                          // 如果图片加载失败，显示首字母
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                          target.parentElement!.textContent =
                                            displayName.charAt(0);
                                          target.parentElement!.className =
                                            "w-6 h-6 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white text-xs font-bold";
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                        {displayName.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                );
                                })}
                                {room.total_selected > 10 && (
                                  <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-300 text-xs font-medium">
                                    +{room.total_selected - 10}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* 右侧：操作按钮 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* 编辑按钮 */}
                      {user && room.owner_id === user.id && (
                        <button
                          onClick={() => handleEditRoomClick(room)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-md transition-colors"
                          title="编辑房间"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}

                      {/* 删除按钮 */}
                      {user && room.owner_id === user.id && (
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
                          title="删除房间"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}

                      {/* 复制链接按钮 - 第二个 */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            getRoomUrl(room.id),
                          );
                          showSuccess("房间链接已复制到剪贴板！");
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center gap-1"
                        title="复制链接"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        复制链接
                      </button>

                      {/* 进入房间按钮 - 最后一个 */}
                      <button
                        onClick={() => onEnterRoom?.(room.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        进入房间
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 移动端：紧凑卡片布局 */}
        <div className="sm:hidden space-y-3">
          {displayRooms.map((room: Room) => (
            <div
              key={room.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 relative"
            >
              {/* 右上角按钮组 */}
              <div className="absolute top-3 right-3 flex gap-2">
                {/* 编辑按钮 */}
                {user && room.owner_id === user.id && (
                  <button
                    onClick={() => handleEditRoomClick(room)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-md transition-colors"
                    title="编辑房间"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}

                {/* 删除按钮 */}
                {user && room.owner_id === user.id && (
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
                    title="删除房间"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mb-3">
                <h3 className="text-base font-semibold text-white mb-1 pr-10">
                  {room.name}
                </h3>
                {room.description && (
                  <p className="text-xs text-gray-400">
                    {room.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="truncate">
                    {room.owner?.username ||
                      room.owner?.display_name ||
                      room.owner?.email ||
                      "未知用户"}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="创建时间">
                  <svg
                    className="w-3 h-3 text-blue-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-blue-400">创建</span>
                  <span>{formatDate(room.created_at)}</span>
                </div>
                <div
                  className="flex items-center gap-1"
                  title="最后活动时间"
                >
                  <svg
                    className="w-3 h-3 text-green-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-green-400">更新</span>
                  <span>
                    {formatDate(room.bp_updated_at || room.updated_at)}
                  </span>
                </div>
              </div>

              {/* 英雄选择信息 */}
              {room.total_selected && room.total_selected > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>已选择 {room.total_selected} 个英雄</span>
                  </div>

                  {room.selected_heroes &&
                    room.selected_heroes.length > 0 && (
                      <div className="flex items-center gap-1">
                        {room.selected_heroes.slice(0, 8).map((hero: any) => {
                          // 从HEROES数据中获取英雄详细信息
                          const heroData = HEROES.find(h => h.id === hero.id);
                          const avatarUrl = heroData ? getHeroAvatarUrl(heroData) : null;
                          const displayName = heroData ? (heroData.cnName || heroData.name) : hero.name;

                          return (
                          <div
                            key={hero.id}
                            className="w-8 h-8 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center overflow-hidden"
                            title={displayName}
                          >
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  // 如果图片加载失败，显示首字母
                                  const target =
                                    e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.parentElement!.textContent =
                                    displayName.charAt(0);
                                  target.parentElement!.className =
                                    "w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white text-sm font-bold";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                {displayName.charAt(0)}
                              </div>
                            )}
                          </div>
                        );
                        })}
                        {room.total_selected > 8 && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-300 text-sm font-medium">
                            +{room.total_selected - 8}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* 底部两个固定按钮 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onEnterRoom?.(room.id)}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  进入房间
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getRoomUrl(room.id));
                    showSuccess("房间链接已复制到剪贴板！");
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  复制链接
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // 渲染所有弹窗
  const renderModals = () => {
    return (
      <>
        {/* 房间表单弹窗（创建/编辑） */}
        <RoomFormModal
          isOpen={showRoomForm}
          onClose={() => {
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
          mode={editingRoom ? "edit" : "create"}
          room={editingRoom || undefined}
          onSuccess={handleRoomSuccess}
        />

        {/* 加入房间弹窗 */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">加入房间</h2>
                <button
                  onClick={() => {
                    setShowJoinForm(false);
                    setJoinFormData({ roomId: "" });
                    setError("");
                  }}
                  className="text-zinc-400 hover:text-white text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    房间ID或房间链接 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={joinFormData.roomId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setJoinFormData({
                          ...joinFormData,
                          roomId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required
                      placeholder="输入房间ID或房间链接"
                    />
                    {joinFormData.roomId && (
                      <button
                        type="button"
                        onClick={() =>
                          setJoinFormData({ ...joinFormData, roomId: "" })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    支持输入房间ID或完整的房间链接（如：{getRoomUrl("abc123")}）
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={joinLoading || !joinFormData.roomId.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joinLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        加入中...
                      </div>
                    ) : (
                      "进入房间"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setJoinFormData({ roomId: "" });
                      setError("");
                    }}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 移动端侧边菜单 */}
        {showMobileMenu && (
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* 菜单面板 */}
            <div className="fixed right-0 top-0 h-full w-72 bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="p-6">
                {/* 菜单头部 */}
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-semibold text-white">用户菜单</h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* 菜单内容 */}
                <div className="space-y-4">
                  {/* 用户信息显示 */}
                  <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user ? (
                        <>
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {user.username}
                            </div>
                            <div className="text-zinc-400 text-sm truncate">
                              {user.email}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              游客模式
                            </div>
                            <div className="text-zinc-400 text-sm truncate">
                              登录后可使用完整功能
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 用户操作区域 */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      用户操作
                    </h4>
                    {user ? (
                      <>
                        <button
                          onClick={() => {
                            setUsernameFormData({ username: user.username });
                            setShowUserSettings(true);
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white">用户设置</div>
                            <div className="text-xs text-zinc-500">
                              修改用户名
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            signOut();
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white">退出登录</div>
                            <div className="text-xs text-zinc-500">安全退出</div>
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowLoginForm(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <div>
                          <div>登录或注册</div>
                          <div className="text-xs text-blue-100">
                            访问完整功能
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* 房间操作区域 - 所有用户都可见 */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      房间操作
                    </h4>

                    <button
                      onClick={() => {
                        setShowJoinForm(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div>加入房间</div>
                        <div className="text-xs text-purple-100">
                          通过ID或链接加入
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleCreateRoom();
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <div>
                        <div>创建房间</div>
                        <div className="text-xs text-green-100">
                          {user ? "创建新的房间" : "需要登录后创建"}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 登录模态框 */}
        {showLoginForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {authMode === "login" ? "登录账户" : "注册账户"}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {authMode === "login"
                      ? "登录后即可创建和管理房间"
                      : "创建账户开始使用在线功能"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLoginForm(false);
                    setAuthFormData({
                      email: "",
                      password: "",
                      confirmPassword: "",
                      username: "",
                    });
                    setError("");
                  }}
                  className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
                >
                  ×
                </button>
              </div>

              {/* 模式切换 */}
              <div className="flex bg-zinc-700/50 rounded-lg p-1 mb-6 border border-zinc-600">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
                    authMode === "login"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-600"
                  }`}
                >
                  登录
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
                    authMode === "register"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-600"
                  }`}
                >
                  注册
                </button>
              </div>

              {/* 登录表单 */}
              <div className="space-y-5">
                {authMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      用户名 <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-zinc-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={authFormData.username}
                        onChange={(e) =>
                          setAuthFormData({
                            ...authFormData,
                            username: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="请输入用户名（中英文均可）"
                        required
                      />
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      用户名将作为您在平台上的显示名称
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    邮箱地址 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={authFormData.email}
                      onChange={handleEmailChange}
                      className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="请输入邮箱地址（用于登录）"
                      required
                    />
                  </div>
                  {(authMode === "register" || authMode === "login") && (
                    <>
                      {emailChecking && (
                        <div className="text-blue-400 text-sm mt-1">
                          正在检查邮箱状态...
                        </div>
                      )}

                      {/* 注册模式下显示邮箱状态反馈 */}
                      {authMode === "register" &&
                        emailCheckResult &&
                        !emailChecking &&
                        authFormData.email && (
                          <div
                            className={`text-sm mt-2 flex items-center ${
                              emailCheckResult.status === "registered_unverified"
                                ? "text-yellow-400"
                                : emailCheckResult.status ===
                                    "registered_verified"
                                  ? "text-green-400"
                                  : emailCheckResult.status === "not_registered"
                                    ? "text-green-400"
                                    : "text-gray-400"
                            }`}
                          >
                            {emailCheckResult.status ===
                              "registered_unverified" && (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                                <span>邮箱已注册但未验证</span>
                              </>
                            )}
                            {emailCheckResult.status ===
                              "registered_verified" && (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                  />
                                </svg>
                                <span>邮箱已注册并已验证</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode("login");
                                    setShowVerifiedModal(false);
                                    setShowUnverifiedModal(false);
                                  }}
                                  className="ml-2 text-xs bg-green-600/20 hover:bg-green-600/30 px-2 py-1 rounded border border-green-600/50"
                                >
                                  去登录
                                </button>
                              </>
                            )}
                            {emailCheckResult.status === "not_registered" && (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>邮箱可以注册</span>
                              </>
                            )}
                          </div>
                        )}

                      {/* 登录模式下只显示未注册的提示，其他状态会弹窗 */}
                      {authMode === "login" &&
                        emailCheckResult &&
                        !emailChecking &&
                        authFormData.email &&
                        emailCheckResult.status === "not_registered" && (
                          <div className="text-sm mt-2 flex items-center text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>该邮箱尚未注册</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode("register");
                                setShowVerifiedModal(false);
                                setShowUnverifiedModal(false);
                              }}
                              className="ml-2 text-xs bg-blue-600/20 hover:bg-blue-600/30 px-2 py-1 rounded border border-blue-600/50"
                            >
                              去注册
                            </button>
                          </div>
                        )}

                      <div className="mt-1 text-xs text-zinc-500">
                        邮箱地址仅用于登录，不会公开显示
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    密码 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={authFormData.password}
                      onChange={(e) =>
                        setAuthFormData({
                          ...authFormData,
                          password: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="请输入密码（至少6位）"
                      required
                    />
                  </div>
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      确认密码 <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-zinc-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={authFormData.confirmPassword}
                        onChange={(e) =>
                          setAuthFormData({
                            ...authFormData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="请再次输入密码"
                        required
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-400 text-sm">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAuth}
                  disabled={
                    authFormLoading ||
                    !authFormData.email ||
                    !authFormData.password
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    authMode === "login"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  }`}
                >
                  {authFormLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {authMode === "login" ? "登录中..." : "注册中..."}
                    </>
                  ) : (
                    <>
                      {authMode === "login" ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                          </svg>
                          登录
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                          注册
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-700">
                <div className="text-center">
                  <p className="text-xs text-zinc-500">
                    {authMode === "login" ? (
                      <>
                        还没有账户？{" "}
                        <button
                          onClick={() => setAuthMode("register")}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          立即注册
                        </button>
                      </>
                    ) : (
                      <>
                        已有账户？{" "}
                        <button
                          onClick={() => setAuthMode("login")}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          立即登录
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 用户设置模态框 */}
        {showUserSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">用户设置</h3>
                  <p className="text-sm text-zinc-400 mt-1">修改您的用户名</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserSettings(false);
                    setUsernameFormData({ username: "" });
                    setError("");
                  }}
                  className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    用户名 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={usernameFormData.username}
                      onChange={(e) =>
                        setUsernameFormData({
                          ...usernameFormData,
                          username: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="请输入新的用户名（中英文均可）"
                      required
                    />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    用户名将作为您在平台上的显示名称
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-400 text-sm">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={
                      usernameFormLoading || !usernameFormData.username.trim()
                    }
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {usernameFormLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        更新中...
                      </div>
                    ) : (
                      "更新用户名"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserSettings(false);
                      setUsernameFormData({ username: "" });
                      setError("");
                    }}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">删除房间</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    此操作不可恢复，请谨慎操作
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setError("");
                  }}
                  className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-red-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <p className="text-red-400 font-medium">
                      确定要删除这个房间吗？
                    </p>
                    <p className="text-red-300 text-sm mt-1">
                      删除后将无法恢复，所有相关数据都会被清除
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => confirmDeleteRoom(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  确认删除
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setError("");
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 邮箱状态模态框 */}
        <UnverifiedEmailModal
          isOpen={showUnverifiedModal}
          onClose={() => setShowUnverifiedModal(false)}
          email={registeredEmail}
          onResendEmail={handleResendConfirmation}
          resendLoading={resendConfirmationLoading}
          cooldownSeconds={cooldownSeconds}
        />

        <VerifiedEmailModal
          isOpen={showVerifiedModal}
          onClose={() => setShowVerifiedModal(false)}
          email={registeredEmail}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </>
    );
  };

  // 使用新的布局结构
  return (
    <RoomManagerLayout
      roomHeader={
        <RoomHeader
          user={user}
          onBack={onBack}
          onJoinRoom={() => setShowJoinForm(true)}
          onCreateRoom={handleCreateRoom}
          onUserMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
          showMobileMenu={showMobileMenu}
        />
      }
      filterHeader={
        <FilterHeader
          totalRooms={totalRooms}
          filteredTotal={filteredTotal}
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          loading={loading}
          filters={filters}
          setFilter={setFilter}
          setFilters={setFilters}
          clearFilters={clearFilters}
        />
      }
      scrollableContent={
        <ScrollableContent>
          {renderRoomList()}
        </ScrollableContent>
      }
      paginationFooter={
        <PaginationFooter>
          <Pagination
            totalItems={totalRooms}
            containerWidth="full"
            isSticky={true}
          />
        </PaginationFooter>
      }
      modals={renderModals()}
    />
  );
};