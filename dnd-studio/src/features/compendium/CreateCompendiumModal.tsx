import { useState, type FormEvent } from 'react';

import { useCreateCompendium } from '../../shared/api/hooks';
import { Modal } from '../../shared/ui/Modal';

interface CreateCompendiumModalProps {
  open: boolean;
  onClose: () => void;
}

type CompendiumType = 'monster' | 'item' | 'spell' | 'feat' | 'race' | 'class' | 'other';

const COMPENDIUM_TYPES: Array<{ value: CompendiumType; label: string; icon: string }> = [
  { value: 'monster', label: 'Monsters', icon: '👹' },
  { value: 'item', label: 'Items', icon: '🗡️' },
  { value: 'spell', label: 'Spells', icon: '✨' },
  { value: 'feat', label: 'Feats', icon: '🎯' },
  { value: 'race', label: 'Races', icon: '🧝' },
  { value: 'class', label: 'Classes', icon: '⚔️' },
  { value: 'other', label: 'Other', icon: '📚' },
];

export function CreateCompendiumModal({
  open,
  onClose,
}: CreateCompendiumModalProps) {
  const createCompendium = useCreateCompendium();

  const [name, setName] = useState('');
  const [type, setType] = useState<CompendiumType>('monster');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createCompendium.mutate(
      {
        name: name.trim(),
        compendiumType: type,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      },
    );
  };

  const handleClose = () => {
    if (!createCompendium.isPending) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setType('monster');
  };

  return (
    <Modal
      open={open}
      title="Create New Compendium"
      onClose={handleClose}
      width={440}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={createCompendium.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-compendium-form"
            className="btn-primary"
            disabled={!name.trim() || createCompendium.isPending}
          >
            {createCompendium.isPending ? 'Creating…' : 'Create Compendium'}
          </button>
        </>
      }
    >
      <form id="create-compendium-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="compendium-name">Name</label>
          <input
            id="compendium-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Homebrew Monsters"
            autoFocus
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label>Type</label>
          <div className="compendium-type-selector">
            {COMPENDIUM_TYPES.map((ct) => (
              <label
                key={ct.value}
                className={`compendium-type-option ${
                  type === ct.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="compendium-type"
                  value={ct.value}
                  checked={type === ct.value}
                  onChange={() => setType(ct.value)}
                />
                <span className="compendium-type-icon">{ct.icon}</span>
                <span className="compendium-type-label">{ct.label}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
