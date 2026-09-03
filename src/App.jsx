import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GISExplorer from './pages/GISExplorer.jsx';
import Explorer from './pages/Explorer.jsx';
import FloorMapping from './pages/FloorMapping.jsx';
import VerticalAnalysis from './pages/VerticalAnalysis.jsx';
import ConflictDetection from './pages/ConflictDetection.jsx';
import Registry from './pages/Registry.jsx';
import Timeline from './pages/Timeline.jsx';

const PAGES = {
  dashboard: Dashboard,
  'gis-explorer': GISExplorer,
  explorer: Explorer,
  'floor-mapping': FloorMapping,
  'vertical-analysis': VerticalAnalysis,
  'conflict-detection': ConflictDetection,
  registry: Registry,
  timeline: Timeline,
};

function Layout() {
  const { currentPage } = useApp();
  const Page = PAGES[currentPage] || Dashboard;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-cipher-bg text-cipher-text gis-grid-bg">
      <Navbar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          <div className="max-w-7xl mx-auto h-full min-h-0">
            <Page />
          </div>
        </main>
      </div>
    </div>
  );
}

function MainRoot() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRoot />
    </AuthProvider>
  );
}
