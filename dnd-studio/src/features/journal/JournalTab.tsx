import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import {
  useDeleteJournalEntry,
  useJournalEntry,
  useUpdateJournalEntry,
} from '../../shared/api/hooks';
import { useWorkspaceStore } from '../../shared/stores/workspace';

function MarkdownPreview({ content }: { content: string }) {
  const html = useMemo(() => {
    const rawHtml = marked.parse(content || '', {
      async: false,
    }) as string;

    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  return (
    <div
      className="journal-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function JournalTab({ entryId }: { entryId?: string }) {
  const { data: entry, isLoading } = useJournalEntry(entryId);

  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

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

  useEffect(() => {
    if (!entry || entry.id === initializedFor) {
      return;
    }

    setTitle(entry.title);
    setFolderPath(entry.folderPath);
    setContentMarkdown(entry.contentMarkdown);
    setIsVisibleToPlayers(entry.isVisibleToPlayers);
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
        isVisibleToPlayers,
      },
      {
        onSuccess: () => {
          renameTabByEntity(
            'journal',
            entry.id,
            title.trim() || 'Untitled',
          );
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
    </div>
  );
}