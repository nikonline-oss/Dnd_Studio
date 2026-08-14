import { useEffect, useState } from 'react';

import {
  useCharacter,
  useUpdateCharacter,
} from '../../shared/api/hooks';
import { useWorkspaceStore } from '../../shared/stores/workspace';

type CharacterType = 'pc' | 'npc' | 'monster';

interface CharacterHp {
  current: number;
  max: number;
  temp: number;
}

interface CharacterFormData {
  hp: CharacterHp;
  ac: number;
  initiativeMod: number;
  speed: number;
  notes: string;
}

const DEFAULT_DATA: CharacterFormData = {
  hp: {
    current: 0,
    max: 0,
    temp: 0,
  },
  ac: 10,
  initiativeMod: 0,
  speed: 30,
  notes: '',
};

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function parseCharacterData(rawJson: string): CharacterFormData {
  try {
    const parsed = JSON.parse(rawJson);

    return {
      hp: {
        current: toNumber(parsed?.hp?.current, DEFAULT_DATA.hp.current),
        max: toNumber(parsed?.hp?.max, DEFAULT_DATA.hp.max),
        temp: toNumber(parsed?.hp?.temp, DEFAULT_DATA.hp.temp),
      },
      ac: toNumber(parsed?.ac, DEFAULT_DATA.ac),
      initiativeMod: toNumber(
        parsed?.initiativeMod,
        DEFAULT_DATA.initiativeMod,
      ),
      speed: toNumber(parsed?.speed, DEFAULT_DATA.speed),
      notes:
        typeof parsed?.notes === 'string'
          ? parsed.notes
          : DEFAULT_DATA.notes,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function CharacterTab({ characterId }: { characterId?: string }) {
  const { data: character, isLoading } = useCharacter(characterId);

  const updateCharacter = useUpdateCharacter();

  const renameTabByEntity = useWorkspaceStore(
    (state) => state.renameTabByEntity,
  );

  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>('pc');
  const [data, setData] = useState<CharacterFormData>(DEFAULT_DATA);

  useEffect(() => {
    if (!character || character.id === initializedFor) {
      return;
    }

    setName(character.name);
    setCharacterType(character.type as CharacterType);
    setData(parseCharacterData(character.dataJson));
    setInitializedFor(character.id);
  }, [character, initializedFor]);

  if (!characterId) {
    return (
      <div className="workspace-empty">
        Character tab is broken: missing character id.
      </div>
    );
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading character…</div>;
  }

  if (!character) {
    return <div className="workspace-empty">Character not found.</div>;
  }

  const setHpField = (
    field: keyof CharacterHp,
    value: number,
  ) => {
    setData((prev) => ({
      ...prev,
      hp: {
        ...prev.hp,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const safeName = name.trim() || 'Unnamed';

    const dataJson = JSON.stringify(data);

    updateCharacter.mutate(
      {
        id: character.id,
        name: safeName,
        characterType,
        dataJson,
      },
      {
        onSuccess: () => {
          renameTabByEntity('character', character.id, safeName);
        },
      },
    );
  };

  return (
    <div className="character-tab">
      <div className="character-toolbar">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Character name"
        />

        <select
          value={characterType}
          onChange={(event) =>
            setCharacterType(event.target.value as CharacterType)
          }
        >
          <option value="pc">PC</option>
          <option value="npc">NPC</option>
          <option value="monster">Monster</option>
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateCharacter.isPending}
        >
          {updateCharacter.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="character-content">
        <section className="character-section">
          <h3>Combat</h3>

          <div className="character-grid">
            <label>
              HP current
              <input
                type="number"
                value={data.hp.current}
                onChange={(event) =>
                  setHpField('current', Number(event.target.value) || 0)
                }
              />
            </label>

            <label>
              HP max
              <input
                type="number"
                value={data.hp.max}
                onChange={(event) =>
                  setHpField('max', Number(event.target.value) || 0)
                }
              />
            </label>

            <label>
              HP temp
              <input
                type="number"
                value={data.hp.temp}
                onChange={(event) =>
                  setHpField('temp', Number(event.target.value) || 0)
                }
              />
            </label>

            <label>
              AC
              <input
                type="number"
                value={data.ac}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    ac: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>

            <label>
              Initiative mod
              <input
                type="number"
                value={data.initiativeMod}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    initiativeMod: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>

            <label>
              Speed
              <input
                type="number"
                value={data.speed}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    speed: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>
          </div>
        </section>

        <section className="character-section">
          <h3>Notes</h3>

          <textarea
            className="character-notes"
            value={data.notes}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
            placeholder="Character notes…"
          />
        </section>
      </div>
    </div>
  );
}