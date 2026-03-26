import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store }           from './store/store';
import DashboardLayout     from './layouts/DashboardLayout';
import VibrantBackground   from './components/VibrantBackground';
import Dashboard           from './pages/Dashboard';
import ReservationPage     from './pages/ReservationPage';
import RoomPage            from './pages/RoomPage';
import CheckInPage         from './pages/CheckInPage';
import ExpensePage         from './pages/ExpensePage';
import StaffPage           from './pages/StaffPage';
import CMSPage             from './pages/CMSPage';
import SettingPage         from './pages/SettingPage';
import Home                from './pages/Home';
import '../css/app.css';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <VibrantBackground />
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<Home />} />

          {/* Protected/Dashboard Routes */}
          <Route path="/*" element={
            <DashboardLayout>
              <Routes>
                <Route path="/"            element={<Dashboard />} />
                <Route path="/reservation" element={<ReservationPage />} />
                <Route path="/room"        element={<RoomPage />} />
                <Route path="/checkin"     element={<CheckInPage />} />
                <Route path="/expense"     element={<ExpensePage />} />
                <Route path="/staff"       element={<StaffPage />} />
                <Route path="/cms"         element={<CMSPage />} />
                <Route path="/setting"     element={<SettingPage />} />
              </Routes>
            </DashboardLayout>
          } />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

if (document.getElementById('app')) {
  const root = createRoot(document.getElementById('app'));
  root.render(<App />);
}
