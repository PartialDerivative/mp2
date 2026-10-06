import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link;

export default function NavBar() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          Art Institute of Chicago <span className={styles.sub}>Collection Explorer</span>
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/" end className={linkClass}>Search</NavLink>
          <NavLink to="/gallery" className={linkClass}>Gallery</NavLink>
        </nav>
      </div>
    </header>
  );
}