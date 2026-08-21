import { useState, type FormEvent } from 'react';

import { useCreateCharacter } from '../../shared/api/hooks';
import { Modal } from '../../shared/ui/Modal';

interface CreateCharacterModalProps {
  open: boolean;
  onClose: () => void;
}

type CharacterType = 'pc' | 'npc' | 'monster';

const CHARACTER_TYPES: Array<{
  value: CharacterType;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: 'pc',
    label: 'Player Character',
    icon: '🧙',
    description: 'A hero controlled by a player',
  },
  {
    value: 'npc',
    label: 'Non-Player Character',
    icon: '🧑‍🌾',
    description: 'An ally, merchant, or quest giver',
  },
  {
    value: 'monster',
    label: 'Monster',
    icon: '👹',
    description: 'An enemy or creature',
  },
];

export function CreateCharacterModal({
  open,
  onClose,
}: CreateCharacterModalProps) {
  const createCharacter = useCreateCharacter();

  const [name, setName] = useState('');
  const [type, setType] = useState<CharacterType>('pc');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createCharacter.mutate(
      {
        name: name.trim(),
        characterType: type,
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
    if (!createCharacter.isPending) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setType('pc');
  };

  return (
    <Modal
      open={open}
      title="Create New Character"
      onClose={handleClose}
      width={440}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={createCharacter.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-character-form"
            className="btn-primary"
            disabled={!name.trim() || createCharacter.isPending}
          >
            {createCharacter.isPending ? 'Creating…' : 'Create Character'}
          </button>
        </>
      }
    >
      <form id="create-character-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="character-name">Name</label>
          <input
            id="character-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thorin Ironfist"
            autoFocus
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label>Type</label>
          <div className="character-type-selector">
            {CHARACTER_TYPES.map((ct) => (
              <label
                key={ct.value}
                className={`character-type-option ${
                  type === ct.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="character-type"
                  value={ct.value}
                  checked={type === ct.value}
                  onChange={() => setType(ct.value)}
                />
                <span className="character-type-icon">{ct.icon}</span>
                <span className="character-type-label">{ct.label}</span>
                <span className="character-type-description">
                  {ct.description}
                </span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
