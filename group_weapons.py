import json
import re

def remove_accents(text):
    accents = {
        'a': ['á', 'à', 'ã', 'â', 'ä'],
        'e': ['é', 'è', 'ê', 'ë'],
        'i': ['í', 'ì', 'î', 'ï'],
        'o': ['ó', 'ò', 'õ', 'ô', 'ö'],
        'u': ['ú', 'ù', 'û', 'ü'],
        'c': ['ç'],
        'A': ['Á', 'À', 'Ã', 'Â', 'Ä'],
        'E': ['É', 'È', 'Ê', 'Ë']
    }
    for char, variants in accents.items():
        for variant in variants:
            text = text.replace(variant, char)
    return text

with open('src/data/weapons.json', 'r', encoding='utf-8') as f:
    weapons_db = json.load(f)

id_to_group = {}

category_names = {
    "simpleMelee": "Armas Simples (Corpo a Corpo)",
    "simpleRanged": "Armas Simples (À Distância)",
    "martialMelee": "Armas Marciais (Corpo a Corpo)",
    "martialRanged": "Armas Marciais (À Distância)"
}

for cat, name in category_names.items():
    if cat in weapons_db:
        for w in weapons_db[cat]:
            clean_str = remove_accents(w["name"].strip().lower()).replace(" ", "_").replace(",", "")
            id_to_group[clean_str] = name

with open('src/data/classDetails.json', 'r', encoding='utf-8') as f:
    classes_db = json.load(f)
    
count = 0
for class_key, class_data in classes_db.items():
    if "features" in class_data:
        for feature in class_data["features"]:
            if feature["name"] == "Maestria em Arma" and "options" in feature:
                for opt in feature["options"]:
                    if "group" not in opt:
                        opt_id = opt.get("id", "")
                        
                        found = False
                        for cid, grp in id_to_group.items():
                            if opt_id.startswith(cid):
                                opt["group"] = grp
                                found = True
                                break
                        
                        if not found and "label" in opt:
                            for cid, grp in id_to_group.items():
                                if remove_accents(opt["label"].lower()).startswith(remove_accents(cid.replace("_", " "))):
                                    opt["group"] = grp
                                    found = True
                                    break
                                    
                        if not found:
                            if "maca" in opt_id: opt["group"] = "Armas Simples (Corpo a Corpo)"
                            elif "zagaia" in opt_id: opt["group"] = "Armas Simples (Corpo a Corpo)"
                            else: opt["group"] = "Armas Sem Categoria"

                count += 1

with open('src/data/classDetails.json', 'w', encoding='utf-8') as f:
    json.dump(classes_db, f, ensure_ascii=False, indent=2)

print(f"Added grouping to {count} features")
