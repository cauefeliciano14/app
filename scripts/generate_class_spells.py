"""
Gera arquivos JSON de magias por classe, organizados por nível (círculo) e ordem alfabética.
Inclui flags de Concentração (C), Ritual (R) e Componente Material específico (M).

Saída:
  react-app/src/data/spells/bardo_spells.json
  react-app/src/data/spells/bruxo_spells.json
  react-app/src/data/spells/clerigo_spells.json
  react-app/src/data/spells/druida_spells.json
  react-app/src/data/spells/feiticeiro_spells.json
  react-app/src/data/spells/guardiao_spells.json
  react-app/src/data/spells/mago_spells.json
  react-app/src/data/spells/paladino_spells.json
"""
import json
import re
import os

# ---------------------------------------------------------------------------
# Ordem de níveis para ordenação
# ---------------------------------------------------------------------------
LEVEL_ORDER = [
    "Truque",
    "1º Círculo", "2º Círculo", "3º Círculo",
    "4º Círculo", "5º Círculo", "6º Círculo",
    "7º Círculo", "8º Círculo", "9º Círculo",
]

def level_index(level: str) -> int:
    try:
        return LEVEL_ORDER.index(level)
    except ValueError:
        return 99

# ---------------------------------------------------------------------------
# Derivar flags Especial a partir dos componentes e duração
# ---------------------------------------------------------------------------
def get_especial(spell: dict) -> str:
    flags = []
    duration = spell.get("duration", "")
    components = spell.get("components", "")
    casting_time = spell.get("castingTime", "")

    # C = Concentração
    if "Concentração" in duration or "Concentracao" in duration:
        flags.append("C")

    # R = Ritual (tempo de conjuração menciona Ritual, ou duração menciona Ritual)
    if "Ritual" in casting_time or "Ritual" in duration:
        flags.append("R")

    # M = Componente Material específico (tem parênteses dentro dos componentes)
    # Ex: "V, S, M (um pouco de lã)"
    if re.search(r'M\s*\(', components):
        flags.append("M")

    return ", ".join(flags) if flags else "—"

# ---------------------------------------------------------------------------
# Carregar spells_all.json
# ---------------------------------------------------------------------------
with open("react-app/src/data/spells/spells_all.json", "r", encoding="utf-8") as f:
    all_spells = json.load(f)

# ---------------------------------------------------------------------------
# Configuração das classes e seus arquivos
# ---------------------------------------------------------------------------
CLASSES = {
    "Bardo":      "bardo_spells.json",
    "Bruxo":      "bruxo_spells.json",
    "Clérigo":    "clerigo_spells.json",
    "Druida":     "druida_spells.json",
    "Feiticeiro": "feiticeiro_spells.json",
    "Guardião":   "guardiao_spells.json",
    "Mago":       "mago_spells.json",
    "Paladino":   "paladino_spells.json",
}

os.makedirs("react-app/src/data/spells", exist_ok=True)

# ---------------------------------------------------------------------------
# Gerar arquivo por classe
# ---------------------------------------------------------------------------
for class_name, filename in CLASSES.items():
    # Filtrar magias da classe
    class_spells = [
        s for s in all_spells
        if class_name in s.get("classes", [])
    ]

    # Ordenar: primeiro por nível, depois alfabeticamente
    class_spells = sorted(
        class_spells,
        key=lambda s: (level_index(s["level"]), s["name"].lower())
    )

    # Montar objeto de saída com os campos relevantes
    output = []
    for s in class_spells:
        output.append({
            "name":        s["name"],
            "level":       s["level"],
            "school":      s["school"],
            "especial":    get_especial(s),
            "castingTime": s["castingTime"],
            "range":       s["range"],
            "components":  s["components"],
            "duration":    s["duration"],
            "description": s["description"],
            "classes":     s["classes"],
        })

    filepath = f"react-app/src/data/spells/{filename}"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"[{class_name:12}] {len(output):3} magias -> {filename}")

print("\nTodos os arquivos gerados com sucesso!")
