import { NavLink } from 'react-router-dom';

export default function SidebarItem({ icon, label, path, isOpen }) {
  return (
    <NavLink
      to={path}
      title={!isOpen ? label : ''}
      style={({ isActive }) => ({
        display:        'flex',
        alignItems:     'center',
        borderRadius:   '10px',
        cursor:         'pointer',
        textDecoration: 'none',
        padding:        '10px 12px',
        gap:            isOpen ? '12px' : '0px',
        background:     isActive ? '#A8D5A2' : 'transparent',
        color:          isActive ? '#1A2E1B' : 'rgba(255,255,255,0.75)',
        transition:     'all 280ms cubic-bezier(0.4,0,0.2,1)',
        overflow:       'hidden',
      })}
      onMouseEnter={e => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      }}
      onMouseLeave={e => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Icon — fixed 20x20, always visible */}
      <span style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        width:          '20px',
        height:         '20px',
        minWidth:       '20px',
      }}>
        {icon}
      </span>

      {/* Label — fade + slide out on collapse, no layout ghosting */}
      <span style={{
        fontSize:      '13px',
        fontWeight:    500,
        whiteSpace:    'nowrap',
        fontFamily:    '"DM Sans", sans-serif',
        opacity:       isOpen ? 1 : 0,
        transform:     isOpen ? 'translateX(0)' : 'translateX(-10px)',
        transition:    'opacity 200ms ease, transform 200ms ease',
        visibility:    isOpen ? 'visible' : 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
        marginLeft:    isOpen ? '0px' : '-20px',
      }}>
        {label}
      </span>
    </NavLink>
  );
}
