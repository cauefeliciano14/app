import React from 'react';

interface TabBarProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => (
  <div style={{
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid rgba(255,255,255,0.06)',
    marginBottom: '20px',
  }}>
    {tabs.map(tab => {
      const active = tab.id === activeTab;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: active ? '2px solid #f97316' : '2px solid transparent',
            marginBottom: '-2px',
            color: active ? '#f1f5f9' : '#64748b',
            fontWeight: active ? 700 : 500,
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);
