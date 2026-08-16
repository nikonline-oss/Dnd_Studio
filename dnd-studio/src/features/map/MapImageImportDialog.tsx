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

    // Показ тестовых токенов
    const [showTokens, setShowTokens] = useState(true);

    // Масштаб превью (для расчётов)
    const previewScaleRef = useRef(1);

    // Drag state для crop
    const dragRef = useRef<{
        mode: 'move' | 'resize';
        startX: number;
        startY: number;
        startCropX: number;
        startCropY: number;
        startCropW: number;
        startCropH: number;
    } | null>(null);

    // Загрузка превью
    useEffect(() => {
        readFile.mutate(sourcePath, {
            onSuccess: (dataUrl) => {
                const img = new Image();
                img.onload = () => {
                    imageRef.current = img;
                    setOriginalWidth(img.width);
                    setOriginalHeight(img.height);

                    setTargetWidth(img.width);
                    setTargetHeight(img.height);

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

    const drawPreview = useCallback(
        (img: HTMLImageElement) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const maxPreviewWidth = 640;
            const maxPreviewHeight = 440;

            const scale = Math.min(
                maxPreviewWidth / img.width,
                maxPreviewHeight / img.height,
                1,
            );

            previewScaleRef.current = scale;

            const previewWidth = Math.floor(img.width * scale);
            const previewHeight = Math.floor(img.height * scale);

            canvas.width = previewWidth;
            canvas.height = previewHeight;

            // Фон
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, previewWidth, previewHeight);

            // Изображение
            ctx.drawImage(img, 0, 0, previewWidth, previewHeight);

            // Затемнение вне crop
            if (cropEnabled) {
                const sx = cropX * scale;
                const sy = cropY * scale;
                const sw = cropWidth * scale;
                const sh = cropHeight * scale;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

                ctx.fillRect(0, 0, previewWidth, sy);
                ctx.fillRect(0, sy + sh, previewWidth, previewHeight - sy - sh);
                ctx.fillRect(0, sy, sx, sh);
                ctx.fillRect(sx + sw, sy, previewWidth - sx - sw, sh);
            }

            // Сетка (только в области crop или по всему изображению)
            const gridStep = gridSize * scale;

            if (gridStep > 3) {
                // Minor grid lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.5;

                const startX = cropEnabled ? cropX * scale : 0;
                const startY = cropEnabled ? cropY * scale : 0;
                const endX = cropEnabled ? (cropX + cropWidth) * scale : previewWidth;
                const endY = cropEnabled ? (cropY + cropHeight) * scale : previewHeight;

                for (let x = startX; x <= endX; x += gridStep) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }

                for (let y = startY; y <= endY; y += gridStep) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }

                // Major grid lines (каждая 5-я)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.lineWidth = 1;

                const majorStep = gridStep * 5;

                for (let x = startX; x <= endX; x += majorStep) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }

                for (let y = startY; y <= endY; y += majorStep) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }
            }

            // Тестовые токены
            if (showTokens && gridStep > 4) {
                const tokenRadius = gridStep * 0.4;

                const effectiveW = cropEnabled ? cropWidth * scale : previewWidth;
                const effectiveH = cropEnabled ? cropHeight * scale : previewHeight;
                const offsetX = cropEnabled ? cropX * scale : 0;
                const offsetY = cropEnabled ? cropY * scale : 0;

                // Позиции токенов (относительно области)
                const tokenPositions = [
                    { x: 0.25, y: 0.25, color: '#4FC3F7' },
                    { x: 0.5, y: 0.5, color: '#EF5350' },
                    { x: 0.75, y: 0.25, color: '#66BB6A' },
                    { x: 0.25, y: 0.75, color: '#FFA726' },
                    { x: 0.75, y: 0.75, color: '#AB47BC' },
                ];

                tokenPositions.forEach((pos) => {
                    const tx = offsetX + effectiveW * pos.x;
                    const ty = offsetY + effectiveH * pos.y;

                    // Тень
                    ctx.beginPath();
                    ctx.arc(tx + 2, ty + 2, tokenRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fill();

                    // Токен
                    ctx.beginPath();
                    ctx.arc(tx, ty, tokenRadius, 0, Math.PI * 2);
                    ctx.fillStyle = pos.color;
                    ctx.fill();

                    // Обводка
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Блик
                    ctx.beginPath();
                    ctx.arc(tx - tokenRadius * 0.3, ty - tokenRadius * 0.3, tokenRadius * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fill();
                });
            }

            // Рамка crop
            if (cropEnabled) {
                const sx = cropX * scale;
                const sy = cropY * scale;
                const sw = cropWidth * scale;
                const sh = cropHeight * scale;

                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 3]);
                ctx.strokeRect(sx, sy, sw, sh);
                ctx.setLineDash([]);

                // Уголки для resize
                const cornerSize = 8;
                ctx.fillStyle = '#FFD700';

                // Top-left
                ctx.fillRect(sx - cornerSize / 2, sy - cornerSize / 2, cornerSize, cornerSize);
                // Top-right
                ctx.fillRect(sx + sw - cornerSize / 2, sy - cornerSize / 2, cornerSize, cornerSize);
                // Bottom-left
                ctx.fillRect(sx - cornerSize / 2, sy + sh - cornerSize / 2, cornerSize, cornerSize);
                // Bottom-right
                ctx.fillRect(sx + sw - cornerSize / 2, sy + sh - cornerSize / 2, cornerSize, cornerSize);
            }

            // Легенда
            const legendY = previewHeight - 30;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, legendY, previewWidth, 30);

            ctx.fillStyle = '#ffffff';
            ctx.font = '11px sans-serif';
            ctx.textBaseline = 'middle';

            const effectiveW = cropEnabled ? cropWidth : img.width;
            const effectiveH = cropEnabled ? cropHeight : img.height;
            const cols = Math.floor(effectiveW / gridSize);
            const rows = Math.floor(effectiveH / gridSize);

            ctx.fillText(
                `Grid: ${gridSize}px | Cells: ${cols}×${rows} | Token ≈ ${gridSize}px | Target: ${targetWidth}×${targetHeight}`,
                10,
                legendY + 15,
            );
        },
        [
            gridSize,
            cropEnabled,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            showTokens,
            targetWidth,
            targetHeight,
        ],
    );

    // Перерисовка
    useEffect(() => {
        if (imageRef.current) {
            drawPreview(imageRef.current);
        }
    }, [drawPreview]);

    // Mouse handlers для crop drag
    const getCanvasCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / previewScaleRef.current,
            y: (e.clientY - rect.top) / previewScaleRef.current,
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!cropEnabled) return;

        const { x, y } = getCanvasCoords(e);

        // Проверяем, попали ли в область crop
        const inCrop =
            x >= cropX && x <= cropX + cropWidth &&
            y >= cropY && y <= cropY + cropHeight;

        // Проверяем уголки для resize
        const cornerThreshold = 12 / previewScaleRef.current;
        const nearCorner =
            Math.abs(x - cropX) < cornerThreshold && Math.abs(y - cropY) < cornerThreshold ||
            Math.abs(x - (cropX + cropWidth)) < cornerThreshold && Math.abs(y - cropY) < cornerThreshold ||
            Math.abs(x - cropX) < cornerThreshold && Math.abs(y - (cropY + cropHeight)) < cornerThreshold ||
            Math.abs(x - (cropX + cropWidth)) < cornerThreshold && Math.abs(y - (cropY + cropHeight)) < cornerThreshold;

        if (nearCorner) {
            dragRef.current = {
                mode: 'resize',
                startX: x,
                startY: y,
                startCropX: cropX,
                startCropY: cropY,
                startCropW: cropWidth,
                startCropH: cropHeight,
            };
        } else if (inCrop) {
            dragRef.current = {
                mode: 'move',
                startX: x,
                startY: y,
                startCropX: cropX,
                startCropY: cropY,
                startCropW: cropWidth,
                startCropH: cropHeight,
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragRef.current || !cropEnabled) return;

        const { x, y } = getCanvasCoords(e);
        const drag = dragRef.current;

        const dx = x - drag.startX;
        const dy = y - drag.startY;

        if (drag.mode === 'move') {
            const newX = Math.max(0, Math.min(drag.startCropX + dx, originalWidth - cropWidth));
            const newY = Math.max(0, Math.min(drag.startCropY + dy, originalHeight - cropHeight));
            setCropX(Math.round(newX));
            setCropY(Math.round(newY));
        } else if (drag.mode === 'resize') {
            const newW = Math.max(50, Math.min(drag.startCropW + dx, originalWidth - cropX));
            const newH = Math.max(50, Math.min(drag.startCropH + dy, originalHeight - cropY));
            setCropWidth(Math.round(newW));
            setCropHeight(Math.round(newH));
        }
    };

    const handleMouseUp = () => {
        if (dragRef.current && cropEnabled) {
            setCropX((prev) => {
                const clamped = Math.max(0, Math.min(prev, originalWidth - 1));
                setCropWidth((prevW) => Math.min(prevW, originalWidth - clamped));
                return clamped;
            });
            setCropY((prev) => {
                const clamped = Math.max(0, Math.min(prev, originalHeight - 1));
                setCropHeight((prevH) => Math.min(prevH, originalHeight - clamped));
                return clamped;
            });
        }
    };

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
            // Финальный clamp перед отправкой
            const safeCropX = Math.max(0, Math.min(cropX, originalWidth - 1));
            const safeCropY = Math.max(0, Math.min(cropY, originalHeight - 1));
            const safeCropW = Math.max(1, Math.min(cropWidth, originalWidth - safeCropX));
            const safeCropH = Math.max(1, Math.min(cropHeight, originalHeight - safeCropY));

            options.cropX = safeCropX;
            options.cropY = safeCropY;
            options.cropWidth = safeCropW;
            options.cropHeight = safeCropH;
        }

        onConfirm(options);
    };

    const handleAutoFitGrid = () => {
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
                            <canvas
                                ref={canvasRef}
                                className="map-import-canvas"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{
                                    cursor: cropEnabled ? (dragRef.current ? 'grabbing' : 'grab') : 'default',
                                }}
                            />
                        )}
                    </div>

                    {/* Информация */}
                    <div className="map-import-info">
                        <span>
                            Original: {originalWidth} × {originalHeight}px
                        </span>
                        {cropEnabled && (
                            <span>
                                Crop: {cropWidth} × {cropHeight}px at ({cropX}, {cropY})
                            </span>
                        )}
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

                            <label className="map-import-checkbox">
                                <input
                                    type="checkbox"
                                    checked={showTokens}
                                    onChange={(e) => setShowTokens(e.target.checked)}
                                />
                                Show test tokens
                            </label>
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

                            {cropEnabled && (
                                <span className="map-import-hint-inline">
                                    Drag to move, corners to resize
                                </span>
                            )}
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
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(Number(e.target.value) || 0, originalWidth - 1));
                                            setCropX(val);
                                            // Уменьшаем ширину если выходим за границы
                                            if (val + cropWidth > originalWidth) {
                                                setCropWidth(originalWidth - val);
                                            }
                                        }}
                                    />
                                </label>
                                <label>
                                    Y
                                    <input
                                        type="number"
                                        value={cropY}
                                        min={0}
                                        max={originalHeight - 1}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(Number(e.target.value) || 0, originalHeight - 1));
                                            setCropY(val);
                                            if (val + cropHeight > originalHeight) {
                                                setCropHeight(originalHeight - val);
                                            }
                                        }}
                                    />
                                </label>
                                <label>
                                    Width
                                    <input
                                        type="number"
                                        value={cropWidth}
                                        min={50}
                                        max={originalWidth - cropX}
                                        onChange={(e) => {
                                            const val = Math.max(50, Math.min(Number(e.target.value) || 50, originalWidth - cropX));
                                            setCropWidth(val);
                                        }}
                                    />
                                </label>
                                <label>
                                    Height
                                    <input
                                        type="number"
                                        value={cropHeight}
                                        min={50}
                                        max={originalHeight - cropY}
                                        onChange={(e) => {
                                            const val = Math.max(50, Math.min(Number(e.target.value) || 50, originalHeight - cropY));
                                            setCropHeight(val);
                                        }}
                                    />
                                </label>
                            </div>
                        )}

                        {/* Подсказка */}
                        <div className="map-import-hint">
                            Tokens are sized relative to grid_size. Recommended: grid_size ≈
                            map_width / 30 for ~30 cells across. Test tokens show approximate
                            token size on the map.
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