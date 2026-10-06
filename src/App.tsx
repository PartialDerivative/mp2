import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <NavBar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/artworks/:id" element={<DetailView />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;