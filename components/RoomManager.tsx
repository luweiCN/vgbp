import React, { useState, useCallback, useEffect } from "react";
import { useRooms, Room } from "../hooks/useRooms";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useI18n } from "@/i18n/hooks/useI18n";
import { Pagination } from "./Pagination";
import { useRoomFilters } from "../hooks/useRoomFilters";
import { RoomFormModal } from "./RoomFormModal";
import { RoomItem } from "./RoomItem";
import { supabase } from "../services/supabase";

// 新组件导入
import { RoomManagerLayout } from "./RoomManagerLayout";
import { RoomHeader } from "./RoomHeader";
import { FilterHeader } from "./FilterHeader";
import { ScrollableContent } from "./ScrollableContent";
import { JoinRoomModal } from "./JoinRoomModal";
import { AuthModal } from "./AuthModal";
import { UserSettingsModal } from "./UserSettingsModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { RoomManagerMenuModal } from "./RoomManagerMenuModal";

interface RoomManagerProps {
  onEnterRoom?: (roomId: string) => void;
  onBack?: () => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  onEnterRoom,
  onBack,
}) => {
  const { t } = useI18n();

  // 设置安全区域为深蓝色
  useEffect(() => {
    document.body.className = 'safe-area-blue';
    return () => {
      // 组件卸载时不做处理，让下一个页面自己设置
    };
  }, []);

  // 保持所有原有状态
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState("");

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

  const { user, loading: authLoading, updateUsername } = useAuth();
  const { showSuccess, showError } = useToast();

  const {
    rooms,
    loading,
    totalRooms,
    filteredTotal,
    loadRoomData,
    deleteRoom,
    validatePageNumber,
  } = useRooms();

  // 筛选和搜索状态管理
  const { filters, setFilter, setFilters, clearFilters } = useRoomFilters();

  // 主要的数据加载 useEffect - 不依赖 filteredTotal
  useEffect(() => {
    const currentPage = filters.page || 1;
    const pageSize = filters.pageSize || 10;

    // 直接加载当前页数据，不进行预验证
    // 页码验证将在数据加载完成后进行
    loadRoomData({
      search: filters.search,
      owner: filters.owner,
      sort: filters.sort,
      order: filters.order,
      page: currentPage,
      pageSize: filters.pageSize,
    });
  }, [
    filters.search, // 搜索关键词
    filters.owner, // 筛选条件
    filters.sort, // 排序条件
    filters.order, // 排序方向
    filters.page, // 分页
    filters.pageSize, // 每页数量
    filters.t, // 时间戳参数，用于强制刷新
    user?.id, // 只监听用户ID变化，避免用户信息细节变化重复触发
    loadRoomData,
  ]);

  // 数据加载完成后的页码验证 - 依赖 filteredTotal
  useEffect(() => {
    // 只有在数据加载完成后（filteredTotal !== undefined）才进行验证
    if (filteredTotal !== undefined && filteredTotal !== null) {
      const currentPage = filters.page || 1;

      // 获取实际的 pageSize - 如果没有设置，根据设备类型确定
      const getActualPageSize = () => {
        if (filters.pageSize) {
          return filters.pageSize;
        }
        // 如果 URL 中没有 pageSize 参数，根据设备类型返回默认值
        if (typeof window !== 'undefined') {
          return window.innerWidth < 640 ? 5 : 10;
        }
        return 10;
      };

      const pageSize = getActualPageSize();

      // 验证当前页码是否有效
      const validPage = validatePageNumber(currentPage, pageSize, filteredTotal);

      // 如果页码无效，修正它
      if (validPage !== currentPage) {
        console.log(`[RoomManager] 页码修正: ${currentPage} -> ${validPage} (总数: ${filteredTotal}, 每页: ${pageSize})`);
        setFilter('page', validPage);
      }
    }
  }, [filteredTotal, filters.page, filters.pageSize, validatePageNumber, setFilter]);

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

  // 编辑房间相关函数 - 优化依赖
  const handleEditRoomClick = useCallback((room: Room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  }, []);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinFormData.roomId.trim()) {
      setError(t('ui.components.roomManager.join.error'));
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
          throw new Error(t('ui.components.roomManager.join.invalidLink'));
        }
      }

      // 检查房间是否存在（移除is_public检查，因为所有房间都是公开的）

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .single();

      if (roomError || !room) {
        throw new Error(t('ui.components.roomManager.join.roomNotFound'));
      }

      // 直接跳转到房间，不进行任何参与者相关的操作
      setJoinFormData({ roomId: "" });
      setShowJoinForm(false);

      if (onEnterRoom) {
        onEnterRoom(roomId);
      }
    } catch (err: any) {
      const errorMessage = err.message || t('ui.components.roomManager.join.joinFailed');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setJoinLoading(false);
    }
  };

  // 删除房间相关函数 - 优化依赖
  const handleDeleteRoom = useCallback(async (roomId: string) => {
    setShowDeleteConfirm(roomId);
  }, []);

  // 确认删除房间 - 优化依赖
  const confirmDeleteRoom = useCallback(async (roomId: string) => {
    setShowDeleteConfirm(null);

    try {
      await deleteRoom(roomId);
      showSuccess(t('ui.components.roomManager.delete.success'));
      // 删除后刷新数据
      await loadRoomData();
    } catch (err: any) {
      const errorMessage = err.message || t('ui.components.roomManager.delete.failed');
      setError(errorMessage);
      showError(errorMessage);
    }
  }, [deleteRoom, showSuccess, showError, loadRoomData]);

  // 更新用户名处理函数
  const handleUpdateUsername = async () => {
    if (!usernameFormData.username.trim()) {
      setError(t('ui.components.roomManager.auth.updateUsername.error'));
      return;
    }

    if (usernameFormData.username === user?.username) {
      setError(t('ui.components.roomManager.auth.updateUsername.sameUsername'));
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

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();

    // 始终更新搜索内容和时间戳，确保数据重新加载
    setFilter("search", trimmedValue);
    setFilter("t", Date.now()); // 每次搜索都更新时间戳，强制刷新
  };

  const handleClearSearch = () => {
    setFilter("search", "");
  };

  // 认证检查 - 改进加载状态处理（移动到组件最后作为条件渲染）

  // 渲染房间列表内容
  const renderRoomList = useCallback(() => {
    if (loading) {
      return <div className="text-center py-8 text-gray-400">{t('ui.components.roomManager.list.loading')}</div>;
    }

    if (rooms.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>{t('ui.components.roomManager.list.noRooms')}</p>
        </div>
      );
    }

    return (
      <>
        {/* 桌面端：列表式布局 */}
        <div className="hidden sm:block">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
            {rooms.map((room: Room) => (
              <RoomItem
                key={room.id}
                room={room}
                onEditRoom={handleEditRoomClick}
                onDeleteRoom={handleDeleteRoom}
                onEnterRoom={onEnterRoom}
              />
            ))}
          </div>
        </div>

        {/* 移动端：紧凑卡片布局 */}
        <div className="sm:hidden space-y-3">
          {rooms.map((room: Room) => (
            <RoomItem
              key={room.id}
              room={room}
              onEditRoom={handleEditRoomClick}
              onDeleteRoom={handleDeleteRoom}
              onEnterRoom={onEnterRoom}
            />
          ))}
        </div>
      </>
    );
  }, [loading, rooms, handleEditRoomClick, handleDeleteRoom, onEnterRoom, t]);

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
        <JoinRoomModal
          isOpen={showJoinForm}
          onClose={() => {
            setShowJoinForm(false);
            setJoinFormData({ roomId: "" });
            setError("");
          }}
          onSubmit={handleJoinRoom}
          roomId={joinFormData.roomId}
          onRoomIdChange={(roomId: string) =>
            setJoinFormData({ ...joinFormData, roomId })
          }
          loading={joinLoading}
          error={error}
        />

        {/* 房间管理器菜单 */}
        <RoomManagerMenuModal
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          onCreateRoom={() => {
            setShowMobileMenu(false);
            handleCreateRoom();
          }}
          onJoinRoom={() => {
            setShowJoinForm(true);
            setShowMobileMenu(false);
          }}
          onOpenUserSettings={() => {
            setUsernameFormData({ username: user?.username || "" });
            setShowUserSettings(true);
            setShowMobileMenu(false);
          }}
          onOpenLogin={() => {
            setShowLoginForm(true);
            setShowMobileMenu(false);
          }}
        />

        {/* 登录模态框 */}
        <AuthModal
          isOpen={showLoginForm}
          onClose={() => setShowLoginForm(false)}
          onSuccess={() => setShowLoginForm(false)}
        />

        {/* 用户设置弹窗 */}
        <UserSettingsModal
          isOpen={showUserSettings}
          onClose={() => {
            setShowUserSettings(false);
            setUsernameFormData({ username: "" });
            setError("");
          }}
          username={usernameFormData.username}
          onUsernameChange={(username: string) =>
            setUsernameFormData({ ...usernameFormData, username })
          }
          onUpdateUsername={handleUpdateUsername}
          loading={usernameFormLoading}
          error={error}
        />

        {/* 删除确认弹窗 */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(null);
            setError("");
          }}
          onConfirm={() =>
            showDeleteConfirm && confirmDeleteRoom(showDeleteConfirm)
          }
          roomName={showDeleteConfirm?.name}
        />
      </>
    );
  };

  // 认证检查 - 在所有Hooks调用后进行条件渲染
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white">{t('ui.components.roomManager.auth.loadingUserInfo')}</div>
        </div>
      </div>
    );
  }

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
        <ScrollableContent>{renderRoomList()}</ScrollableContent>
      }
      paginationFooter={
        <div className="py-4">
          <Pagination
            totalItems={totalRooms}
            containerWidth="full"
            isSticky={true}
          />
        </div>
      }
      modals={renderModals()}
    />
  );
};
