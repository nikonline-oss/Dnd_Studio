import { FormEvent, useState } from 'react';
import { useCampaigns, useCreateCampaign, useOpenCampaign } from '../../shared/api/hooks';
import { open } from '@tauri-apps/plugin-dialog';
import { useImportCampaign } from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';

export function StartScreen() {
  const [name, setName] = useState('');

  const activeProfileId = useUiStore((state) => state.activeProfileId);

  const { data: campaigns = [], isLoading } = useCampaigns(activeProfileId!);
  const createCampaign = useCreateCampaign(activeProfileId!);
  const openCampaign = useOpenCampaign(activeProfileId!);

  const importCampaign = useImportCampaign();

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'DndStudio Campaign',
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

    createCampaign.mutate(name.trim());
    setName('');
  };

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1>DndStudio</h1>
        <p>Create or open a campaign to start.</p>

        <form className="start-form" onSubmit={onSubmit}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Campaign name"
          />
          <button type="submit" disabled={createCampaign.isPending || !name.trim()}>
            {createCampaign.isPending ? 'Creating…' : 'Create campaign'}
          </button>
        </form>

        <div className="start-import">
          <button
            type="button"
            onClick={handleImport}
            disabled={importCampaign.isPending}
          >
            {importCampaign.isPending ? 'Importing…' : 'Import campaign (.dndcampaign)'}
          </button>
        </div>

        {createCampaign.isError && (
          <div className="error-text">
            Failed to create campaign.
          </div>
        )}

        <section className="recent-campaigns">
          <h2>Recent campaigns</h2>

          {isLoading && <p>Loading…</p>}

          {!isLoading && campaigns.length === 0 && (
            <p>No campaigns yet.</p>
          )}

          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <button
                  type="button"
                  onClick={() => openCampaign.mutate(campaign.id)}
                  disabled={openCampaign.isPending}
                >
                  {campaign.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}