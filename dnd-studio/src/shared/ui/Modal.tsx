import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 440,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Всегда держим актуальную ссылку на onClose
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Эффект открытия: срабатывает ТОЛЬКО при изменении `open`
  useEffect(() => {
    if (!open) return;

    // Сохраняем элемент, который был в фокусе ДО открытия модалки
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Фокус на первый фокусируемый элемент
    const frameId = requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [open]); // ← Только `open`, никаких callback'ов

  // Эффект закрытия: возвращаем фокус при закрытии
  useEffect(() => {
    if (open) return;

    // Возвращаем фокус на элемент, который был активен до открытия
    if (previousActiveElement.current) {
      requestAnimationFrame(() => {
        previousActiveElement.current?.focus();
        previousActiveElement.current = null;
      });
    }
  }, [open]);

  // Escape: используем ref, чтобы не добавлять onClose в зависимости
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]); // ← Только `open`

  // Блокировка скролла body
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}