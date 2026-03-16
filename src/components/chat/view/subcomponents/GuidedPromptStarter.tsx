import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  GUIDED_PROMPT_SCENARIOS,
  type GuidedPromptScenario,
} from '../../constants/guidedPromptScenarios';
import { api } from '../../../../utils/api';
import { useAuth } from '../../../../contexts/AuthContext';

interface GuidedPromptStarterProps {
  projectName: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

interface SkillTreeNode {
  name: string;
  type: 'directory' | 'file';
  children?: SkillTreeNode[];
}

function buildTemplate(
  t: (key: string, options?: Record<string, unknown>) => string,
  scenario: GuidedPromptScenario,
  skills: string[],
) {
  return [
    t('guidedStarter.template.intro', {
      scenario: t(scenario.titleKey),
      skills: skills.join(', '),
    }),
    '',
  ].join('\n');
}

export default function GuidedPromptStarter({
  projectName: _projectName,
  setInput,
  textareaRef,
}: GuidedPromptStarterProps) {
  const { t } = useTranslation('chat');
  const { user } = useAuth();
  const username = (user as { username?: string } | null)?.username ?? null;
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const normalize = (value: string) => value.trim().toLowerCase();
    const discovered = new Set<string>();

    const collect = (nodes: SkillTreeNode[]) => {
      for (const node of nodes) {
        if (node.type !== 'directory') {
          continue;
        }
        const hasSkillMd = (node.children || []).some(
          (child) => child.type === 'file' && child.name === 'SKILL.md',
        );
        if (hasSkillMd) {
          discovered.add(normalize(node.name));
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          collect(node.children);
        }
      }
    };

    const fetchSkills = async () => {
      try {
        const response = await api.getGlobalSkills();
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as SkillTreeNode[];
        collect(payload);
        if (!cancelled && discovered.size > 0) {
          setAvailableSkills(discovered);
        }
      } catch {
        // Keep static list as fallback.
      }
    };

    fetchSkills();
    return () => {
      cancelled = true;
    };
  }, []);

  const injectTemplate = (scenario: GuidedPromptScenario, skills: string[]) => {
    const nextValue = buildTemplate(t, scenario, skills);
    setInput(nextValue);
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const cursor = nextValue.length;
      el.setSelectionRange(cursor, cursor);
    }, 100);
  };

  const handleScenarioSelect = (scenario: GuidedPromptScenario) => {
    setSelectedScenarioId(scenario.id);
    const matchedSkills = availableSkills
      ? scenario.skills.filter((skill) => availableSkills.has(skill.toLowerCase()))
      : [];
    injectTemplate(scenario, matchedSkills.length > 0 ? matchedSkills : scenario.skills);
  };

  return (
    <div className="mt-8 px-1">
      <div className="flex items-start gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-emerald-400 flex items-center justify-center shadow-[0_8px_24px_rgba(34,211,238,0.3)]">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            {username ? (
              <p className="text-base sm:text-lg font-medium tracking-tight text-white/78">
                {t('guidedStarter.greeting', { username })}
              </p>
            ) : null}
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">{t('guidedStarter.title')}</p>
            <p className="mt-1 text-sm text-white/55 leading-relaxed">
              {t('guidedStarter.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {GUIDED_PROMPT_SCENARIOS.map((scenario) => {
          const isActive = selectedScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => handleScenarioSelect(scenario)}
              className={`rounded-full border px-3.5 py-2.5 text-left transition-colors ${
                isActive
                  ? 'border-cyan-400/70 bg-cyan-400/14 text-white'
                  : 'border-white/8 bg-white/[0.04] text-white/78 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="text-base leading-none">{scenario.icon}</span>
                {t(scenario.titleKey)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
