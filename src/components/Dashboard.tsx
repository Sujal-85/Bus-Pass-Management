import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { busData } from '../data/busData';
import LoaderOverlay from './LoaderOverlay';

type Section = 'dashboard' | 'students' | 'route' | 'payment';

type CourseFilter = 'all' | 'diploma' | 'engineering' | 'pharmacy' | 'iti';

type BusPassRecord = {
  formType: string;
  date: string;
  academicYear: string;
  studentId: string;
  studentName: string;
  mobileNo: string;
  EmailId?: string;
  department?: string;
  class?: string;
  semester?: string;
  busRoute: string;
  routeTo: string;
  passType: 'monthly' | 'semester' | 'yearly';
  passAmount: number;
  receivedAmount: number;
  pendingAmount?: number;
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#dedee8' },
  sidebar: { width: 250, background: 'linear-gradient(535deg, #010a1a, #7b88ae)', color: '#fff', display: 'flex', flexDirection: 'column' },
  navItem: { display: 'block', padding: '20px 30px', color: '#fff', textDecoration: 'none' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const },
  topBar: { background: '#02172d', padding: '10px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  secondaryBar: { background: '#404043', padding: '10px 32px' },
  chips: { display: 'flex', gap: 12, flexWrap: 'wrap' as const },
  chip: { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 16px', textDecoration: 'none' },
  content: { padding: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  statCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 },
  tablesCard: { background: '#faf9f9', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  cardHeader: { background: '#484646', padding: '16px 20px', color: '#fff' },
  cardBody: { padding: 16 },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#dadde1' },
  th: { background: '#484646', padding: 12, textAlign: 'left' as const, color: '#fcfdfe', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' as const },
  td: { padding: 12, borderBottom: '1px solid #f3f4f6', color: '#6b7280' },
  search: { padding: '9px 18px', borderRadius: 5, border: '1px solid #b39696', backgroundColor: '#eceaea' },
  sideButton: { display: 'block', width: '100%', textAlign: 'left' as const, background: 'transparent', border: 'none', color: '#fff', padding: '20px 30px', cursor: 'pointer' },
  sideButtonActive: { background: 'rgba(255,255,255,0.12)' },
};

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [records, setRecords] = useState<BusPassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [routeSearch, setRouteSearch] = useState<string>('');
  const [paymentSearch, setPaymentSearch] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/bus-pass');
        const data: BusPassRecord[] = await res.json();
        if (!isMounted) return;
        setRecords(Array.isArray(data) ? data : []);
      } catch (e) {
        setRecords([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalStudents = records.length;
    let activePasses = 0;
    const routeSet = new Set<string>();
    let pendingPayments = 0;

    for (const item of records) {
      const validUntil = new Date(item.date);
      const months = item.passType === 'monthly' ? 1 : item.passType === 'semester' ? 6 : 12;
      validUntil.setMonth(validUntil.getMonth() + months);
      if (new Date() <= validUntil) activePasses += 1;
      routeSet.add(`${item.busRoute}-${item.routeTo}`);
      const pending = typeof item.pendingAmount === 'number' ? item.pendingAmount : Math.max(0, (item.passAmount || 0) - (item.receivedAmount || 0));
      pendingPayments += pending;
    }
    return { totalStudents, activePasses, totalRoutes: routeSet.size, pendingPayments };
  }, [records]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return records.filter(r => {
      const inCourse = courseFilter === 'all' || r.formType?.toLowerCase() === courseFilter;
      if (!inCourse) return false;
      if (!q) return true;
      return [r.studentName, r.studentId, r.busRoute, r.routeTo, r.mobileNo, r.formType].some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [records, courseFilter, studentSearch]);

  const routeRows = useMemo(() => {
    const map: Record<string, { routeId: string; routeName: string; startPoint: string; endPoint: string; students: number }>
      = {};
    let idx = 0;
    records.forEach(item => {
      const key = `${item.busRoute}-${item.routeTo}`;
      if (!map[key]) {
        idx += 1;
        map[key] = {
          routeId: `RT${String(idx).padStart(4, '0')}`,
          routeName: item.busRoute,
          startPoint: 'Vita',
          endPoint: item.routeTo,
          students: 0,
        };
      }
      map[key].students += 1;
    });
    const q = routeSearch.trim().toLowerCase();
    const arr = Object.values(map);
    return q ? arr.filter(r => [r.routeId, r.routeName, r.startPoint, r.endPoint].some(v => v.toLowerCase().includes(q))) : arr;
  }, [records, routeSearch]);

  const paymentRows = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase();
    const rows = records.map(item => {
      const pending = typeof item.pendingAmount === 'number' ? item.pendingAmount : Math.max(0, (item.passAmount || 0) - (item.receivedAmount || 0));
      return { ...item, pending };
    });
    return q
      ? rows.filter(r => [r.studentId, r.studentName, r.busRoute, r.formType].some(v => String(v || '').toLowerCase().includes(q)))
      : rows;
  }, [records, paymentSearch]);

  return (
    <div style={styles.container}>
      <LoaderOverlay show={loading} message="Fetching data…" fullscreen={false} />
      <aside style={styles.sidebar}>
        <div style={{ padding: 24, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 70, height: 70, margin: '0 auto 8px', background: 'linear-gradient(135deg,#395c91,#82889a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>AIT</div>
          <div>BUS PASS MANAGEMENT</div>
        </div>
        <nav>
          <button
            style={{ ...styles.sideButton, ...(activeSection === 'dashboard' ? styles.sideButtonActive : {}) }}
            onClick={() => setActiveSection('dashboard')}
          >DASHBOARD</button>
          <button
            style={{ ...styles.sideButton, ...(activeSection === 'students' ? styles.sideButtonActive : {}) }}
            onClick={() => setActiveSection('students')}
          >STUDENT MANAGEMENT</button>
          <button
            style={{ ...styles.sideButton, ...(activeSection === 'route' ? styles.sideButtonActive : {}) }}
            onClick={() => setActiveSection('route')}
          >ROUTE MANAGEMENT</button>
          <button
            style={{ ...styles.sideButton, ...(activeSection === 'payment' ? styles.sideButtonActive : {}) }}
            onClick={() => setActiveSection('payment')}
          >UPDATE PROFILE</button>
        </nav>
      </aside>
      <main style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Dashboard</h1>
          <div>
            <input
              placeholder="Search students..."
              style={styles.search}
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.secondaryBar}>
          <div style={styles.chips}>
            <Link to="/forms/diploma" style={{ ...styles.chip, color: '#0e3e78' }}>DIPLOMA</Link>
            <Link to="/forms/engineering" style={{ ...styles.chip, color: '#0e3e78' }}>ENGINEERING</Link>
            <Link to="/forms/pharmacy" style={{ ...styles.chip, color: '#0e3e78' }}>PHARMACY</Link>
            <Link to="/forms/iti" style={{ ...styles.chip, color: '#0e3e78' }}>ITI</Link>
          </div>
        </div>

        <div style={styles.content}>
          {activeSection === 'dashboard' && (
            <>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : stats.totalStudents}</div>
                  <div style={{ color: '#64748b' }}>Total Students</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : stats.activePasses}</div>
                  <div style={{ color: '#64748b' }}>No Of Pass</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : stats.totalRoutes}</div>
                  <div style={{ color: '#64748b' }}>Total Routes</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : `₹${stats.pendingPayments.toLocaleString()}`}</div>
                  <div style={{ color: '#64748b' }}>All Payments</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginTop: 16 }}>
                {busData.map(b => (
                  <Link key={b.name} to={`/route/${encodeURIComponent(b.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: '#f8f9f9', border: '1px solid #eff1f4', borderRadius: 10, padding: 16 }}>
                      <div style={{ background: 'linear-gradient(535deg, #3b82f6, #7b88ae)', width: 70, height: 50, borderRadius: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>🚌</div>
                      <div style={{ fontWeight: 600 }}>{b.name.toUpperCase()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeSection === 'students' && (
            <div style={styles.tablesCard}>
              <div style={styles.cardHeader}><h2 style={{ margin: 0, fontSize: 18 }}>Student Management</h2></div>
              <div style={styles.cardBody}>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                  <input
                    placeholder="Search students..."
                    style={styles.search}
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                  {(['all','diploma','engineering','pharmacy','iti'] as CourseFilter[]).map(c => (
                    <button key={c} onClick={() => setCourseFilter(c)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: courseFilter === c ? '#001033' : '#f1f5f9', color: courseFilter === c ? '#fff' : '#0e3e78' }}>
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Bus Name</th>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>Course</th>
                      <th style={styles.th}>Phone No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td style={styles.td} colSpan={4}>Loading…</td></tr>
                    )}
                    {!loading && filteredStudents.length === 0 && (
                      <tr><td style={styles.td} colSpan={4}>No records</td></tr>
                    )}
                    {!loading && filteredStudents.map((r, i) => (
                      <tr key={`${r.studentId}-${i}`}>
                        <td style={styles.td}>{r.busRoute}</td>
                        <td style={styles.td}>{r.studentName}</td>
                        <td style={styles.td}>{r.formType}</td>
                        <td style={styles.td}>{r.mobileNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'route' && (
            <div style={styles.tablesCard}>
              <div style={styles.cardHeader}><h2 style={{ margin: 0, fontSize: 18 }}>Route Management</h2></div>
              <div style={styles.cardBody}>
                <div style={{ marginBottom: 12 }}>
                  <input
                    placeholder="Search routes..."
                    style={styles.search}
                    value={routeSearch}
                    onChange={e => setRouteSearch(e.target.value)}
                  />
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Route ID</th>
                      <th style={styles.th}>Route Name</th>
                      <th style={styles.th}>Start</th>
                      <th style={styles.th}>End</th>
                      <th style={styles.th}>Students</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeRows.length === 0 && (
                      <tr><td style={styles.td} colSpan={6}>{loading ? 'Loading…' : 'No routes'}</td></tr>
                    )}
                    {routeRows.map(r => (
                      <tr key={r.routeId}>
                        <td style={styles.td}>{r.routeId}</td>
                        <td style={styles.td}>{r.routeName}</td>
                        <td style={styles.td}>{r.startPoint}</td>
                        <td style={styles.td}>{r.endPoint}</td>
                        <td style={styles.td}>{r.students}</td>
                        <td style={styles.td}><button onClick={() => alert('Delete not implemented')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff' }}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div style={styles.tablesCard}>
              <div style={styles.cardHeader}><h2 style={{ margin: 0, fontSize: 18 }}>Student Profile</h2></div>
              <div style={styles.cardBody}>
                <div style={{ marginBottom: 12 }}>
                  <input
                    placeholder="Search student..."
                    style={styles.search}
                    value={paymentSearch}
                    onChange={e => setPaymentSearch(e.target.value)}
                  />
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student ID</th>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>Bus Route</th>
                      <th style={styles.th}>Pass Amount</th>
                      <th style={styles.th}>Received</th>
                      <th style={styles.th}>Pending</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRows.length === 0 && (
                      <tr><td style={styles.td} colSpan={9}>{loading ? 'Loading…' : 'No records'}</td></tr>
                    )}
                    {paymentRows.map((r, i) => {
                      const validUntil = new Date(r.date);
                      const months = r.passType === 'monthly' ? 1 : r.passType === 'semester' ? 6 : 12;
                      validUntil.setMonth(validUntil.getMonth() + months);
                      const isActive = new Date() <= validUntil;
                      return (
                        <tr key={`${r.studentId}-${i}`}>
                          <td style={styles.td}>{r.studentId}</td>
                          <td style={styles.td}>{r.studentName}</td>
                          <td style={styles.td}>{r.busRoute}</td>
                          <td style={styles.td}>₹{(r.passAmount || 0).toLocaleString()}</td>
                          <td style={styles.td}>₹{(r.receivedAmount || 0).toLocaleString()}</td>
                          <td style={styles.td}>₹{(r as any).pending.toLocaleString()}</td>
                          <td style={styles.td}>{new Date(r.date).toLocaleDateString()}</td>
                          <td style={styles.td}><span style={{ color: (r as any).pending === 0 ? '#27ae60' : '#f39c12' }}>{(r as any).pending === 0 ? 'Completed' : 'Pending'}</span></td>
                          <td style={styles.td}><button onClick={() => alert('Refund not implemented')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff' }}>Refund</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;


