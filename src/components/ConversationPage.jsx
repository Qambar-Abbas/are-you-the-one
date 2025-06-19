import React, { useState, useRef, useEffect } from 'react';
import './ConversationPage.css';
import {
    sendMessageToFirebase,
    // no longer need listenToTodayMessages…
    listenToAllConversations
} from '../services/messageService';

/** (same formatTimestamp as before) */
function formatTimestamp(ts) {
    let date;
    try {
        date = ts?.toDate?.() ?? new Date(ts);
        if (isNaN(date.getTime())) throw new Error('Invalid Date');
    } catch {
        return 'invalid timestamp';
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    if (date.toDateString() === now.toDateString()) {
        return `Today at ${timeStr}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${timeStr}`;
    }
    const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
    return `${dateStr} at ${timeStr}`;
}

export default function ConversationPage() {
    const [lines, setLines] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        // Subscribe to *all* days’ messages
        const unsubscribe = listenToAllConversations((messages) => {
            const formatted = messages.map((msg) => {
                const timeStr = formatTimestamp(msg.timestamp);
                return `<span class="username">&lt;127.0.0.1@${msg.user}&gt;</span> [${timeStr}] ${msg.text}`;
            });
            setLines(formatted);
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    // auto‑scroll on new lines
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // handle sending
    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const message = inputRef.current?.innerText.trim();
            if (!selectedUser || !message) return;
            inputRef.current.innerText = '';
            try {
                await sendMessageToFirebase(selectedUser, message);
            } catch (err) {
                console.error('sendMessageToFirebase error:', err);
            }
        }
    };

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInputClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="conversation-container">
            <div className="terminal">

                {/* Dropdown */}
                <div className="dropdown-container">
                    <label htmlFor="user-select">User:&nbsp;</label>
                    <select
                        id="user-select"
                        value={selectedUser}
                        onChange={handleUserChange}
                    >
                        <option value="">-- Select --</option>
                        <option value="sbfn">sbfn</option>
                        <option value="qa">qa</option>
                    </select>
                </div>

                {/* Hacker status block (white text via CSS) */}
                <div className="hacker-status">
                    <code>
                        └─▶ Initiating TLS handshake...<br />
                        └─ Negotiating AES-256 key exchange...<br />
                        └─ Spawning SOCKS5 proxy at 10.0.0.5:1080...<br />
                        └─ Validating auth token (SHA-1)...<br />
                        Secure channel established.
                    </code>
                </div>

                {/* Render full history */}
                {lines.map((line, i) => (
                    <div
                        key={i}
                        className="terminal-line"
                        dangerouslySetInnerHTML={{ __html: line }}
                    />
                ))}

                <div className="separator-line" />

                {/* Input */}
                <div className="terminal-input" onClick={handleInputClick}>
                    <span className="prompt">&gt;</span>
                    <div
                        ref={inputRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="terminal-editable"
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        style={{ opacity: selectedUser ? 1 : 0.4 }}
                        data-placeholder={selectedUser ? '' : 'Select a user first'}
                    />
                </div>

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
