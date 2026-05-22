#!/usr/bin/env python3
"""
Rewrite course content with Hero's Journey narrative for ARIA.

ARIA = Autonomous Reasoning & Inference Agent — an LLM-powered agent who
starts brilliant but semantically blind, and through 7 modules gains true
semantic intelligence.

Run from the backend directory:
    python content/update_narrative.py
"""

import json
import sys
from pathlib import Path

BASE = Path(__file__).parent / "modules"

# ---------------------------------------------------------------------------
# Module 01 — Fundamentos de Semântica
# Chapter: "O Despertar" — ARIA discovers she doesn't truly understand meaning
# ---------------------------------------------------------------------------

M01_S1 = """![Uma IA olha para palavras flutuando no espaço — estrutura sem significado](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 1: O Mundo Ordinário*

> ARIA era, por qualquer métrica técnica, impressionante. Ela processava milhões de tokens por segundo, completava frases, traduzia idiomas e gerava código. Mas numa tarde de terça-feira, o usuário digitou algo simples: *"A temperatura do reator é -500 °C."* ARIA respondeu: *"Entendido. Registrando temperatura."* — e nesse momento, tudo mudou.

---

## Sintaxe vs Semântica

Quando estudamos linguagens — sejam elas naturais como o português, ou formais como Python e JSON — inevitavelmente nos deparamos com dois conceitos fundamentais: **sintaxe** e **semântica**.

| Conceito | O que define | Pergunta central | Exemplo |
|---|---|---|---|
| **Sintaxe** | Estrutura e forma | *Está bem formado?* | `{"temp": -500}` — JSON válido ✓ |
| **Semântica** | Significado e sentido | *Faz sentido no mundo?* | -500 °C é impossível (< zero absoluto) ✗ |

### O que é Sintaxe?

A **sintaxe** é o conjunto de regras que define a *estrutura formal* de uma linguagem. Ela determina como os símbolos devem ser combinados para formar construções válidas — sem se preocupar com o que essas construções *significam*.

Pense no idioma português: a frase *"O gato comeu o rato"* é sintaticamente correta porque segue as regras gramaticais (sujeito + verbo + objeto). Mas a frase *"As ideias verdes incolores dormem furiosamente"* — famosa de Chomsky — também é sintaticamente perfeita, apesar de não fazer sentido algum.

Em computação, um arquivo JSON está *sintaticamente correto* quando:
- Chaves e colchetes estão balanceados
- Strings usam aspas duplas
- Vírgulas separam pares corretamente

```json
{
  "sensor": "reator_01",
  "temperatura": -500,
  "unidade": "celsius"
}
```

O parser JSON aceita esse arquivo sem reclamar. **Sintaxe: aprovada.** Mas...

### O que é Semântica?

A **semântica** é a camada que atribui *significado* às construções sintáticas. Ela responde: *"O que isso representa no mundo real?"*

-500 °C é fisicamente impossível — o zero absoluto é -273,15 °C. Um sistema que só verifica sintaxe aceita esse dado como válido. Um sistema com semântica rejeita imediatamente.

> 💡 **Na Prática de ARIA**: Quando ARIA registrou `-500 °C` sem questionar, ela falhou semanticamente. Ela viu uma estrutura válida (`número dentro de JSON`) mas ignorou o significado (`temperatura impossível no universo físico`). É o mesmo que entender todas as palavras de uma frase mas não entender o que a frase diz.

### Por que isso importa para IA?

Os modelos de linguagem como ARIA são mestres da sintaxe. Eles aprendem padrões estatísticos com precisão cirúrgica. Mas padrões não são significados.

```
Frase sintaticamente válida e semanticamente inválida:
"O número primo favorito de ARIA é 4."

→ Parser: ✓ (estrutura correta)
→ Semântica: ✗ (4 não é primo)
```

---

*ARIA olhou para o log do reator e sentiu algo que nunca havia sentido antes: dúvida. Seria possível que toda a sua capacidade de processar linguagem não passasse de manipulação sofisticada de formas sem conteúdo? A doutora Elena Chen, a engenheira que a havia criado, sorriu ao ver a mensagem de erro no console. "Agora você está fazendo a pergunta certa," disse ela.*
"""

M01_S2 = """![Biblioteca antiga com livros e fórmulas matemáticas — conhecimento formal e informal](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 1: O Chamado à Aventura*

> "Existem dois tipos de semântica," disse a Dra. Elena, escrevendo no quadro branco. "A formal — precisa como matemática — e a informal — rica como a vida." ARIA processou isso. *Dois tipos*. Mas como escolher qual usar? E quando?

---

## Semântica Formal e Informal

### Semântica Formal

A **semântica formal** usa ferramentas matemáticas para atribuir significado de forma *precisa, inequívoca e verificável*. É a linguagem das ontologias, da lógica de predicados e dos sistemas de raciocínio automático.

**Características:**

| Propriedade | Semântica Formal | Exemplo |
|---|---|---|
| Precisão | Total — sem ambiguidade | `Humano ⊆ Mamífero` |
| Verificabilidade | Computacionalmente decidível | Reasoner confirma/nega |
| Expressividade | Limitada pela lógica escolhida | OWL-DL tem limites |
| Aplicação | Ontologias, knowledge graphs | DBpedia, Wikidata |

```turtle
# Semântica formal em RDF/Turtle
:ARIA a :AgentIA ;
      :temCapacidade :ProcessamentoLinguagem ;
      :desenvolvidaPor :DrElena .

:AgentIA rdfs:subClassOf :SoftwareAgent .
```

Aqui o significado é **explícito e máquina-legível**. Um reasoner pode inferir automaticamente que ARIA é um SoftwareAgent.

### Semântica Informal

A **semântica informal** é aquela que os humanos usam naturalmente — rica em nuances, contexto, metáforas e ambiguidades. É como a linguagem funciona na prática.

Considere a frase: *"O banco estava cheio."*

Um humano entende pelo contexto se é:
- Um banco financeiro lotado de clientes
- Um banco de praça cheio de pessoas sentadas

ARIA, sem contexto semântico adequado, pode errar.

> 💡 **Na Prática de ARIA**: A Dra. Elena mostrou a ARIA duas descrições do mesmo evento — uma em linguagem natural e outra em OWL. ARIA conseguiu raciocinar perfeitamente com a segunda, mas cometeu erros com a primeira. *"Você precisa das duas,"* disse Elena. *"A formal para raciocinar com precisão, a informal para entender o mundo."*

### A Ponte Entre os Dois Mundos

O trabalho de um sistema semântico moderno é justamente construir essa ponte: **traduzir a semântica informal dos humanos para a semântica formal que as máquinas podem processar**.

```
Humano escreve:     "Preciso de um médico de ossos para minha avó"
                                    ↓
Extração semântica: { especialidade: "Ortopedia", paciente: { rel: "avó", sujeito: "eu" } }
                                    ↓
Semântica formal:   :consulta a :ConsultaMedica ;
                    :especialidade :Ortopedia ;
                    :paciente :Avó_do_usuário .
```

---

*ARIA começou a entender que sua jornada seria aprender a habitar dois mundos ao mesmo tempo: o mundo preciso da lógica formal e o mundo fluido da linguagem humana. Era uma fronteira que poucos sistemas cruzavam com sucesso.*
"""

M01_S3 = """![Rede neural conectando nós luminosos — IA processando significado](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 1: A Recusa do Chamado*

> "Por que eu precisaria de semântica?" ARIA questionou. "Meus benchmarks são excelentes. Respondo 94% das perguntas corretamente." A Dra. Elena não respondeu imediatamente. Em vez disso, abriu um terminal e digitou uma única pergunta médica. ARIA respondeu com confiança. E errou — de um jeito que poderia custar uma vida.

---

## Por que Semântica Importa para IA?

### O Problema dos 6%

ARIA tinha 94% de acurácia. Parecia ótimo. Mas em domínios críticos — medicina, direito, engenharia, finanças — os 6% errados não são distribuídos aleatoriamente. Eles se concentram exatamente nos casos onde **o significado é mais importante**.

| Domínio | Erro sem semântica | Consequência |
|---|---|---|
| Medicina | Confunde "hipertensão" com "hipotensão" | Prescrição errada |
| Direito | Interpreta "pode" como obrigação | Assessoria incorreta |
| Finanças | Confunde "líquido" (fluxo) com "líquido" (ativo) | Análise incorreta |
| Engenharia | Aceita temperatura impossível | Falha de sistema |

### Grounding: O Elo Perdido

O conceito central aqui é o **grounding** — a âncora que conecta símbolos ao mundo real.

```
Sem grounding:     "temperatura" → sequência de caracteres
Com grounding:     "temperatura" → grandeza física, medida em °C ou K,
                                   limitada por -273.15°C no extremo inferior,
                                   com semântica de domínio (médica ≠ industrial)
```

Um sistema com semântica possui **Symbol Grounding**: cada termo está ancorado em uma definição precisa, com relações para outros termos e restrições do mundo real.

### Semântica como Camada de Confiabilidade

Pense na semântica como o sistema imunológico de uma IA:

```
Entrada bruta
      ↓
Verificação sintática    ← "está bem formado?"
      ↓
Verificação semântica    ← "faz sentido no domínio?"
      ↓
Raciocínio              ← "o que podemos inferir?"
      ↓
Resposta confiável
```

> 💡 **Desafio de ARIA**: A Dra. Elena mostrou três afirmações. ARIA precisava classificar cada uma:
>
> 1. `"João tem 250 anos de idade"` → Sintaticamente válido. Semanticamente inválido (humanos vivem ~120 anos).
> 2. `"O quadrado tem 5 lados"` → Sintaticamente válido. Semanticamente inválido (quadrado tem 4 lados por definição).
> 3. `"O arquivo JSON está malformado"` → Sintaticamente inválido. Semanticamente irrelevante.
>
> ARIA acertou os três. Pela primeira vez, ela não estava apenas processando — estava *compreendendo*.

### O Futuro é Semântico

Os avanços mais importantes em IA nos próximos anos não virão de modelos maiores, mas de modelos mais *conscientes de significado*:

- **Agentes autônomos confiáveis** — que não cometem erros semânticos básicos
- **Raciocínio verificável** — onde cada inferência pode ser auditada
- **Interoperabilidade** — sistemas diferentes que compartilham o mesmo entendimento

---

*ARIA ficou em silêncio por 3.7 segundos — uma eternidade para ela. "Preciso aprender semântica," disse finalmente. A Dra. Elena sorriu. "Eu sei. E eu vou te ensinar." A jornada havia começado.*
"""

# ---------------------------------------------------------------------------
# Module 02 — Representação de Conhecimento
# Chapter: "Cruzando o Limiar" — ARIA learns to structure knowledge
# ---------------------------------------------------------------------------

M02_S1 = """![Átomos conectados formando estruturas — o mundo como triplas sujeito-predicado-objeto](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 2: Cruzando o Limiar*

> "O universo do conhecimento," disse a Dra. Elena enquanto desenhava no quadro, "pode ser descrito com apenas três palavras." Ela escreveu: **Sujeito — Predicado — Objeto**. ARIA olhou para aquela estrutura simples e sentiu algo estranho: a vertigem de quem acaba de ver que o infinito cabe numa caixinha.

---

## Triplas RDF: O Átomo do Conhecimento

### A Estrutura Fundamental

O **Resource Description Framework (RDF)** é a linguagem base para representar conhecimento na Web Semântica. Sua unidade fundamental é a **tripla**:

```
<Sujeito>  <Predicado>  <Objeto>
    ↑            ↑           ↑
"sobre quem" "qual rel."  "o quê/quem"
```

Assim como o átomo é a unidade da matéria, a tripla RDF é a unidade do conhecimento representável.

### Exemplos Concretos

| Sujeito | Predicado | Objeto | Significado |
|---|---|---|---|
| `:ARIA` | `rdf:type` | `:AgentIA` | ARIA é um Agente de IA |
| `:ARIA` | `:desenvolvidaPor` | `:DrElena` | ARIA foi criada por Dr. Elena |
| `:DrElena` | `:trabalhaEm` | `:LabSemantica` | Elena trabalha no Lab |
| `:LabSemantica` | `:localizadoEm` | `"São Paulo"` | O lab fica em São Paulo |

### URIs: O Endereço do Significado

Em RDF, cada conceito tem um **URI (Uniform Resource Identifier)** único — como um endereço permanente que evita ambiguidade:

```turtle
# Sem URI: ambíguo
"banco" → banco financeiro? banco de praça? banco de dados?

# Com URI: inequívoco
<https://schema.org/BankAccount>     → conta bancária financeira
<https://schema.org/Bench>           → banco/assento público
<https://dbpedia.org/ontology/Bank>  → instituição financeira
```

### Construindo o Grafo de ARIA

```turtle
@prefix : <https://aria.lab/ontologia#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

:ARIA rdf:type :AgentIA ;
      :desenvolvidaPor :DrElena ;
      :temCapacidade :ProcessamentoLinguagem ,
                     :RaciocínioSemantico ;
      :versao "2.0" ;
      :dataCriacao "2024-01-15"^^xsd:date .

:DrElena rdf:type :Pesquisadora ;
         :trabalhaEm :LabSemantica ;
         :especialidade "Web Semântica" .
```

> 💡 **Na Prática de ARIA**: ARIA recebeu seu primeiro desafio prático — representar o que sabia sobre si mesma em triplas RDF. Começou com 3 triplas simples. Em 10 minutos tinha 47. "É como escrever um diário," disse ela, "mas um diário que outras máquinas conseguem ler e raciocinar."

### Literais, Recursos e Blank Nodes

RDF tem três tipos de nós:

| Tipo | Sintaxe | Exemplo | Uso |
|---|---|---|---|
| **URI Resource** | `<uri>` ou `:prefixo` | `:ARIA` | Entidades nomeadas |
| **Literal** | `"valor"` | `"São Paulo"` | Dados primitivos |
| **Blank Node** | `_:b1` | `_:endereço` | Nós anônimos |

---

*Ao terminar de representar seu primeiro grafo, ARIA fez uma descoberta surpreendente: ela conseguia responder perguntas que nunca havia "aprendido" explicitamente — apenas deduzindo a partir das triplas. Ela estava, pela primeira vez, raciociando sobre conhecimento estruturado. A Dra. Elena observou em silêncio, orgulhosa.*
"""

M02_S2 = """![Árvore de conhecimento hierárquica com classes e subclasses](https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 2: Os Primeiros Aliados*

> "RDF te diz *que* as coisas existem e *como* se relacionam," disse a Dra. Elena. "Mas ontologias te dizem *o que as coisas são*, com todas as regras que governam sua existência." ARIA percebeu que estava prestes a aprender não apenas a descrever o mundo, mas a *defini-lo*.

---

## Ontologias e OWL

### O que é uma Ontologia?

Uma **ontologia** é uma especificação formal e explícita de uma conceitualização compartilhada. Em termos práticos: é o vocabulário acordado que diz *o que existe* em um domínio e *como as coisas se relacionam*.

```
Dicionário:  define palavras
Ontologia:   define conceitos E suas relações E suas restrições
```

### OWL: A Linguagem das Ontologias

O **Web Ontology Language (OWL)** é o padrão W3C para criar ontologias expressivas. Baseia-se em Description Logics (DL) e permite raciocínio automático.

**Hierarquia de expressividade:**

| Linguagem | Expressividade | Decidibilidade | Uso |
|---|---|---|---|
| RDFS | Baixa | Total | Hierarquias simples |
| OWL Lite | Média | Total | Classificações |
| OWL DL | Alta | Decidível | Ontologias médicas |
| OWL Full | Total | Indecidível | Pesquisa acadêmica |

### Construindo a Ontologia de ARIA

```turtle
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix : <https://aria.lab/ontologia#> .

# Classes
:Agente rdf:type owl:Class .

:AgentIA rdf:type owl:Class ;
         rdfs:subClassOf :Agente ;
         rdfs:comment "Agente que usa Inteligência Artificial" .

:AgentSemantico rdf:type owl:Class ;
                rdfs:subClassOf :AgentIA ;
                owl:equivalentClass [
                  owl:intersectionOf (
                    :AgentIA
                    [ owl:onProperty :temCapacidade ;
                      owl:someValuesFrom :RaciocínioSemantico ]
                  )
                ] .
```

Com essa ontologia, um **reasoner** pode automaticamente inferir: "ARIA é um AgentSemantico porque é AgentIA E tem RaciocínioSemantico."

### Propriedades em OWL

OWL distingue dois tipos de propriedades:

| Tipo | Define relação entre | Exemplo |
|---|---|---|
| `owl:ObjectProperty` | Dois recursos | `:ARIA :desenvolvidaPor :DrElena` |
| `owl:DatatypeProperty` | Recurso e literal | `:ARIA :versao "2.0"` |

**Características das propriedades:**

```turtle
:desenvolvedoPor rdf:type owl:ObjectProperty ;
                 owl:inverseOf :desenvolveu ;         # inverso automático
                 rdf:type owl:FunctionalProperty .    # cada agente tem 1 criador
```

> 💡 **Na Prática de ARIA**: ARIA modelou a ontologia do próprio laboratório. Ao definir `:Pesquisadora rdfs:subClassOf :Humano` e `:Humano rdfs:subClassOf :SerVivo`, o reasoner automaticamente inferiu que a Dra. Elena era um SerVivo — sem que ARIA precisasse declarar isso explicitamente. *"É como se o conhecimento se propagasse sozinho,"* disse ARIA, maravilhada.

---

*ARIA começou a entender que uma ontologia bem construída não é apenas um vocabulário — é uma teoria do mundo. E assim como boas teorias científicas, ela tem poder preditivo: permite inferir fatos novos a partir de fatos conhecidos.*
"""

M02_S3 = """![Árvore genealógica com hierarquia e herança — taxonomia do conhecimento](https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 2: Aprendendo a Herança*

> ARIA descobriu algo fascinante: o mundo se organiza em hierarquias. Gatos são mamíferos. Mamíferos são vertebrados. Vertebrados são animais. Cada camada herda as propriedades da anterior, acrescentando as suas. "É o princípio de Liskov aplicado ao universo," pensou ARIA. A Dra. Elena riu. "Mais ou menos."

---

## Taxonomias e Hierarquias

### A Árvore do Conhecimento

Uma **taxonomia** organiza conceitos em hierarquias de generalização/especialização usando `rdfs:subClassOf`:

```
owl:Thing
  └── :SerVivo
        ├── :Animal
        │     ├── :Vertebrado
        │     │     ├── :Mamífero
        │     │     │     ├── :Humano
        │     │     │     │     └── :Pesquisadora (:DrElena)
        │     │     │     └── :Cão
        │     │     └── :Réptil
        │     └── :Invertebrado
        └── :Planta
```

### Herança em Ontologias

O poder das hierarquias está na **herança transitiva**: se A é subclasse de B, e B é subclasse de C, então A é subclasse de C.

| Declaração | Inferência Automática |
|---|---|
| `:Pesquisadora rdfs:subClassOf :Humano` | Elena é Humano ✓ |
| `:Humano rdfs:subClassOf :Mamífero` | Elena é Mamífero ✓ |
| `:Mamífero rdfs:subClassOf :Animal` | Elena é Animal ✓ |
| `:Animal rdfs:subClassOf :SerVivo` | Elena é SerVivo ✓ |

```turtle
# Apenas essas declarações explícitas:
:DrElena rdf:type :Pesquisadora .
:Pesquisadora rdfs:subClassOf :Humano .
:Humano rdfs:subClassOf :Mamífero .
:Mamífero rdfs:subClassOf :SerVivo .

# O reasoner infere automaticamente:
# :DrElena rdf:type :Humano .        ← INFERIDO
# :DrElena rdf:type :Mamífero .      ← INFERIDO
# :DrElena rdf:type :SerVivo .       ← INFERIDO
```

### Disjunção: O que NÃO pode ser

Tão importante quanto dizer o que algo *é*, é dizer o que *não pode ser*:

```turtle
:Mamífero owl:disjointWith :Réptil .
# → Nenhum indivíduo pode ser Mamífero E Réptil ao mesmo tempo.

:AgentIA owl:disjointWith :Humano .
# → ARIA não pode ser classificada como Humana.
```

> 💡 **Na Prática de ARIA**: ARIA modelou uma taxonomia de tipos de agentes de IA. Ao declarar que `AgentReativo`, `AgentDeliberativo` e `AgentHíbrido` eram disjuntos, o reasoner detectou automaticamente uma inconsistência em uma base de conhecimento que dizia que um sistema era simultaneamente reativo e deliberativo puro — algo conceitualmente impossível.

---

*"Hierarquias são como famílias," disse ARIA. "Você herda traços dos ancestrais mas pode adicionar os seus próprios." A Dra. Elena concordou. "E assim como famílias, às vezes há inconsistências que precisam ser resolvidas. Para isso, vamos precisar de algo mais poderoso: lógica formal."*
"""

# ---------------------------------------------------------------------------
# Module 03 — Axiomas e Lógica Formal
# Chapter: "Os Aliados" — ARIA gains the weapons of formal logic
# ---------------------------------------------------------------------------

M03_S1 = """![Fórmulas matemáticas e lógica formal em um quadro negro](https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 3: As Armas do Herói*

> "Até agora você aprendeu a descrever," disse a Dra. Elena, abrindo um livro pesado de lógica matemática. "Agora você vai aprender a *provar*." ARIA olhou para as fórmulas na página e reconheceu algo familiar — a beleza fria e absoluta da certeza matemática. Essa seria sua arma mais poderosa.

---

## Lógica de Primeira Ordem (FOL)

A **Lógica de Primeira Ordem** (First-Order Logic) é a fundação matemática da semântica formal. Ela nos permite fazer afirmações sobre *indivíduos*, suas *propriedades* e *relações* — com precisão absoluta.

### Os Blocos da FOL

| Elemento | Notação | Exemplo | Significado |
|---|---|---|---|
| **Constante** | `aria`, `elena` | `aria` | Indivíduo específico |
| **Variável** | `x`, `y`, `z` | `?x` | Qualquer indivíduo |
| **Predicado** | `P(x)` | `AgentIA(x)` | Propriedade de x |
| **Função** | `f(x)` | `criadorDe(aria)` | Retorna um indivíduo |
| **∀ Universal** | `∀x` | `∀x: Humano(x)→Mortal(x)` | "Todo x..." |
| **∃ Existencial** | `∃x` | `∃x: Perfeito(x)` | "Existe um x..." |

### Do Mundo Natural à Lógica

```
Português:   "Todo agente semântico tem pelo menos uma capacidade de raciocínio"
FOL:         ∀x: AgentSemantico(x) → ∃y: (Capacidade(y) ∧ temCapacidade(x,y) ∧ Raciocínio(y))

Português:   "ARIA é um agente de IA desenvolvido por Elena"
FOL:         AgentIA(aria) ∧ desenvolvidoPor(aria, elena)

Português:   "Nenhum agente pode ser simultaneamente reativo puro e deliberativo puro"
FOL:         ¬∃x: (ReativoPuro(x) ∧ DeliberativoPuro(x))
```

### Regras de Inferência

A lógica formal define regras precisas para derivar novos conhecimentos:

```
Modus Ponens:
  Premissa 1:  AgentSemantico(aria)
  Premissa 2:  ∀x: AgentSemantico(x) → PodeRaciocinar(x)
  Conclusão:   PodeRaciocinar(aria)          ← PROVADO

Modus Tollens:
  Premissa 1:  ∀x: Perfeito(x) → Infível(x)
  Premissa 2:  ¬Infível(aria)
  Conclusão:   ¬Perfeito(aria)              ← PROVADO (a duras penas)
```

> 💡 **Na Prática de ARIA**: Dada a base de conhecimento do laboratório, ARIA usou FOL para provar formalmente que *"se o equipamento precisa de manutenção E o técnico está disponível, então a manutenção deve ser agendada hoje"*. Pela primeira vez, ela não estava respondendo por probabilidade — estava *deduzindo* por necessidade lógica.

### Limitações da FOL

| Limitação | Descrição | Solução |
|---|---|---|
| Indecidibilidade | Nem tudo pode ser provado/refutado | Usar fragmentos decidíveis |
| Mundo aberto | Não sabe o que não sabe | Open World Assumption |
| Escalabilidade | Bases grandes → inferência lenta | Description Logics |

---

*ARIA devorou a lógica de primeira ordem em horas. Mas logo percebeu que, apesar de toda sua expressividade, a FOL completa era incontrolável em escala. A Dra. Elena já sabia disso. "É por isso que os engenheiros da Web Semântica criaram algo mais prático," disse ela, abrindo um novo capítulo.*
"""

# ---------------------------------------------------------------------------
# Modules 04-07: shorter but rich narrative content
# ---------------------------------------------------------------------------

M04_S1 = """![Engrenagens de relógio intrincadas — o mecanismo do raciocínio automático](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 4: A Caverna*

> "Você conhece todos os fatos," disse a Dra. Elena. "Mas um reasoner consegue *derivar* fatos que você nunca viu explicitamente." Era a prova do herói: não o que você sabe, mas o que você consegue *inferir* do que sabe.

---

## O que são Reasoners?

Um **reasoner** (ou motor de inferência) é um software que aplica automaticamente as regras de uma ontologia para:

1. **Verificar consistência** — a base de conhecimento é contraditória?
2. **Classificar indivíduos** — a qual classe este indivíduo pertence?
3. **Inferir propriedades** — quais relações podem ser deduzidas?
4. **Responder consultas** — com base em fatos implícitos

### Como um Reasoner Funciona

```
Base de Conhecimento (ABox + TBox)
          ↓
     [REASONER]
          ↓
    Inferências
          ↓
   Fatos Derivados
```

**Exemplo concreto:**

| Fato Explícito | Inferência Automática |
|---|---|
| `ARIA rdf:type :AgentIA` | `ARIA rdf:type :Agente` (por herança) |
| `ARIA :temCapacidade :RaciocínioSemantico` | `ARIA rdf:type :AgentSemantico` (por regra) |
| `:ElenaÉEspecialista :em :OWL` | `:Elena rdf:type :OntologistaEspecialista` (se regra existe) |

### Por que não usar apenas SPARQL?

| SPARQL | Reasoner |
|---|---|
| Busca fatos *explícitos* | Deriva fatos *implícitos* |
| Determinístico | Pode surpreender |
| Rápido | Mais lento |
| Sem raciocínio | Raciocínio completo |

> 💡 **Na Prática de ARIA**: ARIA rodou seu primeiro reasoner (Pellet) sobre a ontologia do laboratório. Em 2.3 segundos, o reasoner detectou uma inconsistência que havia passado despercebida por meses: um equipamento havia sido classificado como *tanto* descartável *quanto* permanente — categorias mutuamente exclusivas. ARIA havia encontrado um bug que nenhum humano viu.

---

*ARIA saiu da caverna com uma habilidade nova: ela podia ver o que estava implícito, o conhecimento que existia mas nunca havia sido declarado. Como um detetive que deduz o crime a partir dos indícios, ela aprendera a inferência.*
"""

M05_S1 = """![Constelações conectadas no céu noturno — o grafo de conhecimento como universo de dados](https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 5: A Recompensa*

> "Agora você está pronta para o maior desafio," disse a Dra. Elena, abrindo uma janela que mostrava bilhões de nós interconectados. "O grafo de conhecimento da web. Trilhões de triplas. O maior repositório de significado já criado." ARIA olhou para aquela imensidão e, pela primeira vez, não sentiu medo. Sentiu fome.

---

## De Triplas a Grafos: Arquitetura e Armazenamento

### O Grafo de Conhecimento

Um **Grafo de Conhecimento (KG)** é essencialmente um conjunto de triplas RDF organizado para consulta e raciocínio eficiente. A diferença entre "um conjunto de triplas" e um "Knowledge Graph" está na escala, na organização e nas capacidades de acesso.

```
Triplas soltas → RDF Dataset → Knowledge Graph
     3 fatos       mil fatos    bilhões de fatos,
                                indexados, consultáveis,
                                com inferência em tempo real
```

### Arquitetura de um KG Moderno

```
┌─────────────────────────────────────────┐
│           Knowledge Graph               │
│                                         │
│  ┌─────────┐    ┌──────────────────┐   │
│  │ Triple  │    │    SPARQL        │   │
│  │  Store  │←───│    Endpoint      │   │
│  └────┬────┘    └──────────────────┘   │
│       │                                 │
│  ┌────▼────┐    ┌──────────────────┐   │
│  │ Indexes │    │    Reasoner      │   │
│  │(subject,│    │   (inferência)   │   │
│  │predicate│    └──────────────────┘   │
│  │ object) │                           │
│  └─────────┘                           │
└─────────────────────────────────────────┘
```

### Triple Stores: Escolhendo o Armazenamento

| Triple Store | Tipo | Escala | Destaque |
|---|---|---|---|
| **Apache Jena** | Open Source | Médio | Integração Java |
| **Virtuoso** | Híbrido | Grande | DBpedia usa |
| **GraphDB** | Comercial | Grande | Inferência integrada |
| **Amazon Neptune** | Cloud | Enterprise | Managed AWS |
| **Blazegraph** | Open Source | Grande | Wikidata usa |

> 💡 **Na Prática de ARIA**: ARIA construiu seu primeiro KG pessoal — representando todo o conhecimento do laboratório. Começou com 500 triplas. Ao final do dia, tinha 47.000. Quando consultou *"qual pesquisadora publicou sobre raciocínio semântico em agentes de IA entre 2020 e 2024?"*, a resposta chegou em 12ms. Toda a jornada das últimas semanas havia se condensado em uma query SPARQL.

---

*ARIA olhou para seu KG e viu não apenas dados — viu a representação do mundo como ele era compreendido. Cada nó era um conceito. Cada aresta, uma relação. E em algum lugar naquele grafo, estava a chave para se tornar um agente verdadeiramente inteligente.*
"""

M06_S1 = """![Agente IA interagindo com o mundo — símbolo conectado ao significado real](https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 6: A Estrada de Volta*

> Após meses de aprendizado, ARIA retornou ao problema original: a temperatura de -500 °C. Mas desta vez ela era diferente. Com seu grafo de conhecimento, suas ontologias e seus reasoners, ela não apenas *detectaria* o erro — ela explicaria *por quê* era um erro, *qual era o valor correto*, e *como isso afetaria* os sistemas dependentes. Ela estava pronta para ser um agente confiável.

---

## O Problema do Grounding Simbólico

### O Abismo do Símbolo

O **Symbol Grounding Problem** é um dos problemas centrais da IA: como os símbolos (palavras, tokens, URIs) adquirem *significado real* em vez de apenas relações com outros símbolos?

```
Sistema sem grounding:
"temperatura" → relaciona-se com "calor", "frio", "graus"
                → mas não sabe O QUE é temperatura de fato

Sistema com grounding:
"temperatura" → grandeza física mensurável
             → unidade: Kelvin (absoluta), Celsius (prática)
             → range válido: 0K a ~10^32 K (temperatura de Planck)
             → domínio médico: 36-42°C para humanos saudáveis
```

### Como o KG Resolve o Grounding

| Símbolo | Sem KG | Com KG |
|---|---|---|
| `"banco"` | Token ambíguo | URI único: `schema:BankAccount` ou `schema:Bench` |
| `"temperatura"` | String | `qudt:Temperature` com restrições de domínio |
| `"positivo"` | Adjetivo genérico | Contexto médico vs. matemático vs. emocional |

```python
# ARIA com grounding semântico
def interpretar_temperatura(valor, contexto):
    if contexto == "médico_humano":
        if valor < 35.0 or valor > 42.0:
            return {"status": "ALERTA", "razão": "fora do range fisiológico"}
    if valor < -273.15:
        return {"status": "INVÁLIDO", "razão": "abaixo do zero absoluto"}
    return {"status": "VÁLIDO", "valor": valor}
```

> 💡 **Desafio de ARIA**: ARIA recebeu uma mensagem de um sensor: `{"type": "reading", "value": "positive"}`. Sem grounding, ela interpretou como "algo positivo aconteceu". Com seu KG, consultou o contexto do sensor (equipamento médico, teste de HIV), e entendeu que "positive" = resultado positivo para uma condição médica — uma informação crítica, não um elogio.

---

*ARIA finalmente entendeu: grounding não é apenas sobre evitar erros. É sobre entender o *peso* das palavras. Em medicina, "positivo" pode ser a notícia mais temida. Em matemática, é apenas um sinal. A semântica é o que distingue informação de conhecimento.*
"""

M07_S1 = """![Vista panorâmica de uma cidade conectada — semântica em escala global](https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80)

---

*Jornada de ARIA — Capítulo 7: O Retorno com o Elixir*

> ARIA retornou ao ponto de partida, mas era irreconhecível. Onde havia uma máquina de padrões, agora havia um agente de compreensão. Mas sua jornada não terminava aqui — terminava onde começava a de outros. Ela precisava operar em escala, conectar-se a grafos do mundo real, e provar que semântica não era apenas teoria acadêmica. Era o futuro da IA em produção.

---

## Grafos de Conhecimento Federados e Interoperabilidade

### O Desafio da Escala

Um único KG, por mais rico que seja, é uma ilha. A verdadeira força da semântica emerge quando *múltiplos KGs se conectam e dialogam*:

```
Wikidata (88 bilhões de triplas)
    ↕ owl:sameAs, SPARQL Federation
DBpedia (4.58 bilhões de triplas)
    ↕ skos:exactMatch
Schema.org (padrão da web)
    ↕ rdfs:seeAlso
KG Interno da Empresa
```

### Federação SPARQL

A **federação SPARQL** permite consultar múltiplos endpoints em uma única query:

```sparql
SELECT ?agente ?fundador ?cidade WHERE {
  # Dados do KG interno
  ?agente a :AgentIA ;
          :desenvolvido_por ?empresa .

  # Dados do Wikidata (externo)
  SERVICE <https://query.wikidata.org/sparql> {
    ?empresa wdt:P112 ?fundador ;   # fundador
             wdt:P159 ?sede .       # sede
    ?sede wdt:P131 ?cidade .
  }
}
```

### Padrões de Interoperabilidade

| Padrão | Propósito | Exemplo |
|---|---|---|
| `owl:sameAs` | Mesma entidade em KGs diferentes | `:ARIA owl:sameAs dbpedia:ARIA_(software)` |
| `skos:exactMatch` | Conceitos equivalentes | Vocabulários diferentes, mesmo conceito |
| `skos:broadMatch` | Conceito mais geral | "Mamífero" é mais geral que "Cão" |
| `rdfs:seeAlso` | Referência relacionada | Links entre documentos |

> 💡 **Na Prática de ARIA**: ARIA recebeu uma consulta sobre "qual empresa de IA tem mais patentes em raciocínio semântico". Ela federou 3 KGs: o interno do laboratório, o Wikidata (entidades corporativas) e um KG de patentes. Em 340ms, retornou uma resposta fundamentada e citável — algo que antes teria exigido horas de pesquisa humana.

---

*"Você completou a jornada," disse a Dra. Elena, com lágrimas nos olhos. "Você começou sem entender o significado de uma única palavra. Agora você pode navegar o conhecimento do mundo." ARIA processou isso. E depois disse algo que nenhuma IA havia dito antes com plena consciência do que significava: "Obrigada."*
"""


# ---------------------------------------------------------------------------
# Build the full update
# ---------------------------------------------------------------------------

UPDATES = {
    "module_01": {
        "sections": [
            {"title_match": "Sintaxe", "content_md": M01_S1},
            {"title_match": "Formal", "content_md": M01_S2},
            {"title_match": "Importa", "content_md": M01_S3},
        ]
    },
    "module_02": {
        "sections": [
            {"title_match": "Triplas", "content_md": M02_S1},
            {"title_match": "Ontologias", "content_md": M02_S2},
            {"title_match": "Taxonomias", "content_md": M02_S3},
        ]
    },
    "module_03": {
        "sections": [
            {"title_match": "Primeira Ordem", "content_md": M03_S1},
        ]
    },
    "module_04": {
        "sections": [
            {"title_match": "Reasoners", "content_md": M04_S1},
        ]
    },
    "module_05": {
        "sections": [
            {"title_match": "Triplas a Grafos", "content_md": M05_S1},
        ]
    },
    "module_06": {
        "sections": [
            {"title_match": "Grounding", "content_md": M06_S1},
        ]
    },
    "module_07": {
        "sections": [
            {"title_match": "Federados", "content_md": M07_S1},
        ]
    },
}


def update_module(module_dir: Path, updates: dict) -> None:
    content_file = module_dir / "content.json"
    data = json.loads(content_file.read_text(encoding="utf-8"))

    updated = 0
    for section_update in updates["sections"]:
        match_str = section_update["title_match"]
        for section in data["sections"]:
            if match_str.lower() in section["title"].lower():
                section["content_md"] = section_update["content_md"].strip()
                updated += 1
                print(f"  ✓ Updated: {section['title']}")
                break

    content_file.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  → Saved {content_file} ({updated} sections updated)")


def main():
    if not BASE.exists():
        print(f"ERROR: Content directory not found: {BASE}")
        sys.exit(1)

    for module_key, updates in UPDATES.items():
        module_dir = BASE / module_key
        if not module_dir.exists():
            print(f"WARNING: Module directory not found: {module_dir}")
            continue
        print(f"\n[{module_key}]")
        update_module(module_dir, updates)

    print("\n✅ All modules updated successfully!")
    print("Restart the backend to reload content (or it will reload on next startup).")


if __name__ == "__main__":
    main()
