import { unwrap } from '../api/hooks';
import { commands } from '../api/bindings';

export interface CampaignSharingConfig {
    serverUrl: string;
    roomId: string;
    gmToken: string;
    displayName: string;
}

/**
 * GM: Экспортирует кампанию как ZIP и загружает на сервер.
 */
export async function uploadCampaignToRelay(
    config: CampaignSharingConfig,
    onProgress?: (percent: number) => void,
): Promise<void> {
    const tempZipPath = await unwrap(commands.exportCampaignZipToTemp());
    console.log('[CampaignSharing] ZIP created:', tempZipPath);

    const zipData = await unwrap(commands.readFileBytes(tempZipPath));
    console.log('[CampaignSharing] ZIP read, size:', zipData.length, 'bytes');

    if (!zipData || zipData.length === 0) {
        throw new Error('Exported campaign archive is empty');
    }

    const httpUrl = config.serverUrl.replace(/^ws/, 'http');
    const uploadUrl = `${httpUrl}/api/rooms/${config.roomId}/campaign`;

    console.log('[CampaignSharing] Uploading ZIP to:', uploadUrl);
    onProgress?.(10);

    const body = new Uint8Array(zipData);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body,
    });

    onProgress?.(100);

    if (!response.ok) {
        throw new Error(`Failed to upload campaign: ${response.statusText}`);
    }

    await unwrap(commands.deleteTempFile(tempZipPath));
}

/**
 * Player: Запрашивает отфильтрованные данные кампании с сервера.
 * НЕ скачивает ZIP — работает через REST API.
 */
export async function fetchCampaignEntities(
    serverUrl: string,
    roomId: string,
    token: string,
): Promise<any> {
    const httpUrl = serverUrl.replace(/^ws/, 'http');
    const entitiesUrl = `${httpUrl}/api/rooms/${roomId}/entities?token=${encodeURIComponent(token)}`;

    console.log('[CampaignSharing] Fetching entities from:', entitiesUrl);

    const response = await fetch(entitiesUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch campaign entities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[CampaignSharing] Entities received:', data);

    return data;
}

/**
 * Player: Загружает ассет по хэшу (ленивая загрузка).
 */
export async function fetchAssetByHash(
    serverUrl: string,
    roomId: string,
    hash: string,
): Promise<Uint8Array> {
    const httpUrl = serverUrl.replace(/^ws/, 'http');
    const assetUrl = `${httpUrl}/api/rooms/${roomId}/assets/${hash}`;

    const response = await fetch(assetUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

export async function getMultiplayerSessions(
    profileId: string,
): Promise<any[]> {
    return unwrap(commands.listMultiplayerSessions(profileId));
}

export async function deleteMultiplayerSession(
    roomId: string,
    profileId: string,
): Promise<void> {
    await unwrap(commands.deleteMultiplayerSession(roomId, profileId));
}
