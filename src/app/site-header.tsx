import Link from "next/link";
import styles from "./site-header.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.title} href="/">ApplyTracker</Link>
        <p>クラウドソーシングの案件応募を記録・管理するツール</p>
      </div>
    </header>
  );
}
