"use client";

import React from "react";
import styles from "./styles.module.css";

type UserMenuProps = {
  isOpen?: boolean;
  onClose?: () => void;
  userName?: string;
  userPoints?: number;
  onChargePoints?: () => void;
  onLogout?: () => void;
  showProfile?: boolean;
};

export default function UserMenu({
  isOpen = false,
  onClose,
  userName = "사용자",
  userPoints = 23000,
  onChargePoints,
  onLogout,
  showProfile = true,
}: UserMenuProps) {
  if (!isOpen) return null;

  const formatPoints = (points: number) => {
    return points.toLocaleString("ko-KR");
  };

  return (
    <div className={styles.container} data-testid="user-menu-container">
      {/* Profile Section - 조건부 렌더링 */}
      {showProfile && (
        <>
          <div className={styles.profileSection} data-testid="user-menu-profile">
            <div className={styles.profileImage} data-testid="user-menu-profile-image" />
            <span className={styles.profileName} data-testid="user-menu-name">
              {userName}
            </span>
            <svg className={styles.profileArrow} width="8" height="5" viewBox="0 0 8 5" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M1 1.5L4 4L7 1.5" />
            </svg>
          </div>
          <div className={styles.divider} />
        </>
      )}

      {/* Points Section */}
      <div className={styles.pointsSection} data-testid="user-menu-points">
        <svg className={styles.pointsIcon} width="18" height="17" viewBox="0 0 18 17" fill="currentColor" data-testid="user-menu-points-icon">
          <path d="M9 1L11 6H17L12.5 10L14.5 16L9 11.5L3.5 16L5.5 10L1 6H7L9 1Z" />
        </svg>
        <span className={styles.pointsValue} data-testid="user-menu-points-value">
          {formatPoints(userPoints)}
        </span>
        <span className={styles.pointsUnit} data-testid="user-menu-points-unit">
          P
        </span>
      </div>

      <div className={styles.divider} />

      {/* Menu Items Section */}
      <div className={styles.menuItemsSection} data-testid="user-menu-items">
        <button
          className={styles.menuItem}
          type="button"
          onClick={onChargePoints}
          data-testid="user-menu-charge-button"
        >
          <svg className={styles.menuItemIcon} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1V13M2 7H14M4 3H12C13.1 3 14 3.9 14 5V11C14 12.1 13.1 13 12 13H4C2.9 13 2 12.1 2 11V5C2 3.9 2.9 3 4 3Z" />
          </svg>
          <span>포인트 충전</span>
        </button>

        <button
          className={styles.menuItem}
          type="button"
          onClick={onLogout}
          data-testid="user-menu-logout-button"
        >
          <svg className={styles.menuItemIcon} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H6M10 11L14 8M14 8L10 5M14 8H6" />
          </svg>
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
