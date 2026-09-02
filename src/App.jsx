import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explorer from './pages/Explorer.jsx';
import FloorMapping from './pages/FloorMapping.jsx';
import VerticalAnalysis from './pages/VerticalAnalysis.jsx';
import ConflictDetection from './pages/ConflictDetection.jsx';
import Registry from './pages/Registry.jsx';
import Timeline from './pages/Timeline.jsx';

const PAGES = {
  dashboard: Dashboard,
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
      <WelcomeModal />
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto h-full">
            <Page />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
