import json
from collections import Counter

files = [
    ('bardo_spells.json',      'Bardo'),
    ('bruxo_spells.json',      'Bruxo'),
    ('clerigo_spells.json',    'Clerigo'),
    ('druida_spells.json',     'Druida'),
    ('feiticeiro_spells.json', 'Feiticeiro'),
    ('guardiao_spells.json',   'Guardiao'),
    ('mago_spells.json',       'Mago'),
    ('paladino_spells.json',   'Paladino'),
]

for fname, cls in files:
    with open(f'react-app/src/data/spells/{fname}', 'r', encoding='utf-8') as f:
        spells = json.load(f)

    s0 = spells[0]
    print(f'=== {cls} ({len(spells)} magias) ===')
    print(f'  Keys: {list(s0.keys())}')
    print(f'  Primeiro: {s0["name"]} | {s0["level"]} | {s0["school"]} | Especial: {s0["especial"]}')
    
    lvl_count = Counter(s['level'] for s in spells)
    
    # Nivel order
    level_order = ['Truque','1o Circulo','2o Circulo','3o Circulo']
    print(f'  Por nivel: {dict(lvl_count)}')
    print()
