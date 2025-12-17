import * as React from 'react';
import { ITaskItem } from '../TaskBoardWebPart';

export interface ITaskBoardProps {
  title: string;
  tasks: ITaskItem[];
  isLoading: boolean;
  onReload: () => void;
  error?: string;
}

interface IGroupedTask extends ITaskItem {
  children: ITaskItem[];
}

const groupTasks = (items: ITaskItem[]): IGroupedTask[] => {
  const parents = new Map<number, IGroupedTask>();
  const orphans: ITaskItem[] = [];

  items.forEach(item => {
    const parentId = item.ParentId;
    if (parentId) {
      const parent = parents.get(parentId);
      if (parent) {
        parent.children.push(item);
      } else {
        orphans.push(item);
      }
    } else {
      parents.set(item.Id, { ...item, children: [] });
    }
  });

  // Attach orphans to their parents if they show up later in the array
  orphans.forEach(child => {
    const parent = parents.get(child.ParentId!);
    if (parent) {
      parent.children.push(child);
    }
  });

  return Array.from(parents.values());
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return null;
  const color = status === 'Færdig' ? '#2f9e44' : status === 'I gang' ? '#f08c00' : '#4dabf7';
  return (
    <span style={{
      backgroundColor: color,
      color: '#fff',
      padding: '4px 8px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600
    }}>
      {status}
    </span>
  );
};

const TaskBoard: React.FC<ITaskBoardProps> = ({ title, tasks, isLoading, onReload, error }) => {
  const grouped = groupTasks(tasks);

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <button onClick={onReload} disabled={isLoading}>Opdater</button>
      </div>
      {error && (
        <div style={{ marginBottom: 12, color: '#c92a2a', background: '#fff5f5', padding: 10, borderRadius: 8 }}>
          {error}
        </div>
      )}
      {isLoading && <div>Indlæser data...</div>}
      {!isLoading && grouped.length === 0 && <div>Ingen opgaver fundet.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {grouped.map(task => (
          <div key={task.Id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>#{task.Id}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{task.Title}</div>
                {task.DueDate && <div style={{ fontSize: 12, color: '#9ca3af' }}>Deadline: {new Date(task.DueDate).toLocaleDateString()}</div>}
              </div>
              <StatusBadge status={task.Status} />
            </div>
            <div style={{ margin: '12px 0 8px', height: 6, background: '#e5e7eb', borderRadius: 4 }}>
              <div style={{ width: `${task.Progress || 0}%`, background: '#3b82f6', height: '100%', borderRadius: 4 }} />
            </div>
            {task.children.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Underopgaver ({task.children.length})</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {task.children.map(child => (
                    <li key={child.Id} style={{ padding: 8, background: '#f1f5f9', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{child.Title}</div>
                          {child.DueDate && <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(child.DueDate).toLocaleDateString()}</div>}
                        </div>
                        <StatusBadge status={child.Status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
