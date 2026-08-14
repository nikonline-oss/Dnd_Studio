import { FormEvent, useEffect, useRef, useState } from 'react';

import { useActiveCampaign } from '../../shared/api/hooks';
import { formatNumber, rollExpression } from '../../shared/lib/dice';
import { useChatStore, type ChatMessage } from '../../shared/stores/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];

const QUICK_ROLLS = [
  '1d20',
  '1d12',
  '1d10',
  '1d8',
  '1d6',
  '1d4',
  '2d4*23',
];

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function DiceMessage({ message }: { message: ChatMessage }) {
  const roll = message.roll;

  if (!roll) {
    return null;
  }

  const criticalClass = roll.natural20
    ? 'dice-total-crit'
    : roll.natural1
      ? 'dice-total-fumble'
      : '';

  return (
    <div className="chat-message chat-message-dice">
      <div className="chat-message-header">
        <span>{message.author} rolled {roll.input}</span>
        <time>{formatTime(message.createdAt)}</time>
      </div>

      <div className="chat-dice-breakdown">
        {roll.breakdown}
      </div>

      <div className="chat-dice-result">
        <span className={`chat-dice-total ${criticalClass}`}>
          = {formatNumber(roll.total)}
        </span>

        {roll.natural20 && (
          <span className="chat-dice-badge">CRIT</span>
        )}

        {roll.natural1 && (
          <span className="chat-dice-badge">FUMBLE</span>
        )}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { data: activeCampaign } = useActiveCampaign();

  const messagesByCampaign = useChatStore(
    (state) => state.messagesByCampaign,
  );

  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const addSystemMessage = useChatStore((state) => state.addSystemMessage);
  const addDiceRoll = useChatStore((state) => state.addDiceRoll);
  const clearChat = useChatStore((state) => state.clearChat);

  const [input, setInput] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messages = activeCampaign
    ? messagesByCampaign[activeCampaign.id] ?? EMPTY_MESSAGES
    : EMPTY_MESSAGES;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length]);

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to use chat.
      </div>
    );
  }

  const performRoll = (notation: string) => {
    const roll = rollExpression(notation);

    if (!roll) {
      addSystemMessage(
        activeCampaign.id,
        `Cannot parse dice expression: ${notation}`,
      );

      return;
    }

    addDiceRoll(activeCampaign.id, roll);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    const text = input.trim();

    if (!text) {
      return;
    }

    const commandMatch = text.match(/^\/(?:roll|r)\s+(.*)$/i);

    if (commandMatch) {
      performRoll(commandMatch[1]);
      setInput('');
      return;
    }

    const directRoll = text.includes('d')
      ? rollExpression(text)
      : null;

    if (directRoll) {
      addDiceRoll(activeCampaign.id, directRoll);
      setInput('');
      return;
    }

    addUserMessage(activeCampaign.id, text);
    setInput('');
  };

  return (
    <div className="chat">
      <div className="chat-toolbar">
        <div className="chat-quick-actions">
          {QUICK_ROLLS.map((notation) => (
            <button
              key={notation}
              type="button"
              onClick={() => performRoll(notation)}
            >
              {notation}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => clearChat(activeCampaign.id)}
        >
          Clear
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            No messages yet. Try `/roll 2d4*23`.
          </div>
        )}

        {messages.map((message) => {
          if (message.kind === 'dice') {
            return (
              <DiceMessage
                key={message.id}
                message={message}
              />
            );
          }

          if (message.kind === 'system') {
            return (
              <div
                key={message.id}
                className="chat-message chat-message-system"
              >
                <div className="chat-message-header">
                  <span>System</span>
                  <time>{formatTime(message.createdAt)}</time>
                </div>

                <div className="chat-message-text">{message.text}</div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className="chat-message chat-message-user"
            >
              <div className="chat-message-header">
                <span>{message.author}</span>
                <time>{formatTime(message.createdAt)}</time>
              </div>

              <div className="chat-message-text">{message.text}</div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Message or /roll 2d4*23"
        />

        <button type="submit" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}