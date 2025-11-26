import React, { useState, useEffect } from 'react';

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

interface EditStudentModalProps {
    student: BusPassRecord;
    onClose: () => void;
    onSave: (updatedStudent: BusPassRecord) => void;
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: '#fff', padding: 24, borderRadius: 12,
        width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    header: { fontSize: 20, fontWeight: 600, marginBottom: 20, color: '#2c3e50' },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#64748b' },
    input: {
        width: '100%', padding: '10px 12px', borderRadius: 6,
        border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box'
    },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
    cancelBtn: {
        padding: '10px 16px', borderRadius: 6, border: '1px solid #cbd5e1',
        background: '#fff', color: '#64748b', cursor: 'pointer'
    },
    saveBtn: {
        padding: '10px 16px', borderRadius: 6, border: 'none',
        background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 500
    }
};

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSave }) => {
    const [formData, setFormData] = useState<BusPassRecord>(student);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 style={styles.header}>Edit Student</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Student Name</label>
                        <input name="studentName" value={formData.studentName} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mobile No</label>
                        <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email ID</label>
                        <input name="EmailId" value={formData.EmailId || ''} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Bus Route</label>
                        <input name="busRoute" value={formData.busRoute} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Route To</label>
                        <input name="routeTo" value={formData.routeTo} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Pass Type</label>
                        <select name="passType" value={formData.passType} onChange={handleChange} style={styles.input}>
                            <option value="monthly">Monthly</option>
                            <option value="semester">Semester</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div style={styles.actions}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" style={styles.saveBtn}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStudentModal;
