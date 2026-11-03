import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export default function SafeWalk() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('5511999998888'); // Telefone configurável

  // Regra de Negócio: Capturar localização via GPS com try/catch
  const triggerPanicButton = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Pedir permissões do SO Android
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location !== 'granted' && permResult.location !== 'coarse') {
        throw new Error('Permissão de localização negada pelo usuário.');
      }

      // 2. Capturar coordenadas com timeout e alta precisão
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000 // 10 segundos timeout
      });

      const { latitude, longitude, accuracy } = position.coords;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      setCoords({
        latitude,
        longitude,
        accuracy,
        mapsUrl,
        timestamp: new Date(position.timestamp).toLocaleTimeString('pt-BR')
      });
    } catch (err) {
      setErrorMsg(err.message || 'Erro de timeout ou falha na captura do GPS.');
    } finally {
      setLoading(false);
    }
  };

  // Envio de Alerta via WhatsApp
  const sendWhatsAppAlert = () => {
    if (!coords) return;
    const message = encodeURIComponent(
      `🚨 *ALERTA DE EMERGÊNCIA - SAFEWALK*\n\n` +
      `Preciso de ajuda urgente no campus!\n` +
      `📍 Minha Localização: ${coords.mapsUrl}\n` +
      `🌐 Lat: ${coords.latitude}, Lng: ${coords.longitude}\n` +
      `🎯 Precisão: ~${Math.round(coords.accuracy)}m (${coords.timestamp})`
    );
    window.open(`https://wa.me/${emergencyPhone}?text=${message}`, '_blank');
  };

  // Envio de Alerta via SMS NATIVO
  const sendSMSAlert = () => {
    if (!coords) return;
    const message = encodeURIComponent(
      `🚨 SOCORRO! Preciso de ajuda no campus. Minha localização: ${coords.mapsUrl}`
    );
    window.location.href = `sms:${emergencyPhone}?body=${message}`;
  };

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlignment: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#dc2626', margin: '0 0 5px 0' }}>🚨 SafeWalk</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          Botão de Pânico Universitário (Aluno 17)
        </p>
      </header>

      {/* Configuração do Contato de Emergência */}
      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          Contato de Emergência (DDI + DDD + Número):
        </label>
        <input
          type="text"
          value={emergencyPhone}
          onChange={(e) => setEmergencyPhone(e.target.value)}
          placeholder="Ex: 5511999998888"
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Botão Principal de Pânico */}
      <button
        onClick={triggerPanicButton}
        disabled={loading}
        style={{
          width: '100%',
          padding: '20px',
          backgroundColor: loading ? '#94a3b8' : '#dc2626',
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
        }}
      >
        {loading ? 'OBTENDO COORDENADAS GPS...' : '🆘 DISPARAR ALERTA DE EMERGÊNCIA'}
      </button>

      {/* Exibição de Erros */}
      {errorMsg && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px' }}>
          ⚠️ <strong>Erro:</strong> {errorMsg}
        </div>
      )}

      {/* Resultado da Geolocalização e Ações */}
      {coords && (
        <div style={{ marginTop: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#166534' }}>✅ Localização Capturada</h3>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Latitude:</strong> {coords.latitude}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Longitude:</strong> {coords.longitude}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Precisão:</strong> ~{Math.round(coords.accuracy)} metros</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748b' }}>Horário: {coords.timestamp}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
            {/* Direct Google Maps Link */}
            <a
              href={coords.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px',
                background: '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              🗺️ Abrir no Google Maps
            </a>

            {/* Disparo de WhatsApp */}
            <button
              onClick={sendWhatsAppAlert}
              style={{
                padding: '10px',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💬 Enviar via WhatsApp
            </button>

            {/* Disparo de SMS */}
            <button
              onClick={sendSMSAlert}
              style={{
                padding: '10px',
                background: '#475569',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📱 Enviar via SMS Nativo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}