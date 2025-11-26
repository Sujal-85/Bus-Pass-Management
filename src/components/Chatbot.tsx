import React, { useState, useRef, useEffect } from 'react';

type Message = {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
};

const styles: Record<string, React.CSSProperties> = {
    floatingBtn: {
        position: 'fixed',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        zIndex: 1000,
        transition: 'transform 0.2s',
    },
    window: {
        position: 'fixed',
        bottom: 100,
        right: 30,
        width: 350,
        height: 500,
        backgroundColor: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
        border: '1px solid #e2e8f0',
    },
    header: {
        padding: '16px 20px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 600,
    },
    messages: {
        flex: 1,
        padding: 20,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        backgroundColor: '#f8fafc',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: 12,
        fontSize: 14,
        lineHeight: 1.4,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#3b82f6',
        color: '#fff',
        borderBottomRightRadius: 2,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#e2e8f0',
        color: '#1e293b',
        borderBottomLeftRadius: 2,
    },
    inputArea: {
        padding: 16,
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: 10,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: 20,
        border: '1px solid #cbd5e1',
        outline: 'none',
        fontSize: 14,
    },
    sendBtn: {
        background: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 40,
        height: 40,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: 'Hi! I can help you with bus routes, pass status, or general queries. Ask me anything!', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: data.reply || "I'm sorry, I couldn't process that.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button style={styles.floatingBtn} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div style={styles.window}>
                    <div style={styles.header}>
                        <span>AI Assistant</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={styles.messages}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{ ...styles.messageBubble, ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble) }}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ ...styles.messageBubble, ...styles.botBubble, fontStyle: 'italic', color: '#64748b' }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            style={styles.input}
                            placeholder="Type a message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button style={styles.sendBtn} onClick={handleSend} disabled={loading}>
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
