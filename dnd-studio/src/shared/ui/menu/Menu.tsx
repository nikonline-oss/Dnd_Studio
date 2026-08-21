import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import { formatShortcut, type Shortcut } from '../../hooks/useKeyboardShortcuts';

// ============================================
// Context для меню
// ============================================

interface MenuContextValue {
  closeAll: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('Menu components must be used inside <MenuBar>');
  return ctx;
}

// ============================================
// MenuBar — контейнер меню верхнего уровня
// ============================================

interface MenuBarProps {
  children: ReactNode;
}

export function MenuBar({ children }: MenuBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const closeAll = () => setOpenMenuId(null);

  // Закрытие по клику вне
  const handleDocumentClick = (e: MouseEvent) => {
    if (!barRef.current?.contains(e.target as Node)) {
      closeAll();
    }
  };

  // Используем useEffect для document listener
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  return (
    <MenuContext.Provider value={{ closeAll }}>
      <div
        ref={barRef}
        className="menu-bar"
      >
        {Array.isArray(children)
          ? children.map((child, i) => {
              if (!child) return null;
              const menuChild = child as React.ReactElement<MenuProps>;
              const id = menuChild.props.id ?? `menu-${i}`;
              return (
                <MenuTrigger
                  key={id}
                  id={id}
                  label={menuChild.props.label}
                  isOpen={openMenuId === id}
                  onToggle={() =>
                    setOpenMenuId((prev) => (prev === id ? null : id))
                  }
                >
                  {menuChild.props.children}
                </MenuTrigger>
              );
            })
          : children}
      </div>
    </MenuContext.Provider>
  );
}

// ============================================
// MenuTrigger — кнопка меню + dropdown
// ============================================

interface MenuTriggerProps {
  id: string;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function MenuTrigger({
  label,
  isOpen,
  onToggle,
  children,
}: MenuTriggerProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="menu-trigger-wrapper"
      onMouseLeave={(e) => {
        if (isOpen && dropdownRef.current?.contains(e.relatedTarget as Node)) return;
        if (isOpen) onToggle();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`menu-trigger ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        onMouseEnter={() => {
          // При наведении на другой trigger — переключаемся
          if (isOpen) return;
          const anyOpen = document.querySelector('.menu-trigger.open');
          if (anyOpen) onToggle();
        }}
      >
        {label}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="menu-dropdown"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MenuList>{children}</MenuList>
        </div>
      )}
    </div>
  );
}

// ============================================
// Menu — контейнер элементов меню
// ============================================

interface MenuProps {
  id?: string;
  label: string;
  children: ReactNode;
}

export function Menu({ children }: MenuProps) {
  return <>{children}</>;
}

// ============================================
// MenuList — список элементов
// ============================================

interface MenuListProps {
  children: ReactNode;
}

function MenuList({ children }: MenuListProps) {
  return (
    <div className="menu-list" role="menu">
      {children}
    </div>
  );
}

// ============================================
// MenuItem — элемент меню
// ============================================

interface MenuItemProps {
  label: string;
  shortcut?: Omit<Shortcut, 'handler' | 'label'>;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  /** Если true — показывает индикатор текущего выбора */
  selected?: boolean;
  /** Подменю, которое показывается при наведении */
  submenu?: ReactNode;
}

export function MenuItem({
  label,
  shortcut,
  icon,
  disabled = false,
  destructive = false,
  onClick,
  selected,
  submenu,
}: MenuItemProps) {
  const { closeAll } = useMenuContext();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    closeAll();
  };

  return (
    <div
      className={`menu-item-wrapper ${isSubmenuOpen ? 'open' : ''}`}
      onMouseEnter={() => setIsSubmenuOpen(true)}
      onMouseLeave={() => setIsSubmenuOpen(false)}
    >
      <button
        type="button"
        className={`menu-item ${disabled ? 'disabled' : ''} ${
          destructive ? 'destructive' : ''
        } ${selected ? 'selected' : ''}`}
        role="menuitem"
        disabled={disabled}
        onClick={handleClick}
      >
        {icon && <span className="menu-item-icon">{icon}</span>}
        <span className="menu-item-label">{label}</span>
        {selected && <span className="menu-item-check">✓</span>}
        {submenu && <span className="menu-item-arrow">›</span>}
        {shortcut && !submenu && (
          <span className="menu-item-shortcut">{formatShortcut(shortcut)}</span>
        )}
      </button>

      {isSubmenuOpen && submenu && (
        <div
          className="menu-submenu"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="menu-list" role="menu">{submenu}</div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MenuDivider — разделитель
// ============================================

export function MenuDivider() {
  return <div className="menu-divider" role="separator" />;
}

// ============================================
// MenuGroup — заголовок группы
// ============================================

interface MenuGroupProps {
  label: string;
  children: ReactNode;
}

export function MenuGroup({ label, children }: MenuGroupProps) {
  return (
    <div className="menu-group">
      <div className="menu-group-label">{label}</div>
      {children}
    </div>
  );
}
