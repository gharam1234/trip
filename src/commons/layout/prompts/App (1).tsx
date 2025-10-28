import UserInfo from "./imports/UserInfo";
import styles from "./App.module.css";

export default function App() {
  const recentActivities = [
    { label: "최근 접속", value: "2025년 10월 28일" },
    { label: "사용 기간", value: "3개월" },
    { label: "누적 포인트", value: "156,000 P" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>마이페이지</h1>
        <p className={styles.subtitle}>회원 정보 및 활동 내역을 확인하세요</p>
      </div>

      <div className={styles.userInfoWrapper}>
        <UserInfo />
      </div>

      <div className={styles.contentSection}>
        <h3>활동 정보</h3>
        {recentActivities.map((activity, index) => (
          <div key={index} className={styles.activityItem}>
            <span className={styles.activityLabel}>{activity.label}</span>
            <span className={styles.activityValue}>{activity.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
