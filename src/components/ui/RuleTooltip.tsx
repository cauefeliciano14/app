import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { GLOSSARY } from '../../data/glossary';
import styles from './RuleTooltip.module.css';

/* ════════════════════════════════════════════════════
   Tipos de tag suportados pelo parser
   ════════════════════════════════════════════════════ */
export type RuleTagType =
  | 'feitiço'
  | 'condição'
  | 'item'
  | 'regra'
  | 'atributo'
  | 'ação'
  | 'dano';

const TAG_STYLE: Record<RuleTagType, string> = {
  feitiço:  styles.tagFeitico,
  condição: styles.tagCondicao,
  item:     styles.tagItem,
  regra:    styles.tagRegra,
  atributo: styles.tagAtributo,
  ação:     styles.tagAcao,
  dano:     styles.tagDano,
};

/* ════════════════════════════════════════════════════
   Cache global de regras resolvidas
   ════════════════════════════════════════════════════ */
const ruleCache = new Map<string, string | null>();

/**
 * Resolve o conteúdo de uma regra a partir do glossário.
 * Suporta aliases, variações gramaticais (plural → singular),
 * e formato [regra]Dano Ácido;Ácido[/regra] (alias após ;).
 */
function resolveRule(value: string): string | null {
  // Checa cache
  if (ruleCache.has(value)) return ruleCache.get(value)!;

  // Se tem ";", o segundo trecho é o alias de busca
  const parts = value.split(';');
  const displayName = parts[0].trim();
  const searchKey = (parts[1] ?? parts[0]).trim();

  // Busca exata
  let result = GLOSSARY[searchKey] ?? GLOSSARY[displayName] ?? null;

  // Fallback: singular (remove trailing "s"/"es")
  if (!result) {
    const singular = searchKey.replace(/e?s$/i, '');
    result = GLOSSARY[singular] ?? null;
  }

  // Fallback: case-insensitive
  if (!result) {
    const lower = searchKey.toLowerCase();
    const key = Object.keys(GLOSSARY).find(k => k.toLowerCase() === lower);
    if (key) result = GLOSSARY[key];
  }

  ruleCache.set(value, result);
  return result;
}

/* ════════════════════════════════════════════════════
   RuleTooltip — trigger + conteúdo flutuante
   ════════════════════════════════════════════════════ */
interface RuleTooltipProps {
  type: RuleTagType;
  value: string;
  children?: React.ReactNode;
}

const DEBOUNCE_MS = 300;

export function RuleTooltip({ type, value, children }: RuleTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = value.split(';')[0].trim();

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: DEBOUNCE_MS, close: 100 },
    restMs: 150,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  /* Carregar conteúdo com debounce */
  useEffect(() => {
    if (isOpen && content === null && !isLoading) {
      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        const resolved = resolveRule(value);
        setContent(resolved);
        setIsLoading(false);
      }, 50); // resolução é local, quase instantânea
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isOpen, value, content, isLoading]);

  /* Keyboard: Enter/Space para abrir */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (content === null) {
          const resolved = resolveRule(value);
          setContent(resolved);
        }
      }
    },
    [value, content],
  );

  const tagClass = TAG_STYLE[type] ?? styles.tagRegra;

  return (
    <>
      <span
        ref={refs.setReference}
        className={`${styles.trigger} ${tagClass}`}
        tabIndex={0}
        role="button"
        aria-describedby={isOpen ? 'rule-tooltip' : undefined}
        onKeyDown={handleKeyDown}
        {...getReferenceProps()}
      >
        {children ?? displayName}
      </span>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            id="rule-tooltip"
            className={styles.tooltip}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <div className={styles.tooltipHeader}>
              <span className={`${styles.tooltipBadge} ${tagClass}`}>
                {type.toUpperCase()}
              </span>
              <span className={styles.tooltipTitle}>{displayName}</span>
            </div>
            {isLoading ? (
              <div className={styles.tooltipLoading}>Carregando...</div>
            ) : content ? (
              <div className={styles.tooltipBody}>{content}</div>
            ) : (
              <div className={styles.tooltipEmpty}>
                Regra não encontrada no glossário.
              </div>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════
   Parser de pseudo-tags → componentes React
   ════════════════════════════════════════════════════ */
const TAG_REGEX = /\[(\w+)\](.*?)\[\/\1\]/g;

const VALID_TAGS = new Set<string>([
  'feitiço', 'feitico',
  'condição', 'condicao',
  'item',
  'regra',
  'atributo',
  'ação', 'acao',
  'dano',
]);

/** Normaliza tag sem acentos para o tipo canônico */
function normalizeTag(raw: string): RuleTagType | null {
  const lower = raw.toLowerCase();
  const map: Record<string, RuleTagType> = {
    'feitiço': 'feitiço',
    'feitico': 'feitiço',
    'condição': 'condição',
    'condicao': 'condição',
    'item': 'item',
    'regra': 'regra',
    'atributo': 'atributo',
    'ação': 'ação',
    'acao': 'ação',
    'dano': 'dano',
  };
  return map[lower] ?? null;
}

/**
 * Processa texto com pseudo-tags e retorna fragmentos React.
 *
 * Exemplo:
 *   parseRuleTags("Lança [feitiço]Bola de Fogo[/feitiço] causando [dano]Ígneo[/dano]")
 *   → ["Lança ", <RuleTooltip type="feitiço" value="Bola de Fogo"/>, " causando ", <RuleTooltip type="dano" value="Ígneo"/>]
 */
export function parseRuleTags(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  TAG_REGEX.lastIndex = 0;

  while ((match = TAG_REGEX.exec(text)) !== null) {
    const [fullMatch, tagName, tagValue] = match;
    const tagType = normalizeTag(tagName);

    // Texto antes do match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    if (tagType) {
      result.push(
        <RuleTooltip key={`${match.index}-${tagValue}`} type={tagType} value={tagValue} />,
      );
    } else {
      // Tag desconhecida: renderizar como texto simples
      result.push(tagValue);
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Texto restante após último match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/**
 * Componente wrapper que recebe texto raw e renderiza com tooltips.
 */
interface ParsedRuleTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ParsedRuleText({ text, className, as: Tag = 'span' }: ParsedRuleTextProps) {
  const parsed = useMemo(() => parseRuleTags(text), [text]);
  return <Tag className={className}>{parsed}</Tag>;
}
