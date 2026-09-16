'use client';

import { useState } from 'react';
import {
  FolderOpen, FileText, Image, Film, Archive, Upload,
  Download, Trash2, Share2, MoreHorizontal, Search,
  Grid, List, ChevronRight, Home, Plus, HardDrive,
} from 'lucide-react';
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConfirmDialog } from '@/components/ui/modal';
import { useAppStore } from '@/store/app-store';
import type { FileItem } from '@/types';

const mimeIcons: Record<string, React.ElementType> = {
  'application/pdf':   FileText,
  'application/docx':  FileText,
  'application/xlsx':  FileText,
  'application/figma': Image,
  'image/':            Image,
  'video/':            Film,
  'application/zip':   Archive,
};

function getFileIcon(item: FileItem) {
  if (item.type === 'folder') return FolderOpen;
  const mime = item.mimeType ?? '';
  for (const [key, Icon] of Object.entries(mimeIcons)) {
    if (mime.startsWith(key) || mime.includes(key)) return Icon;
  }
  return FileText;
}

function getFileColor(item: FileItem): string {
  if (item.type === 'folder') return '#f59e0b';
  const mime = item.mimeType ?? '';
  if (mime.includes('pdf'))    return '#ef4444';
  if (mime.includes('image') || mime.includes('figma')) return '#8b5cf6';
  if (mime.includes('video'))  return '#3b82f6';
  if (mime.includes('zip'))    return '#6b7280';
  return '#64748b';
}

function FileCard({ item, onOpen, onDelete }: { item: FileItem; onOpen: () => void; onDelete: () => void }) {
  const { users } = useAppStore();
  const uploader  = users.find(u => u.id === item.uploadedBy);
  const Icon  = getFileIcon(item);
  const color = getFileColor(item);
  const [menu, setMenu] = useState(false);

  return (
    <div className="group relative flex flex-col bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
      onClick={onOpen}>
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>

      <p className="text-sm font-medium text-[var(--text-primary)] truncate mb-1" title={item.name}>{item.name}</p>
      <p className="text-xs text-[var(--text-muted)]">
        {item.type === 'folder' ? 'Folder' : item.mimeType?.split('/').pop()?.toUpperCase()}
        {item.size ? ' · ' + formatBytes(item.size) : ''}
      </p>
      {uploader && <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{uploader.name}</p>}

      {/* Context menu button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all"
        onClick={e => { e.stopPropagation(); setMenu(!menu); }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {menu && (
        <div className="absolute top-8 right-2 z-20 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-xl w-40 py-1" onClick={e => e.stopPropagation()}>
          {[
            { icon: Download, label: 'Download' },
            { icon: Share2,   label: 'Share'    },
          ].map(({ icon: MI, label }) => (
            <button key={label} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
              <MI className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
          <button
            onClick={() => { onDelete(); setMenu(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function FilesPage() {
  const { files, company, users } = useAppStore();
  const [search,      setSearch]      = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [view,        setView]        = useState<'grid'|'list'>('grid');
  const [deleteId,    setDeleteId]    = useState<string | null>(null);

  // Breadcrumbs
  const buildBreadcrumbs = () => {
    const crumbs: Array<{ id: string|null; name: string }> = [{ id: null, name: 'All Files' }];
    let folderId = currentFolder;
    const visited: string[] = [];
    while (folderId) {
      if (visited.includes(folderId)) break;
      visited.push(folderId);
      const folder = files.find(f => f.id === folderId);
      if (!folder) break;
      crumbs.splice(1, 0, { id: folder.id, name: folder.name });
      folderId = folder.parentId ?? null;
    }
    return crumbs;
  };

  const currentItems = files.filter(f => {
    const parentMatch = f.parentId === currentFolder;
    if (!search) return parentMatch;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  const folders = currentItems.filter(f => f.type === 'folder');
  const filesList = currentItems.filter(f => f.type === 'file');
  const storagePercent = (company.storageUsed / company.storageLimit) * 100;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-elevated)] p-4 flex flex-col shrink-0">
        <Button fullWidth icon={<Upload className="w-4 h-4" />} size="sm" className="mb-4">Upload Files</Button>

        <nav className="space-y-0.5 flex-1">
          {[
            { label: 'All Files', id: null },
            ...files.filter(f => f.type === 'folder' && !f.parentId).map(f => ({ label: f.name, id: f.id })),
          ].map(item => (
            <button key={item.id ?? 'root'} onClick={() => setCurrentFolder(item.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors',
                currentFolder === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              )}>
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Storage meter */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 mb-2">
            <HardDrive className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">Storage</span>
          </div>
          <Progress value={storagePercent} size="sm" />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatBytes(company.storageUsed)} / {formatBytes(company.storageLimit)}
          </p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm flex-1">
            {buildBreadcrumbs().map((crumb, i, arr) => (
              <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                <button
                  onClick={() => setCurrentFolder(crumb.id)}
                  className={cn(
                    'hover:text-blue-600 transition-colors',
                    i === arr.length - 1 ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  )}>
                  {i === 0 ? <Home className="w-3.5 h-3.5" /> : crumb.name}
                </button>
              </span>
            ))}
          </nav>

          <Input placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />} inputSize="sm" className="w-48" />

          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-0.5 rounded-lg border border-[var(--border)]">
            {([['grid', Grid],['list', List]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={cn('p-1.5 rounded-md transition-colors', view===v ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>New Folder</Button>
          <Button size="sm" icon={<Upload className="w-4 h-4" />}>Upload</Button>
        </div>

        {/* Files area */}
        <div className="flex-1 overflow-y-auto p-5">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FolderOpen className="w-16 h-16 text-[var(--text-muted)] mb-4" />
              <p className="font-medium text-[var(--text-primary)]">This folder is empty</p>
              <p className="text-sm text-[var(--text-muted)]">Upload files or create a new folder</p>
            </div>
          ) : view === 'grid' ? (
            <>
              {folders.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Folders</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {folders.map(f => (
                      <FileCard key={f.id} item={f}
                        onOpen={() => f.type === 'folder' && setCurrentFolder(f.id)}
                        onDelete={() => setDeleteId(f.id)} />
                    ))}
                  </div>
                </div>
              )}
              {filesList.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Files</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filesList.map(f => (
                      <FileCard key={f.id} item={f} onOpen={() => {}} onDelete={() => setDeleteId(f.id)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    {['Name','Type','Size','Uploaded by','Modified'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {currentItems.map(f => {
                    const uploader = users.find(u => u.id === f.uploadedBy);
                    const Icon  = getFileIcon(f);
                    const color = getFileColor(f);
                    return (
                      <tr key={f.id} onClick={() => f.type === 'folder' && setCurrentFolder(f.id)}
                        className="hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                            <span className="font-medium text-[var(--text-primary)] truncate max-w-xs">{f.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {f.type === 'folder' ? 'Folder' : f.mimeType?.split('/').pop()?.toUpperCase() ?? 'File'}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{f.size ? formatBytes(f.size) : '—'}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{uploader?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{formatRelativeTime(f.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete file" message="This will permanently delete the file. This action cannot be undone."
        confirmLabel="Delete" danger />
    </div>
  );
}
