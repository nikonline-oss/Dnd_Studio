import { useEffect, useState } from 'react';

import {
  useCharacter,
  usePluginSheet,
  usePluginSheets,
  useUpdateCharacter,
} from '../../shared/api/hooks';
import { useWorkspaceStore } from '../../shared/stores/workspace';

import { SheetRenderer } from '../sheets/SheetRenderer';

type CharacterType = 'pc' | 'npc' | 'monster';

interface CharacterFormData {
  hp: { current: number; max: number; temp: number };
  ac: number;
  initiativeMod: number;
  speed: number;
  notes: string;
  [key: string]: unknown;
}

const DEFAULT_DATA: CharacterFormData = {
  hp: { current: 0, max: 0, temp: 0 },
  ac: 10,
  initiativeMod: 0,
  speed: 30,
  notes: '',
};

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCharacterData(rawJson: string): CharacterFormData {
  try {
    const parsed = JSON.parse(rawJson);

    return {
      ...DEFAULT_DATA,
      ...parsed,
      hp: {
        current: toNumber(parsed?.hp?.current, 0),
        max: toNumber(parsed?.hp?.max, 0),
        temp: toNumber(parsed?.hp?.temp, 0),
      },
      ac: toNumber(parsed?.ac, 10),
      initiativeMod: toNumber(parsed?.initiativeMod, 0),
      speed: toNumber(parsed?.speed, 30),
      notes: typeof parsed?.notes === 'string' ? parsed.notes : '',
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function CharacterTab({ characterId }: { characterId?: string }) {
  const { data: character, isLoading } = useCharacter(characterId);
  const updateCharacter = useUpdateCharacter();
  const { data: availableSheets = [] } = usePluginSheets(Boolean(characterId));

  const renameTabByEntity = useWorkspaceStore(
    (state) => state.renameTabByEntity,
  );

  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>('pc');
  const [data, setData] = useState<CharacterFormData>(DEFAULT_DATA);
  const [selectedSheetKey, setSelectedSheetKey] = useState<string | null>(null);
  const [selectedSheetPluginId, setSelectedSheetPluginId] = useState<string | null>(null);

  // Загруженный sheet JSON
  const { data: sheetJson } = usePluginSheet(
    selectedSheetPluginId ?? undefined,
    selectedSheetKey ?? undefined,
  );

  useEffect(() => {
    if (!character || character.id === initializedFor) {
      return;
    }

    setName(character.name);
    setCharacterType(character.type as CharacterType);
    setData(parseCharacterData(character.dataJson));

    // Восстанавливаем выбранный шаблон из data
    try {
      const parsed = JSON.parse(character.dataJson);
      if (parsed._sheetPluginId && parsed._sheetKey) {
        setSelectedSheetPluginId(parsed._sheetPluginId);
        setSelectedSheetKey(parsed._sheetKey);
      }
    } catch {
      // ignore
    }

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

  const handleSave = () => {
    const safeName = name.trim() || 'Unnamed';

    // Сохраняем выбранный шаблон в data
    const dataToSave = {
      ...data,
      _sheetPluginId: selectedSheetPluginId,
      _sheetKey: selectedSheetKey,
    };

    const dataJson = JSON.stringify(dataToSave);

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

  const handleSheetChange = (value: string) => {
    if (!value) {
      setSelectedSheetPluginId(null);
      setSelectedSheetKey(null);
      return;
    }

    const [pluginId, sheetKey] = value.split('::');
    setSelectedSheetPluginId(pluginId);
    setSelectedSheetKey(sheetKey);
  };

  const currentSheetValue =
    selectedSheetPluginId && selectedSheetKey
      ? `${selectedSheetPluginId}::${selectedSheetKey}`
      : '';

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

        {/* Выбор шаблона листа */}
        <select
          value={currentSheetValue}
          onChange={(event) => handleSheetChange(event.target.value)}
          title="Sheet template"
        >
          <option value="">Default form</option>
          {availableSheets.map((sheet) => (
            <option
              key={`${sheet.pluginId}::${sheet.sheetKey}`}
              value={`${sheet.pluginId}::${sheet.sheetKey}`}
            >
              {sheet.name}
            </option>
          ))}
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
        {sheetJson ? (
          /* Декларативный лист из плагина */
          <SheetRenderer
            sheetJson={sheetJson}
            data={data as Record<string, unknown>}
            onChange={(newData) =>
              setData(newData as CharacterFormData)
            }
          />
        ) : (
          /* Хардкод-форма по умолчанию */
          <>
            <section className="character-section">
              <h3>Combat</h3>

              <div className="character-grid">
                <label>
                  HP current
                  <input
                    type="number"
                    value={data.hp.current}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        hp: {
                          ...prev.hp,
                          current: Number(event.target.value) || 0,
                        },
                      }))
                    }
                  />
                </label>

                <label>
                  HP max
                  <input
                    type="number"
                    value={data.hp.max}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        hp: {
                          ...prev.hp,
                          max: Number(event.target.value) || 0,
                        },
                      }))
                    }
                  />
                </label>

                <label>
                  HP temp
                  <input
                    type="number"
                    value={data.hp.temp}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        hp: {
                          ...prev.hp,
                          temp: Number(event.target.value) || 0,
                        },
                      }))
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
          </>
        )}
      </div>
    </div>
  );
}