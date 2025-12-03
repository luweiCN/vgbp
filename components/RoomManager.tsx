import React, { useState, useCallback, useEffect } from "react";
import { useRooms, Room } from "../hooks/useRooms";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Pagination } from "./Pagination";
import { useRoomFilters } from "../hooks/useRoomFilters";
import { AuthForm } from "./AuthForm";
import { RoomFormModal } from "./RoomFormModal";
import { RoomItem } from "./RoomItem";
import { supabase } from "../services/supabase";

// 新组件导入
import { RoomManagerLayout } from "./RoomManagerLayout";
import { RoomHeader } from "./RoomHeader";
import { FilterHeader } from "./FilterHeader";
import { ScrollableContent } from "./ScrollableContent";
import { PaginationFooter } from "./PaginationFooter";
import { JoinRoomModal } from "./JoinRoomModal";
import { AuthModal } from "./AuthModal";
import { UserSettingsModal } from "./UserSettingsModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { MobileMenuModal } from "./MobileMenuModal";

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

  const { user, loading: authLoading, signOut, updateUsername } = useAuth();
  const { showSuccess, showError } = useToast();

  const { rooms, loading, totalRooms, filteredTotal, fetchRooms, loadRoomData, deleteRoom } =
    useRooms();

  // 筛选和搜索状态管理
  const { filters, setFilter, setFilters, clearFilters } = useRoomFilters();

  // 统一监听URL参数和用户状态变化
  useEffect(() => {
    loadRoomData({
      search: filters.search,
      owner: filters.owner,
      sort: filters.sort,
      order: filters.order,
      page: filters.page,
      pageSize: filters.pageSize,
    });
  }, [
    filters.search, // 搜索关键词
    filters.owner, // 筛选条件
    filters.sort, // 排序条件
    filters.order, // 排序方向
    filters.page, // 分页
    filters.pageSize, // 每页数量
    user?.id, // 只监听用户ID变化，避免用户信息细节变化重复触发
    loadRoomData,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    if (loading) {
      return <div className="text-center py-8 text-gray-400">加载中...</div>;
    }

    if (rooms.length === 0) {
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
            {rooms.map((room: Room, index: number) => (
              <RoomItem
                key={room.id}
                room={room}
                index={index}
                totalRooms={rooms.length}
                user={user}
                onEditRoom={handleEditRoomClick}
                onDeleteRoom={handleDeleteRoom}
                onEnterRoom={onEnterRoom}
                showSuccess={showSuccess}
                formatDate={formatDate}
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
              index={0}
              totalRooms={rooms.length}
              user={user}
              onEditRoom={handleEditRoomClick}
              onDeleteRoom={handleDeleteRoom}
              onEnterRoom={onEnterRoom}
              showSuccess={showSuccess}
              formatDate={formatDate}
            />
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
        <JoinRoomModal
          isOpen={showJoinForm}
          onClose={() => {
            setShowJoinForm(false);
            setJoinFormData({ roomId: "" });
            setError("");
          }}
          onSubmit={handleJoinRoom}
          roomId={joinFormData.roomId}
          onRoomIdChange={(roomId) => setJoinFormData({ ...joinFormData, roomId })}
          loading={joinLoading}
          error={error}
        />

        {/* 移动端侧边菜单 */}
        <MobileMenuModal
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
          onUsernameChange={(username) => setUsernameFormData({ ...usernameFormData, username })}
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
          onConfirm={() => showDeleteConfirm && confirmDeleteRoom(showDeleteConfirm)}
          roomName={showDeleteConfirm?.name}
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
        <ScrollableContent>{renderRoomList()}</ScrollableContent>
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

