import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import type { MapSummary, TokenSummary } from '../../shared/api/bindings';

interface Viewport {
    x: number;
    y: number;
    scale: number;
}

interface MapCanvasProps {
    map: MapSummary;
    tokens?: TokenSummary[];
    selectedTokenId?: string | null;
    onSelectToken?: (tokenId: string | null) => void;
    onMoveToken?: (
        tokenId: string,
        x: number,
        y: number,
    ) => Promise<void>;
}

type DragState =
    | {
        kind: 'pan';
        pointerId: number;
        startX: number;
        startY: number;
        origin: Viewport;
    }
    | {
        kind: 'token';
        pointerId: number;
        tokenId: string;
        offsetX: number;
        offsetY: number;
        sessionId: number;
    };

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;

function clampScale(scale: number): number {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function getCssVar(name: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    return value || fallback;
}

function hashString(input: string): number {
    let hash = 0;

    for (let index = 0; index < input.length; index += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
}

function tokenColor(tokenId: string): string {
    const hue = hashString(tokenId) % 360;

    return `hsl(${hue}, 70%, 52%)`;
}

function characterInitials(name: string): string {
    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
        return (
            (parts[0][0] ?? '') + (parts[1][0] ?? '')
        ).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
}

export function MapCanvas({
    map,
    tokens = [],
    selectedTokenId = null,
    onSelectToken,
    onMoveToken,
}: MapCanvasProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const dragSessionRef = useRef(0);

    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    const [viewport, setViewport] = useState<Viewport | null>(null);
    const [themeVersion, setThemeVersion] = useState(0);

    const [dragTokenPosition, setDragTokenPosition] = useState<{
        tokenId: string;
        x: number;
        y: number;
    } | null>(null);

    const dragRef = useRef<DragState | null>(null);
    const fittedMapIdRef = useRef<string | null>(null);

    const tokenRadius = Math.max(10, (map.gridSize || 50) * 0.45);

    const fit = useCallback(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) {
            return;
        }

        const scale = clampScale(
            Math.min(width / map.width, height / map.height) * 0.9,
        );

        setViewport({
            scale,
            x: (width - map.width * scale) / 2,
            y: (height - map.height * scale) / 2,
        });
    }, [map.width, map.height]);

    const zoomAt = useCallback(
        (clientX: number, clientY: number, factor: number) => {
            const container = containerRef.current;

            if (!container) {
                return;
            }

            const rect = container.getBoundingClientRect();

            const pointerX = clientX - rect.left;
            const pointerY = clientY - rect.top;

            setViewport((prev) => {
                if (!prev) {
                    return prev;
                }

                const scale = clampScale(prev.scale * factor);

                const worldX = (pointerX - prev.x) / prev.scale;
                const worldY = (pointerY - prev.y) / prev.scale;

                return {
                    scale,
                    x: pointerX - worldX * scale,
                    y: pointerY - worldY * scale,
                };
            });
        },
        [],
    );

    const zoomCenter = useCallback(
        (factor: number) => {
            const container = containerRef.current;

            if (!container) {
                return;
            }

            const rect = container.getBoundingClientRect();

            zoomAt(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                factor,
            );
        },
        [zoomAt],
    );

    const screenToWorld = useCallback(
        (clientX: number, clientY: number) => {
            const container = containerRef.current;

            if (!container || !viewport) {
                return {
                    x: 0,
                    y: 0,
                };
            }

            const rect = container.getBoundingClientRect();

            const pointerX = clientX - rect.left;
            const pointerY = clientY - rect.top;

            return {
                x: (pointerX - viewport.x) / viewport.scale,
                y: (pointerY - viewport.y) / viewport.scale,
            };
        },
        [viewport],
    );

    const getTokenPosition = useCallback(
        (token: TokenSummary) => {
            if (dragTokenPosition?.tokenId === token.id) {
                return {
                    x: dragTokenPosition.x,
                    y: dragTokenPosition.y,
                };
            }

            return {
                x: token.x,
                y: token.y,
            };
        },
        [dragTokenPosition],
    );

    const findTokenAt = useCallback(
        (worldX: number, worldY: number): TokenSummary | null => {
            const reversed = [...tokens].reverse();

            for (const token of reversed) {
                const position = getTokenPosition(token);

                const dx = worldX - (position.x != null ? position.x : 0);
                const dy = worldY - (position.y != null ? position.y : 0);

                if (dx * dx + dy * dy <= tokenRadius * tokenRadius) {
                    return token;
                }
            }

            return null;
        },
        [tokens, tokenRadius, getTokenPosition],
    );

    // Отслеживаем размер контейнера.
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];

            if (!entry) {
                return;
            }

            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    // Первичный fit для текущей карты.
    useEffect(() => {
        if (
            size.width > 0 &&
            size.height > 0 &&
            fittedMapIdRef.current !== map.id
        ) {
            fittedMapIdRef.current = map.id;
            fit();
        }
    }, [size.width, size.height, map.id, fit]);

    // Wheel zoom.
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();

            const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

            zoomAt(event.clientX, event.clientY, factor);
        };

        container.addEventListener('wheel', onWheel, {
            passive: false,
        });

        return () => {
            container.removeEventListener('wheel', onWheel);
        };
    }, [zoomAt]);

    // Перерисовка при смене темы.
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setThemeVersion((version) => version + 1);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    // Отрисовка.
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        if (!size.width || !size.height || !viewport) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(size.width * dpr));
        canvas.height = Math.max(1, Math.floor(size.height * dpr));

        canvas.style.width = `${size.width}px`;
        canvas.style.height = `${size.height}px`;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size.width, size.height);

        const gridColor = getCssVar(
            '--border-gold',
            'rgba(212, 175, 55, 0.25)',
        );

        const borderColor = getCssVar(
            '--border-gold-strong',
            'rgba(212, 175, 55, 0.55)',
        );

        const selectedColor = getCssVar('--accent', '#7c5cff');

        ctx.save();

        ctx.translate(viewport.x, viewport.y);
        ctx.scale(viewport.scale, viewport.scale);

        // Область карты.
        ctx.fillStyle = 'rgba(128, 128, 160, 0.06)';
        ctx.fillRect(0, 0, map.width, map.height);

        // Сетка.
        const gridSize = map.gridSize > 0 ? map.gridSize : 50;

        let gridStep = gridSize;
        const screenStep = gridStep * viewport.scale;

        if (screenStep < 8) {
            gridStep *= Math.ceil(8 / screenStep);
        }

        ctx.beginPath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1 / viewport.scale;

        for (let x = 0; x <= map.width; x += gridStep) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, map.height);
        }

        for (let y = 0; y <= map.height; y += gridStep) {
            ctx.moveTo(0, y);
            ctx.lineTo(map.width, y);
        }

        ctx.stroke();

        // Граница карты.
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2 / viewport.scale;
        ctx.strokeRect(0, 0, map.width, map.height);

        // Токены.
        const labelByTokenId = new Map<string, string>();

        tokens.forEach((token, index) => {
            const label = token.characterName
                ? characterInitials(token.characterName)
                : String(index + 1);

            labelByTokenId.set(token.id, label);
        });

        const normalTokens = tokens.filter(
            (token) => token.id !== dragTokenPosition?.tokenId,
        );

        const draggingToken = tokens.find(
            (token) => token.id === dragTokenPosition?.tokenId,
        );

        const drawToken = (token: TokenSummary) => {
            const position = getTokenPosition(token);
            const isSelected = token.id === selectedTokenId;
            const label = labelByTokenId.get(token.id) ?? '';

            ctx.beginPath();
            ctx.arc((position.x != null ? position.x : 0), (position.y != null ? position.y : 0), tokenRadius, 0, Math.PI * 2);

            ctx.fillStyle = tokenColor(token.id);
            ctx.globalAlpha = token.isVisible ? 0.92 : 0.35;
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.strokeStyle = isSelected
                ? selectedColor
                : 'rgba(0, 0, 0, 0.55)';

            ctx.lineWidth = (isSelected ? 3 : 1.5) / viewport.scale;
            ctx.stroke();

            ctx.font = `${tokenRadius * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';

            ctx.fillText(label, (position.x != null ? position.x : 0), (position.y != null ? position.y : 0));
        };

        for (const token of normalTokens) {
            drawToken(token);
        }

        if (draggingToken) {
            drawToken(draggingToken);
        }

        ctx.restore();
    }, [
        size.width,
        size.height,
        viewport,
        map.id,
        map.width,
        map.height,
        map.gridSize,
        tokens,
        selectedTokenId,
        dragTokenPosition,
        tokenRadius,
        themeVersion,
        getTokenPosition,
    ]);

    const onPointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        if (event.button !== 0 && event.button !== 1) {
            return;
        }

        if (!viewport) {
            return;
        }

        if (event.button === 1) {
            event.preventDefault();
        }

        event.currentTarget.setPointerCapture(event.pointerId);

        const world = screenToWorld(event.clientX, event.clientY);
        const hitToken = findTokenAt(world.x, world.y);

        if (hitToken) {
            onSelectToken?.(hitToken.id);

            const position = getTokenPosition(hitToken);

            const sessionId = ++dragSessionRef.current;

            dragRef.current = {
                kind: 'token',
                pointerId: event.pointerId,
                tokenId: hitToken.id,
                offsetX: world.x - (position.x != null ? position.x : 0),
                offsetY: world.y - (position.y != null ? position.y : 0),
                sessionId,
            };

            return;
        }

        onSelectToken?.(null);

        dragRef.current = {
            kind: 'pan',
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            origin: viewport,
        };
    };

    const onPointerMove = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        const drag = dragRef.current;

        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        if (drag.kind === 'pan') {
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;

            setViewport({
                ...drag.origin,
                x: drag.origin.x + dx,
                y: drag.origin.y + dy,
            });

            return;
        }

        const world = screenToWorld(event.clientX, event.clientY);

        const x = clampNumber(
            world.x - drag.offsetX,
            0,
            map.width,
        );

        const y = clampNumber(
            world.y - drag.offsetY,
            0,
            map.height,
        );

        setDragTokenPosition({
            tokenId: drag.tokenId,
            x,
            y,
        });
    };

    const onPointerUp = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        const drag = dragRef.current;

        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        if (drag.kind === 'token') {
            const world = screenToWorld(event.clientX, event.clientY);

            const x = clampNumber(
                world.x - drag.offsetX,
                0,
                map.width,
            );

            const y = clampNumber(
                world.y - drag.offsetY,
                0,
                map.height,
            );

            const session = drag.sessionId;

            if (onMoveToken) {
                onMoveToken(drag.tokenId, x, y)
                    .catch(() => {
                        // Ошибка уже обрабатывается в hooks / rollback.
                    })
                    .finally(() => {
                        if (dragSessionRef.current === session) {
                            setDragTokenPosition(null);
                        }
                    });
            } else {
                setDragTokenPosition(null);
            }
        }

        dragRef.current = null;
    };

    return (
        <div className="map-canvas-wrapper">
            <div
                ref={containerRef}
                className="map-canvas-container"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <canvas ref={canvasRef} className="map-canvas" />
            </div>

            <div className="map-canvas-controls">
                <button
                    type="button"
                    onClick={() => zoomCenter(1 / 1.2)}
                    title="Zoom out"
                >
                    −
                </button>

                <span className="map-canvas-zoom">
                    {Math.round((viewport?.scale ?? 1) * 100)}%
                </span>

                <button
                    type="button"
                    onClick={() => zoomCenter(1.2)}
                    title="Zoom in"
                >
                    +
                </button>

                <button type="button" onClick={fit} title="Fit map">
                    Fit
                </button>
            </div>
        </div>
    );
}