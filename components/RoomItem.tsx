import React, { useCallback, memo, useMemo } from "react";
import { Room } from "../hooks/useRooms";
import { useAuth } from "../hooks/useAuth";
import { useToastContext } from "../contexts/ToastContext";
import { getHeroAvatarUrl, getHeroById } from "../data/heroes";
import { useSafeI18n } from "../i18n/components/useSafeI18n";
import { i18nService } from "../i18n/services/i18n.service";

interface RoomItemProps {
  room: Room;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onEnterRoom: (roomId: string) => void;
}

// 统一的英雄头像组件
const HeroAvatar = memo(
  ({
    heroId,
    size = "small",
    showTitle = false,
  }: {
    heroId: string;
    size?: "small" | "large";
    showTitle?: boolean;
  }) => {
    // 使用 O(1) 查找替代 O(n) find()
    const hero = getHeroById(heroId);

    // 使用useMemo缓存头像URL计算
    const avatarUrl = useMemo(() => {
      return hero ? getHeroAvatarUrl(hero) : null;
    }, [hero]);

    // 使用heroId作为显示名称
    const displayName = heroId;

    // 内置错误处理函数
    const handleAvatarError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        // 如果图片加载失败，显示首字母
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        target.parentElement!.textContent = displayName.charAt(0);

        // 根据尺寸设置不同的错误样式
        const errorClasses =
          size === "large"
            ? "w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white text-sm font-bold"
            : "w-6 h-6 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white text-xs font-bold";

        target.parentElement!.className = errorClasses;
      },
      [displayName, size],
    );

    // 根据尺寸设置样式类
    const sizeClasses =
      size === "large" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";

    return (
      <div
        className={`${sizeClasses} rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center overflow-hidden`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={handleAvatarError}
          />
        ) : (
          <div
            className={`w-full h-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-bold ${sizeClasses.includes("text-sm") ? "text-sm" : "text-xs"}`}
          >
            {displayName.charAt(0)}
          </div>
        )}
      </div>
    );
  },
);

export const RoomItem: React.FC<RoomItemProps> = memo(({
  room,
  onEditRoom,
  onDeleteRoom,
  onEnterRoom,
}) => {
  const { user } = useAuth();
  const { showSuccess } = useToastContext();
  const { translate: t } = useSafeI18n();

  // 优化的处理函数 - 使用 useCallback 并稳定化
  const handleEditClick = useCallback(() => {
    onEditRoom(room);
  }, [onEditRoom, room]);

  const handleDeleteClick = useCallback(() => {
    onDeleteRoom(room.id);
  }, [onDeleteRoom, room.id]);

  const handleEnterClick = useCallback(() => {
    onEnterRoom(room.id);
  }, [onEnterRoom, room.id]);

  // 优化的复制链接函数
  const handleCopyRoomUrl = useCallback(async () => {
    try {
      const roomUrl = getRoomUrl(room.id);
      await navigator.clipboard.writeText(roomUrl);
      const message = t("ui.components.roomItem.linkCopied");
      showSuccess(message);
    } catch (error) {
      console.error('Failed to copy room URL:', error);
      // 可以添加错误提示，但为了保持简单，暂时只在控制台记录错误
    }
  }, [room.id, showSuccess, t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 根据当前语言决定格式
    const currentLang = i18nService.getCurrentLanguage();
    if (currentLang === 'zh-CN') {
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
      // 日韩习惯的格式：YYYY/MM/DD HH:mm (更简洁，符合国际通用)
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
  };

  const getRoomUrl = (roomId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/room/${roomId}`;
    }
    return `http://localhost:3000/room/${roomId}`;
  };

  // 桌面端布局
  const DesktopLayout = () => {
    return (
      <div className="group hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-700 last:border-b-0">
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
                    t("ui.components.roomItem.unknownUser")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title={t("ui.components.roomItem.createdAt")}>
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
                    <span className="text-blue-400">{t("ui.components.roomItem.created")}</span>
                    {formatDate(room.created_at)}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("ui.components.roomItem.updatedAt")}
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
                    <span className="text-green-400">{t("ui.components.roomItem.updated")}</span>
                    {formatDate(room.updated_at)}
                  </span>
                </div>
              </div>

              {/* 英雄选择信息 - 单独一行 */}
              {room.total_selected !== undefined && (
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
                    <span>
                      {!!room.total_selected && room.total_selected > 0
                        ? t("ui.components.roomItem.heroesSelected", { count: room.total_selected })
                        : t("ui.components.roomItem.noHeroesSelected")
                      }
                    </span>
                  </div>

                  {room.selected_heroes && room.selected_heroes.length > 0 && (
                    <div className="flex items-center gap-1">
                      {room.selected_heroes.slice(0, 10).map((heroId: string) => (
                        <HeroAvatar
                          key={heroId}
                          heroId={heroId}
                          size="small"
                        />
                      ))}
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
            <div className="flex items-center gap-2 shrink-0">
              {/* 编辑按钮 */}
              {user && room.owner_id === user.id && (
                <button
                  onClick={handleEditClick}
                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-md transition-colors"
                  title={t("ui.components.roomItem.editRoom")}
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
                  onClick={handleDeleteClick}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
                  title={t("ui.components.roomItem.deleteRoom")}
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

              {/* 复制链接按钮 */}
              <button
                onClick={handleCopyRoomUrl}
                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center gap-1"
                title={t("ui.components.roomItem.copyLink")}
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
                {t("ui.components.roomItem.copyLink")}
              </button>

              {/* 进入房间按钮 */}
              <button
                onClick={handleEnterClick}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {t("ui.components.roomItem.enterRoom")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 移动端布局
  const MobileLayout = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 relative">
        {/* 右上角按钮组 */}
        <div className="absolute top-3 right-3 flex gap-2">
          {/* 编辑按钮 */}
          {user && room.owner_id === user.id && (
            <button
              onClick={handleEditClick}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-md transition-colors"
              title={t("ui.components.roomItem.editRoom")}
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
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
              title={t("ui.components.roomItem.deleteRoom")}
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
          <h3 className="text-base font-semibold text-white mb-1 pr-10 max-w-[260px] md:max-w-[500px] truncate">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-xs text-gray-400">{room.description}</p>
          )}
        </div>

        <div className="space-y-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 shrink-0"
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
                t("ui.components.roomItem.unknownUser")}
            </span>
          </div>
          <div className="flex items-center gap-1" title={t("ui.components.roomItem.createdAt")}>
            <svg
              className="w-3 h-3 text-blue-400 shrink-0"
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
            <span className="text-blue-400">{t("ui.components.roomItem.created")}</span>
            <span>{formatDate(room.created_at)}</span>
          </div>
          <div className="flex items-center gap-1" title={t("ui.components.roomItem.updatedAt")}>
            <svg
              className="w-3 h-3 text-green-400 shrink-0"
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
            <span className="text-green-400">{t("ui.components.roomItem.updated")}</span>
            <span>{formatDate(room.updated_at)}</span>
          </div>
        </div>

        {/* 英雄选择信息 */}
        {room.total_selected !== undefined && (
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
              <span>
                  {!!room.total_selected && room.total_selected > 0
                    ? t("ui.components.roomItem.heroesSelected", { count: room.total_selected })
                    : t("ui.components.roomItem.noHeroesSelected")
                  }
                </span>
            </div>

            {room.selected_heroes && room.selected_heroes.length > 0 && (
              <div className="flex items-center gap-1">
                {room.selected_heroes.slice(0, 8).map((heroId: string) => (
                  <HeroAvatar
                    key={heroId}
                    heroId={heroId}
                    size="large"
                    showTitle={true}
                  />
                ))}
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
            onClick={handleEnterClick}
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
            {t("ui.components.roomItem.enterRoom")}
          </button>

          <button
            onClick={handleCopyRoomUrl}
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
            {t("ui.components.roomItem.copyLink")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 桌面端：列表式布局 */}
      <div className="hidden sm:block">
        <DesktopLayout />
      </div>

      {/* 移动端：紧凑卡片布局 */}
      <div className="sm:hidden">
        <MobileLayout />
      </div>
    </>
  );
});
