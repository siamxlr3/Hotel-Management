import Sidebar        from '../components/sidebar/Sidebar';
import Topbar         from '../components/topbar/Topbar';
import { useSidebar } from '../hooks/useDashboard';

export default function DashboardLayout({ children }) {
  const { isOpen } = useSidebar();

  return (
    <div style={{
      display:  'flex',
      height:   '100vh',
      width:    '100vw',
      overflow: 'hidden',
    }}>
      {/* Sidebar owns its own width — no wrapper needed */}
      <Sidebar isOpen={isOpen} />

      {/* Main content */}
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        flex:          1,
        minWidth:      0,
        overflow:      'hidden',
        height:        '100vh',
      }}>
        <Topbar />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
