import type { CompendiumEntrySummary } from '../../shared/api/bindings';

interface MonsterCardProps {
  entry: CompendiumEntrySummary;
}

export function MonsterCard({ entry }: MonsterCardProps) {
  // Безопасный парсинг JSON
  let data: any = {};
  try {
    data = JSON.parse(entry.dataJson);
  } catch {
    return (
      <div className="compendium-error">
        Ошибка: некорректный формат JSON для записи "{entry.name}"
      </div>
    );
  }

  const {
    size = 'Средний',
    type = 'Гуманоид',
    alignment = 'нейтрально-злой',
    armor_class = 15,
    hit_points = 7,
    speed = '30 фт.',
    stats = { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    description = '',
    actions = [],
  } = data;

  // Хелпер для модификатора характеристики
  const getMod = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="monster-card">
      <div className="monster-header">
        <h2 className="monster-name">{entry.name}</h2>
        <p className="monster-meta">
          {size} {type}, {alignment}
        </p>
      </div>

      <div className="monster-stats-block">
        <div className="stat-row">
          <span className="stat-label">Класс Доспеха:</span>
          <span className="stat-value">{armor_class}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Хиты:</span>
          <span className="stat-value">{hit_points}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Скорость:</span>
          <span className="stat-value">{speed}</span>
        </div>
      </div>

      <div className="monster-abilities">
        {Object.entries(stats as Record<string, number>).map(([key, val]) => (
          <div key={key} className="ability-box">
            <div className="ability-abbr">{key.toUpperCase()}</div>
            <div className="ability-val">{val}</div>
            <div className="ability-mod">({getMod(val)})</div>
          </div>
        ))}
      </div>

      {description && (
        <div className="monster-section">
          <h3>Описание</h3>
          <p className="monster-text">{description}</p>
        </div>
      )}

      {actions.length > 0 && (
        <div className="monster-section">
          <h3>Действия</h3>
          {actions.map((action: any, idx: number) => (
            <div key={idx} className="monster-action">
              <strong>{action.name}. </strong>
              <span>{action.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
