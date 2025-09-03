import React, { useEffect, useMemo, useState } from 'react';
import { busData, BusRoute } from '../../data/busData';
import QR from '../../images/QR.png';
import LoaderOverlay from '../LoaderOverlay';

export type BusPassFormProps = {
  title: string;
  formType: 'Diploma' | 'Engineering' | 'Pharmacy' | 'ITI';
  departmentOptions: string[];
  maxYear: number;
};

type ErrorState = {
  date?: string;
  academicYear?: string;
  studentId?: string;
  studentName?: string;
  mobileNo?: string;
  EmailId?: string;
  department?: string;
  classSelect?: string;
  semester?: string;
  busRoute?: string;
  amount?: string;
  received?: string;
};

const containerStyle: React.CSSProperties = {
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  background: 'linear-gradient(to bottom, #455a7eff, #bcc6d1ff)',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 0,
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0f1e36',
  padding: 40,
  borderRadius: 15,
  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  width: 530,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 8,
  color: '#f9fcf9',
  fontSize: 14,
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  border: '2px solid #dfe6e9',
  borderRadius: 8,
  fontSize: 16,
  boxSizing: 'border-box',
  backgroundColor: '#f9fbfd',
};

const rowStyle: React.CSSProperties = {
  marginBottom: 25,
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 15,
  justifyContent: 'center',
  marginTop: 30,
};

const primaryButton: React.CSSProperties = {
  padding: '12px 30px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  backgroundColor: '#0984e3',
  color: '#fff',
};

const dangerButton: React.CSSProperties = {
  ...primaryButton,
  backgroundColor: '#e74c3c',
};

const errorText: React.CSSProperties = {
  color: '#e74c3c',
  fontSize: 12,
  marginTop: 5,
};

const tabNavStyle: React.CSSProperties = { display: 'flex', gap: 20, marginBottom: 10 };
const tabButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: 20,
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: '#f1f3f5',
  color: '#545e34',
  fontWeight: 600,
  border: 'none',
  borderRadius: 8,
};
const tabButtonActive: React.CSSProperties = { ...tabButtonStyle, backgroundColor: '#0984e3', color: '#fff' };

const amountBoxStyle: React.CSSProperties = {
  border: '1px solid #dfe6e9',
  borderRadius: 8,
  padding: 15,
  backgroundColor: '#f9fbfd',
};

export const BusPassForm: React.FC<BusPassFormProps> = ({ title, formType, departmentOptions, maxYear }) => {
  const [currentTab, setCurrentTab] = useState<'student' | 'bus'>('student');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [date, setDate] = useState<string>(today);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [mobileNo, setMobileNo] = useState<string>('');
  const [EmailId, setEmailId] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [classSelect, setClassSelect] = useState<string>('');
  const [semester, setSemester] = useState<string>('');

  const [busRoute, setBusRoute] = useState<string>('');
  const [routeTo, setRouteTo] = useState<string>('');
  const [passType, setPassType] = useState<'semester' | 'yearly'>('semester');
  const [passAmount, setPassAmount] = useState<number>(0);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  const [errors, setErrors] = useState<ErrorState>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const academicYearOptions = useMemo(() => {
    const items: string[] = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 1; i <= currentYear + 5; i++) {
      items.push(`${i}-${i + 1}`);
    }
    return items;
  }, []);

  const isStudentValid = useMemo(() => {
    if (!date) return false;
    if (!academicYear) return false;
    if (!studentId.trim()) return false;
    if (!/^[A-Za-z\s]{2,}$/.test(studentName)) return false;
    if (!/^\d{10}$/.test(mobileNo)) return false;
    if (!/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(EmailId)) return false;
    if (!department) return false;
    if (!classSelect) return false;
    if (!semester) return false;
    return true;
  }, [date, academicYear, studentId, studentName, mobileNo, EmailId, department, classSelect, semester]);

  // compute academic year from selected date
  useEffect(() => {
    const selectedDate = new Date(date);
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const ay = month >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    setAcademicYear(ay);
  }, [date]);

  // update amount when route or passType changes
  useEffect(() => {
    if (!busRoute || !routeTo) {
      setPassAmount(0);
      return;
    }
    const route: BusRoute | undefined = busData.find(b => b.name === busRoute);
    if (!route) return;
    const stop = route.stops.find(s => s.name === routeTo);
    if (!stop) return;
    setPassAmount(passType === 'semester' ? stop.semester : stop.yearly);
  }, [busRoute, routeTo, passType]);

  const pendingAmount = Math.max(0, (passAmount || 0) - (receivedAmount || 0));

  const yearOptions = useMemo(() => Array.from({ length: maxYear }, (_, i) => `${i + 1}`), [maxYear]);

  const toOptions = useMemo(() => {
    if (!busRoute) return [] as string[];
    const route = busData.find(r => r.name === busRoute);
    return route ? route.stops.map(s => s.name) : [];
  }, [busRoute]);

  function validateStudent(): boolean {
    const next: ErrorState = {};
    if (!date) next.date = 'Please select a valid date.';
    if (!academicYear) next.academicYear = 'Please select an Academic Year.';
    if (!studentId.trim()) next.studentId = 'Student ID must be unique.';
    if (!/^[A-Za-z\s]{2,}$/.test(studentName)) next.studentName = 'Please enter a valid name.';
    if (!/^\d{10}$/.test(mobileNo)) next.mobileNo = 'Mobile number must be exactly 10 digits.';
    if (!/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(EmailId)) next.EmailId = 'Please enter a valid Email Id.';
    if (!department) next.department = 'Please select a department.';
    if (!classSelect) next.classSelect = 'Please select a class.';
    if (!semester) next.semester = 'Please select a semester.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateBus(): boolean {
    const next: ErrorState = {};
    if (!busRoute) next.busRoute = 'Please select a bus route.';
    if (!routeTo) next.busRoute = 'Please select a destination.';
    if (!(receivedAmount >= 0)) next.amount = 'Please enter valid amounts.';
    if (passAmount - receivedAmount < 0) next.received = 'Received amount cannot exceed pass amount.';
    setErrors(prev => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  }

  function resetAll(): void {
    setDate(today);
    setStudentId('');
    setStudentName('');
    setMobileNo('');
    setEmailId('');
    setDepartment('');
    setClassSelect('');
    setSemester('');
    setBusRoute('');
    setRouteTo('');
    setPassType('semester');
    setPassAmount(0);
    setReceivedAmount(0);
    setErrors({});
    setSubmitted(false);
    setCurrentTab('student');
  }

  async function handleSubmit(): Promise<void> {
    if (!validateBus()) return;
    try {
      setSubmitting(true);
      const payload = {
        formType,
        date,
        academicYear,
        studentId,
        studentName,
        mobileNo,
        EmailId,
        department,
        class: classSelect,
        semester,
        busRoute,
        routeTo,
        passType,
        passAmount: Number(passAmount),
        receivedAmount: Number(receivedAmount),
        pendingAmount: Number(Math.max(0, passAmount - receivedAmount)),
      };
      const res = await fetch('http://localhost:5000/api/bus-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        setErrors(prev => ({ ...prev, amount: msg || 'Submission failed' }));
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        resetAll();
      }, 1500);
    } catch (e) {
      setErrors(prev => ({ ...prev, amount: 'Network error occurred' }));
    }
    finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={containerStyle}>
      <LoaderOverlay show={submitting} message="Submitting…" fullscreen />
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <img width={50} height={50} src="https://cdn-icons-png.flaticon.com/128/18042/18042017.png" alt="bus" style={{ filter: 'brightness(0) invert(1)' }} />
          <h2 style={{ color: '#f5f6f7', margin: 0 }}>{title}</h2>
        </div>

        <div style={tabNavStyle}>
          <button type="button" style={currentTab === 'student' ? tabButtonActive : tabButtonStyle} onClick={() => setCurrentTab('student')}>Student Details</button>
          <button type="button" style={currentTab === 'bus' ? tabButtonActive : tabButtonStyle} onClick={() => { if (validateStudent()) setCurrentTab('bus'); }} disabled={!isStudentValid}>
            Bus Details
          </button>
        </div>

        {currentTab === 'student' && (
          <div>
            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="date">Date:</label>
              <input style={inputStyle} type="date" id="date" value={date} onChange={e => setDate(e.target.value)} />
              {errors.date && <div style={errorText}>{errors.date}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="academicYear">Academic Year:</label>
              <select style={inputStyle} id="academicYear" value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
                <option value="" disabled>Select Academic Year</option>
                {academicYearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.academicYear && <div style={errorText}>{errors.academicYear}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="studentId">Student Id: (Unique)</label>
              <input style={inputStyle} type="text" id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} />
              {errors.studentId && <div style={errorText}>{errors.studentId}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="studentName">Student Name:</label>
              <input style={inputStyle} type="text" id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} />
              {errors.studentName && <div style={errorText}>{errors.studentName}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="mobileNo">Mobile No: (Only 10 digits)</label>
              <input style={inputStyle} type="number" id="mobileNo" value={mobileNo} onChange={e => setMobileNo(e.target.value)} />
              {errors.mobileNo && <div style={errorText}>{errors.mobileNo}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="EmailId">Email Id:</label>
              <input style={inputStyle} type="text" id="EmailId" value={EmailId} onChange={e => setEmailId(e.target.value)} />
              {errors.EmailId && <div style={errorText}>{errors.EmailId}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="department">Department:</label>
              <select style={inputStyle} id="department" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="" disabled>Select Department</option>
                {departmentOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.department && <div style={errorText}>{errors.department}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="class">Class:</label>
              <select style={inputStyle} id="class" value={classSelect} onChange={e => setClassSelect(e.target.value)}>
                <option value="" disabled>Select Class</option>
                {yearOptions.map(y => (
                  <option key={y} value={y}>{`${y}${y === '1' ? 'st' : y === '2' ? 'nd' : y === '3' ? 'rd' : 'th'} Year`}</option>
                ))}
              </select>
              {errors.classSelect && <div style={errorText}>{errors.classSelect}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="semester">Semester:</label>
              <select style={inputStyle} id="semester" value={semester} onChange={e => setSemester(e.target.value)}>
                <option value="" disabled>Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              {errors.semester && <div style={errorText}>{errors.semester}</div>}
            </div>

            <div style={buttonRowStyle}>
              <button type="button" style={dangerButton} onClick={resetAll}>Reset</button>
              <button type="button" style={primaryButton} onClick={() => { if (validateStudent()) setCurrentTab('bus'); }}>Next</button>
            </div>
          </div>
        )}

        {currentTab === 'bus' && (
          <div>
            <div style={rowStyle}>
              <label style={labelStyle} htmlFor="busRoute">Select Bus Name:</label>
              <select style={inputStyle} id="busRoute" value={busRoute} onChange={e => { setBusRoute(e.target.value); setRouteTo(''); }}>
                <option value="" disabled>Select Bus Route</option>
                {busData.map(b => <option key={b.name} value={b.name}>{b.name.toUpperCase()}</option>)}
              </select>
              {errors.busRoute && <div style={errorText}>{errors.busRoute}</div>}
            </div>

            <div style={rowStyle}>
              <label style={labelStyle}>Bus Route:</label>
              <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <span style={{ ...inputStyle as React.CSSProperties, textAlign: 'center' }}>Vita</span>
                <img width={32} height={32} src="https://img.icons8.com/external-kmg-design-glyph-kmg-design/32/external-transfer-arrows-kmg-design-glyph-kmg-design.png" alt="route" style={{ filter: 'brightness(0) invert(1)' }} />
                <select style={inputStyle} id="routeTo" value={routeTo} onChange={e => setRouteTo(e.target.value)}>
                  <option value="" disabled>Select Destination</option>
                  {toOptions.map(stop => (
                    <option key={stop} value={stop}>{stop.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={rowStyle}>
              <label style={labelStyle}>Pass Type:</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, color: '#f9fcf9' }}>
                <label><input type="radio" name="passType" checked={passType === 'semester'} onChange={() => setPassType('semester')} /> Semester Pass</label>
                <label><input type="radio" name="passType" checked={passType === 'yearly'} onChange={() => setPassType('yearly')} /> Yearly Pass</label>
              </div>
            </div>

            <div style={rowStyle}>
              <label style={labelStyle}>Amount Details:</label>
              <div style={amountBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ flex: 1, fontWeight: 600, color: '#34495e', fontSize: 14 }}>Pass Amount:</span>
                  <input style={inputStyle} type="number" readOnly value={passAmount || ''} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ flex: 1, fontWeight: 600, color: '#34495e', fontSize: 14 }}>Received Amount:</span>
                  <input style={inputStyle} type="number" value={Number.isNaN(receivedAmount) ? '' : receivedAmount} onChange={e => setReceivedAmount(Number(e.target.value))} />
                </div>
                {errors.received && <div style={errorText}>{errors.received}</div>}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ flex: 1, fontWeight: 600, color: '#34495e', fontSize: 14 }}>Pending:</span>
                  <input style={inputStyle} type="number" readOnly value={pendingAmount || 0} />
                </div>
              </div>
              {errors.amount && <div style={errorText}>{errors.amount}</div>}
            </div>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <label style={{ ...labelStyle, textTransform: 'none' }}>Scan to Pay:</label>
              <img src={QR} alt="Payment QR Code" width={150} height={150} style={{ border: '2px solid #dfe6e9', borderRadius: 8 }} />
            </div>

            <div style={buttonRowStyle}>
              <button type="button" style={dangerButton} onClick={() => { setBusRoute(''); setRouteTo(''); setPassType('semester'); setPassAmount(0); setReceivedAmount(0); setErrors(prev => ({ ...prev, amount: undefined, received: undefined })); }}>Reset</button>
              <button type="button" style={primaryButton} onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}

        {submitted && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#27ae60', color: '#fff', padding: '20px 40px', borderRadius: 8, fontWeight: 600, fontSize: 18 }}>
            Submitted Successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default BusPassForm;


