import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export default function App() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [phone, setPhone] = useState('5511999998888');

  // Disparo e captura de coordenadas GPS
  const triggerPanic = async () => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      // 1. Solicita as permissões do SO Android
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location !== 'granted' && permResult.location !== 'coarse') {
        throw new Error('Permissão de localização negada pelo usuário.');
      }

      // 2. Captura do GPS com Alta Precisão e Timeout
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000 // 10s timeout
      });

      const { latitude, longitude, accuracy } = position.coords;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      setCoords({
        latitude,
        longitude,
        accuracy,
        mapsUrl,
        time: new Date(position.timestamp).toLocaleTimeString('pt-BR')
      });
    } catch (err) {
      setErrorMsg(err.message || 'Erro de conexão ou timeout do GPS.');
    } finally {
      setLoading(false);
    }
  };

  // Envio WhatsApp
  const sendWhatsApp = () => {
    if (!coords) return;
    const msg = encodeURIComponent(
      `🚨 *ALERTA SAFEWALK - SOCORRO!*\n\n` +
      `Estou em situação de emergência no campus.\n` +
      `📍 *Minha Localização:* ${coords.mapsUrl}\n` +
      `🌐 Lat: ${coords.latitude}, Lng: ${coords.longitude}\n` +
      `🎯 Precisão: ~${Math.round(coords.accuracy)}m às ${coords.time}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Envio SMS
  const sendSMS = () => {
    if (!coords) return;
    const msg = encodeURIComponent(
      `🚨 SOCORRO SAFEWALK! Preciso de ajuda urgente no campus. Minha localização: ${coords.mapsUrl}`
    );
    window.location.href = `sms:${phone}?body=${msg}`;
  };

  return (
    <div style={styles.container}>
      {/* Header do App */}
      <header style={styles.header}>
        <div style={styles.badge}>ALUNO 17 • SAÚDE</div>
        <h1 style={styles.title}>🛡️ SafeWalk</h1>
        <p style={styles.subtitle}>Sistema de Alerta e Pânico Universitário</p>
      </header>

      {/* Input de Contato de Emergência */}
      <div style={styles.cardInput}>
        <label style={styles.label}>📞 Contato de Emergência (Com DDD):</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ex: 5511999998888"
          style={styles.input}
        />
      </div>

      {/* Botão Principal de Pânico */}
      <div style={styles.panicContainer}>
        <button
          onClick={triggerPanic}
          disabled={loading}
          style={{
            ...styles.panicButton,
            backgroundColor: loading ? '#94a3b8' : '#dc2626',
            boxShadow: loading ? 'none' : '0 10px 25px rgba(220, 38, 38, 0.4)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '6px' }}>
            {loading ? '⏳' : '🆘'}
          </div>
          {loading ? 'OBTENDO COORDENADAS...' : 'DISPARAR BOTÃO DE PÂNICO'}
        </button>
      </div>

      {/* Mensagem de Erro / Timeout */}
      {errorMsg && (
        <div style={styles.errorBox}>
          ⚠️ <strong>Aviso:</strong> {errorMsg}
        </div>
      )}

      {/* Card de Coordenadas Capturadas */}
      {coords && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <span style={styles.liveDot}>●</span>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#166534' }}>Localização Capturada</h3>
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>{coords.time}</span>
          </div>

          <div style={styles.gridCoords}>
            <div style={styles.coordItem}>
              <span style={styles.coordLabel}>LATITUDE</span>
              <span style={styles.coordVal}>{coords.latitude}</span>
            </div>
            <div style={styles.coordItem}>
              <span style={styles.coordLabel}>LONGITUDE</span>
              <span style={styles.coordVal}>{coords.longitude}</span>
            </div>
          </div>

          <p style={styles.accuracyText}>
            🎯 <strong>Precisão do GPS:</strong> ~{Math.round(coords.accuracy)} metros
          </p>

          {/* Botões de Ação Exigidos */}
          <div style={styles.actionGroup}>
            <a
              href={coords.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnMaps}
            >
              🗺️ Abrir no Google Maps
            </a>

            <button onClick={sendWhatsApp} style={styles.btnWsp}>
              💬 Enviar Alerta via WhatsApp
            </button>

            <button onClick={sendSMS} style={styles.btnSms}>
              📱 Enviar SMS de Socorro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilização Mobile Embutida
const styles = {
  container: {
    maxWidth: '450px',
    margin: '0 auto',
    padding: '20px 16px',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ef4444',
    letterSpacing: '1px'
  },
  title: {
    margin: '8px 0 2px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff'
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#94a3b8'
  },
  cardInput: {
    backgroundColor: '#1e293b',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #334155'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  panicContainer: {
    marginBottom: '20px'
  },
  panicButton: {
    width: '100%',
    padding: '24px 16px',
    borderRadius: '16px',
    border: 'none',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  errorBox: {
    backgroundColor: '#451a03',
    border: '1px solid #78350f',
    color: '#fde68a',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  resultCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #166534',
    borderRadius: '14px',
    padding: '16px'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px'
  },
  liveDot: {
    color: '#22c55e',
    fontSize: '18px'
  },
  gridCoords: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '10px'
  },
  coordItem: {
    backgroundColor: '#0f172a',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  coordLabel: {
    display: 'block',
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 'bold'
  },
  coordVal: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#38bdf8'
  },
  accuracyText: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '0 0 16px 0'
  },
  actionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  btnMaps: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  btnWsp: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  },
  btnSms: {
    backgroundColor: '#475569',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  }
};