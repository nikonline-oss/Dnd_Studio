import { FormEvent, useEffect, useRef, useState } from 'react';

import { relayClient } from '../../shared/services/relayClient';
import { useChatStore } from '../../shared/stores/chat';
import { useUiStore } from '../../shared/stores/ui';

export function ChatPanel() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const connectionStatus = useUiStore((state) => state.connectionStatus);
  const userRole = useUiStore((state) => state.userRole);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isConnected = connectionStatus === 'connected';

  const handleSend = (event: FormEvent) => {
    event.preventDefault();

    const text = inputText.trim();
    if (!text) return;

    // Локальное имя отправителя
    const senderName = relayClient.status === 'connected'
      ? `You (${relayClient.connectedRole})`
      : 'You';

    // Добавляем в локальный store
    addMessage({
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      text,
      senderId: relayClient.connectedUserId || 'local',
      senderName,
      timestamp: Date.now(),
      type: 'user',
    });

    // Отправляем через Relay если подключены
    if (relayClient.status === 'connected') {
      relayClient.send('chat_message', {
        channel: 'general',
        text,
        sender_name: senderName,
      });
    }

    setInputText('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet.</div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message chat-message-${message.type}`}
          >
            {message.type === 'system' ? (
              <span className="chat-system-text">{message.text}</span>
            ) : (
              <>
                <span className="chat-sender">{message.senderName}</span>
                <span className="chat-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="chat-text">{message.text}</span>
              </>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder={
            isConnected
              ? 'Type a message…'
              : 'Type a message (offline)…'
          }
        />
        <button type="submit" disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}