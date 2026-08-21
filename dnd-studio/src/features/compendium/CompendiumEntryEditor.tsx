import { useState, useEffect } from 'react';

import { useUpdateCompendiumEntry } from '../../shared/api/hooks';
import type { CompendiumEntrySummary } from '../../shared/api/bindings';
import { MonsterCard } from './MonsterCard';

interface CompendiumEntryEditorProps {
  entry: CompendiumEntrySummary;
  onClose: () => void;
  onDelete?: () => void;
}

export function CompendiumEntryEditor({
  entry,
  onClose,
  onDelete,
}: CompendiumEntryEditorProps) {
  const updateEntry = useUpdateCompendiumEntry();

  // Определяем, является ли запись частью плагина (тогда редактирование запрещено)
  const isReadonly = Boolean(entry.sourcePluginId);

  const [viewMode, setViewMode] = useState<'card' | 'json'>('card');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Инициализация JSON при открытии
  useEffect(() => {
    try {
      const parsed = JSON.parse(entry.dataJson);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      setJsonText(entry.dataJson);
      setJsonError('Исходный JSON невалиден');
    }
  }, [entry.dataJson]);

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      JSON.parse(text);
      setJsonError(null);
    } catch (e) {
      setJsonError('Некорректный JSON: ' + (e instanceof Error ? e.message : 'Syntax Error'));
    }
  };

  const handleSave = () => {
    if (jsonError || isReadonly) return;

    updateEntry.mutate(
      {
        id: entry.id,
        name: entry.name,
        dataJson: jsonText,
      },
      {
        onSuccess: () => {
          setViewMode('card'); // Возвращаемся к просмотру после сохранения
        },
      }
    );
  };

  return (
    <div className="compendium-editor">
      {/* Шапка редактора */}
      <div className="compendium-editor-header">
        <h3>{entry.name}</h3>
        
        <div className="compendium-editor-controls">
          {!isReadonly && (
            <div className="view-toggle">
              <button
                type="button"
                className={viewMode === 'card' ? 'active' : ''}
                onClick={() => setViewMode('card')}
              >
                📄 Карточка
              </button>
              <button
                type="button"
                className={viewMode === 'json' ? 'active' : ''}
                onClick={() => setViewMode('json')}
              >
                {`{ }`} JSON
              </button>
            </div>
          )}

          {isReadonly && (
            <span className="readonly-badge" title="Эта запись импортирована из плагина и не может быть изменена">
              🔒 Только чтение (Плагин)
            </span>
          )}

          <button type="button" className="icon-btn" onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>
      </div>

      {/* Тело редактора */}
      <div className="compendium-editor-body">
        {viewMode === 'card' ? (
          <MonsterCard entry={entry} />
        ) : (
          <div className="json-editor-wrapper">
            <textarea
              className="json-textarea"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
            />
            {jsonError && <div className="json-error">{jsonError}</div>}
          </div>
        )}
      </div>

      {/* Футер с кнопками */}
      {!isReadonly && (
        <div className="compendium-editor-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!!jsonError || updateEntry.isPending}
            onClick={handleSave}
          >
            {updateEntry.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          
          {onDelete && (
            <button
              type="button"
              className="btn-danger"
              onClick={onDelete}
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
}
