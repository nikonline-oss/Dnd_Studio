import { FormEvent, useState } from 'react';
import { useCampaigns, useCreateCampaign, useCreateServerCampaign, useDeleteCampaign, useOpenCampaign } from '../../shared/api/hooks';
import { open } from '@tauri-apps/plugin-dialog';
import { useImportCampaign } from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';

export function StartScreen() {
  const [campaignType, setCampaignType] = useState<'local' | 'server'>('local');
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:3001');
  const [roomName, setRoomName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const activeProfileId = useUiStore((state) => state.activeProfileId);

  const { data: campaigns = [], isLoading } = useCampaigns(activeProfileId!);
  const createCampaign = useCreateCampaign();
  const createServerCampaign = useCreateServerCampaign();
  const deleteCampaign = useDeleteCampaign(activeProfileId!);
  const openCampaign = useOpenCampaign(activeProfileId!);

  const importCampaign = useImportCampaign();

  const handleDeleteCampaign = async () => {
    if (!pendingDelete) return;

    deleteCampaign.mutate(
      { campaignId: pendingDelete.id, profileId: activeProfileId! },
      {
        onSuccess: () => {
          setPendingDelete(null);
        },
      },
    );
  };

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Kампания DndStudio',
            extensions: ['dndcampaign'],
          },
        ],
      });

      if (typeof selected === 'string') {
        importCampaign.mutate({
          sourcePath: selected,
          profileId: activeProfileId!,
        });
      }
    } catch (error) {
      console.error('Import failed', error);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (campaignType === 'local') {
      createCampaign.mutate({ name: name.trim(), profileId: activeProfileId! });
    } else {
      if (!serverUrl.trim()) {
        alert('Введите адрес Relay Server');
        return;
      }
      if (!roomName.trim()) {
        alert('Введите название комнаты');
        return;
      }
      createServerCampaign.mutate({
        name: name.trim(),
        profileId: activeProfileId!,
        serverUrl: serverUrl.trim(),
        roomName: roomName.trim(),
        accessCode: accessCode || undefined,
      });
    }
    setName('');
  };

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1>DndStudio</h1>
        <p>Создайте или откройте кампанию для начала работы.</p>

        <form className="start-form" onSubmit={onSubmit}>
          {/* Переключатель типа кампании */}
          <div className="form-field">
            <label>Тип кампании</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="local"
                  checked={campaignType === 'local'}
                  onChange={() => setCampaignType('local')}
                />
                Локальная (офлайн)
              </label>
              <label>
                <input
                  type="radio"
                  value="server"
                  checked={campaignType === 'server'}
                  onChange={() => setCampaignType('server')}
                />
                Серверная (мультиплеер)
              </label>
            </div>
          </div>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название кампании"
          />

          {campaignType === 'server' && (
            <>
              <input
                value={serverUrl}
                onChange={(event) => setServerUrl(event.target.value)}
                placeholder="Адрес Relay Server (ws://localhost:3001)"
              />
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Название комнаты"
              />
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Код доступа (опционально)"
                type="password"
              />
            </>
          )}

          <button
            type="submit"
            disabled={
              (createCampaign.isPending || createServerCampaign.isPending) ||
              !name.trim() ||
              (campaignType === 'server' && (!serverUrl.trim() || !roomName.trim()))
            }
          >
            {createCampaign.isPending
              ? 'Создание…'
              : createServerCampaign.isPending
              ? 'Создание и загрузка…'
              : campaignType === 'local'
              ? 'Создать кампанию'
              : 'Создать серверную кампанию'}
          </button>
        </form>

        <div className="start-import">
          <button
            type="button"
            onClick={handleImport}
            disabled={importCampaign.isPending}
          >
            {importCampaign.isPending ? 'Импорт…' : 'Импортировать кампанию (.dndcampaign)'}
          </button>
        </div>

        {createCampaign.isError && (
          <div className="error-text">
            Не удалось создать кампанию.
          </div>
        )}

        {createServerCampaign.isError && (
          <div className="error-text">
            Не удалось создать серверную кампанию. Проверьте соединение с сервером.
          </div>
        )}

        <div className="start-join-server">
          <a
            href="#"
            className="link-button"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Открыть модальное окно присоединения
              alert('Функция присоединения к серверной кампании будет доступна в следующем обновлении');
            }}
          >
            👥 Присоединиться к игре
          </a>
        </div>

        <section className="recent-campaigns">
          <h2>Последние кампании</h2>

          {isLoading && <p>Загрузка…</p>}

          {!isLoading && campaigns.length === 0 && (
            <p>Кампаний пока нет.</p>
          )}

          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="navigator-item-row">
                  <span className="navigator-item-grow">
                    <button
                      type="button"
                      onClick={() => openCampaign.mutate(campaign.id)}
                      disabled={openCampaign.isPending}
                    >
                      {campaign.name}
                    </button>
                  </span>
                  {activeProfileId && (
                    <span className="navigator-item-delete-wrapper">
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger navigator-item-delete"
                        title="Удалить кампанию"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDelete({ id: campaign.id, name: campaign.name });
                        }}
                      >
                        🗑️
                      </button>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ConfirmDialog
          open={pendingDelete !== null}
          title="Удаление кампании"
          message={`Вы уверены, что хотите удалить "${pendingDelete?.name}"? Это действие необратимо. Все карты, персонажи и ресурсы будут удалены навсегда.`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          destructive
          onConfirm={handleDeleteCampaign}
          onCancel={() => setPendingDelete(null)}
        />
      </div>
    </div>
  );
}