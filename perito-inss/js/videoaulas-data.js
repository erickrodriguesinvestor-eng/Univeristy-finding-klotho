/* ============================================================
   VIDEOAULAS — currículo por módulo, com curadoria 80/20
   Cada aula aponta para uma busca otimizada no YouTube
   (links de busca não quebram como links de vídeos avulsos).
   alta: true  → tópico de alta incidência na Cebraspe (80/20)
   ============================================================ */

const MODULOS_VIDEO = [

  /* =============== BLOCO I — CONHECIMENTOS BÁSICOS =============== */
  {
    id: 'portugues',
    titulo: 'Língua Portuguesa',
    bloco: 1,
    icone: '📖',
    peso8020: 'Na Cebraspe, interpretação de texto + reescrita respondem pela maioria dos itens. Gramática pura cai menos do que parece.',
    aulas: [
      { t: 'Interpretação e compreensão de textos no estilo Cebraspe', busca: 'interpretação de texto cebraspe certo errado aula', alta: true,
        dica: 'A banca troca uma palavra do texto e pergunta se "preserva o sentido". Desconfie de generalizações (sempre, somente, qualquer).' },
      { t: 'Reescrita de frases e equivalência de sentido', busca: 'reescritura de frases cebraspe correção gramatical aula', alta: true,
        dica: 'Julgue duas coisas separadas: correção gramatical E manutenção do sentido. Basta uma falhar para o item estar errado.' },
      { t: 'Mecanismos de coesão textual (pronomes, conectivos, referência)', busca: 'coesão textual referenciação cebraspe aula', alta: true,
        dica: 'Itens clássicos: "o pronome X retoma o termo Y". Volte ao texto e teste a substituição.' },
      { t: 'Sintaxe da oração e do período: coordenação e subordinação', busca: 'sintaxe do período coordenação subordinação cebraspe aula', alta: false },
      { t: 'Concordância nominal e verbal', busca: 'concordância verbal e nominal cebraspe aula', alta: true,
        dica: 'Decore os impessoais: haver (existir) e fazer (tempo) não vão ao plural.' },
      { t: 'Pontuação: vírgula e dois-pontos', busca: 'pontuação vírgula cebraspe aula concurso', alta: true,
        dica: 'Vírgula entre sujeito e verbo = sempre errado. Vírgula antes de "e" com sujeitos diferentes = correta.' },
      { t: 'Regência e crase', busca: 'regência verbal e crase cebraspe aula', alta: false }
    ]
  },

  {
    id: 'constitucional',
    titulo: 'Direito Constitucional',
    bloco: 1,
    icone: '⚖️',
    peso8020: 'Foco quase total em Seguridade Social (arts. 194 a 204) e Administração Pública (arts. 37 a 41). Direitos fundamentais caem de forma pontual.',
    aulas: [
      { t: 'Seguridade Social na CF: arts. 194 a 204 (saúde, previdência, assistência)', busca: 'seguridade social constituição art 194 aula concurso inss', alta: true,
        dica: 'Tripé: saúde (universal, sem contribuição), previdência (contributiva, filiação obrigatória), assistência (a quem necessitar).' },
      { t: 'Administração Pública: arts. 37 a 41 (acesso, acumulação, estabilidade)', busca: 'artigo 37 a 41 constituição administração pública aula cebraspe', alta: true,
        dica: 'Estabilidade = 3 anos. Acumulação permitida: dois cargos de saúde com profissões regulamentadas.' },
      { t: 'Direitos e garantias fundamentais (art. 5º) — visão de prova', busca: 'direitos e garantias fundamentais art 5 cebraspe aula', alta: false },
      { t: 'Direitos sociais (art. 6º) e princípios da seguridade', busca: 'direitos sociais art 6 princípios seguridade social aula', alta: false },
      { t: 'Competências legislativas: privativa × concorrente (seguridade × previdência)', busca: 'competência legislativa privativa concorrente união aula cebraspe', alta: false,
        dica: 'Pegadinha recorrente: seguridade social = privativa da União; previdência social = concorrente.' }
    ]
  },

  {
    id: 'administrativo',
    titulo: 'Direito Administrativo',
    bloco: 1,
    icone: '🏛️',
    peso8020: 'Atos administrativos + princípios (LIMPE) + poderes concentram a maior parte dos itens. Organização administrativa cai para classificar o INSS (autarquia).',
    aulas: [
      { t: 'Atos administrativos: requisitos, atributos, anulação × revogação', busca: 'atos administrativos atributos anulação revogação cebraspe aula', alta: true,
        dica: 'Súmula 473/STF: anula o ilegal (ex tunc), revoga por mérito (ex nunc). Autoexecutoriedade NÃO está em todo ato.' },
      { t: 'Princípios da Administração Pública (LIMPE e implícitos)', busca: 'princípios da administração pública LIMPE aula cebraspe', alta: true },
      { t: 'Poderes administrativos: hierárquico, disciplinar, regulamentar e de polícia', busca: 'poderes administrativos poder de polícia aula cebraspe', alta: true,
        dica: 'Poder de polícia: discricionariedade + autoexecutoriedade + coercibilidade.' },
      { t: 'Organização administrativa: direta, indireta, autarquias (o INSS)', busca: 'organização administrativa autarquias administração indireta aula', alta: false,
        dica: 'INSS = autarquia federal = direito PÚBLICO. Item dizendo "direito privado" está errado.' },
      { t: 'Responsabilidade civil do Estado (art. 37, § 6º)', busca: 'responsabilidade civil do estado risco administrativo aula cebraspe', alta: false },
      { t: 'Improbidade administrativa após a Lei 14.230/2021', busca: 'improbidade administrativa lei 14230 alterações aula', alta: false,
        dica: 'Depois de 2021: TODAS as modalidades exigem dolo. Improbidade culposa acabou.' }
    ]
  },

  {
    id: 'etica-servico',
    titulo: 'Ética no Serviço Público e Lei 8.112/1990',
    bloco: 1,
    icone: '📜',
    peso8020: 'Regime disciplinar da Lei 8.112 (penalidades + prazos de prescrição) e o Decreto 1.171 são os campeões de incidência.',
    aulas: [
      { t: 'Lei 8.112/90: provimento, posse (30 dias), exercício e estágio probatório', busca: 'lei 8112 provimento posse exercício aula cebraspe', alta: true,
        dica: 'Posse em 30 dias do ato de provimento; exercício em 15 dias da posse. Estágio probatório: 3 anos (jurisprudência).' },
      { t: 'Formas de provimento e vacância: reversão × reintegração × recondução', busca: 'lei 8112 reversão reintegração recondução aproveitamento aula', alta: true,
        dica: 'REversão = volta do aposentado. REIntegração = demissão invalidada. REcondução = volta ao cargo anterior.' },
      { t: 'Regime disciplinar: deveres, proibições e penalidades', busca: 'lei 8112 regime disciplinar penalidades demissão aula cebraspe', alta: true,
        dica: 'Prescrição: 5 anos (demissão/cassação), 2 anos (suspensão), 180 dias (advertência).' },
      { t: 'Decreto 1.171/94: Código de Ética do Servidor', busca: 'decreto 1171 código de ética servidor público aula cebraspe', alta: true,
        dica: 'Deixar usuário esperando = "grave dano moral aos usuários", não simples falta de educação.' },
      { t: 'Processo Administrativo Disciplinar (PAD) e sindicância', busca: 'processo administrativo disciplinar PAD lei 8112 aula', alta: false }
    ]
  },

  {
    id: 'informatica',
    titulo: 'Noções de Informática',
    bloco: 1,
    icone: '💻',
    peso8020: 'Segurança da informação é o tema favorito da Cebraspe; depois, redes/internet e ferramentas de escritório.',
    aulas: [
      { t: 'Segurança da informação: malwares, phishing, criptografia, backup', busca: 'segurança da informação cebraspe malware phishing aula', alta: true,
        dica: 'Diferencie vírus (precisa de hospedeiro) × worm (autônomo) × trojan (disfarçado) × ransomware (sequestra dados).' },
      { t: 'Internet e redes: navegadores, e-mail, protocolos (HTTP, HTTPS, DNS)', busca: 'redes internet protocolos cebraspe aula concurso', alta: false },
      { t: 'Computação em nuvem e armazenamento', busca: 'computação em nuvem cebraspe aula concurso', alta: false },
      { t: 'Editores de texto e planilhas (Word/Excel/LibreOffice)', busca: 'excel cebraspe questões aula concurso', alta: false },
      { t: 'Sistemas operacionais Windows e Linux — o que a banca cobra', busca: 'windows linux cebraspe aula concurso', alta: false }
    ]
  },

  /* =============== BLOCO II — CONHECIMENTOS ESPECÍFICOS =============== */
  {
    id: 'prev-beneficios',
    titulo: 'Legislação Previdenciária I — Benefícios (Lei 8.213/91)',
    bloco: 2,
    icone: '🧾',
    peso8020: 'O coração da prova. Benefícios por incapacidade + qualidade de segurado + carência + NTEP/CAT respondem, sozinhos, por enorme fatia dos itens específicos.',
    aulas: [
      { t: 'Segurados obrigatórios e facultativos; qualidade de segurado e período de graça', busca: 'segurados obrigatórios qualidade de segurado período de graça lei 8213 aula', alta: true,
        dica: 'Período de graça: 12 meses (+12 se >120 contribuições, +12 se desemprego comprovado).' },
      { t: 'Carência: regras e dispensas (art. 25 e 26 da Lei 8.213)', busca: 'carência benefícios previdenciários art 25 26 lei 8213 aula', alta: true,
        dica: 'Incapacidade: 12 contribuições. Dispensa: acidente de qualquer natureza, doença do trabalho e doenças da lista.' },
      { t: 'Auxílio por incapacidade temporária (auxílio-doença): requisitos, DCB, prorrogação', busca: 'auxílio por incapacidade temporária auxílio doença lei 8213 aula perito', alta: true,
        dica: 'Empregado: empresa paga os 15 primeiros dias. Doença preexistente só dá benefício se houver agravamento.' },
      { t: 'Aposentadoria por incapacidade permanente e adicional de 25%', busca: 'aposentadoria por incapacidade permanente invalidez grande invalidez 25% aula', alta: true,
        dica: 'Única hipótese que pode ultrapassar o teto: +25% da grande invalidez (Anexo I do Dec. 3.048).' },
      { t: 'Auxílio-acidente: natureza indenizatória e acumulações', busca: 'auxílio-acidente lei 8213 natureza indenizatória aula', alta: true,
        dica: 'Acumula com salário, NÃO acumula com aposentadoria.' },
      { t: 'Acidente do trabalho, CAT, NTEP e estabilidade acidentária', busca: 'acidente de trabalho CAT NTEP nexo técnico epidemiológico aula perito médico', alta: true,
        dica: 'NTEP: CNAE × CID presume o nexo, sem CAT. Trajeto = acidente de trabalho (MP 905 caducou). Estabilidade: 12 meses.' },
      { t: 'Salário de benefício e cálculo após a EC 103/2019', busca: 'salário de benefício cálculo EC 103 reforma da previdência aula', alta: false },
      { t: 'Reabilitação profissional (arts. 89 a 93)', busca: 'reabilitação profissional INSS lei 8213 aula', alta: false }
    ]
  },

  {
    id: 'prev-custeio',
    titulo: 'Legislação Previdenciária II — Custeio e Regulamento',
    bloco: 2,
    icone: '🏦',
    peso8020: 'Cai menos que benefícios, mas o Decreto 3.048/99 é fonte direta de itens literais sobre perícia.',
    aulas: [
      { t: 'Lei 8.212/91: organização e custeio da seguridade', busca: 'lei 8212 custeio seguridade social aula concurso', alta: false },
      { t: 'Decreto 3.048/99: Regulamento da Previdência — pontos de perícia', busca: 'decreto 3048 regulamento previdência social perícia médica aula', alta: true,
        dica: 'Anexo I (grande invalidez) e os dispositivos sobre exames médicos periódicos são presença constante.' },
      { t: 'EC 103/2019: o que mudou nos benefícios por incapacidade', busca: 'EC 103 reforma da previdência benefícios incapacidade mudanças aula', alta: false },
      { t: 'Lei 13.846/2019: pente-fino, revisões e a Perícia Médica Federal', busca: 'lei 13846 perícia médica federal revisão benefícios aula', alta: true,
        dica: 'Criou a carreira de Perito Médico Federal e o programa de revisão de benefícios por incapacidade.' }
    ]
  },

  {
    id: 'pericia',
    titulo: 'Perícia Médica e Medicina Legal',
    bloco: 2,
    icone: '🔬',
    peso8020: 'Conceitos de incapacidade (temporária × permanente, total × parcial, uni × omniprofissional), DID/DII/DCB e simulação são o filé da prova específica.',
    aulas: [
      { t: 'Conceitos: doença × deficiência × incapacidade × invalidez', busca: 'conceito incapacidade laborativa invalidez deficiência perícia médica aula', alta: true,
        dica: 'Doença ≠ incapacidade. Invalidez = total + permanente + omniprofissional + insuscetível de reabilitação.' },
      { t: 'Classificação da incapacidade: temporária/permanente, total/parcial, uni/multi/omniprofissional', busca: 'classificação incapacidade laborativa temporária permanente total parcial aula perícia', alta: true },
      { t: 'DID, DII, DER e DCB: fixação de datas na perícia previdenciária', busca: 'DID DII DCB perícia médica previdenciária aula', alta: true,
        dica: 'DID ≠ DII (a doença pode preceder a incapacidade em anos) — chave para julgar preexistência.' },
      { t: 'Nexo causal e concausa: técnico-profissional, individual e epidemiológico (NTEP)', busca: 'nexo causal técnico epidemiológico concausa perícia médica aula', alta: true },
      { t: 'Simulação, metassimulação, dissimulação e transtorno factício', busca: 'simulação dissimulação metassimulação perícia médica aula', alta: true,
        dica: 'Simulação: sintomas falsos + incentivo externo. Factício: sem incentivo externo. Dissimulação: esconde a doença.' },
      { t: 'CIF e avaliação biopsicossocial da deficiência (BPC, LC 142)', busca: 'CIF classificação internacional funcionalidade avaliação deficiência aula', alta: true },
      { t: 'Profissiografia e análise da atividade laboral', busca: 'profissiografia análise atividade perícia médica aula', alta: false },
      { t: 'Documentos médico-legais: laudo, parecer, atestado, relatório', busca: 'documentos médico legais laudo parecer atestado aula medicina legal', alta: false }
    ]
  },

  {
    id: 'med-trabalho',
    titulo: 'Medicina do Trabalho e Saúde Ocupacional',
    bloco: 2,
    icone: '🏭',
    peso8020: 'Área mais importante dos específicos junto com perícia: NR-7/NR-9, LER/DORT, PAIR, pneumoconioses e transtornos mentais do trabalho.',
    aulas: [
      { t: 'NR-7 (PCMSO) e exames ocupacionais: admissional, periódico, retorno, mudança, demissional', busca: 'NR-7 PCMSO exames ocupacionais ASO aula medicina do trabalho', alta: true },
      { t: 'NR-9 / PGR e avaliação de riscos ambientais', busca: 'NR-9 PGR riscos ambientais aula medicina do trabalho', alta: true },
      { t: 'LER/DORT: quadro clínico, nexo e avaliação pericial', busca: 'LER DORT diagnóstico nexo ocupacional aula perícia', alta: true,
        dica: 'Etiologia multifatorial: a banca adora item dizendo que é "exclusivamente ocupacional" (errado).' },
      { t: 'PAIR — perda auditiva induzida por ruído', busca: 'PAIR perda auditiva induzida por ruído audiometria aula', alta: true,
        dica: 'Neurossensorial, bilateral, simétrica, irreversível, entalhe em 3–6 kHz, não progride após cessar exposição.' },
      { t: 'Pneumoconioses: silicose, asbestose e mesotelioma', busca: 'pneumoconioses silicose asbestose aula medicina do trabalho', alta: true,
        dica: 'Mesotelioma → asbesto (não tabagismo). Silicose → ↑risco de tuberculose.' },
      { t: 'Intoxicações ocupacionais: chumbo (saturnismo), mercúrio, benzeno', busca: 'intoxicações ocupacionais chumbo saturnismo benzeno aula', alta: true,
        dica: 'Saturnismo = chumbo (linha de Burton, cólica). Hidrargirismo = mercúrio (tremor, eretismo). Benzeno = aplasia/leucemia.' },
      { t: 'Transtornos mentais relacionados ao trabalho e burnout (CID-11)', busca: 'transtornos mentais relacionados ao trabalho burnout CID-11 aula', alta: true },
      { t: 'Acidente de trabalho: conceito, equiparações e trajeto', busca: 'acidente de trabalho equiparações trajeto lei 8213 aula', alta: false },
      { t: 'Ergonomia e NR-17', busca: 'NR-17 ergonomia aula medicina do trabalho concurso', alta: false }
    ]
  },

  {
    id: 'clinica',
    titulo: 'Medicina Geral e Clínica Médica',
    bloco: 2,
    icone: '🩺',
    peso8020: 'A banca cobra as grandes síndromes de alta prevalência sob a ótica da limitação funcional: cardio, diabetes, DPOC, AVC, DRC, TB.',
    aulas: [
      { t: 'Hipertensão e diabetes: diagnóstico, alvos e complicações incapacitantes', busca: 'hipertensão diabetes diagnóstico diretrizes aula revisão concurso médico', alta: true,
        dica: 'HAS ≥ 140x90 em 2 ocasiões; DM: HbA1c ≥ 6,5%, jejum ≥ 126, TOTG ≥ 200.' },
      { t: 'Síndromes coronarianas e insuficiência cardíaca (classificação por FE)', busca: 'síndrome coronariana aguda insuficiência cardíaca fração de ejeção aula revisão', alta: true,
        dica: 'ICFEr < 40% · levemente reduzida 40–49% · preservada ≥ 50%. IAMCSST: reperfusão até 12h.' },
      { t: 'DPOC e asma: espirometria e graduação funcional', busca: 'DPOC espirometria GOLD aula revisão concurso médico', alta: true,
        dica: 'VEF1/CVF pós-BD < 0,7 confirma DPOC. O VEF1 gradua e dialoga com capacidade laboral.' },
      { t: 'AVC: janelas terapêuticas e sequelas (avaliação funcional)', busca: 'AVC isquêmico trombólise janela sequelas aula revisão', alta: false },
      { t: 'Doença renal crônica e diálise', busca: 'doença renal crônica KDIGO estágios aula revisão', alta: false },
      { t: 'Tuberculose e hanseníase: tratamento e repercussão laboral', busca: 'tuberculose hanseníase tratamento esquema aula revisão concurso', alta: true,
        dica: 'TB: RIPE 2RHZE/4RH. Hanseníase: incapacidades graduadas (grau 0, 1, 2) — tema querido em perícia.' },
      { t: 'Epidemiologia e vigilância em saúde: indicadores e conceitos básicos', busca: 'epidemiologia conceitos básicos vigilância indicadores aula concurso', alta: true,
        dica: 'Incidência × prevalência; sensibilidade × especificidade; VPP/VPN — caem em itens diretos.' },
      { t: 'Sequelas pós-agudas de infecções graves (síndromes respiratórias e neurológicas)', busca: 'sequelas pós covid síndromes pós infecciosas avaliação funcional aula', alta: false },
      { t: 'Neoplasias: estadiamento e incapacidade', busca: 'oncologia estadiamento performance status ECOG aula', alta: false,
        dica: 'Neoplasia maligna dispensa carência (lista ministerial). Performance status orienta a avaliação funcional.' }
    ]
  },

  {
    id: 'ortopedia',
    titulo: 'Ortopedia e Reumatologia Pericial — extra 80/20',
    bloco: 2,
    icone: '🦴',
    peso8020: 'Doenças osteomusculares são a 1ª causa de auxílio-doença no Brasil — por isso a banca sempre reserva itens para coluna, ombro e punho.',
    aulas: [
      { t: 'Lombalgia e hérnia discal: semiologia (Lasègue) e conduta', busca: 'lombalgia hérnia de disco lasègue semiologia aula revisão', alta: true,
        dica: 'L4-L5 e L5-S1 = 90% das hérnias. Repouso prolongado no leito = conduta errada.' },
      { t: 'Ombro doloroso e manguito rotador (Jobe, Neer)', busca: 'manguito rotador supraespinhal testes jobe neer aula', alta: true,
        dica: 'Tendão mais lesado: supraespinal.' },
      { t: 'Síndrome do túnel do carpo e neuropatias compressivas', busca: 'síndrome do túnel do carpo nervo mediano phalen tinel aula', alta: true,
        dica: 'Nervo MEDIANO (não ulnar). Phalen e Tinel positivos.' },
      { t: 'Epicondilites e tendinopatias ocupacionais', busca: 'epicondilite lateral medial tendinopatias aula revisão', alta: false },
      { t: 'Osteoporose e fraturas por fragilidade', busca: 'osteoporose fratura colo do fêmur fragilidade aula revisão', alta: false },
      { t: 'Artrite reumatoide e espondiloartrites: impacto funcional', busca: 'artrite reumatoide critérios diagnóstico aula revisão concurso', alta: false }
    ]
  },

  {
    id: 'psiquiatria',
    titulo: 'Psiquiatria Pericial — extra 80/20',
    bloco: 2,
    icone: '🧠',
    peso8020: 'Transtornos mentais estão no top 3 de causas de afastamento. Depressão, bipolar, TEPT e dependência química são presença certa.',
    aulas: [
      { t: 'Depressão maior: critérios DSM-5 e avaliação de incapacidade', busca: 'episódio depressivo maior critérios DSM-5 aula psiquiatria', alta: true,
        dica: '≥5 sintomas, ≥2 semanas, com humor deprimido OU anedonia obrigatórios.' },
      { t: 'Transtorno bipolar: tipo I × tipo II', busca: 'transtorno bipolar tipo 1 tipo 2 mania hipomania aula', alta: true,
        dica: 'Tipo II = hipomania + depressão (SEM mania franca).' },
      { t: 'Esquizofrenia: sintomas positivos × negativos e funcionalidade', busca: 'esquizofrenia sintomas positivos negativos aula psiquiatria', alta: false },
      { t: 'TEPT e transtornos de ansiedade', busca: 'transtorno estresse pós traumático TEPT critérios aula', alta: true },
      { t: 'Dependência química e síndrome de abstinência (delirium tremens)', busca: 'síndrome abstinência alcoólica delirium tremens aula', alta: true,
        dica: 'Delirium tremens = ABSTINÊNCIA (48–96h), não intoxicação aguda.' },
      { t: 'Avaliação do risco de suicídio', busca: 'avaliação risco de suicídio entrevista aula psiquiatria', alta: false,
        dica: 'Perguntar sobre ideação NÃO induz o ato — investigação ativa é mandatória.' },
      { t: 'Simulação em psiquiatria forense e testes de validação de sintomas', busca: 'simulação psiquiatria forense avaliação aula', alta: false }
    ]
  },

  {
    id: 'etica-medica',
    titulo: 'Ética Médica, Bioética e Teleperícia',
    bloco: 2,
    icone: '🤝',
    peso8020: 'O CEM aplicado ao perito: sigilo, impedimentos (não periciar paciente próprio) e as resoluções do CFM sobre perícia e telemedicina.',
    aulas: [
      { t: 'Código de Ética Médica: capítulos relevantes ao perito (sigilo, perícia, documentos)', busca: 'código de ética médica perícia sigilo aula concurso', alta: true,
        dica: 'Art. 93: vedado ser perito de paciente seu, familiar ou pessoa próxima. Laudo só revela o necessário ao objeto.' },
      { t: 'Resoluções CFM sobre perícia médica e autonomia do perito', busca: 'resolução CFM perícia médica autonomia perito aula', alta: true,
        dica: 'Atestado do assistente NÃO vincula o perito; divergir não é infração ética.' },
      { t: 'Telemedicina e teleperícia: marcos regulatórios vigentes', busca: 'telemedicina teleperícia regulamentação CFM lei aula', alta: true },
      { t: 'Responsabilidade civil e penal do médico', busca: 'responsabilidade civil penal do médico aula concurso', alta: false },
      { t: 'Bioética: princípios (autonomia, beneficência, não maleficência, justiça)', busca: 'bioética princípios autonomia beneficência aula concurso', alta: false }
    ]
  },

  {
    id: 'sus-loas',
    titulo: 'SUS e Assistência Social (LOAS/BPC)',
    bloco: 2,
    icone: '🏥',
    peso8020: 'Lei 8.080 (princípios e diretrizes do SUS) e os critérios do BPC — que o perito federal avalia na prática — caem de forma literal.',
    aulas: [
      { t: 'Lei 8.080/90: princípios e diretrizes do SUS (universalidade, integralidade, equidade)', busca: 'lei 8080 princípios diretrizes SUS aula cebraspe', alta: true,
        dica: 'Princípios doutrinários (universalidade, integralidade, equidade) × organizativos (descentralização, regionalização, participação).' },
      { t: 'Lei 8.142/90: participação social e financiamento', busca: 'lei 8142 controle social conselhos conferências SUS aula', alta: false },
      { t: 'LOAS (Lei 8.742/93) e BPC: requisitos e avaliação da deficiência', busca: 'BPC LOAS benefício prestação continuada critérios avaliação aula', alta: true,
        dica: 'Sem carência e sem contribuição: deficiência (impedimento ≥ 2 anos, avaliação biopsicossocial) ou 65+ anos, renda per capita < 1/4 SM.' },
      { t: 'Estatuto da Pessoa com Deficiência (Lei 13.146/2015) e LC 142/2013', busca: 'estatuto pessoa com deficiência lei 13146 LC 142 aposentadoria aula', alta: false },
      { t: 'Vigilância em saúde do trabalhador no SUS (RENAST, notificações)', busca: 'saúde do trabalhador SUS RENAST notificação compulsória aula', alta: false }
    ]
  }
];

window.MODULOS_VIDEO = MODULOS_VIDEO;
