import React, { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { busData } from '../data/busData';
import LoaderOverlay from './LoaderOverlay';
import EditStudentModal from './EditStudentModal';

type Section = 'dashboard' | 'students' | 'route' | 'lost-found' | 'payment';

type CourseFilter = 'all' | 'Diploma' | 'Engineering' | 'Pharmacy' | 'ITI';

type BusPassRecord = {
  _id?: string;
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
  status?: 'active' | 'inactive';
};

type RouteRecord = {
  _id: string;
  name: string;
  from: string;
  stops: { name: string; semester: number; yearly: number }[];
};

type LostItem = {
  _id: string;
  itemName: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  status: 'lost' | 'found' | 'claimed';
  image?: string;
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#dedee8' },
  sidebar: { width: 250, background: 'linear-gradient(535deg, #010a1a, #7b88ae)', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto' },
  navItem: { display: 'block', padding: '20px 30px', color: '#fff', textDecoration: 'none' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, marginLeft: 250, width: 'calc(100% - 250px)' },
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
  card: { background: '#faf9f9', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', padding: 16 }, // Added card style
  cardTitle: { margin: '0 0 16px 0', fontSize: 18, color: '#2c3e50' }, // Added cardTitle style
};

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [records, setRecords] = useState<BusPassRecord[]>([]);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [editingStudent, setEditingStudent] = useState<BusPassRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [routeSearch, setRouteSearch] = useState<string>('');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/bus-pass');
        const data: BusPassRecord[] = await res.json();
        const routeRes = await fetch('http://localhost:5000/api/routes');
        const routeData: RouteRecord[] = await routeRes.json();
        const lostRes = await fetch('http://localhost:5000/api/lost-items');
        const lostData: LostItem[] = await lostRes.json();
        if (!isMounted) return;
        setRecords(Array.isArray(data) ? data : []);
        setRoutes(Array.isArray(routeData) ? routeData : []);
        setLostItems(Array.isArray(lostData) ? lostData : []);
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
      if (new Date() <= validUntil && item.status !== 'inactive') activePasses += 1;
      routeSet.add(`${item.busRoute} -${item.routeTo} `);
      const pending = typeof item.pendingAmount === 'number' ? item.pendingAmount : Math.max(0, (item.passAmount || 0) - (item.receivedAmount || 0));
      pendingPayments += pending;
    }
    return { totalStudents, activePasses, totalRoutes: routeSet.size, pendingPayments };
  }, [records]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return records.filter(r => {
      const inCourse = courseFilter === 'all' || r.formType?.toLowerCase() === courseFilter.toLowerCase();
      if (!inCourse) return false;

      if (statusFilter === 'active') {
        if (r.status === 'inactive') return false;
        const validUntil = new Date(r.date);
        const months = r.passType === 'monthly' ? 1 : r.passType === 'semester' ? 6 : 12;
        validUntil.setMonth(validUntil.getMonth() + months);
        if (new Date() > validUntil) return false;
      }

      if (!q) return true;
      return [r.studentName, r.studentId, r.busRoute, r.routeTo, r.mobileNo, r.formType].some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [records, courseFilter, studentSearch, statusFilter]);

  const routeRows = useMemo(() => {
    const q = routeSearch.trim().toLowerCase();
    const rows = routes.map((r, i) => {
      const studentCount = records.filter(rec => rec.busRoute === r.name).length;
      return {
        routeId: r._id,
        routeName: r.name,
        startPoint: r.from,
        endPoint: 'College', // or last stop
        students: studentCount,
      };
    });
    return q ? rows.filter(r => [r.routeName, r.startPoint].some(v => v.toLowerCase().includes(q))) : rows;
  }, [records, routes, routeSearch]);

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

  const [showQR, setShowQR] = useState(false);

  const analyticsData = useMemo(() => {
    const routeData: Record<string, number> = {};
    const deptData: Record<string, number> = {};
    const typeData: Record<string, number> = {};

    records.forEach(r => {
      routeData[r.busRoute] = (routeData[r.busRoute] || 0) + 1;
      deptData[r.department || 'Unknown'] = (deptData[r.department || 'Unknown'] || 0) + 1;
      typeData[r.passType] = (typeData[r.passType] || 0) + 1;
    });

    const maxRoute = Math.max(...Object.values(routeData), 1);
    const maxDept = Math.max(...Object.values(deptData), 1);

    const routes = Object.entries(routeData).map(([name, count]) => ({ name, count, percent: (count / maxRoute) * 100 }));
    const depts = Object.entries(deptData).map(([name, count]) => ({ name, count, percent: (count / maxDept) * 100 }));
    const types = Object.entries(typeData).map(([name, count]) => ({ name, count }));

    return { routes, depts, types };
  }, [records]);

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await fetch(`http://localhost:5000/api/bus-pass/${id}`, { method: 'DELETE' });
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const editStudent = (record: BusPassRecord) => {
    setEditingStudent(record);
  };

  const handleSaveStudent = async (updatedStudent: BusPassRecord) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bus-pass/${updatedStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
      const updated = await res.json();
      setRecords(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
      setEditingStudent(null);
    } catch (e) {
      alert('Failed to update student');
    }
  };

  const updateStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      const res = await fetch(`http://localhost:5000/api/bus-pass/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setRecords(prev => prev.map(r => r._id === id ? { ...r, ...updated } : r));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const deleteRoute = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await fetch(`http://localhost:5000/api/routes/${id}`, { method: 'DELETE' });
      setRoutes(prev => prev.filter(r => r._id !== id));
    } catch (e) {
      alert('Failed to delete route');
    }
  };

  const editRoute = async (route: { routeId: string; routeName: string }) => {
    const newName = prompt('Enter new route name:', route.routeName);
    if (newName && newName !== route.routeName) {
      try {
        const res = await fetch(`http://localhost:5000/api/routes/${route.routeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
        const updated = await res.json();
        setRoutes(prev => prev.map(r => r._id === route.routeId ? { ...r, ...updated } : r));
      } catch (e) {
        alert('Failed to update route');
      }
    }
  };

  useEffect(() => {
    if (showQR) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(
        (decodedText) => {
          handleScan(decodedText);
          scanner.clear();
        },
        (error) => {
          // console.warn(error);
        }
      );
      return () => {
        scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
      };
    }
  }, [showQR]);

  const handleScan = async (data: string | null) => {
    if (data) {
      try {
        const res = await fetch('http://localhost:5000/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        const result = await res.json();
        if (result.valid) {
          alert(`Valid Pass!\nStudent: ${result.student.studentName}\nRoute: ${result.student.busRoute}`);
          setShowQR(false);
        } else {
          alert(`Invalid Pass: ${result.message}`);
        }
      } catch (e) {
        alert('Verification failed');
      }
    }
  };

  const updateLostItemStatus = async (id: string, status: 'found' | 'claimed') => {
    try {
      const res = await fetch(`http://localhost:5000/api/lost-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setLostItems(prev => prev.map(item => item._id === id ? { ...item, ...updated } : item));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={styles.container}>
      <LoaderOverlay show={loading} message="Fetching data…" fullscreen={false} />

      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowQR(false)}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 16, textAlign: 'center', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Scan Student QR</h2>
            <div id="reader" style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}></div>
            <p style={{ color: '#7f8c8d' }}>Point your camera at the student's pass to verify validity.</p>
            <button onClick={() => setShowQR(false)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Close Scanner</button>
          </div>
        </div>
      )}

      {(!isMobile || isSidebarOpen) && (
        <aside style={{
          ...styles.sidebar,
          background: '#1e293b',
          position: 'fixed',
          zIndex: 100,
          height: '100vh',
          left: 0,
          top: 0
        }}>
          <div style={{ padding: 24, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 70, height: 70, margin: '0 auto 8px', background: 'linear-gradient(135deg,#395c91,#82889a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>AIT</div>
            <div>BUS PASS MANAGEMENT</div>
            {isMobile && <button onClick={() => setIsSidebarOpen(false)} style={{ marginTop: 10, background: 'transparent', border: '1px solid #fff', color: '#fff', borderRadius: 4, padding: '4px 8px' }}>Close Menu</button>}
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
              style={{ ...styles.sideButton, ...(activeSection === 'lost-found' ? styles.sideButtonActive : {}) }}
              onClick={() => setActiveSection('lost-found')}
            >LOST & FOUND ADMIN</button>
            <button
              style={{ ...styles.sideButton, ...(activeSection === 'payment' ? styles.sideButtonActive : {}) }}
              onClick={() => setActiveSection('payment')}
            >STUDENT PROFILE</button>
            <Link to="/lost-found" style={{ ...styles.sideButton, textDecoration: 'none', display: 'block', width: '100%', boxSizing: 'border-box' }}>LOST & FOUND (PUBLIC)</Link>
            <button
              style={{ ...styles.sideButton, marginTop: 'auto', color: '#e74c3c' }}
              onClick={logout}
            >LOGOUT</button>
          </nav>
        </aside>
      )}
      <main style={{ ...styles.main, marginLeft: isMobile ? 0 : 250, width: isMobile ? '100%' : 'calc(100% - 250px)' }}>
        <div style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>
                <i className="fas fa-bars"></i> ☰
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: 20 }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => setShowQR(true)} style={{ background: '#3498db', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-qrcode"></i> Scan QR
            </button>
          </div>
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
                <div style={{ ...styles.statCard, cursor: 'pointer' }} onClick={() => { setActiveSection('students'); setStatusFilter('active'); }}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : stats.activePasses}</div>
                  <div style={{ color: '#64748b' }}>Active Passes (Click to view)</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : stats.totalRoutes}</div>
                  <div style={{ color: '#64748b' }}>Total Routes</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{loading ? '…' : `₹${stats.pendingPayments.toLocaleString()}`}</div>
                  <div style={{ color: '#64748b' }}>Pending Payments</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 24 }}>
                <div style={{ background: '#fff', padding: 20, borderRadius: 10 }}>
                  <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Route Distribution</h3>
                  <div className="hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '300px', overflowY: 'auto' }}>
                    {analyticsData.routes.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 100, fontSize: 14, fontWeight: 600, color: '#555' }}>{d.name}</div>
                        <div style={{ flex: 1, background: '#ecf0f1', height: 12, borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${d.percent}%`, background: '#3498db', height: '100%' }}></div>
                        </div>
                        <div style={{ width: 30, textAlign: 'right', fontSize: 14 }}>{d.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 10 }}>
                  <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Department Stats</h3>
                  <div className="hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '300px', overflowY: 'auto' }}>
                    {analyticsData.depts.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={d.name}>{d.name}</div>
                        <div style={{ flex: 1, background: '#ecf0f1', height: 12, borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${d.percent}%`, background: '#9b59b6', height: '100%' }}></div>
                        </div>
                        <div style={{ width: 30, textAlign: 'right', fontSize: 14 }}>{d.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 20, borderRadius: 10 }}>
                  <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Pass Types</h3>
                  <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', height: 150 }}>
                    {analyticsData.types.map(t => (
                      <div key={t.name} style={{ textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: t.name === 'semester' ? '#e67e22' : '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, margin: '0 auto 10px' }}>
                          {t.count}
                        </div>
                        <div style={{ textTransform: 'capitalize', fontWeight: 600, color: '#7f8c8d' }}>{t.name}</div>
                      </div>
                    ))}
                  </div>
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
                  {(['all', 'Diploma', 'Engineering', 'Pharmacy', 'ITI'] as CourseFilter[]).map(c => (
                    <button key={c} onClick={() => setCourseFilter(c)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: courseFilter === c ? '#001033' : '#f1f5f9', color: courseFilter === c ? '#fff' : '#0e3e78' }}>
                      {c.toUpperCase()}
                    </button>
                  ))}
                  {statusFilter === 'active' && (
                    <button onClick={() => setStatusFilter('all')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer' }}>
                      Clear Active Filter
                    </button>
                  )}
                </div>
                <div className="hide-scrollbar" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Bus Name</th>
                        <th style={styles.th}>Student Name</th>
                        <th style={styles.th}>Course</th>
                        <th style={styles.th}>Phone No</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr><td style={styles.td} colSpan={5}>Loading…</td></tr>
                      )}
                      {!loading && filteredStudents.length === 0 && (
                        <tr><td style={styles.td} colSpan={5}>No records</td></tr>
                      )}
                      {!loading && filteredStudents.map((r, i) => (
                        <tr key={`${r.studentId}-${i}`}>
                          <td style={styles.td}>{r.busRoute}</td>
                          <td style={styles.td}>{r.studentName}</td>
                          <td style={styles.td}>{r.formType}</td>
                          <td style={styles.td}>{r.mobileNo}</td>
                          <td style={styles.td}>
                            <span style={{ padding: '4px 8px', borderRadius: 4, background: r.status === 'inactive' ? '#e74c3c' : '#2ecc71', color: '#fff', fontSize: 12 }}>
                              {r.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => r._id && updateStatus(r._id, r.status === 'inactive' ? 'active' : 'inactive')} style={{ marginRight: 8, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#34495e', color: '#fff', cursor: 'pointer' }}>
                              {r.status === 'inactive' ? 'Activate' : 'Deactivate'}
                            </button>
                            <button onClick={() => editStudent(r)} style={{ marginRight: 8, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#f39c12', color: '#fff', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => r._id && deleteStudent(r._id)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <div className="hide-scrollbar" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
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
                          <td style={styles.td}>
                            <button onClick={() => editRoute(r as any)} style={{ marginRight: 8, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#f39c12', color: '#fff', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => deleteRoute(r.routeId)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <div className="hide-scrollbar" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
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
            </div>
          )}

          {activeSection === 'lost-found' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Lost & Found Management</h2>
              <div className="hide-scrollbar" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Item</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Contact</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lostItems.map(item => (
                      <tr key={item._id}>
                        <td style={styles.td}>{item.itemName}</td>
                        <td style={styles.td}>{item.description}</td>
                        <td style={styles.td}>{item.location}</td>
                        <td style={styles.td}>{item.contact}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '4px 8px', borderRadius: 4, fontSize: 12,
                            background: item.status === 'lost' ? '#e74c3c' : item.status === 'found' ? '#f39c12' : '#27ae60',
                            color: '#fff'
                          }}>{item.status.toUpperCase()}</span>
                        </td>
                        <td style={styles.td}>
                          {item.status === 'lost' && (
                            <button onClick={() => updateLostItemStatus(item._id, 'found')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#f39c12', color: '#fff', cursor: 'pointer' }}>Mark Found</button>
                          )}
                          {item.status === 'found' && (
                            <button onClick={() => updateLostItemStatus(item._id, 'claimed')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#27ae60', color: '#fff', cursor: 'pointer' }}>Mark Claimed</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main >
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={handleSaveStudent}
        />
      )}
    </div >
  );
};

export default Dashboard;
