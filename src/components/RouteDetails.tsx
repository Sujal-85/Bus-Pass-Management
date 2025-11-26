import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { busData } from '../data/busData';
import { busMeta } from '../data/busMeta';
import LoaderOverlay from './LoaderOverlay';

// NOTE: You must add your Google Maps API key to an env var and load the script in index.html or via a loader.
// For simplicity, we will just render the encoded data and provide a link to Google Maps directions.

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24 },
  hero: { background: 'linear-gradient(135deg, #02172d, #1b2f52)', color: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heroTitle: { margin: 0, fontSize: 22, fontWeight: 700 },
  heroSub: { margin: 0, opacity: 0.9 },
  backLink: { color: '#9ecbff', textDecoration: 'none', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16 },
  gridSingle: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  cardHeader: { background: '#f7f8fb', borderBottom: '1px solid #edf0f4', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' },
  cardBody: { padding: 16 },
  select: { padding: '8px 10px', borderRadius: 8, border: '1px solid #dce3ea', background: '#fff' },
  pillRow: { display: 'flex', gap: 8, overflowX: 'auto' as const, paddingBottom: 6, whiteSpace: 'nowrap' as const },
  pill: { padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 999, background: '#f8fafc', color: '#0e3e78', textDecoration: 'none', whiteSpace: 'nowrap' as const },
  actionsRow: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginTop: 12 },
  btnPrimary: { padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  btnGhost: { padding: '8px 12px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' },
  statList: { listStyle: 'none', margin: 0, padding: 0, lineHeight: 1.9, color: '#334155' },
  table: { width: '100%', borderCollapse: 'collapse' as const, borderTop: '1px solid #eef2f6' },
  th: { textAlign: 'left' as const, padding: 10, background: '#f7f8fb', borderBottom: '1px solid #eef2f6', color: '#475569', fontWeight: 700 },
  td: { padding: 10, borderBottom: '1px solid #f1f5f9', color: '#475569' },
  badge: { padding: '2px 8px', background: '#eff6ff', color: '#1e40af', borderRadius: 999, border: '1px solid #dbeafe', display: 'inline-block' },
  mapFrame: { width: '100%', height: 360, border: 0, borderRadius: 10 },
};

const RouteDetails: React.FC = () => {
  const params = useParams();
  const routeName = (params.routeName || '').toLowerCase();

  const route = useMemo(() => busData.find(r => r.name.toLowerCase() === routeName), [routeName]);
  const meta = busMeta[routeName];

  // Updated starting address as requested (AITRC Vita full address)
  const startLabel = 'Adarsh Institute of Technology & Research Centre (AITRC) Vita, A/P- Khambale(Bha.), Near Karve MIDC, Sangli Road, Tal-Khanapur, Vita, Sangli, Maharashtra - 415311, India';

  // Ensure hooks are called before any conditional return
  const initialStop = route && route.stops.length > 0 ? route.stops[0].name : '';
  const [selectedStop, setSelectedStop] = useState<string>(initialStop);

  // If selectedStop wasn't available when component mounted, set it when route resolves
  React.useEffect(() => {
    if (!selectedStop && route && route.stops.length > 0) {
      setSelectedStop(route.stops[0].name);
    }
  }, [route, selectedStop]);

  // Map loading state (must be before any conditional returns)
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  React.useEffect(() => {
    // show loader again when destination changes
    setMapLoading(true);
  }, [selectedStop]);

  if (!route) {
    return <div style={{ padding: 24 }}>Route not found.</div>;
  }

  const ensureSangli = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('sangli') ? name : `${name}, Sangli, Maharashtra`;
  };
  const googleMapsUrl = (destination: string) => {
    const dest = ensureSangli(destination);
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLabel)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
  };
  const googleEmbedUrl = (place: string) => `https://www.google.com/maps?q=${encodeURIComponent(ensureSangli(place))}&output=embed`;
  const currency = (n: number) => `₹${(n || 0).toLocaleString()}`;


  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div>
          <h2 style={styles.heroTitle}>{route.name.toUpperCase()} Route</h2>
          <p style={styles.heroSub}>Start: {startLabel} • Total Stops: {route.stops.length}</p>
        </div>
        <div>
          <Link to="/Dashboard" style={styles.backLink}>← Back</Link>
        </div>
      </div>

      <div style={styles.grid}>
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Route Map Preview</h3>
              <select style={styles.select} value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)}>
                {route.stops.map(s => (
                  <option key={s.name} value={s.name}>{s.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div style={styles.cardBody}>
              <div style={{ position: 'relative' }}>
                <LoaderOverlay show={mapLoading} message="Loading map…" fullscreen={false} absolute />
                <iframe
                  title="map"
                  style={styles.mapFrame}
                  key={selectedStop}
                  src={googleEmbedUrl(`${startLabel} to ${ensureSangli(selectedStop)}`)}
                  loading="lazy"
                  onLoad={() => setMapLoading(false)}
                />
              </div>
              <div style={styles.actionsRow}>
                <a href={googleMapsUrl(selectedStop)} target="_blank" rel="noreferrer" style={{ ...styles.btnPrimary as React.CSSProperties, textDecoration: 'none' }}>Open Directions</a>
                <a href={googleEmbedUrl(selectedStop)} target="_blank" rel="noreferrer" style={{ ...styles.btnGhost as React.CSSProperties, textDecoration: 'none' }}>Open Stop on Map</a>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Stops</h3>
              <span style={{ color: '#64748b' }}>{route.stops.length} total</span>
            </div>
            <div style={styles.cardBody}>
              {/* <div className="hide-scrollbar" style={styles.pillRow}>
                {route.stops.map(s => (
                  <a key={s.name} href={googleMapsUrl(s.name)} target="_blank" rel="noreferrer" style={styles.pill}>{s.name.toUpperCase()}</a>
                ))}
              </div> */}
              <div style={{ marginTop: 12 }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Stop</th>
                      <th style={styles.th}>Semester</th>
                      <th style={styles.th}>Yearly</th>
                      <th style={styles.th}>Map</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.stops.map(s => (
                      <tr key={s.name}>
                        <td style={styles.td}>{s.name.toUpperCase()}</td>
                        <td style={styles.td}><span style={styles.badge}>{currency(s.semester)}</span></td>
                        <td style={styles.td}><span style={styles.badge}>{currency(s.yearly)}</span></td>
                        <td style={styles.td}><a href={googleMapsUrl(s.name)} target="_blank" rel="noreferrer">View</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Bus & Driver</h3></div>
            <div style={styles.cardBody}>
              {meta ? (
                <ul style={styles.statList}>
                  <li><b>Bus Number:</b> {meta.busNumber}</li>
                  <li><b>Driver:</b> {meta.driverName}</li>
                  <li><b>Phone:</b> {meta.driverPhone}</li>
                  <li><b>Capacity:</b> {meta.capacity}</li>
                </ul>
              ) : (
                <p style={{ color: '#64748b' }}>No metadata available.</p>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Route Info</h3></div>
            <div style={styles.cardBody}>
              <ul style={styles.statList}>
                <li><b>From:</b> {route.from}</li>
                <li><b>Start:</b> {startLabel}</li>
                <li><b>Stops:</b> {route.stops.length}</li>
              </ul>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Students</h3></div>
            <div style={styles.cardBody}>
              <p style={{ color: '#64748b' }}>This can list students on this route by filtering backend data by busRoute and routeTo.</p>
              <button style={styles.btnGhost}>View Students</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;


