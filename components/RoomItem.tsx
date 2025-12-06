import React, { useCallback, memo, useMemo } from "react";
import { Room } from "@/hooks/useRooms";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { getHeroAvatarUrl, getHeroById } from "@/data/heroes";
import { useSafeI18n } from "@/i18n/components/useSafeI18n";
import { i18nService } from "@/i18n/services/i18n.service";
import { User, Calendar, Clock, Swords, Edit, Trash2, Link, LogIn } from 'lucide-react';
import { Icon } from "@/components/ui/Icon";

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
                  <Icon icon={User} preset="xs" />
                  {room.owner?.username ||
                    room.owner?.display_name ||
                    room.owner?.email ||
                    t("ui.components.roomItem.unknownUser")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title={t("ui.components.roomItem.createdAt")}>
                    <Icon icon={Calendar} preset="xs" className="text-blue-400" />
                    <span className="text-blue-400">{t("ui.components.roomItem.created")}</span>
                    {formatDate(room.created_at)}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={t("ui.components.roomItem.updatedAt")}
                  >
                    <Icon icon={Clock} preset="xs" className="text-green-400" />
                    <span className="text-green-400">{t("ui.components.roomItem.updated")}</span>
                    {formatDate(room.updated_at)}
                  </span>
                </div>
              </div>

              {/* 英雄选择信息 - 单独一行 */}
              {room.total_selected !== undefined && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Icon icon={Swords} preset="xs" />
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
                  <Icon icon={Edit} preset="sm" />
                </button>
              )}

              {/* 删除按钮 */}
              {user && room.owner_id === user.id && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
                  title={t("ui.components.roomItem.deleteRoom")}
                >
                  <Icon icon={Trash2} preset="sm" />
                </button>
              )}

              {/* 复制链接按钮 */}
              <button
                onClick={handleCopyRoomUrl}
                className="px-3 py-[6px] text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center gap-1"
                title={t("ui.components.roomItem.copyLink")}
              >
                <Icon icon={Link} preset="sm" />
                {t("ui.components.roomItem.copyLink")}
              </button>

              {/* 进入房间按钮 */}
              <button
                onClick={handleEnterClick}
                className="px-3 py-[7px] text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1"
              >
                <Icon icon={LogIn} preset="sm" />
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
              <Icon icon={Edit} preset="sm" />
            </button>
          )}

          {/* 删除按钮 */}
          {user && room.owner_id === user.id && (
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
              title={t("ui.components.roomItem.deleteRoom")}
            >
              <Icon icon={Trash2} preset="sm" />
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
            <Icon icon={User} preset="xs" />
            <span className="truncate">
              {room.owner?.username ||
                room.owner?.display_name ||
                room.owner?.email ||
                t("ui.components.roomItem.unknownUser")}
            </span>
          </div>
          <div className="flex items-center gap-1" title={t("ui.components.roomItem.createdAt")}>
            <Icon icon={Calendar} preset="xs" className="text-blue-400" />
            <span className="text-blue-400">{t("ui.components.roomItem.created")}</span>
            <span>{formatDate(room.created_at)}</span>
          </div>
          <div className="flex items-center gap-1" title={t("ui.components.roomItem.updatedAt")}>
            <Icon icon={Clock} preset="xs" className="text-green-400" />
            <span className="text-green-400">{t("ui.components.roomItem.updated")}</span>
            <span>{formatDate(room.updated_at)}</span>
          </div>
        </div>

        {/* 英雄选择信息 */}
        {room.total_selected !== undefined && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Icon icon={Swords} preset="xs" />
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
            className="px-3 py-[7px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <Icon icon={LogIn} preset="sm" />
            {t("ui.components.roomItem.enterRoom")}
          </button>

          <button
            onClick={handleCopyRoomUrl}
            className="px-3 py-[6px] text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <Icon icon={Link} preset="sm" />
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
