import { useState, type FormEvent } from 'react';

import { useCreateMap } from '../../shared/api/hooks';
import { Modal } from '../../shared/ui/Modal';

interface CreateMapModalProps {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
}

export function CreateMapModal({
  open,
  onClose,
  defaultName = '',
}: CreateMapModalProps) {
  const createMap = useCreateMap();

  const [name, setName] = useState(defaultName);
  const [width, setWidth] = useState(2000);
  const [height, setHeight] = useState(1500);
  const [gridSize, setGridSize] = useState(50);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;
    if (width < 100 || width > 16384) return;
    if (height < 100 || height > 16384) return;
    if (gridSize < 5 || gridSize > 500) return;

    createMap.mutate(
      {
        name: name.trim(),
        width,
        height,
        grid_size: gridSize,
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
    if (!createMap.isPending) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setWidth(2000);
    setHeight(1500);
    setGridSize(50);
  };

  const isValid =
    name.trim().length > 0 &&
    width >= 100 &&
    width <= 16384 &&
    height >= 100 &&
    height <= 16384 &&
    gridSize >= 5 &&
    gridSize <= 500;

  return (
    <Modal
      open={open}
      title="Create New Map"
      onClose={handleClose}
      width={440}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={createMap.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-map-form"
            className="btn-primary"
            disabled={!isValid || createMap.isPending}
          >
            {createMap.isPending ? 'Creating…' : 'Create Map'}
          </button>
        </>
      }
    >
      <form id="create-map-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="map-name">Name</label>
          <input
            id="map-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Battle of the Bridge"
            autoFocus
            maxLength={100}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="map-width">Width (px)</label>
            <input
              id="map-width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={100}
              max={16384}
            />
            {width < 100 && (
              <span className="form-error">Min 100px</span>
            )}
            {width > 16384 && (
              <span className="form-error">Max 16384px</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="map-height">Height (px)</label>
            <input
              id="map-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={100}
              max={16384}
            />
            {height < 100 && (
              <span className="form-error">Min 100px</span>
            )}
            {height > 16384 && (
              <span className="form-error">Max 16384px</span>
            )}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="map-grid">Grid Size (px)</label>
          <input
            id="map-grid"
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            min={5}
            max={500}
          />
          <span className="form-hint">
            Tokens are sized relative to grid size. Recommended: width / 30.
          </span>
          {gridSize < 5 && (
            <span className="form-error">Min 5px</span>
          )}
          {gridSize > 500 && (
            <span className="form-error">Max 500px</span>
          )}
        </div>

        <div className="form-preview">
          <div
            className="form-preview-ratio"
            style={{
              aspectRatio: `${width} / ${height}`,
            }}
          >
            <span>
              {width} × {height}
            </span>
          </div>
          <span className="form-hint">
            ~{Math.round(width / gridSize)}×{Math.round(height / gridSize)} cells
          </span>
        </div>
      </form>
    </Modal>
  );
}
