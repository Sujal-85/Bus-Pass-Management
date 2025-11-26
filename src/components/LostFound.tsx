import React, { useEffect, useState } from 'react';

type LostItem = {
    _id: string;
    itemName: string;
    description: string;
    busRoute: string;
    date: string;
    contactInfo: string;
    status: 'lost' | 'found' | 'claimed';
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: 20,
        fontFamily: 'Segoe UI, sans-serif',
        background: '#f0f2f5',
        minHeight: '100vh',
    },
    header: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#2c3e50',
    },
    formCard: {
        background: '#fff',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 30,
        maxWidth: 600,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        display: 'block',
        marginBottom: 5,
        fontWeight: 600,
        color: '#34495e',
    },
    input: {
        width: '100%',
        padding: 10,
        borderRadius: 4,
        border: '1px solid #ddd',
        fontSize: 16,
        boxSizing: 'border-box',
    },
    button: {
        background: '#e74c3c',
        color: '#fff',
        border: 'none',
        padding: '12px 20px',
        borderRadius: 4,
        fontSize: 16,
        cursor: 'pointer',
        width: '100%',
        fontWeight: 600,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
    },
    card: {
        background: '#fff',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
    },
};

const LostFound: React.FC = () => {
    const [items, setItems] = useState<LostItem[]>([]);
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [busRoute, setBusRoute] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/lost-items');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/lost-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName, description, busRoute, contactInfo }),
            });
            if (res.ok) {
                setItemName('');
                setDescription('');
                setBusRoute('');
                setContactInfo('');
                fetchItems();
                alert('Item reported successfully!');
            }
        } catch (error) {
            console.error('Error reporting item:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'lost': return '#e74c3c';
            case 'found': return '#f1c40f';
            case 'claimed': return '#27ae60';
            default: return '#95a5a6';
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Lost & Found</h1>

            <div style={styles.formCard}>
                <h2 style={{ marginTop: 0, color: '#e74c3c' }}>Report Lost Item</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Item Name</label>
                        <input style={styles.input} value={itemName} onChange={e => setItemName(e.target.value)} required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea style={{ ...styles.input, height: 80 }} value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Bus Route</label>
                        <input style={styles.input} value={busRoute} onChange={e => setBusRoute(e.target.value)} required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contact Info (Phone/Email)</label>
                        <input style={styles.input} value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Submitting...' : 'Report Item'}
                    </button>
                </form>
            </div>

            <div style={styles.grid}>
                {items.map(item => (
                    <div key={item._id} style={styles.card}>
                        <span style={{ ...styles.statusBadge, background: getStatusColor(item.status), color: '#fff' }}>{item.status}</span>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{item.itemName}</h3>
                        <p style={{ color: '#7f8c8d', fontSize: 14 }}>{new Date(item.date).toLocaleDateString()}</p>
                        <p><strong>Route:</strong> {item.busRoute}</p>
                        <p>{item.description}</p>
                        <p style={{ fontSize: 14, color: '#95a5a6' }}>Contact: {item.contactInfo}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LostFound;
