import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function RotationChecklistsPage() {
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [checklist, setChecklist] = useState<any>(null);

  useEffect(() => {
    api.getRotationTypes().then(r => setTypes(r.types)).catch(() => {});
  }, []);

  const loadChecklist = async (type: string) => {
    setSelectedType(type);
    try {
      const result = await api.getRotationChecklist(type);
      setChecklist(result.checklist);
    } catch {
      setChecklist(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Rotation Checklists</h2>
      <p className="text-gray-600">Select a secret type to view its rotation procedure.</p>

      <div className="flex gap-2 flex-wrap">
        {types.map(type => (
          <button
            key={type}
            onClick={() => loadChecklist(type)}
            className={`px-4 py-2 rounded text-sm ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {type.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {checklist && (
        <div className="bg-white border rounded p-4 space-y-3">
          <h3 className="text-lg font-bold">{checklist.title}</h3>
          <ol className="list-decimal ml-5 space-y-2">
            {checklist.steps.map((step: any, i: number) => (
              <li key={i} className="text-sm">{step.description}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
