import { useState } from 'react';

import { relayClient } from '../../shared/services/relayClient';
import { useUiStore } from '../../shared/stores/ui';

export function ConnectionPanel() {
    const connectionStatus = useUiStore((state) => state.connectionStatus);

    const [mode, setMode] = useState<'create' | 'join'>('join');
    const [serverUrl, setServerUrl] = useState('ws://localhost:3001');
    const [roomId, setRoomId] = useState('');
    const [token, setToken] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [createdRoom, setCreatedRoom] = useState<{
        room_id: string;
        gm_token: string;
        access_code?: string;
    } | null>(null);

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';

    const handleCreateRoom = async () => {
        setError(null);

        try {
            const response = await fetch(`${serverUrl.replace(/^ws/, 'http')}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_name: roomName || 'New Campaign',
                    gm_name: displayName || 'GM',
                    max_players: 6,
                    access_code: accessCode || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create room: ${response.statusText}`);
            }

            const data = await response.json();
            setCreatedRoom(data);

            // Автоматически подключаемся как GM
            await relayClient.connect({
                serverUrl,
                roomId: data.room_id,
                token: data.gm_token,
                displayName: displayName || 'GM',
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        }
    };

    const handleJoinRoom = async () => {
        setError(null);

        try {
            await relayClient.connect({
                serverUrl,
                roomId,
                token,
                displayName: displayName || 'Player',
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Connection failed');
        }
    };

    const handleDisconnect = () => {
        relayClient.disconnect();
        setCreatedRoom(null);
        setError(null);
    };

    if (isConnected) {
        return (
            <div className="connection-panel">
                <div className="connection-status connected">
                    🟢 Connected
                </div>

                <div className="connection-info">
                    <div>
                        User ID: {relayClient.connectedUserId
                            ? `${relayClient.connectedUserId.slice(0, 8)}…`
                            : 'Unknown'}
                    </div>
                    <div>
                        Role: {relayClient.connectedRole === 'gm'
                            ? '👑 Game Master'
                            : relayClient.connectedRole === 'player'
                                ? '🎮 Player'
                                : relayClient.connectedRole || 'Unknown'}
                    </div>
                </div>

                {createdRoom && (
                    <div className="connection-room-info">
                        <h4>Room Created Successfully!</h4>

                        <div className="connection-info-row">
                            <label>Room ID:</label>
                            <div className="connection-info-value">
                                <code>{createdRoom.room_id}</code>
                                <button
                                    type="button"
                                    className="copy-button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdRoom.room_id);
                                        // Можно добавить toast уведомление
                                    }}
                                    title="Copy Room ID"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        <div className="connection-info-row">
                            <label>GM Token:</label>
                            <div className="connection-info-value">
                                <code>{createdRoom.gm_token}</code>
                                <button
                                    type="button"
                                    className="copy-button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdRoom.gm_token);
                                    }}
                                    title="Copy GM Token"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        {createdRoom.access_code && (
                            <div className="connection-info-row">
                                <label>Access Code:</label>
                                <div className="connection-info-value">
                                    <code>{createdRoom.access_code}</code>
                                    <button
                                        type="button"
                                        className="copy-button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdRoom.access_code!);
                                        }}
                                        title="Copy Access Code"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="connection-info-hint">
                            <p><strong>Для игроков:</strong></p>
                            <p>1. Дайте им <strong>Room ID</strong> и <strong>Access Code</strong></p>
                            <p>2. Они выбирают "Join Room" и вводят эти данные</p>
                        </div>
                    </div>
                )}

                <button type="button" onClick={handleDisconnect}>
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="connection-panel">
            <div className={`connection-status ${connectionStatus}`}>
                {connectionStatus === 'connecting' && '🟡 Connecting…'}
                {connectionStatus === 'disconnected' && '⚪ Disconnected'}
                {connectionStatus === 'error' && '🔴 Error'}
            </div>

            {error && <div className="connection-error">{error}</div>}

            <div className="connection-mode-tabs">
                <button
                    type="button"
                    className={mode === 'join' ? 'active' : ''}
                    onClick={() => setMode('join')}
                >
                    Join Room
                </button>
                <button
                    type="button"
                    className={mode === 'create' ? 'active' : ''}
                    onClick={() => setMode('create')}
                >
                    Create Room
                </button>
            </div>

            <label>
                Server URL
                <input
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="ws://localhost:3001"
                />
            </label>

            <label>
                Display Name
                <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                />
            </label>

            {mode === 'join' ? (
                <>
                    <label>
                        Room ID
                        <input
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Room ID"
                        />
                    </label>

                    <label>
                        Token / Access Code
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="GM token or access code"
                            type="password"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={handleJoinRoom}
                        disabled={isConnecting || !roomId}
                    >
                        {isConnecting ? 'Connecting…' : 'Join'}
                    </button>
                </>
            ) : (
                <>
                    <label>
                        Room Name
                        <input
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="My Campaign"
                        />
                    </label>

                    <label>
                        Access Code (optional)
                        <input
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="Secret code for players"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={handleCreateRoom}
                        disabled={isConnecting || !displayName}
                    >
                        {isConnecting ? 'Creating…' : 'Create & Join'}
                    </button>
                </>
            )}
        </div>
    );
}