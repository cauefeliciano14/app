import json
import re
import unicodedata

def normalize(s):
    # Remove accents and lowercase
    s = s.lower().strip()
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

# Termos que NÃO são nomes de magia
NOT_SPELL_NAMES = {
    normalize("Treinamento com Armadura"),
    normalize("Usando um Espaço de Magia de Círculo Superior"),
    normalize("Aprimoramento de Truque"),
}

def is_flavor_text(s: str) -> bool:
    """Retorna True se a linha é flavor text, não um nome de magia."""
    if not s: return True
    if s.endswith('.'): return True  # frases terminam com ponto
    if len(s) > 55: return True       # nomes de magia nunca são tão longos
    if s and s[0].islower(): return True  # nomes começam com maiúscula
    if normalize(s) in NOT_SPELL_NAMES: return True
    return False

def parse_spells(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()

    spells = []
    
    in_spell_section = False
    current_spell = None
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if line == "Descrições das Magias" or line == "Descrições da Magias":
            in_spell_section = True
            i += 1
            continue
            
        if not in_spell_section:
            i += 1
            continue

        if len(line) == 1 and line.isupper():
            i += 1
            continue
            
        if line.startswith("Tempo de Conjuração:"):
            level_school = None
            name = None
            
            for j in range(i-1, i-6, -1):
                if j < 0: break
                check_line = lines[j].strip()
                match = re.search(r'^(Truque|[1-9]º Círculo)[a-zA-Z\s,]*(.*?)(?:\((.*?)\))?$', check_line)
                if match:
                    level_school = check_line
                    # Buscar o nome nas linhas anteriores, pulando flavor text
                    for back in range(1, 4):
                        if j - back < 0: break
                        name_cand = lines[j - back].strip()
                        if not is_flavor_text(name_cand):
                            name = name_cand
                            break
                    break
            
            if name and level_school:
                if current_spell:
                    spells.append(current_spell)
                
                level = re.search(r'^(Truque|[1-9]º Círculo)', level_school)
                level_str = level.group(1) if level else ""
                
                school_match = re.search(r'(Abjuração|Adivinhação|Encantamento|Evocação|Ilusão|Invocação|Necromancia|Transmutação)', level_school)
                school_str = school_match.group(1) if school_match else ""
                
                classes_match = re.search(r'\((.*?)\)', level_school)
                classes_str = classes_match.group(1) if classes_match else ""
                
                casting_time = line.replace("Tempo de Conjuração:", "").strip()
                
                range_str = ""
                components_str = ""
                duration_str = ""
                desc_lines = []
                
                k = i + 1
                while k < len(lines):
                    curr_line = lines[k].strip()
                    if curr_line.startswith("Alcance:"):
                        range_str = curr_line.replace("Alcance:", "").strip()
                    elif curr_line.startswith("Componentes:"):
                        components_str = curr_line.replace("Componentes:", "").strip()
                    elif curr_line.startswith("Duração:"):
                        duration_str = curr_line.replace("Duração:", "").strip()
                    elif curr_line.startswith("Tempo de Conjuração:"):
                        break
                    else:
                        if duration_str:
                            break
                    k += 1
                
                k_desc = k
                while k_desc < len(lines):
                    next_check = lines[k_desc].strip()
                    if k_desc + 1 < len(lines) and lines[k_desc+1].strip().startswith("Tempo de Conjuração:"):
                        break
                    if k_desc + 2 < len(lines) and lines[k_desc+2].strip().startswith("Tempo de Conjuração:"):
                        if re.match(r'^(Truque|[1-9]º Círculo)', lines[k_desc+1].strip()):
                            break
                    if k_desc + 3 < len(lines) and lines[k_desc+3].strip().startswith("Tempo de Conjuração:"):
                        if re.match(r'^(Truque|[1-9]º Círculo)', lines[k_desc+2].strip()):
                            break
                    
                    if len(next_check) == 1 and next_check.isupper():
                        k_desc += 1
                        continue
                        
                    if next_check != "":
                        desc_lines.append(next_check)
                    k_desc += 1
                
                current_spell = {
                    "name": name,
                    "level": level_str,
                    "school": school_str,
                    "classes": classes_str.split(", ") if classes_str else [],
                    "castingTime": casting_time,
                    "range": range_str,
                    "components": components_str,
                    "duration": duration_str,
                    "description": "\n".join(desc_lines)
                }
                
                i = k_desc - 1
            
        i += 1

    if current_spell:
        spells.append(current_spell)
        
    return spells

cleric_initiate_names = [
    "Acudir os Moribundos", "Badalar Fúnebre", "Chama Sagrada", "Luz", "Orientação", 
    "Palavra de Radiância", "Reparar", "Resistência", "Taumaturgia",
    "Benção", "Comando", "Criar ou Destruir Água", "Curar Ferimentos", "Detectar Magia",
    "Detectar o Bem e o Mal", "Detectar Veneno e Doença", "Escudo da Fé", "Infligir Ferimentos",
    "Palavra Curativa", "Perdição", "Proteção Contra o Bem e o Mal", "Purificar Alimentos e Bebidas",
    "Raio Guia", "Santuário"
]

druid_initiate_names = [
    "Acudir os Moribundos", "Arte Druídica", "Bordão Místico", "Chicote de Espinhos", "Criar Chamas",
    "Elementalismo", "Fagulha Estelar", "Mensagem", "Orientação", "Rajada de Veneno", "Reparar", "Resistência", "Trovão",
    "Amizade Animal", "Bom Fruto", "Criar ou Destruir Água", "Curar Ferimentos", "Detectar Magia",
    "Detectar Veneno e Doença", "Emaranhar", "Enfeitiçar Pessoa", "Faca de Gelo", "Falar com Animais",
    "Fogo das Fadas", "Névoa Obscurecente", "Onda Trovejante", "Palavra Curativa", "Passos Largos",
    "Proteção Contra o Bem e o Mal", "Purificar Alimentos e Bebidas", "Salto"
]

wizard_initiate_names = [
    "Amigos", "Badalar Fúnebre", "Bolha Ácida", "Elementalismo", "Golpe Certeiro", "Ilusão Menor",
    "Luz", "Luzes Dançantes", "Mãos Mágicas", "Mensagem", "Prestidigitação Arcana", "Proteção Contra Lâminas",
    "Raio de Fogo", "Raio de Gelo", "Rajada de Veneno", "Reparar", "Talho Mental", "Toque Chocante",
    "Toque Necrótico", "Trovão",
    "Alarme", "Armadura Arcana", "Compreender Idiomas", "Convocar Familiar", "Detectar Magia",
    "Disco Flutuante de Tenser", "Disfarçar-se", "Enfeitiçar Pessoa", "Escrita Ilusória", "Escudo Arcano",
    "Faca de Gelo", "Gargalhada Nefasta de Tasha", "Graxa", "Identificar", "Imagem Silenciosa", "Leque Cromático",
    "Mãos Flamejantes", "Mísseis Mágicos", "Névoa Obscurecente", "Onda Trovejante", "Orbe Cromático",
    "Passos Largos", "Proteção Contra o Bem e o Mal", "Queda Suave", "Raio de Bruxa", "Raio Nauseante",
    "Retirada Acelerada", "Salto", "Servo Invisível", "Sono", "Vitalidade Vazia"
]

all_spells = parse_spells("react-app/source/spells_extracted.txt")

# Filtrar entradas inválidas (nomes que são na verdade flavor text ou talentos)
all_spells = [s for s in all_spells if not is_flavor_text(s['name']) and normalize(s['name']) not in NOT_SPELL_NAMES]
# Remover duplicatas por nome normalizado
seen = set()
unique_spells = []
for s in all_spells:
    key = normalize(s['name'])
    if key not in seen:
        seen.add(key)
        unique_spells.append(s)
all_spells = unique_spells

cleric_spells = [s for s in all_spells if normalize(s['name']) in map(normalize, cleric_initiate_names)]
druid_spells = [s for s in all_spells if normalize(s['name']) in map(normalize, druid_initiate_names)]
wizard_spells = [s for s in all_spells if normalize(s['name']) in map(normalize, wizard_initiate_names)]

import os
os.makedirs("react-app/src/data/spells", exist_ok=True)

with open("react-app/src/data/spells/spells_all.json", "w", encoding="utf-8") as f:
    json.dump(all_spells, f, ensure_ascii=False, indent=2)

with open("react-app/src/data/spells/magic_initiate_cleric.json", "w", encoding="utf-8") as f:
    json.dump(cleric_spells, f, ensure_ascii=False, indent=2)

with open("react-app/src/data/spells/magic_initiate_druid.json", "w", encoding="utf-8") as f:
    json.dump(druid_spells, f, ensure_ascii=False, indent=2)

with open("react-app/src/data/spells/magic_initiate_wizard.json", "w", encoding="utf-8") as f:
    json.dump(wizard_spells, f, ensure_ascii=False, indent=2)

print(f"Total spells parsed: {len(all_spells)}")
print(f"Cleric spells: {len(cleric_spells)} / {len(cleric_initiate_names)}")
print(f"Druid spells: {len(druid_spells)} / {len(druid_initiate_names)}")
print(f"Wizard spells: {len(wizard_spells)} / {len(wizard_initiate_names)}")
