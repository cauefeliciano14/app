import json

def get_missing():
    with open('react-app/src/data/spells/spells_all.json', 'r', encoding='utf-8') as f:
        spells = json.load(f)
        
    all_names = [s['name'].lower().strip() for s in spells]
    
    cleric = ['Acudir os Moribundos', 'Badalar Fúnebre', 'Chama Sagrada', 'Luz', 'Orientação', 'Palavra de Radiância', 'Reparar', 'Resistência', 'Taumaturgia', 'Benção', 'Comando', 'Criar ou Destruir Água', 'Curar Ferimentos', 'Detectar Magia', 'Detectar o Bem e o Mal', 'Detectar Veneno e Doença', 'Escudo da Fé', 'Infligir Ferimentos', 'Palavra Curativa', 'Perdição', 'Proteção Contra o Bem e o Mal', 'Purificar Alimentos e Bebidas', 'Raio Guia', 'Santuário']
    druid = ['Acudir os Moribundos', 'Arte Druídica', 'Bordão Místico', 'Chicote de Espinhos', 'Criar Chamas', 'Elementalismo', 'Fagulha Estelar', 'Mensagem', 'Orientação', 'Rajada de Veneno', 'Reparar', 'Resistência', 'Trovão', 'Amizade Animal', 'Bom Fruto', 'Criar ou Destruir Água', 'Curar Ferimentos', 'Detectar Magia', 'Detectar Veneno e Doença', 'Emaranhar', 'Enfeitiçar Pessoa', 'Faca de Gelo', 'Falar com Animais', 'Fogo das Fadas', 'Névoa Obscurecente', 'Onda Trovejante', 'Palavra Curativa', 'Passos Largos', 'Proteção Contra o Bem e o Mal', 'Purificar Alimentos e Bebidas', 'Salto']
    wizard = ['Amigos', 'Badalar Fúnebre', 'Bolha Ácida', 'Elementalismo', 'Golpe Certeiro', 'Ilusão Menor', 'Luz', 'Luzes Dançantes', 'Mãos Mágicas', 'Mensagem', 'Prestidigitação Arcana', 'Proteção Contra Lâminas', 'Raio de Fogo', 'Raio de Gelo', 'Rajada de Veneno', 'Reparar', 'Talho Mental', 'Toque Chocante', 'Toque Necrótico', 'Trovão', 'Alarme', 'Armadura Arcana', 'Compreender Idiomas', 'Convocar Familiar', 'Detectar Magia', 'Disco Flutuante de Tenser', 'Disfarçar-se', 'Enfeitiçar Pessoa', 'Escrita Ilusória', 'Escudo Arcano', 'Faca de Gelo', 'Gargalhada Nefasta de Tasha', 'Graxa', 'Identificar', 'Imagem Silenciosa', 'Leque Cromático', 'Mãos Flamejantes', 'Mísseis Mágicos', 'Névoa Obscurecente', 'Onda Trovejante', 'Orbe Cromático', 'Passos Largos', 'Proteção Contra o Bem e o Mal', 'Queda Suave', 'Raio de Bruxa', 'Raio Nauseante', 'Retirada Acelerada', 'Salto', 'Servo Invisível', 'Sono', 'Vitalidade Vazia']

    missing_cleric = [n for n in cleric if n.lower().strip() not in all_names]
    missing_druid = [n for n in druid if n.lower().strip() not in all_names]
    missing_wizard = [n for n in wizard if n.lower().strip() not in all_names]

    print("Missing Cleric:", missing_cleric)
    print("Missing Druid:", missing_druid)
    print("Missing Wizard:", missing_wizard)

get_missing()
