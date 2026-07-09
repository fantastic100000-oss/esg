import { useState } from 'react';
import type { Folder } from '../../types';

interface FolderNodeData extends Folder {
  children: FolderNodeData[];
}

function buildTree(folders: Folder[]): FolderNodeData[] {
  const byParent = new Map<string | null, Folder[]>();
  folders.forEach((f) => {
    const list = byParent.get(f.parentFolderId) ?? [];
    list.push(f);
    byParent.set(f.parentFolderId, list);
  });

  function attach(parentId: string | null): FolderNodeData[] {
    return (byParent.get(parentId) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ ...f, children: attach(f.id) }));
  }

  return attach(null);
}

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelect: (folderId: string) => void;
  onCreateSubfolder: (parentFolderId: string) => void;
  onRename: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

function FolderNode({
  node,
  depth,
  ...handlers
}: FolderTreeProps & { node: FolderNodeData; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = handlers.selectedFolderId === node.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
          isSelected ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.children.length > 0 ? (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="w-4 shrink-0 text-xs text-slate-400">
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button type="button" onClick={() => handlers.onSelect(node.id)} className="flex-1 truncate text-left">
          📁 {node.name}
        </button>
        <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <button type="button" title="하위 폴더 생성" onClick={() => handlers.onCreateSubfolder(node.id)} className="rounded px-1 text-xs text-slate-400 hover:bg-slate-200">
            ＋
          </button>
          <button type="button" title="폴더명 수정" onClick={() => handlers.onRename(node.id)} className="rounded px-1 text-xs text-slate-400 hover:bg-slate-200">
            ✎
          </button>
          <button type="button" title="폴더 삭제" onClick={() => handlers.onDelete(node.id)} className="rounded px-1 text-xs text-red-400 hover:bg-red-100">
            🗑
          </button>
        </div>
      </div>
      {expanded && node.children.map((child) => <FolderNode key={child.id} node={child} depth={depth + 1} {...handlers} />)}
    </div>
  );
}

export function FolderTree(props: FolderTreeProps) {
  const tree = buildTree(props.folders);
  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <FolderNode key={node.id} node={node} depth={0} {...props} />
      ))}
    </div>
  );
}
