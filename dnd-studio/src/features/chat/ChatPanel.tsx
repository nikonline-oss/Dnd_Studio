import { FormEvent, useEffect, useRef, useState } from 'react';

import { relayClient } from '../../shared/services/relayClient';
import { useChatStore } from '../../shared/stores/chat';
import { useUiStore } from '../../shared/stores/ui';

/** Парсинг команды из текста сообщения */
function parseCommand(text: string): { command: string; args: string[] } | null {
  if (!text.startsWith('/')) return null;

  const parts = text.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

/** Простой бросок костей (для /roll) */
function rollDiceNotation(notation: string): { rolls: number[]; total: number } | null {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return null;

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || '0', 10);

  if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;

  return { rolls, total };
}

export function ChatPanel() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const addSystemMessage = useChatStore((state) => state.addSystemMessage);
  const addDiceMessage = useChatStore((state) => state.addDiceMessage);
  const connectionStatus = useUiStore((state) => state.connectionStatus);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isConnected = connectionStatus === 'connected';

  const handleSend = (event: FormEvent) => {
    event.preventDefault();

    const text = inputText.trim();
    if (!text) return;

    // Проверяем, является ли текст командой
    const cmd = parseCommand(text);

    if (cmd) {
      handleCommand(cmd.command, cmd.args);
      setInputText('');
      return;
    }

    // Определяем имя отправителя
    const senderName = isConnected
      ? relayClient.displayName
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

    // Отправляем через Relay
    if (isConnected) {
      relayClient.send('chat_message', {
        channel: 'general',
        text,
        sender_name: senderName,
      });
    }

    setInputText('');
  };

  const handleCommand = (command: string, args: string[]) => {
    switch (command) {
      case 'help': {
        addSystemMessage(
          'Commands: /roll <dice> (e.g. /roll 1d20), /help',
        );
        break;
      }

      case 'roll': {
        const notation = args[0] || '1d20';
        const result = rollDiceNotation(notation);

        if (!result) {
          addSystemMessage(`Invalid dice notation: ${notation}`);
          return;
        }

        const senderName = isConnected ? relayClient.displayName : 'You';

        // Добавляем локально
        addDiceMessage(senderName, notation, result.total);

        // Отправляем через Relay
        if (isConnected) {
          relayClient.send('dice_roll', {
            notation,
            result: result.total,
            rolls: result.rolls,
            modifier: 0,
            roller_name: senderName,
          });
        }
        break;
      }

      default: {
        addSystemMessage(`Unknown command: /${command}. Type /help for list.`);
        break;
      }
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet. Type /help for commands.</div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message chat-message-${message.type}`}
          >
            {message.type === 'system' ? (
              <span className="chat-system-text">{message.text}</span>
            ) : message.type === 'dice' ? (
              <>
                <span className="chat-sender">{message.senderName}</span>
                <span className="chat-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="chat-dice-text">
                  🎲 {message.diceNotation} → <strong>{message.diceResult}</strong>
                </span>
              </>
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
              ? 'Type a message or /roll 1d20…'
              : 'Type a message or /roll 1d20…'
          }
        />
        <button type="submit" disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}