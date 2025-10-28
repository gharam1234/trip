"use client";

import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";
import { useLinkRouting } from "./hooks/index.link.routing.hook";
import { useAreaVisibility } from "./hooks/index.area.hook";
import { useLayoutAuth } from "./hooks/index.auth.hook";
import { useActiveMenu } from "./hooks/index.active.menu.hook";
import { Button } from "../components/button";

type LayoutWireframeProps = {
  children: React.ReactNode;
};

export default function LayoutWireframe({ children }: LayoutWireframeProps) {
  const { handleLogoClick, navigateTo } = useLinkRouting();
  const { showBanner, showNavigation, routeKey } = useAreaVisibility();
  const { isLoggedIn, userName, handleLoginClick, handleLogoutClick, handleDropdownToggle } = useLayoutAuth();
  const { activeMenuId, menuItems } = useActiveMenu();

  // 드롭다운 메뉴 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className={styles.container} data-testid="layout-container" data-route-key={routeKey} data-show-banner={showBanner} data-show-navigation={showNavigation}>
      {/* 네비게이션 영역: 1920x80 (내부 1280 정렬) */}
      <nav className={styles.navigation} style={{ display: showNavigation ? 'flex' : 'none' }}>
        <div className={styles.navigationInner}>
          {/* 좌측: 로고 + 탭 */}
          <div className={styles.navLeftGroup}>
            <Link href="/boards">
              <Image 
                src="/images/logo.png" 
                alt="logo" 
                width={51.52} 
                height={32} 
                className={styles.logoLink}
                data-testid="logo-link"
                onClick={handleLogoClick}
              />
            </Link>
            <div className={styles.tapGroup}>
              {menuItems.map((menu) => (
                <button
                  key={menu.id}
                  className={`${styles.tapItem} ${activeMenuId === menu.id ? styles.tapActive : ''}`}
                  type="button"
                  onClick={() => navigateTo(menu.routeKey)}
                  data-testid={`menu-${menu.id}`}
                >
                  <span className={activeMenuId === menu.id ? styles.tapLabelPrimary : styles.tapLabel}>
                    {menu.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 우측: 인증 상태에 따른 UI */}
          <div className={styles.navRightGroup}>
            {isLoggedIn ? (
              // 로그인 상태: 프로필 영역
              <div className={styles.profileArea} ref={dropdownRef}>
                <div className={styles.profileImage}>
                  <Image 
                    src="/icons/profile.png" 
                    alt="프로필 이미지" 
                    width={40} 
                    height={40}
                    className={styles.profileImg}
                  />
                </div>
                <span className={styles.userName} data-testid="user-name">{userName}</span>
                <div 
                  className={styles.dropdownIcon}
                  data-testid="user-dropdown"
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    handleDropdownToggle();
                  }}
                >
                  <Image 
                    src="/icons/down_arrow.png" 
                    alt="드롭다운 화살표" 
                    width={24} 
                    height={24}
                  />
                </div>
                
                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div 
                      className={styles.dropdownMenuItem}
                      onClick={() => {
                        handleLogoutClick();
                        setIsDropdownOpen(false);
                      }}
                    >
                      로그아웃
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 비로그인 상태: 로그인 버튼
              <Button
                variant="primary"
                size="small"
                style={{ width: '93px' }}
                onClick={handleLoginClick}
                data-testid="layout-login-button"
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* 배너 영역: 1920x516 (react-slick 기반 캐러셀) */}
      <section className={styles.banner} aria-label="main visual banner" style={{ display: showBanner ? 'block' : 'none' }} data-testid="banner-section">
        <Slider
          dots={true}
          infinite={true}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
          autoplay={true}
          autoplaySpeed={3000}
          arrows={true}
        >
          <div>
            <img src="/images/banner1.png" alt="배너 1" style={{ width: '100%', height: '516px', objectFit: 'cover' }} />
          </div>
          <div>
            <img src="/images/banner2.png" alt="배너 2" style={{ width: '100%', height: '516px', objectFit: 'cover' }} />
          </div>
          <div>
            <img src="/images/banner3.png" alt="배너 3" style={{ width: '100%', height: '516px', objectFit: 'cover' }} />
          </div>
        </Slider>
      </section>

      {/* gap 영역: 1920x40 */}
      <div className={styles.gap} />

      {/* children 영역: 1920 x auto */}
      <main className={styles.content}>{children}</main>
    </div>
  );
}


