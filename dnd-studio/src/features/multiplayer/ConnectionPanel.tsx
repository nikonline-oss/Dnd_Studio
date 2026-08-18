import { useEffect, useState } from 'react';

import { relayClient } from '../../shared/services/relayClient';
import { useUiStore } from '../../shared/stores/ui';
import { checkCampaignAvailability, deleteMultiplayerSession, downloadAndOpenCampaign, getMultiplayerSessions, MultiplayerSession, uploadCampaignToRelay } from '../../shared/services/campaignSharing';
import { MultiplayerSessionInfo } from '../../shared/api/bindings';
import { useOpenMultiplayerCampaign } from '../../shared/api/hooks';

export function ConnectionPanel() {
    const connectionStatus = useUiStore((state) => state.connectionStatus);

    const [mode, setMode] = useState<'create' | 'join'>('join');
    const [serverUrl, setServerUrl] = useState('ws://localhost:3001');
    const [roomId, setRoomId] = useState('');
    const [token, setToken] = useState('');

    const activeProfileName = useUiStore((state) => state.activeProfileName);
    const [displayName, setDisplayName] = useState(activeProfileName || '');
    const [roomName, setRoomName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [savedSessions, setSavedSessions] = useState<MultiplayerSessionInfo[]>([]);
    const [createdRoom, setCreatedRoom] = useState<{
        room_id: string;
        gm_token: string;
        access_code?: string;
    } | null>(null);
    const activeProfileId = useUiStore((state) => state.activeProfileId);
    const openMultiplayerCampaign = useOpenMultiplayerCampaign();

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';


    // Состояние для прогресса
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

    // Инициализация displayName из профиля

    useEffect(() => {
        getMultiplayerSessions(activeProfileId!)
            .then(setSavedSessions)
            .catch(console.error);
    }, []);

    const handleDeleteSession = async (roomId: string) => {
        if (!window.confirm('Delete this saved session?')) return;

        try {
            await deleteMultiplayerSession(roomId, activeProfileId!);
            setSavedSessions((prev) => prev.filter((s) => s.roomId !== roomId));
        } catch (e) {
            console.error('Failed to delete session', e);
        }
    };

    const handleJoinRoom = async () => {
        setError(null);
        setDownloadProgress(null);

        if (!activeProfileId) {
            setError('No active profile. Please select a profile first.');
            return;
        }

        try {
            const campaignInfo = await checkCampaignAvailability(serverUrl, roomId);

            if (campaignInfo.hasCampaign) {
                setDownloadProgress(0);

                // Используем новый метод с profile_id
                await downloadAndOpenCampaign(
                    serverUrl,
                    roomId,
                    'player',
                    displayName || 'Player',
                    activeProfileId,  // Передать profile_id
                    (percent) => setDownloadProgress(percent),
                );

                setDownloadProgress(null);
            }

            await relayClient.connect({
                serverUrl,
                roomId,
                token,
                displayName: displayName || 'Player',
            });
        } catch (e) {
            setDownloadProgress(null);
            setError(e instanceof Error ? e.message : 'Connection failed');
        }
    };

    const handleCreateRoom = async () => {
        setError(null);
        setUploadProgress(null);

        if (!activeProfileId) {
            setError('No active profile. Please select a profile first.');
            return;
        }

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

            setUploadProgress(0);
            await uploadCampaignToRelay(
                {
                    serverUrl,
                    roomId: data.room_id,
                    gmToken: data.gm_token,
                    displayName: displayName || 'GM',
                },
                (percent) => setUploadProgress(percent),
            );
            setUploadProgress(null);

            await relayClient.connect({
                serverUrl,
                roomId: data.room_id,
                token: data.gm_token,
                displayName: displayName || 'GM',
            });
        } catch (e) {
            setUploadProgress(null);
            setError(e instanceof Error ? e.message : 'Unknown error');
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

                {uploadProgress !== null && (
                    <div className="connection-progress">
                        <div className="connection-progress-bar">
                            <div
                                className="connection-progress-fill"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <span>Uploading campaign… {uploadProgress}%</span>
                    </div>
                )}

                {downloadProgress !== null && (
                    <div className="connection-progress">
                        <div className="connection-progress-bar">
                            <div
                                className="connection-progress-fill"
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                        <span>Downloading campaign… {downloadProgress}%</span>
                    </div>
                )}

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
            {savedSessions.length > 0 && (
                <div className="saved-sessions">
                    <h4>Saved Sessions</h4>
                    {savedSessions.map((session) => (
                        <div key={session.roomId} className="saved-session-item">
                            <div className="saved-session-info">
                                <span className="saved-session-name">
                                    Room: {session.roomId.slice(0, 8)}…
                                </span>
                                <span className="saved-session-meta">
                                    {session.role} · {new Date(session.lastSyncAt * 1000).toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="icon-btn icon-btn-danger"
                                onClick={() => handleDeleteSession(session.roomId)}
                                title="Delete session"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}