import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
