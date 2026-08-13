import { FormEvent, useState } from 'react';
import { useCampaigns, useCreateCampaign, useOpenCampaign } from '../../shared/api/hooks';

export function StartScreen() {
  const [name, setName] = useState('');

  const { data: campaigns = [], isLoading } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const openCampaign = useOpenCampaign();

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