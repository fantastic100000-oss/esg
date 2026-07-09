import { Card } from '../common/Card';
import { generateId } from '../../lib/id';
import type { Repository } from '../../repositories/localStorageRepository';
import type { TaxonomyItem } from '../../types';

interface TaxonomyEditorProps {
  title: string;
  idPrefix: string;
  items: TaxonomyItem[];
  repository: Repository<TaxonomyItem>;
  onChange: () => void;
}

export function TaxonomyEditor({ title, idPrefix, items, repository, onChange }: TaxonomyEditorProps) {
  function handleAdd() {
    const name = prompt(`추가할 ${title} 이름을 입력하세요.`);
    if (!name?.trim()) return;
    repository.create({ id: generateId(idPrefix), name: name.trim() });
    onChange();
  }

  function handleRename(item: TaxonomyItem) {
    const name = prompt('새 이름을 입력하세요.', item.name);
    if (!name?.trim()) return;
    repository.update({ ...item, name: name.trim() });
    onChange();
  }

  function handleDelete(item: TaxonomyItem) {
    if (!confirm(`"${item.name}"을(를) 삭제할까요?`)) return;
    repository.remove(item.id);
    onChange();
  }

  return (
    <Card
      title={title}
      actions={
        <button type="button" onClick={handleAdd} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
          + 추가
        </button>
      }
    >
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-slate-50">
            <span className="text-slate-700">{item.name}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => handleRename(item)} className="rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100">
                수정
              </button>
              <button type="button" onClick={() => handleDelete(item)} className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50">
                삭제
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="py-3 text-center text-xs text-slate-400">등록된 항목이 없습니다.</p>}
      </ul>
    </Card>
  );
}
