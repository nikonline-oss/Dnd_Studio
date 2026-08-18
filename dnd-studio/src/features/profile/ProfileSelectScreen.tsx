import { useState } from 'react';

import {
  useCreateProfile,
  useDeleteProfile,
  useProfiles,
} from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';

export function ProfileSelectScreen() {
  const { data: profiles = [], isLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();

  const setActiveProfile = useUiStore((state) => state.setActiveProfile);

  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectProfile = (profileId: string, profileName: string) => {
    setActiveProfile(profileId, profileName);
  };

  const handleCreateProfile = async () => {
    const name = newProfileName.trim();
    if (!name) return;

    createProfile.mutate(name, {
      onSuccess: (profile) => {
        setNewProfileName('');
        setIsCreating(false);
        // Автоматически выбираем созданный профиль
        setActiveProfile(profile.id, profile.name);
      },
    });
  };

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    if (!window.confirm(`Delete profile "${profileName}" and all its campaigns?`)) {
      return;
    }

    deleteProfile.mutate(profileId);
  };

  return (
    <div className="profile-select-screen">
      <div className="profile-select-content">
        <h1 className="profile-select-title">DndStudio</h1>
        <p className="profile-select-subtitle">Select a profile to continue</p>

        {isLoading && (
          <div className="empty-state">Loading profiles…</div>
        )}

        {!isLoading && profiles.length === 0 && !isCreating && (
          <div className="empty-state">
            No profiles yet. Create one to get started.
          </div>
        )}

        {/* Список профилей */}
        <div className="profile-grid">
          {profiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <button
                type="button"
                className="profile-card-select"
                onClick={() => handleSelectProfile(profile.id, profile.name)}
              >
                <div className="profile-avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-name">{profile.name}</div>
                <div className="profile-meta">
                  Last active:{' '}
                  {new Date(profile.lastActiveAt * 1000).toLocaleDateString()}
                </div>
              </button>

              <button
                type="button"
                className="profile-card-delete"
                onClick={() => handleDeleteProfile(profile.id, profile.name)}
                title="Delete profile"
              >
                🗑️
              </button>
            </div>
          ))}

          {/* Кнопка создания нового профиля */}
          {!isCreating && (
            <button
              type="button"
              className="profile-card profile-card-new"
              onClick={() => setIsCreating(true)}
            >
              <div className="profile-avatar profile-avatar-new">+</div>
              <div className="profile-name">New Profile</div>
            </button>
          )}
        </div>

        {/* Форма создания профиля */}
        {isCreating && (
          <div className="profile-create-form">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Profile name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProfile();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />

            <div className="profile-create-actions">
              <button
                type="button"
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim() || createProfile.isPending}
              >
                {createProfile.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}