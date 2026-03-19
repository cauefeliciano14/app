import React from 'react';

interface CurrencySectionProps {
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number };
  onCurrencyChange: (coin: string, delta: number) => void;
  onCurrencySet: (coin: string, value: number) => void;
}

const coins = [
  { name: 'Platina', abbr: 'PL', color: '#e2e8f0', icon: '🪙', desc: '= 10 PO', key: 'pp' },
  { name: 'Ouro', abbr: 'PO', color: '#facc15', icon: '🪙', desc: '= 10 PP', key: 'gp' },
  { name: 'Electro', abbr: 'PE', color: '#94a3b8', icon: '🪙', desc: '= 5 PP', key: 'ep' },
  { name: 'Prata', abbr: 'PP', color: '#cbd5e1', icon: '🪙', desc: '= 10 PC', key: 'sp' },
  { name: 'Cobre', abbr: 'PC', color: '#b45309', icon: '🪙', desc: '1/100 PO', key: 'cp' },
];

export const CurrencySection: React.FC<CurrencySectionProps> = ({ currency, onCurrencyChange, onCurrencySet }) => {
  const totalGP = () => {
    const totalCP = (currency.pp * 1000) + (currency.gp * 100) + (currency.ep * 50) + (currency.sp * 10) + currency.cp;
    return (totalCP / 100).toFixed(2);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', padding: '12px 20px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '10px' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total em Peças de Ouro</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '1.8rem' }}>🪙</span>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f97316' }}>{totalGP()}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>PO</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '400px' }}>
        {coins.map(coin => (
          <div key={coin.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#13141b', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: coin.color, fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{coin.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1rem' }}>{coin.name} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>({coin.abbr})</span></span>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{coin.desc}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => onCurrencyChange(coin.key, -1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', cursor: 'pointer' }}>-</button>
              <input
                type="number"
                value={(currency as any)[coin.key]}
                onChange={(e) => onCurrencySet(coin.key, Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '60px', height: '32px', textAlign: 'center', background: '#0d0b14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#f1f5f9', fontWeight: 600 }}
              />
              <button onClick={() => onCurrencyChange(coin.key, 1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
