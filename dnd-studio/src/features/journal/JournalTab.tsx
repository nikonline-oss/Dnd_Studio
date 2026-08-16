import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import {
  useCreateJournalLink,
  useDeleteJournalEntry,
  useDeleteJournalLink,
  useJournalEntries,
  useJournalEntry,
  useJournalLinks,
  useLinkTypes,
  useUpdateJournalEntry,
} from '../../shared/api/hooks';
import { useWorkspaceStore } from '../../shared/stores/workspace';

function MarkdownPreview({ content }: { content: string }) {
  const html = (() => {
    const rawHtml = marked.parse(content || '', {
      async: false,
    }) as string;

    return DOMPurify.sanitize(rawHtml);
  })();

  return (
    <div
      className="journal-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function JournalTab({ entryId }: { entryId?: string }) {
  const { data: entry, isLoading } = useJournalEntry(entryId);
  const { data: allEntries = [] } = useJournalEntries(true);
  const { data: links = [] } = useJournalLinks(entryId);
  const { data: linkTypes = [] } = useLinkTypes(true);

  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();
  const createLink = useCreateJournalLink();
  const deleteLink = useDeleteJournalLink();

  const closeActiveTab = useWorkspaceStore((state) => state.closeActiveTab);
  const renameTabByEntity = useWorkspaceStore(
    (state) => state.renameTabByEntity,
  );

  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [folderPath, setFolderPath] = useState('/');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [isVisibleToPlayers, setIsVisibleToPlayers] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Форма создания связи
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkTargetId, setLinkTargetId] = useState('');
  const [linkType, setLinkType] = useState('reference');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkDirected, setLinkDirected] = useState(true);

  useEffect(() => {
    if (!entry || entry.id === initializedFor) {
      return;
    }

    setTitle(entry.title);
    setFolderPath(entry.folderPath);
    setContentMarkdown(entry.contentMarkdown);
    setIsVisibleToPlayers(entry.visibility === 'players');
    setInitializedFor(entry.id);
  }, [entry, initializedFor]);

  if (!entryId) {
    return (
      <div className="workspace-empty">
        Journal tab is broken: missing entry id.
      </div>
    );
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading journal entry…</div>;
  }

  if (!entry) {
    return <div className="workspace-empty">Journal entry not found.</div>;
  }

  const handleSave = () => {
    updateEntry.mutate(
      {
        id: entry.id,
        title: title.trim() || 'Untitled',
        contentMarkdown,
        folderPath,
        visibility: isVisibleToPlayers ? 'players' : 'gm_only',
        playersCanEdit: false,
      },
      {
        onSuccess: () => {
          renameTabByEntity('journal', entry.id, title.trim() || 'Untitled');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this journal entry?')) {
      return;
    }

    deleteEntry.mutate(
      {
        id: entry.id,
      },
      {
        onSuccess: () => {
          closeActiveTab();
        },
      },
    );
  };

  const handleCreateLink = () => {
    if (!entryId || !linkTargetId) return;

    createLink.mutate(
      {
        sourceEntryId: entryId,
        targetType: 'journal_entry',
        targetId: linkTargetId,
        linkType,
        isDirected: linkDirected,
        label: linkLabel.trim() || null,
      },
      {
        onSuccess: () => {
          setShowLinkForm(false);
          setLinkTargetId('');
          setLinkLabel('');
        },
      },
    );
  };

  const handleDeleteLink = (linkId: string) => {
    if (!window.confirm('Delete this link?')) return;

    deleteLink.mutate({
      id: linkId,
      entryId: entry.id,
    });
  };

  const getLinkTypeLabel = (key: string): string => {
    const lt = linkTypes.find((t) => t.key === key);
    return lt?.label ?? key;
  };

  const getEntryName = (id: string): string => {
    const e = allEntries.find((x) => x.id === id);
    return e?.title ?? 'Unknown';
  };

  // Записи, которые можно линковать (исключая текущую)
  const linkableEntries = allEntries.filter((e) => e.id !== entry.id);

  return (
    <div className="journal-tab">
      <div className="journal-toolbar">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Entry title"
        />

        <input
          type="text"
          value={folderPath}
          onChange={(event) => setFolderPath(event.target.value)}
          placeholder="/folder"
        />

        <label className="journal-visible-label">
          <input
            type="checkbox"
            checked={isVisibleToPlayers}
            onChange={(event) =>
              setIsVisibleToPlayers(event.target.checked)
            }
          />
          Visible to players
        </label>

        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
        >
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateEntry.isPending}
        >
          {updateEntry.isPending ? 'Saving…' : 'Save'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteEntry.isPending}
        >
          {deleteEntry.isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      <div
        className={
          showPreview
            ? 'journal-editor journal-editor-with-preview'
            : 'journal-editor'
        }
      >
        <textarea
          className="journal-textarea"
          value={contentMarkdown}
          onChange={(event) => setContentMarkdown(event.target.value)}
          placeholder="# Heading

Write markdown here…"
        />

        {showPreview && <MarkdownPreview content={contentMarkdown} />}
      </div>

      {/* Секция связей */}
      <div className="journal-links-section">
        <div className="journal-links-header">
          <h4>Links ({links.length})</h4>
          <button
            type="button"
            onClick={() => setShowLinkForm(!showLinkForm)}
          >
            {showLinkForm ? 'Cancel' : '+ Link'}
          </button>
        </div>

        {showLinkForm && (
          <div className="journal-link-form">
            <select
              value={linkTargetId}
              onChange={(e) => setLinkTargetId(e.target.value)}
            >
              <option value="">Select target entry…</option>
              {linkableEntries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
            >
              {linkTypes.map((lt) => (
                <option key={lt.key} value={lt.key}>
                  {lt.label}
                  {lt.sourcePluginId ? ' (plugin)' : ''}
                </option>
              ))}
            </select>

            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Label (optional)"
            />

            <label className="journal-link-directed">
              <input
                type="checkbox"
                checked={linkDirected}
                onChange={(e) => setLinkDirected(e.target.checked)}
              />
              Directed
            </label>

            <button
              type="button"
              onClick={handleCreateLink}
              disabled={!linkTargetId || createLink.isPending}
            >
              {createLink.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        )}

        <div className="journal-links-list">
          {links.length === 0 && !showLinkForm && (
            <div className="empty-state">No links yet.</div>
          )}

          {links.map((link) => {
            const isOutgoing = link.sourceEntryId === entry.id;
            const otherEntryId = isOutgoing
              ? link.targetId
              : link.sourceEntryId;

            return (
              <div key={link.id} className="journal-link-item">
                <span className="journal-link-direction">
                  {isOutgoing ? '→' : '←'}
                </span>

                <span className="journal-link-type">
                  {getLinkTypeLabel(link.linkType)}
                </span>

                <span className="journal-link-target">
                  {getEntryName(otherEntryId)}
                </span>

                {link.label && (
                  <span className="journal-link-label">
                    ({link.label})
                  </span>
                )}

                {!link.isDirected && (
                  <span className="journal-link-undirected">↔</span>
                )}

                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  onClick={() => handleDeleteLink(link.id)}
                  title="Delete link"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}