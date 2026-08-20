import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import FollowUps from './pages/FollowUps.jsx';
import Offers from './pages/Offers.jsx';
import Clients from './pages/Clients.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/clients" element={<Clients />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}

export default App;
