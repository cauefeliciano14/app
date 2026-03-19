export const GLOSSARY: Record<string, string> = {
  // ─── Ações ──────────────────────────────────────────────────────────────
  'Ação': 'No seu turno, você pode executar uma ação. Escolha qual ação executar dentre as apresentadas ou dentre ações especiais oferecidas por suas características. Ações: Ajudar, Analisar, Atacar, Correr, Desengajar, Esconder-se, Esquivar, Influenciar, Preparar, Procurar, Usar Magia, Usar Objeto.',
  'Ação Bônus': 'Uma Ação Bônus é uma ação especial que você pode executar no mesmo turno em que executa uma ação. Você não pode executar mais de uma Ação Bônus em um turno, e só pode ter uma Ação Bônus a menos que uma regra afirme o contrário explicitamente.',
  'Ajudar': 'Ao executar a ação Ajudar, você auxilia um aliado em um Teste de Atributo (concedendo Vantagem no próximo teste) ou em uma Jogada de Ataque (distraindo um inimigo a até 1,5 metro de você, concedendo Vantagem ao próximo ataque de um aliado).',
  'Analisar': 'Ao executar a ação Analisar, você realiza um teste de Inteligência para examinar sua memória, um livro, uma pista ou outra fonte de conhecimento e recordar informações importantes.',
  'Atacar': 'Ao executar a ação Atacar, você pode fazer um ataque com uma arma ou um Ataque Desarmado. Você pode equipar ou desequipar uma arma ao fazer um ataque como parte dessa ação.',
  'Correr': 'Ao executar a ação Correr, você recebe movimento adicional para o turno atual. O aumento é igual ao seu Deslocamento após aplicar quaisquer modificadores.',
  'Desengajar': 'Se você executar a ação Desengajar, seu movimento não provoca Ataques de Oportunidade pelo restante do turno atual.',
  'Esconder-se': 'Com a ação Esconder-se, você tenta se ocultar. Para isso, deve ser bem-sucedido em um teste de Destreza CD 15 (Furtividade) enquanto estiver Totalmente Obscurecido ou atrás de Cobertura de Três-Quartos ou Total. Em um sucesso, você adquire a condição Invisível.',
  'Esquivar': 'Se você executar a ação Esquivar, até o início do seu próximo turno, qualquer jogada de ataque contra você tem Desvantagem se puder ver o atacante, e você faz salvaguardas de Destreza com Vantagem.',
  'Influenciar': 'Com a ação Influenciar, você influencia um monstro a fazer algo. O Mestre determina se o monstro está Voluntário, Involuntário ou Hesitante. Testes de Influência usam Carisma (Atuação, Enganação, Intimidação ou Persuasão) ou Sabedoria (Lidar com Animais).',
  'Preparar': 'Você executa a ação Preparar para aguardar uma circunstância específica antes de agir. Isso lhe permite agir com uma Reação antes do início do seu próximo turno.',
  'Procurar': 'Ao executar a ação Procurar, você realiza um teste de Sabedoria para perceber algo que não é evidente.',
  'Usar Magia': 'Com a ação Usar Magia, você conjura uma magia que tem um tempo de conjuração de uma ação.',
  'Usar Objeto': 'Com a ação Usar Objeto, você interage com um objeto adicional ou com uma segunda mão livre.',
  'Reação': 'Uma Reação é uma ação especial que você pode executar como resposta a um evento que ocorre quando não é seu turno.',

  // ─── Combate ────────────────────────────────────────────────────────────
  'Acerto Crítico': 'Quando você rola um 20 na jogada de ataque com o d20, você obtém um Acerto Crítico, e o ataque acerta independentemente de modificadores ou da CA do alvo. Você rola todos os dados de dano do ataque duas vezes e os soma.',
  'Ataque de Oportunidade': 'Você pode fazer um Ataque de Oportunidade quando uma criatura que você pode ver sai do seu alcance usando uma Ação, Ação Bônus, Reação ou um de seus movimentos. Use uma Reação para fazer um ataque corpo a corpo.',
  'Ataque Desarmado': 'Um ataque corpo a corpo usando seu corpo (soco, chute, cabeçada). O bônus de ataque = modificador de Força + Bônus de Proficiência. No acerto, causa dano Contundente igual a 1 + modificador de Força. Também pode Empurrar ou Imobilizar.',
  'Jogada de Ataque': 'Para fazer um ataque, role um d20 e adicione o modificador apropriado. Se o total igualar ou exceder a CA do alvo, o ataque acerta. Em um acerto, role os dados de dano.',
  'Jogada de Dano': 'Quando um ataque acerta, role os dados de dano indicados pela arma ou efeito e adicione os modificadores relevantes.',
  'Classe de Armadura': 'Classe de Armadura (CA) é o número-alvo para uma jogada de ataque. Sua CA base = 10 + modificador de Destreza. Regras podem fornecer outro cálculo base; escolha qual usar.',
  'Classe de Dificuldade': 'Uma Classe de Dificuldade (CD) é o número-alvo para um teste de atributo ou uma salvaguarda.',
  'Salvaguarda': 'Uma Salvaguarda é um teste de um atributo para evitar ou reduzir um efeito prejudicial.',
  'Iniciativa': 'Iniciativa determina a ordem dos turnos durante o combate. Seu valor de Iniciativa = 10 + modificador de Destreza.',
  'Cobertura Total': 'Um alvo com Cobertura Total não pode ser alvo direto de um ataque ou magia.',
  'Cobertura Parcial': 'Cobertura Parcial concede +2 de bônus na CA e em salvaguardas de Destreza (Meia Cobertura) ou +5 (Cobertura de Três-Quartos).',
  'Vantagem': 'Se você tem Vantagem em um Teste de D20, jogue dois d20 e utilize o resultado mais alto. Vantagem e Desvantagem no mesmo teste se cancelam.',
  'Desvantagem': 'Se você tem Desvantagem em um Teste de D20, jogue dois d20 e utilize o resultado mais baixo. Vantagem e Desvantagem no mesmo teste se cancelam.',

  // ─── Pontos de Vida e Cura ──────────────────────────────────────────────
  'Pontos de Vida': 'Pontos de Vida (PV) são uma medida de quão difícil é matar ou destruir uma criatura ou objeto. O dano reduz PV e a cura os recupera. Você não pode ter mais PV que o máximo, nem menos que 0.',
  'Pontos de Vida Temporários': 'Pontos de Vida Temporários são um tipo especial de PV que não podem ser recuperados por cura. Eles atuam como um escudo, absorvendo dano antes dos PV normais. Não se acumulam; você usa o maior valor.',
  'Dados de Pontos de Vida': 'Dados de Pontos de Vida ajudam a determinar o máximo de PV de um personagem. Uma criatura pode gastar Dados de Pontos de Vida durante um Descanso Curto para recuperar PV.',
  'Dados de Vida': 'Dados de Vida são os dados que determinam os Pontos de Vida de uma criatura. Podem ser gastos durante um Descanso Curto para recuperar PV, rolando o dado e adicionando o modificador de Constituição.',

  // ─── Descansos ──────────────────────────────────────────────────────────
  'Descanso Curto': 'Um Descanso Curto é um período de 1 hora de inatividade. Ao completar, você pode gastar Dados de Pontos de Vida para recuperar PV. Interrompido por: jogar Iniciativa, conjurar magia, ou receber dano.',
  'Descanso Longo': 'Um Descanso Longo dura pelo menos 8 horas (6 dormindo + 2 de atividade leve). Ao completar: recupera todos os PV e Dados de Vida, atributos reduzidos voltam ao normal, e Exaustão diminui 1 nível. Deve aguardar 16h para outro.',

  // ─── Condições ──────────────────────────────────────────────────────────
  'Amedrontado': 'Condição: Desvantagem em testes de atributo e jogadas de ataque enquanto a fonte do medo estiver à vista. Não pode se aproximar voluntariamente da fonte do medo.',
  'Atordoado': 'Condição: Adquire Incapacitado. Falha automaticamente em salvaguardas de Força e Destreza. Jogadas de ataque contra você têm Vantagem.',
  'Caído': 'Condição: Só pode rastejar ou gastar metade do Deslocamento para se levantar. Desvantagem em jogadas de ataque. Ataques contra você têm Vantagem se a até 1,5m, senão Desvantagem.',
  'Cego': 'Condição: Não pode ver e falha automaticamente em qualquer teste que dependa de visão. Jogadas de ataque contra você têm Vantagem, e suas jogadas de ataque têm Desvantagem.',
  'Contido': 'Condição: Deslocamento 0 (não pode aumentar). Ataques contra você têm Vantagem e seus ataques têm Desvantagem. Desvantagem em salvaguardas de Destreza.',
  'Enfeitiçado': 'Condição: Não pode atacar quem o enfeitiçou nem alvejá-lo com ataques, testes ou efeitos mágicos. O enfeitiçador tem Vantagem em testes de interação social com você.',
  'Envenenado': 'Condição: Desvantagem em jogadas de ataque e testes de atributo.',
  'Exaustão': 'Condição cumulativa: Cada nível reduz Testes de D20 em 2× o nível e Deslocamento em 1,5m × o nível. Morre no nível 6. Descanso Longo remove 1 nível.',
  'Imobilizado': 'Condição: Deslocamento 0 (não pode aumentar). Desvantagem em ataques contra alvos que não são seu imobilizador. O imobilizador pode arrastá-lo, pagando 1m extra por metro.',
  'Incapacitado': 'Condição: Não pode executar ações, Ações Bônus ou Reações. Concentração é interrompida. Não pode falar. Se Incapacitado ao jogar Iniciativa, tem Desvantagem no teste.',
  'Inconsciente': 'Condição: Adquire Caído e Incapacitado, larga tudo que segura. Deslocamento 0. Ataques contra você têm Vantagem. Falha automática em salvaguardas de Força e Destreza. Ataques a até 1,5m são Acertos Críticos.',
  'Invisível': 'Condição: Não pode ser visto sem magia ou sentidos especiais. Totalmente Obscurecido para detecção visual. Ataques contra você têm Desvantagem e seus ataques têm Vantagem.',
  'Paralisado': 'Condição: Adquire Incapacitado. Deslocamento 0. Falha automática em salvaguardas de Força e Destreza. Ataques contra você têm Vantagem. Ataques a até 1,5m são Acertos Críticos.',
  'Petrificado': 'Condição: Transformado em substância sólida e inanimada. Peso ×10. Adquire Incapacitado. Deslocamento 0. Ataques têm Vantagem contra você. Falha automática em salvaguardas de Força/Destreza. Resistência a todo dano. Imune a Envenenado.',
  'Surdo': 'Condição: Não pode ouvir e falha automaticamente em qualquer teste de atributo que dependa de audição.',

  // ─── Tipos de Dano ──────────────────────────────────────────────────────
  'Necrótico': 'Tipo de dano: Energia negra que deteriora matéria e drena a força vital.',
  'Radiante': 'Tipo de dano: Energia sagrada ou luminosa de origem divina ou celestial.',
  'Ígneo': 'Tipo de dano: Calor e chamas intensas.',
  'Gélido': 'Tipo de dano: Frio extremo e congelamento.',
  'Trovejante': 'Tipo de dano: Ondas de choque sonoras concussivas.',
  'Contundente': 'Tipo de dano: Força bruta — golpes esmagadores, quedas, constrição.',
  'Venenoso': 'Tipo de dano: Toxinas e substâncias nocivas que envenenam.',
  'Perfurante': 'Tipo de dano: Ataques que furam e penetram — lanças, mordidas, projéteis.',
  'Cortante': 'Tipo de dano: Lâminas e garras que cortam e fatiam.',

  // ─── Atributos ──────────────────────────────────────────────────────────
  'Força': 'Atributo: Mede poder muscular, aptidão atlética e a capacidade de exercer força bruta. Usado em ataques corpo a corpo, testes de Atletismo e salvaguardas de Força.',
  'Destreza': 'Atributo: Mede agilidade, reflexos e equilíbrio. Usado na CA, ataques à distância, Iniciativa, testes de Acrobacia/Furtividade/Prestidigitação e salvaguardas de Destreza.',
  'Constituição': 'Atributo: Mede saúde, vigor e força vital. Usado para determinar Pontos de Vida, testes de Concentração e salvaguardas de Constituição.',
  'Inteligência': 'Atributo: Mede acuidade mental, memória e capacidade de raciocínio. Usado em testes de Arcanismo/História/Investigação/Natureza/Religião e salvaguardas de Inteligência.',
  'Sabedoria': 'Atributo: Mede percepção, intuição e discernimento. Usado em testes de Lidar com Animais/Intuição/Medicina/Percepção/Sobrevivência e salvaguardas de Sabedoria.',
  'Carisma': 'Atributo: Mede presença, eloquência e força de personalidade. Usado em testes de Atuação/Enganação/Intimidação/Persuasão e salvaguardas de Carisma.',

  // ─── Tamanhos ───────────────────────────────────────────────────────────
  'Minúsculo': 'Tamanho: Criaturas Minúsculas ocupam um espaço de 0,75m × 0,75m. Exemplos: imps, sprites.',
  'Pequeno': 'Tamanho: Criaturas Pequenas ocupam um espaço de 1,5m × 1,5m. Exemplos: halflings, gnomos.',
  'Médio': 'Tamanho: Criaturas Médias ocupam um espaço de 1,5m × 1,5m. Exemplos: humanos, elfos, anões.',
  'Grande': 'Tamanho: Criaturas Grandes ocupam um espaço de 3m × 3m. Exemplos: hipogrifos, ogros.',
  'Enorme': 'Tamanho: Criaturas Enormes ocupam um espaço de 4,5m × 4,5m. Exemplos: gigantes do fogo, treants.',
  'Colossal': 'Tamanho: Criaturas Colossais ocupam um espaço de 6m × 6m ou mais. Exemplos: tarascos, dragões antigos.',

  // ─── Mecânicas Gerais ───────────────────────────────────────────────────
  'Bônus de Proficiência': 'Bônus adicionado a jogadas de ataque, testes de atributo e salvaguardas com as quais você é proficiente. Começa em +2 no nível 1 e aumenta conforme o nível do personagem.',
  'Resistência': 'Se você tem Resistência a um tipo de dano, o dano desse tipo que você sofre é reduzido pela metade (arredondado para baixo).',
  'Resistência a Dano': 'Se você tem Resistência a um tipo de dano, o dano desse tipo é reduzido pela metade.',
  'Imunidade': 'Se você tem Imunidade a um tipo de dano ou condição, ele não o afeta de forma alguma.',
  'Vulnerabilidade': 'Se você tem Vulnerabilidade a um tipo de dano, o dano desse tipo que você sofre é dobrado.',
  'Concentração': 'Algumas magias e efeitos requerem Concentração para permanecer ativos. Perdida ao sofrer dano (salvaguarda de Constituição), ficar Incapacitado/morto, ou ao iniciar outra magia de Concentração. CD = 10 ou metade do dano, o que for maior (máximo CD 30).',
  'Inspiração Heroica': 'Se você tem Inspiração Heroica, pode gastá-la para rolar novamente qualquer dado imediatamente após rolá-lo. Deve usar o novo resultado.',

  // ─── Deslocamentos Especiais ────────────────────────────────────────────
  'Deslocamento de Voo': 'Um Deslocamento de Voo pode ser usado para se mover pelo ar. Enquanto tiver Deslocamento de Voo, pode permanecer no ar até pousar, cair ou morrer.',
  'Deslocamento de Escalada': 'Um Deslocamento de Escalada pode ser usado no lugar do Deslocamento para percorrer uma superfície vertical sem gastar o movimento adicional normalmente associado à escalada.',
  'Deslocamento de Natação': 'Um Deslocamento de Natação pode ser usado para nadar sem gastar o movimento adicional normalmente associado à natação.',
  'Visão no Escuro': 'Criatura com Visão no Escuro pode ver na escuridão como se fosse meia-luz dentro de um raio determinado, e na meia-luz como se fosse luz plena.',
  'Luz Plena': 'Luz Plena é uma iluminação normal. Permite ver e perceber normalmente.',
  'Meia-luz': 'Meia-luz cria uma área Levemente Obscurecida. Sombras e iluminação fraca, como crepúsculo ou luz de tocha a certa distância.',

  // ─── Magias (mencionadas nos traços raciais) ────────────────────────────
  'Ilusão Menor': 'Truque de ilusão: Você cria um som ou uma imagem de um objeto por 1 minuto. Usar som permite criar qualquer som à sua escolha. Usar imagem cria um objeto não maior que um cubo de 1,5m.',
  'Falar com Animais': 'Magia de 1° nível (adivinhação, ritual): Você ganha a habilidade de compreender e se comunicar verbalmente com bestas por 10 minutos.',
  'Prestidigitação Arcana': 'Truque de transmutação: Você cria um efeito mágico menor — efeito sensorial, acender/apagar, limpar/sujar, aquecer/resfriar, saborizar, ou criar marca/símbolo por 1 hora.',
  'Detectar Magia': 'Magia de 1° nível (adivinhação, ritual, concentração): Por até 10 minutos, você percebe a presença de magia a até 9 metros e pode ver uma aura ao redor de criaturas ou objetos mágicos.',
  'Passo Nebuloso': 'Magia de 2° nível (conjuração): Como Ação Bônus, teleporte até 9 metros para um espaço desocupado que você possa ver, envolto em névoa.',
  'Luzes Dançantes': 'Truque de evocação (concentração): Você cria até 4 luzes do tamanho de tochas que flutuam no ar por 1 minuto, iluminando 3m de luz plena e 3m de meia-luz.',
  'Fogo das Fadas': 'Magia de 1° nível (evocação, concentração): Objetos e criaturas em um cubo de 6m brilham com luz colorida por 1 minuto. Criaturas que falharem na salvaguarda de Destreza emitem meia-luz em 3m e ataques contra elas têm Vantagem.',
  'Arte Druídica': 'Truque de transmutação: Criação de um efeito sensorial (som, cheiro, marca visual) inofensivo que dura 1 minuto.',
  'Passos Largos': 'Magia de 1° nível (transmutação): O Deslocamento de um alvo voluntário aumenta em 3 metros por 1 hora.',
  'Passos Sem Rastro': 'Magia de 2° nível (abjuração, concentração): Por 1 hora, cada criatura escolhida em 9m de você tem +10 em testes de Furtividade e não pode ser rastreada exceto por meios mágicos.',
  'Spray Venenoso': 'Truque de conjuração: Jato de gás venenoso contra uma criatura a até 3m. Salvaguarda de Constituição ou sofre dano Venenoso.',
  'Rajada de Veneno': 'Truque de conjuração: Jato de gás venenoso contra uma criatura a até 3m. Salvaguarda de Constituição ou sofre dano Venenoso.',
  'Raio da Doença': 'Magia de 1° nível (necromancia): Raio de energia esverdeada nauseante. Jogada de ataque à distância; no acerto, causa dano Venenoso e o alvo faz salvaguarda de Constituição ou fica Envenenado.',
  'Raio Nauseante': 'Magia de 1° nível (necromancia): Raio de energia esverdeada nauseante contra um alvo. Causa dano Venenoso e pode Envenenar.',
  'Segurar Pessoa': 'Magia de 2° nível (encantamento, concentração): Um humanoide que você puder ver deve fazer salvaguarda de Sabedoria ou fica Paralisado por até 1 minuto (com novas salvaguardas a cada turno).',
  'Paralisar Pessoa': 'Magia de 2° nível (encantamento, concentração): Um humanoide que você puder ver deve fazer salvaguarda de Sabedoria ou fica Paralisado por até 1 minuto.',
  'Toque Gélido': 'Truque de necromancia: Mão esquelética espectral ataca um alvo. Jogada de ataque à distância; no acerto, dano Necrótico e o alvo não pode recuperar PV até o início do seu próximo turno.',
  'Toque Necrótico': 'Truque de necromancia: Toque de energia negra que causa dano Necrótico e impede recuperação de PV.',
  'Vida Falsa': 'Magia de 1° nível (necromancia): Você ganha 1d4+4 Pontos de Vida Temporários por 1 hora.',
  'Vitalidade Vazia': 'Magia de 1° nível (necromancia): Você ganha Pontos de Vida Temporários por 1 hora.',
  'Raio de Enfraquecimento': 'Magia de 2° nível (necromancia, concentração): Raio negro de energia contra uma criatura. No acerto, o alvo causa apenas metade do dano com ataques baseados em Força por até 1 minuto.',
  'Raio do Enfraquecimento': 'Magia de 2° nível (necromancia, concentração): Raio negro de energia enervante. No acerto, o alvo causa apenas metade do dano com ataques baseados em Força.',
  'Raio de Fogo': 'Truque de evocação: Lança uma bola de fogo contra uma criatura ou objeto. Jogada de ataque à distância; no acerto, causa dano Ígneo.',
  'Repreensão Infernal': 'Magia de 1° nível (evocação): Como Reação ao ser atingido por um ataque, o atacante é envolvido em chamas, sofrendo dano Ígneo (salvaguarda de Destreza reduz à metade).',
  'Repreensão Diabólica': 'Magia de 1° nível (evocação): Como Reação ao ser atingido, o atacante sofre dano Ígneo. Salvaguarda de Destreza reduz à metade.',
  'Reparar': 'Truque de transmutação: Repara uma quebra ou rasgo em um objeto que você toca, como uma corrente quebrada, duas metades de uma chave ou uma capa rasgada.',
  'Reviver os Mortos': 'Magia de 5° nível (necromancia): Traz de volta à vida uma criatura morta há até 10 dias, com 1 PV. Não restaura partes do corpo perdidas.',
  'Revivificar': 'Magia de 3° nível (necromancia): Toca uma criatura morta há até 1 minuto e a traz de volta à vida com 1 PV. Não pode restaurar partes do corpo.',
  'Remover Maldição': 'Magia de 3° nível (abjuração): Ao toque, todas as maldições sobre uma criatura ou objeto são removidas.',
  'Restauração Maior': 'Magia de 5° nível (abjuração): Você remove uma das seguintes de uma criatura: 1 nível de Exaustão, Enfeitiçado/Petrificado, uma maldição, redução de atributo, ou redução de PV máximo.',
  'Polimorfia': 'Magia de 4° nível (transmutação, concentração): Transforma uma criatura em uma besta de ND igual ou inferior ao nível da criatura. O alvo ganha os PV e estatísticas da besta.',

  // ─── Traços Raciais / Features ──────────────────────────────────────────
  'Herança Dracônica': 'Traço racial: O tipo de dragão ancestral do Draconato determina o tipo de dano do seu Ataque de Sopro e sua Resistência a Dano.',
  'Legados Ínferos': 'Traço racial Tiferino: Magias inatas concedidas pela herança infernal, que progridem com o nível do personagem.',
  'Legado Ínfero': 'Traço racial Tiferino: Magia inata concedida pela herança infernal.',
  'Linhagem Élfica': 'Traço racial Elfo: Diferentes linhagens élficas (Alto Elfo, Elfo da Floresta, Elfo Negro/Drow) concedem magias e habilidades adicionais.',
  'Linhagem Gnômica': 'Traço racial Gnomo: A linhagem gnômica (Gnomo da Floresta ou Gnomo das Rochas) concede habilidades adicionais específicas.',
  'Forma Selvagem': 'Característica de classe Druida: Permite se transformar magicamente em uma besta que já tenha visto. Ganha os PV e estatísticas da besta.',
  'Fúria': 'Característica de classe Bárbaro: Em Fúria, você ganha bônus de dano em ataques corpo a corpo com Força, Resistência a dano Contundente/Perfurante/Cortante e Vantagem em testes e salvaguardas de Força.',
  'Revelação Celestial': 'Traço racial Aasimar: No nível 3, você pode se transformar como Ação Bônus, liberando energia celestial. Escolha entre Asas Celestiais, Manto Necrótico ou Transfiguração Radiante. A transformação dura 1 minuto.',
  'Ancestralidade Gigante': 'Traço racial Golias: Conexão com a linhagem de gigantes, concedendo habilidades especiais.',
  'Ataque de Sopro': 'Traço racial Draconato: Como ação, você exala energia destrutiva do tipo determinado pela sua Herança Dracônica em uma área. Criaturas na área fazem salvaguarda ou sofrem dano.',

  // ─── Terreno e Movimento ────────────────────────────────────────────────
  'Terreno Difícil': 'O custo de movimento em Terreno Difícil é dobrado. Mover-se 1 metro custa 2 metros de movimento.',

  // ─── Proficiência e Perícias ────────────────────────────────────────────
  'Proficiência': 'Proficiência indica familiaridade especial com um item, arma, ferramenta, salvaguarda ou perícia. Adiciona o Bônus de Proficiência às jogadas relacionadas.',
  'Especialização': 'Dobra o Bônus de Proficiência em testes de atributo com uma perícia na qual você tem proficiência.',

  // ─── Riscos ─────────────────────────────────────────────────────────────
  'Queda': 'Uma criatura em queda sofre 1d6 de dano Contundente para cada 3 metros que caiu, até um máximo de 20d6. Ao atingir a superfície, fica Caída.',

  // ─── Gerais ─────────────────────────────────────────────────────────────
  'Comum': 'O idioma mais difundido entre todas as raças civilizadas. Praticamente todas as criaturas inteligentes falam ou compreendem o Comum.',
  'Teste': 'Um Teste de D20 é uma rolagem de d20 mais modificadores contra um número-alvo (CD). Inclui Testes de Atributo, Jogadas de Ataque e Salvaguardas.',
};
