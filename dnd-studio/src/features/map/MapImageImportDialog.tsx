import { useCallback, useEffect, useRef, useState } from 'react';

import { useReadFileAsDataUrl } from '../../shared/api/hooks';
import type { MapImageImportOptions } from '../../shared/api/hooks';

interface MapImageImportDialogProps {
  sourcePath: string;
  onConfirm: (options: MapImageImportOptions) => void;
  onCancel: () => void;
  isImporting: boolean;
}

export function MapImageImportDialog({
  sourcePath,
  onConfirm,
  onCancel,
  isImporting,
}: MapImageImportDialogProps) {
  const readFile = useReadFileAsDataUrl();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Оригинальные размеры изображения
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  // Целевые размеры карты
  const [targetWidth, setTargetWidth] = useState(2000);
  const [targetHeight, setTargetHeight] = useState(1500);

  // Размер сетки
  const [gridSize, setGridSize] = useState(50);

  // Crop
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);

  // Загрузка превью
  useEffect(() => {
    readFile.mutate(sourcePath, {
      onSuccess: (dataUrl) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setOriginalWidth(img.width);
          setOriginalHeight(img.height);

          // По умолчанию целевой размер = оригинальный
          setTargetWidth(img.width);
          setTargetHeight(img.height);

          // По умолчанию crop = всё изображение
          setCropX(0);
          setCropY(0);
          setCropWidth(img.width);
          setCropHeight(img.height);

          drawPreview(img);
        };
        img.src = dataUrl;
      },
    });
  }, [sourcePath]);

  const drawPreview = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Масштабируем превью чтобы вписать в контейнер
    const maxPreviewWidth = 600;
    const maxPreviewHeight = 400;

    const scale = Math.min(
      maxPreviewWidth / img.width,
      maxPreviewHeight / img.height,
      1,
    );

    const previewWidth = Math.floor(img.width * scale);
    const previewHeight = Math.floor(img.height * scale);

    canvas.width = previewWidth;
    canvas.height = previewHeight;

    ctx.clearRect(0, 0, previewWidth, previewHeight);
    ctx.drawImage(img, 0, 0, previewWidth, previewHeight);

    // Рисуем сетку
    if (gridSize > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      const gridStep = gridSize * scale;

      for (let x = 0; x <= previewWidth; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, previewHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= previewHeight; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(previewWidth, y);
        ctx.stroke();
      }
    }

    // Рисуем crop rectangle
    if (cropEnabled) {
      const sx = cropX * scale;
      const sy = cropY * scale;
      const sw = cropWidth * scale;
      const sh = cropHeight * scale;

      // Затемняем область вне crop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      // Верх
      ctx.fillRect(0, 0, previewWidth, sy);
      // Низ
      ctx.fillRect(0, sy + sh, previewWidth, previewHeight - sy - sh);
      // Лево
      ctx.fillRect(0, sy, sx, sh);
      // Право
      ctx.fillRect(sx + sw, sy, previewWidth - sx - sw, sh);

      // Рамка crop
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, sw, sh);
    }
  }, [gridSize, cropEnabled, cropX, cropY, cropWidth, cropHeight]);

  // Перерисовка при изменении параметров
  useEffect(() => {
    if (imageRef.current) {
      drawPreview(imageRef.current);
    }
  }, [drawPreview, targetWidth, targetHeight, gridSize, cropEnabled, cropX, cropY, cropWidth, cropHeight]);

  const handleConfirm = () => {
    const options: MapImageImportOptions = {
        targetWidth,
        targetHeight,
        gridSize,
        cropX: null,
        cropY: null,
        cropWidth: null,
        cropHeight: null
    };

    if (cropEnabled) {
      options.cropX = cropX;
      options.cropY = cropY;
      options.cropWidth = cropWidth;
      options.cropHeight = cropHeight;
    }

    onConfirm(options);
  };

  const handleAutoFitGrid = () => {
    // Автоматически подбираем grid_size чтобы получилось ~20-40 ячеек по ширине
    const effectiveWidth = cropEnabled ? cropWidth : originalWidth;
    const suggestedGrid = Math.round(effectiveWidth / 30);
    setGridSize(Math.max(10, suggestedGrid));
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content dialog-map-import">
        <div className="dialog-header">
          <h3>Import Map Image</h3>
          <button type="button" className="icon-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="dialog-body">
          {/* Превью */}
          <div className="map-import-preview">
            {readFile.isPending ? (
              <div className="empty-state">Loading preview…</div>
            ) : (
              <canvas ref={canvasRef} className="map-import-canvas" />
            )}
          </div>

          {/* Информация об оригинале */}
          <div className="map-import-info">
            <span>
              Original: {originalWidth} × {originalHeight}px
            </span>
          </div>

          {/* Настройки */}
          <div className="map-import-settings">
            <div className="map-import-row">
              <label>
                Map Width (px)
                <input
                  type="number"
                  value={targetWidth}
                  min={100}
                  max={16384}
                  onChange={(e) => setTargetWidth(Number(e.target.value) || 100)}
                />
              </label>

              <label>
                Map Height (px)
                <input
                  type="number"
                  value={targetHeight}
                  min={100}
                  max={16384}
                  onChange={(e) => setTargetHeight(Number(e.target.value) || 100)}
                />
              </label>
            </div>

            <div className="map-import-row">
              <label>
                Grid Size (px)
                <input
                  type="number"
                  value={gridSize}
                  min={5}
                  max={500}
                  onChange={(e) => setGridSize(Number(e.target.value) || 50)}
                />
              </label>

              <button type="button" onClick={handleAutoFitGrid}>
                Auto-fit
              </button>
            </div>

            {/* Crop */}
            <div className="map-import-row">
              <label className="map-import-checkbox">
                <input
                  type="checkbox"
                  checked={cropEnabled}
                  onChange={(e) => setCropEnabled(e.target.checked)}
                />
                Crop image
              </label>
            </div>

            {cropEnabled && (
              <div className="map-import-row map-import-crop-fields">
                <label>
                  X
                  <input
                    type="number"
                    value={cropX}
                    min={0}
                    max={originalWidth - 1}
                    onChange={(e) => setCropX(Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Y
                  <input
                    type="number"
                    value={cropY}
                    min={0}
                    max={originalHeight - 1}
                    onChange={(e) => setCropY(Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Width
                  <input
                    type="number"
                    value={cropWidth}
                    min={1}
                    max={originalWidth - cropX}
                    onChange={(e) => setCropWidth(Number(e.target.value) || 1)}
                  />
                </label>
                <label>
                  Height
                  <input
                    type="number"
                    value={cropHeight}
                    min={1}
                    max={originalHeight - cropY}
                    onChange={(e) => setCropHeight(Number(e.target.value) || 1)}
                  />
                </label>
              </div>
            )}

            {/* Подсказка */}
            <div className="map-import-hint">
              Tokens are sized relative to grid_size. Recommended: grid_size
              ≈ map_width / 30 for ~30 cells across.
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button type="button" onClick={onCancel} disabled={isImporting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isImporting || readFile.isPending}
          >
            {isImporting ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}