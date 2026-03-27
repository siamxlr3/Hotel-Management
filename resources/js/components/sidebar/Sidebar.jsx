import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SidebarItem from './SidebarItem';
import { useGetHomeQuery } from '../../store/api/cmsApi';

/* ── Inline SVG icons — 18x18, stroke="currentColor" ── */
const SVG = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  reservation: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  room: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  checkin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10,17 15,12 10,7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  expense: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  staff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  cms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  setting: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
};

const navItems = [
  { icon: SVG.dashboard,   label: 'Dashboard',       path: '/'            },
  { icon: SVG.reservation, label: 'Reservation',      path: '/reservation' },
  { icon: SVG.room,        label: 'Room',             path: '/room'        },
  { icon: SVG.checkin,     label: 'Check-In & Out',   path: '/checkin'     },
  { icon: SVG.expense,     label: 'Expense',          path: '/expense'     },
  { icon: SVG.staff,       label: 'Staff Management', path: '/staff'       },
  { icon: SVG.cms,         label: 'CMS Management',   path: '/cms'         },
  { icon: SVG.setting,     label: 'Setting',          path: '/setting'     },
];

export default function Sidebar({ isOpen }) {
  const { data: homeData } = useGetHomeQuery();
  const hotel = homeData?.[0] || homeData?.data?.[0] || {};

  return (
    <div style={{
      height:        '100vh',
      display:       'flex',
      flexDirection: 'column',
      background:    '#2D3A2E',
      width:         isOpen ? '240px' : '64px',
      minWidth:      isOpen ? '240px' : '64px',
      transition:    'width 280ms cubic-bezier(0.4,0,0.2,1), min-width 280ms cubic-bezier(0.4,0,0.2,1)',
      willChange:    'width',
      overflow:      'hidden',
      flexShrink:    0,
      boxSizing:     'border-box',
      paddingTop:    '20px',
      paddingBottom: '20px',
    }}>

      {/* ── Logo ── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        paddingLeft:  '12px',
        paddingRight: '12px',
        marginBottom: '24px',
        flexShrink:   0,
        overflow:     'hidden',
        height:       '40px',
      }}>
        <div style={{
          width:          '40px',
          height:         '40px',
          minWidth:       '40px',
          borderRadius:   '10px',
          background:     '#A8D5A2',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          overflow:       'hidden',
        }}>
          {hotel.logo_url ? (
            <img 
              src={hotel.logo_url} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span style={{ color: '#1A2E1B', fontSize: '18px', fontWeight: 900, lineHeight: 1, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {(hotel.hotel_name || 'H')[0].toUpperCase()}
            </span>
          )}
        </div>
        <span style={{
          color:         '#FFFFFF',
          fontWeight:    700,
          fontSize:      '16px',
          whiteSpace:    'nowrap',
          fontFamily:    '"Plus Jakarta Sans", sans-serif',
          opacity:       isOpen ? 1 : 0,
          visibility:    isOpen ? 'visible' : 'hidden',
          transition:    'opacity 150ms ease, visibility 150ms',
          display:       isOpen ? 'block' : 'none',
          lineHeight:    1.2,
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          maxWidth:      '150px',
        }}>
          {hotel.hotel_name || 'Hotel Management'}
        </span>
      </div>

      {/* ── Nav ── */}
      <nav style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           '2px',
        flex:          1,
        paddingLeft:   '8px',
        paddingRight:  '8px',
        overflow:      'hidden',
      }}>
        {navItems.map(item => (
          <SidebarItem key={item.path} {...item} isOpen={isOpen} />
        ))}
      </nav>

      {/* ── Bottom preview — only shown when expanded ── */}
      {isOpen && (
        <div style={{ margin: '12px 8px 0', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            height:     '72px',
            background: 'linear-gradient(to top, #1A2E1B, #3D5C3E)',
            display:    'flex',
            alignItems: 'flex-end',
            padding:    '10px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: '"DM Sans", sans-serif' }}>Hotel Preview</span>
          </div>
        </div>
      )}
    </div>
  );
}
