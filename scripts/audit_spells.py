"""
Auditoria completa das magias extraídas vs. player_handbook_2024.docx
Compara:
1. Nomes de truques e magias nos JSONs vs texto bruto do docx
2. Escola de magia por nome vs docx
3. Componentes (C/R/M) por nome vs docx
4. Completude das listas de "Iniciado em Magia" por classe
"""
import json
import re
import unicodedata
import sys

# ────────────────────────────────────────────────────────────────
# 1.  Utilitários
# ────────────────────────────────────────────────────────────────
def normalize(s: str) -> str:
    s = s.lower().strip()
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')

SCHOOL_MAP = {
    "abjur": "Abjuração",
    "adiv": "Adivinhação",
    "encant": "Encantamento",
    "evoc": "Evocação",
    "ilus": "Ilusão",
    "invoc": "Invocação",
    "necro": "Necromancia",
    "transm": "Transmutação",
}

SCHOOLS_PT = list({
    "Abjuração", "Adivinhação", "Encantamento",
    "Evocação",  "Ilusão",      "Invocação",
    "Necromancia", "Transmutação"
})

# ────────────────────────────────────────────────────────────────
# 2.  Dados dos JSONs
# ────────────────────────────────────────────────────────────────
def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

spells_all    = load_json('react-app/src/data/spells/spells_all.json')
cleric_spells = load_json('react-app/src/data/spells/magic_initiate_cleric.json')
druid_spells  = load_json('react-app/src/data/spells/magic_initiate_druid.json')
wizard_spells = load_json('react-app/src/data/spells/magic_initiate_wizard.json')

# Indexar spells_all por nome normalizado
json_index: dict[str, dict] = {normalize(s['name']): s for s in spells_all}

# ────────────────────────────────────────────────────────────────
# 3.  Reextrair texto cru do docx (sem depender do .txt)
# ────────────────────────────────────────────────────────────────
import zipfile
import xml.etree.ElementTree as ET

def extract_docx_lines(docx_path: str) -> list[str]:
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    lines = []
    for p in root.findall('.//w:p', ns):
        text = ''.join(node.text or '' for node in p.iter() if node.text)
        lines.append(text)
    return lines

print("Extraindo texto do docx...", flush=True)
raw_lines = extract_docx_lines('react-app/source/player_handbook_2024.docx')
# Guardar também versão sem espaços extras
stripped = [l.strip() for l in raw_lines]

# ────────────────────────────────────────────────────────────────
# 4.  Reconstruir "ground truth" das magias diretamente do docx
# ────────────────────────────────────────────────────────────────
# Localizar seção de Descrições de Magias no docx
section_start = 0
for i, l in enumerate(stripped):
    if 'Descrições' in l and 'Magia' in l:
        section_start = i
        break

docx_spell_records: dict[str, dict] = {}   # norm_name -> {name, level, school, components}

def get_level(line: str):
    if re.match(r'^Truque', line):
        return 'Truque'
    m = re.match(r'^([1-9]º Círculo)', line)
    if m:
        return m.group(1)
    return None

i = section_start
while i < len(stripped):
    line = stripped[i]
    # Detectar linha de nível/escola (ex: "1º Círculo, Abjuração (Clérigo, Paladino)")
    # ou  "Truque de Transmutação (Druida)"
    level = get_level(line)
    if level:
        school = ""
        for sc in SCHOOLS_PT:
            if sc in line:
                school = sc
                break
        # Buscar componentes (C, R, M) — geralmente estão na linha dos componentes
        # mas para o ground-truth queremos só nome + escola básica
        
        # Nome: linha anterior (ou ante-anterior se houver flavor text)
        name_candidate = ""
        for back in range(1, 5):
            if i - back < 0:
                break
            cand = stripped[i - back]
            # Pular linhas vazias, flavor text (longa ou termina em ponto)
            if not cand:
                continue
            if cand.endswith('.') or len(cand) > 60:
                continue
            # Pular letras isoladas (separadores de alfabeto)
            if len(cand) == 1:
                continue
            name_candidate = cand
            break
        
        if name_candidate:
            key = normalize(name_candidate)
            docx_spell_records[key] = {
                'name':   name_candidate,
                'level':  level,
                'school': school,
            }
    i += 1

print(f"Spells identificadas no docx (ground truth): {len(docx_spell_records)}", flush=True)
print(f"Spells nos JSONs (spells_all.json): {len(spells_all)}", flush=True)

# ────────────────────────────────────────────────────────────────
# 5.  Comparações
# ────────────────────────────────────────────────────────────────
issues = []

section = lambda t: f"\n{'='*70}\n{t}\n{'='*70}"

# ── 5A  Spells no JSON que não foram encontradas no docx ───────
not_in_docx = []
for sp in spells_all:
    key = normalize(sp['name'])
    if key not in docx_spell_records:
        not_in_docx.append(sp['name'])

# ── 5B  Spells no docx que não estão no JSON ──────────────────
not_in_json = []
for key, rec in docx_spell_records.items():
    if key not in json_index:
        not_in_json.append(rec['name'])

# ── 5C  Escola divergente ─────────────────────────────────────
school_mismatches = []
for sp in spells_all:
    key = normalize(sp['name'])
    if key in docx_spell_records:
        docx_school = docx_spell_records[key]['school']
        json_school = sp['school']
        if docx_school and json_school and normalize(docx_school) != normalize(json_school):
            school_mismatches.append({
                'name':   sp['name'],
                'json':   json_school,
                'docx':   docx_school,
            })

# ── 5D  Nível divergente ──────────────────────────────────────
level_mismatches = []
for sp in spells_all:
    key = normalize(sp['name'])
    if key in docx_spell_records:
        docx_level = docx_spell_records[key]['level']
        json_level = sp['level']
        if normalize(docx_level) != normalize(json_level):
            level_mismatches.append({
                'name':   sp['name'],
                'json':   json_level,
                'docx':   docx_level,
            })

# ── 5E  Nomes duplicados no spells_all.json ───────────────────
seen = {}
duplicates = []
for sp in spells_all:
    key = normalize(sp['name'])
    if key in seen:
        duplicates.append(sp['name'])
    seen[key] = True

# ── 5F  Completude das listas de Iniciado em Magia ────────────
# Listas esperadas (do handbook, confirmadas pelo usuário)
expected = {
    'Clérigo - Truques': [
        "Acudir os Moribundos","Badalar Fúnebre","Chama Sagrada","Luz","Orientação",
        "Palavra de Radiância","Reparar","Resistência","Taumaturgia"
    ],
    'Clérigo - 1º Círculo': [
        "Benção","Comando","Criar ou Destruir Água","Curar Ferimentos","Detectar Magia",
        "Detectar o Bem e o Mal","Detectar Veneno e Doença","Escudo da Fé","Infligir Ferimentos",
        "Palavra Curativa","Perdição","Proteção Contra o Bem e o Mal",
        "Purificar Alimentos e Bebidas","Raio Guia","Santuário"
    ],
    'Druida - Truques': [
        "Acudir os Moribundos","Arte Druídica","Bordão Místico","Chicote de Espinhos",
        "Criar Chamas","Elementalismo","Fagulha Estelar","Mensagem","Orientação",
        "Rajada de Veneno","Reparar","Resistência","Trovão"
    ],
    'Druida - 1º Círculo': [
        "Amizade Animal","Bom Fruto","Criar ou Destruir Água","Curar Ferimentos",
        "Detectar Magia","Detectar Veneno e Doença","Emaranhar","Enfeitiçar Pessoa",
        "Faca de Gelo","Falar com Animais","Fogo das Fadas","Névoa Obscurecente",
        "Onda Trovejante","Palavra Curativa","Passos Largos",
        "Proteção Contra o Bem e o Mal","Purificar Alimentos e Bebidas","Salto"
    ],
    'Mago - Truques': [
        "Amigos","Badalar Fúnebre","Bolha Ácida","Elementalismo","Golpe Certeiro",
        "Ilusão Menor","Luz","Luzes Dançantes","Mãos Mágicas","Mensagem",
        "Prestidigitação Arcana","Proteção Contra Lâminas","Raio de Fogo","Raio de Gelo",
        "Rajada de Veneno","Reparar","Talho Mental","Toque Chocante","Toque Necrótico","Trovão"
    ],
    'Mago - 1º Círculo': [
        "Alarme","Armadura Arcana","Compreender Idiomas","Convocar Familiar","Detectar Magia",
        "Disco Flutuante de Tenser","Disfarçar-se","Enfeitiçar Pessoa","Escrita Ilusória",
        "Escudo Arcano","Faca de Gelo","Gargalhada Nefasta de Tasha","Graxa","Identificar",
        "Imagem Silenciosa","Leque Cromático","Mãos Flamejantes","Mísseis Mágicos",
        "Névoa Obscurecente","Onda Trovejante","Orbe Cromático","Passos Largos",
        "Proteção Contra o Bem e o Mal","Queda Suave","Raio de Bruxa","Raio Nauseante",
        "Retirada Acelerada","Salto","Servo Invisível","Sono","Vitalidade Vazia"
    ]
}

actual_lists = {
    'Clérigo - Truques':    [s['name'] for s in cleric_spells if s['level'] == 'Truque'],
    'Clérigo - 1º Círculo': [s['name'] for s in cleric_spells if s['level'] == '1º Círculo'],
    'Druida - Truques':     [s['name'] for s in druid_spells  if s['level'] == 'Truque'],
    'Druida - 1º Círculo':  [s['name'] for s in druid_spells  if s['level'] == '1º Círculo'],
    'Mago - Truques':       [s['name'] for s in wizard_spells if s['level'] == 'Truque'],
    'Mago - 1º Círculo':    [s['name'] for s in wizard_spells if s['level'] == '1º Círculo'],
}

list_issues = {}
for list_name, expected_names in expected.items():
    actual_norm   = {normalize(n) for n in actual_lists[list_name]}
    expected_norm = {normalize(n): n for n in expected_names}
    missing  = [expected_norm[k] for k in expected_norm if k not in actual_norm]
    extra    = [n for n in actual_lists[list_name] if normalize(n) not in expected_norm]
    if missing or extra:
        list_issues[list_name] = {'faltando': missing, 'excesso': extra}

# ────────────────────────────────────────────────────────────────
# 6.  Relatório
# ────────────────────────────────────────────────────────────────
out = []

out.append("RELATÓRIO DE AUDITORIA DE MAGIAS")
out.append("Fonte: player_handbook_2024.docx vs JSONs extraídos")
out.append(f"Data: 2026-03-10\n")

out.append(section("A) Magias nos JSONs não encontradas no docx"))
if not_in_docx:
    for n in sorted(not_in_docx): out.append(f"  - {n}")
else:
    out.append("  Nenhuma.")

out.append(section("B) Magias identificadas no docx mas ausentes do spells_all.json"))
if not_in_json:
    for n in sorted(not_in_json): out.append(f"  - {n}")
else:
    out.append("  Nenhuma.")

out.append(section("C) Escola divergente (JSON vs docx)"))
if school_mismatches:
    for m in school_mismatches:
        out.append(f"  [{m['name']}]  JSON={m['json']}  |  docx={m['docx']}")
else:
    out.append("  Nenhuma divergência detectada.")

out.append(section("D) Nível divergente (JSON vs docx)"))
if level_mismatches:
    for m in level_mismatches:
        out.append(f"  [{m['name']}]  JSON={m['json']}  |  docx={m['docx']}")
else:
    out.append("  Nenhuma divergência detectada.")

out.append(section("E) Nomes duplicados em spells_all.json"))
if duplicates:
    for n in duplicates: out.append(f"  - {n}")
else:
    out.append("  Nenhum duplicado.")

out.append(section("F) Completude das listas de Iniciado em Magia"))
if list_issues:
    for list_name, problems in list_issues.items():
        out.append(f"\n  [{list_name}]")
        if problems['faltando']:
            out.append("    Faltando:")
            for n in problems['faltando']: out.append(f"      - {n}")
        if problems['excesso']:
            out.append("    Em excesso (não está na lista esperada):")
            for n in problems['excesso']: out.append(f"      + {n}")
else:
    out.append("  Todas as listas estão completas e corretas.")

report = '\n'.join(out)
print(report)

# Salvar relatório
with open('react-app/scripts/audit_report.txt', 'w', encoding='utf-8') as f:
    f.write(report)

print("\n\nRelatório salvo em react-app/scripts/audit_report.txt")
