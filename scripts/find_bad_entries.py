import json

with open('react-app/src/data/spells/spells_all.json', 'r', encoding='utf-8') as f:
    spells = json.load(f)

# Buscar entradas com nomes problemáticos
for i, s in enumerate(spells):
    name_lower = s['name'].lower()
    # Treinamento com Armadura (não é magia)
    if 'treinamento' in name_lower:
        print(f'[TREINAMENTO] Index {i}: {s["name"]} | Level: {s["level"]} | School: {s["school"]}')
    # Flavor text de Imagem Silenciosa capturado como nome
    if 'imagem silenciosa pode' in name_lower:
        print(f'[FLAVOR TEXT] Index {i}: {s["name"]}')
    # Armadura (não arcana) — pode ser Treinamento com Armadura capturada errado
    if 'armadura' in name_lower and 'arcana' not in name_lower:
        print(f'[ARMADURA?] Index {i}: {s["name"]} | Level: {s["level"]}')

print("Busca concluída.")
