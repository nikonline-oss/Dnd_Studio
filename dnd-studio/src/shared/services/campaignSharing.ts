import { unwrap } from '../api/hooks';
import { commands, MultiplayerSessionInfo } from '../api/bindings';
import { useUiStore } from '../stores/ui';

/** Конфигурация для campaign sharing */
export interface CampaignSharingConfig {
    serverUrl: string;
    roomId: string;
    gmToken: string;
    displayName: string;
}

/** Метаданные мультиплеерной сессии */
export interface MultiplayerSession {
    room_id: string;
    server_url: string;
    role: string;
    display_name: string;
    connected_at: number;
    last_sync_at: number;
    has_db?: boolean;
}

/**
 * Экспортирует текущую кампанию и загружает на Relay Server.
 */
export async function uploadCampaignToRelay(
    config: CampaignSharingConfig,
    onProgress?: (percent: number) => void,
): Promise<void> {
    // 1. Экспортируем кампанию во временный файл
    const tempPath = await unwrap(commands.exportCampaignToTemp());

    // 2. Читаем файл
    const fileData = await unwrap(commands.readFileBytes(tempPath));

    // 3. Загружаем на сервер
    const httpUrl = config.serverUrl.replace(/^ws/, 'http');
    const uploadUrl = `${httpUrl}/api/rooms/${config.roomId}/campaign`;

    onProgress?.(10);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': `Bearer ${config.gmToken}`,
        },
        body: new Uint8Array(fileData),
    });

    onProgress?.(100);

    if (!response.ok) {
        throw new Error(`Failed to upload campaign: ${response.statusText}`);
    }

    // 4. Удаляем временный файл
    await unwrap(commands.deleteTempFile(tempPath));
}

/**
 * Скачивает кампанию с Relay Server в изолированную директорию
 * и открывает её.
 */
export async function downloadAndOpenCampaign(
    serverUrl: string,
    roomId: string,
    role: string,
    displayName: string,
    profileId: string,
    onProgress?: (percent: number) => void,
): Promise<void> {
    const httpUrl = serverUrl.replace(/^ws/, 'http');
    const downloadUrl = `${httpUrl}/api/rooms/${roomId}/campaign`;

    onProgress?.(10);

    const response = await fetch(downloadUrl);

    if (!response.ok) {
        throw new Error(`Failed to download campaign: ${response.statusText}`);
    }

    onProgress?.(40);

    const arrayBuffer = await response.arrayBuffer();
    const fileData = Array.from(new Uint8Array(arrayBuffer));

    onProgress?.(60);

    // Сохраняем с profile_id
    await unwrap(
        commands.saveMultiplayerCampaign(
            roomId,
            serverUrl,
            role,
            displayName,
            fileData,
            profileId,
        ),
    );

    onProgress?.(80);

    // Открываем с profile_id
    const campaign = await unwrap(
        commands.openMultiplayerCampaign(roomId, profileId),
    );

    onProgress?.(100);

    // Обновляем Zustand store
    useUiStore.getState().setActiveCampaign(campaign);
}

export async function getMultiplayerSessions(
    profileId: string,
): Promise<MultiplayerSessionInfo[]> {
    return unwrap(commands.listMultiplayerSessions(profileId));
}

export async function deleteMultiplayerSession(
    roomId: string,
    profileId: string,
): Promise<void> {
    await unwrap(commands.deleteMultiplayerSession(roomId, profileId));
}

export async function reconnectToSession(
    session: MultiplayerSessionInfo,
    profileId: string,
    displayName: string,
    onProgress?: (percent: number) => void,
): Promise<void> {
    const availability = await checkCampaignAvailability(
        session.serverUrl,
        session.roomId,
    );

    if (availability.hasCampaign) {
        await downloadAndOpenCampaign(
            session.serverUrl,
            session.roomId,
            session.role,
            displayName || session.displayName,
            profileId,
            onProgress,
        );
    } else {
        await unwrap(commands.openMultiplayerCampaign(session.roomId, profileId));
    }

    await unwrap(
        commands.updateMultiplayerSession(
            session.roomId,
            session.serverUrl,
            session.role,
            displayName || session.displayName,
            profileId,
        ),
    );
}
/**
 * Проверяет, есть ли кампания на сервере.
 */
export async function checkCampaignAvailability(
    serverUrl: string,
    roomId: string,
): Promise<{ hasCampaign: boolean; fileSize: number | null }> {
    const httpUrl = serverUrl.replace(/^ws/, 'http');
    const infoUrl = `${httpUrl}/api/rooms/${roomId}/campaign/info`;

    const response = await fetch(infoUrl);

    if (!response.ok) {
        return { hasCampaign: false, fileSize: null };
    }

    const data = await response.json();
    return {
        hasCampaign: data.has_campaign,
        fileSize: data.file_size,
    };
}