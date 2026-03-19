import re
import json
import os

text_path = 'c:/Users/cauef/OneDrive/Documents/App/react-app/source/docx_text.txt'
out_path = 'c:/Users/cauef/OneDrive/Documents/App/react-app/src/data/classDetails.json'

with open(text_path, 'r', encoding='utf-8') as f:
    text = f.read()

classes = ['Bárbaro', 'Bardo', 'Bruxo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guardião', 'Guerreiro', 'Ladino', 'Mago', 'Monge', 'Paladino']
results = {}

def clean_key(k):
    return k.strip().replace(':', '')

for i, cls in enumerate(classes):
    print(f"Extracting {cls}...")
    
    # 1. To get the subtitle and first sentence, we look around the first H1 'cls' equivalent 
    # In raw text, let's just find the first exact occurrence of the class name on its own line:
    cls_header_pattern = re.compile(rf'^{cls}$', re.MULTILINE)
    match = cls_header_pattern.search(text)
    
    subtitle = ""
    first_sentence = ""
    
    if match:
        start_idx = match.end()
        # look at the next few lines
        snippet = text[start_idx:start_idx+1000].strip().split('\n')
        for line in snippet:
            line = line.strip()
            if not line: continue
            
            # The subtitle is usually a short descriptive phrase right after the title
            if not subtitle and len(line) < 100 and line != cls:
                subtitle = line
            # The first descriptive sentence is usually a longer paragraph
            elif not first_sentence and len(line) >= 60:
                first_sentence = line.split('. ')[0] + '.'
                break

    # 2. Extract Traços Básicos 
    # Usually structured like:
    # Traços Básicos de Bárbaro
    # Atributo Primário  Força
    # Dado de Ponto de Vida  D12 por nível de Bárbaro
    
    traits_pattern = re.compile(rf'Traços Básicos de {cls}(.*?)Equipamento Inicial(.*?)(?=\n[A-Z][a-z]+|\n\n)', re.DOTALL | re.IGNORECASE)
    t_match = traits_pattern.search(text)
    
    basic_traits = {}
    
    if t_match:
        traits_text = t_match.group(1).strip()
        equipment_text = t_match.group(2).strip()
        
        # known keys to look for in the traits_text
        keys = ['Atributo Primário', 'Dado de Ponto de Vida', 'Proficiência em Salvaguardas', 'Proficiência em Perícias', 'Proficiências com Armas', 'Proficiência em Armas', 'Treinamento com Armadura', 'Proficiências com Ferramentas', 'Proficiência em Salvaguarda', 'Proficiências em Perícias', 'Treinamento com Armaduras']
        
        # Simple parser looking for known labels line by line or sequentially
        lines = traits_text.split('\n')
        current_key = None
        current_val = []
        
        for line in lines:
            line = line.strip()
            if not line: continue
            
            found_key = False
            for k in keys:
                if line.startswith(k):
                    if current_key:
                        basic_traits[current_key] = " ".join(current_val).strip()
                    current_key = clean_key(k)
                    # The value might be on the same line after the key
                    val_part = line[len(k):].strip().lstrip(':').strip()
                    current_val = [val_part] if val_part else []
                    found_key = True
                    break
            
            if not found_key and current_key:
                current_val.append(line)
        
        if current_key:
            basic_traits[current_key] = " ".join(current_val).strip()
            
        basic_traits['Equipamento Inicial'] = equipment_text.replace('\n', ' ').strip()
    else:
        # Fallback if pattern doesn't match perfectly, e.g., slightly different trait names
        print(f"Warning: Full traits block not perfectly matched for {cls}")

    # Standardize the ID format
    class_id = cls.lower().replace(' ', '-').encode('ascii', 'ignore').decode('ascii')
    # Custom tweaks for accents
    if cls == "Bárbaro": class_id = "barbaro"
    elif cls == "Clérigo": class_id = "clerigo"
    elif cls == "Guardião": class_id = "guardiao"
    elif cls == "Paladino": class_id = "paladino"
    elif cls == "Guerreiro": class_id = "guerreiro"
    
    results[class_id] = {
        "subtitle": subtitle,
        "firstSentence": first_sentence.replace('Traços Básicos de', '').strip(),
        "basicTraits": basic_traits
    }

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nExtracted data saved to {out_path}")
