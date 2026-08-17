import { unwrap } from '../api/hooks';
import { commands } from '../api/bindings';

/** Конфигурация для campaign sharing */
export interface CampaignSharingConfig {
  serverUrl: string;
  roomId: string;
  gmToken: string;
}

/**
 * Экспортирует текущую кампанию в .dndcampaign файл
 * и загружает на Relay Server.
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
 * Скачивает кампанию с Relay Server и открывает её.
 */
export async function downloadCampaignFromRelay(
  serverUrl: string,
  roomId: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const httpUrl = serverUrl.replace(/^ws/, 'http');
  const downloadUrl = `${httpUrl}/api/rooms/${roomId}/campaign`;

  onProgress?.(10);

  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Failed to download campaign: ${response.statusText}`);
  }

  onProgress?.(50);

  const arrayBuffer = await response.arrayBuffer();
  const fileData = Array.from(new Uint8Array(arrayBuffer));

  onProgress?.(80);

  // Сохраняем во временный файл и открываем
  const tempPath = await unwrap(commands.importCampaignFromBytes(fileData));

  onProgress?.(100);

  return tempPath;
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