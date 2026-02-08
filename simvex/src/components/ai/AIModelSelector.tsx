'use client';

const AI_MODELS = [
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', group: 'GPT-5' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', group: 'GPT-5' },
  { id: 'gpt-5', name: 'GPT-5', group: 'GPT-5' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', group: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', group: 'GPT-4.1' },
  { id: 'gpt-4.1', name: 'GPT-4.1', group: 'GPT-4.1' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', group: 'GPT-4o' },
  { id: 'gpt-4o', name: 'GPT-4o', group: 'GPT-4o' },
] as const;

export type AIModelType = typeof AI_MODELS[number]['id'];

interface AIModelSelectorProps {
  value: AIModelType;
  onChange: (model: AIModelType) => void;
  isDarkMode: boolean;
}

export function AIModelSelector({ value, onChange, isDarkMode }: AIModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AIModelType)}
      className={`text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        isDarkMode
          ? 'bg-gray-700 text-gray-200 border border-gray-600'
          : 'bg-white text-gray-700 border border-gray-300'
      }`}
    >
      <optgroup label="GPT-5 (추론 모델)">
        <option value="gpt-5-nano">GPT-5 Nano (가장 빠름)</option>
        <option value="gpt-5-mini">GPT-5 Mini</option>
        <option value="gpt-5">GPT-5 (고품질)</option>
      </optgroup>
      <optgroup label="GPT-4.1">
        <option value="gpt-4.1-nano">GPT-4.1 Nano (가장 빠름)</option>
        <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
        <option value="gpt-4.1">GPT-4.1</option>
      </optgroup>
      <optgroup label="GPT-4o">
        <option value="gpt-4o-mini">GPT-4o Mini</option>
        <option value="gpt-4o">GPT-4o</option>
      </optgroup>
    </select>
  );
}

export { AI_MODELS };
