export default function PagePlaceholder({ title, description, color = '#A8D5A2', icon }) {
  return (
    <div style={{
      flex:          1,
      overflowY:     'auto',
      padding:       '24px',
      display:       'flex',
      flexDirection: 'column',
      gap:           '20px',
    }}>
      {/* Page header */}
      <div style={{
        background:   '#fff',
        borderRadius: '16px',
        padding:      '28px 32px',
        border:       '1px solid #F0F0F0',
        display:      'flex',
        alignItems:   'center',
        gap:          '20px',
      }}>
        <div style={{
          width:          '56px',
          height:         '56px',
          minWidth:       '56px',
          borderRadius:   '14px',
          background:     color + '33',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          '#2D5A30',
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{
            margin:     0,
            fontSize:   '22px',
            fontWeight: 700,
            color:      '#1A1A1A',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}>{title}</h1>
          <p style={{
            margin:     '4px 0 0',
            fontSize:   '13px',
            color:      '#9CA3AF',
            fontFamily: '"DM Sans", sans-serif',
          }}>{description}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button style={{
            background:   color,
            color:        '#1A2E1B',
            border:       'none',
            borderRadius: '10px',
            padding:      '10px 20px',
            fontSize:     '13px',
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   '"DM Sans", sans-serif',
          }}>
            + Add New
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{
        background:     '#fff',
        borderRadius:   '16px',
        padding:        '32px',
        border:         '1px solid #F0F0F0',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '340px',
        gap:            '16px',
      }}>
        <div style={{
          width:          '72px',
          height:         '72px',
          borderRadius:   '20px',
          background:     color + '22',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          opacity:        0.6,
        }}>
          {icon}
        </div>
        <p style={{
          fontSize:   '15px',
          fontWeight: 600,
          color:      '#374151',
          margin:     0,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}>
          {title} module coming soon
        </p>
        <p style={{
          fontSize:  '13px',
          color:     '#9CA3AF',
          margin:    0,
          fontFamily:'"DM Sans", sans-serif',
          textAlign: 'center',
          maxWidth:  '320px',
        }}>
          This section is under development. The full {title.toLowerCase()} management
          features will be available here.
        </p>
      </div>
    </div>
  );
}
