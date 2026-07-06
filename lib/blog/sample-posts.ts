import type { PortableTextBlock } from "@portabletext/react";
import type { Locale } from "@/lib/i18n";
import type { BlogPost } from "./types";

/**
 * Sample posts shown while Sanity isn't configured yet
 * (NEXT_PUBLIC_SANITY_PROJECT_ID absent). Replaced by real CMS content
 * automatically once the env vars are set.
 */

let keyCounter = 0;
function block(text: string, style: "normal" | "h2" = "normal"): PortableTextBlock {
  keyCounter += 1;
  return {
    _type: "block",
    _key: `sample-${keyCounter}`,
    style,
    markDefs: [],
    children: [{ _type: "span", _key: `sample-span-${keyCounter}`, text, marks: [] }],
  } as PortableTextBlock;
}

type LocalizedPost = {
  slug: string;
  coverUrl: string;
  publishedAt: string;
  locales: Record<Locale, { title: string; excerpt: string; paragraphs: [string, "normal" | "h2"][] }>;
};

const POSTS: LocalizedPost[] = [
  {
    slug: "pmoc-o-que-e-e-por-que-sua-empresa-precisa",
    coverUrl: "/img/services/pmoc.webp",
    publishedAt: "2026-06-22T12:00:00.000Z",
    locales: {
      pt: {
        title: "PMOC: o que é e por que sua empresa precisa",
        excerpt:
          "Entenda o Plano de Manutenção, Operação e Controle, o que diz a legislação vigente e como ele protege a saúde dos ocupantes e o caixa da empresa.",
        paragraphs: [
          ["O PMOC — Plano de Manutenção, Operação e Controle — é obrigatório por lei para edificações de uso público e coletivo climatizadas. Mais do que uma exigência legal, ele é a ferramenta que garante qualidade do ar interior, eficiência energética e vida útil dos equipamentos.", "normal"],
          ["O que diz a legislação", "h2"],
          ["A Lei Federal 13.589/2018 determina que todos os edifícios de uso público e coletivo com ambientes climatizados possuam PMOC implantado, seguindo os parâmetros de qualidade do ar da ANVISA, hoje definidos pela RDC nº 886/2024.", "normal"],
          ["Multas e riscos de operar sem PMOC", "h2"],
          ["Além das sanções aplicáveis em fiscalizações, operar sem manutenção estruturada significa falhas inesperadas de compressores, perda de eficiência, contas de energia mais altas e risco à saúde dos ocupantes — a chamada Síndrome do Edifício Doente.", "normal"],
          ["Como a Dancold implanta o PMOC", "h2"],
          ["Nossa equipe elabora o plano, executa as rotinas com equipes fixas ou volantes, emite relatórios técnicos periódicos e laudos de qualidade do ar, e centraliza toda a documentação exigida pela vigilância sanitária com ART do CREA.", "normal"],
        ],
      },
      en: {
        title: "PMOC: what it is and why your company needs it",
        excerpt:
          "Understand Brazil's Maintenance, Operation and Control Plan, what current legislation requires and how it protects occupants' health and your company's budget.",
        paragraphs: [
          ["The PMOC — Maintenance, Operation and Control Plan — is required by law for air-conditioned buildings of public and collective use in Brazil. More than a legal requirement, it is the tool that ensures indoor air quality, energy efficiency and equipment lifespan.", "normal"],
          ["What the legislation says", "h2"],
          ["Federal Law 13,589/2018 mandates that all public and collective-use buildings with air-conditioned environments implement a PMOC, following ANVISA's air quality parameters, currently defined by RDC No. 886/2024.", "normal"],
          ["Fines and risks of operating without a PMOC", "h2"],
          ["Beyond penalties in inspections, operating without structured maintenance means unexpected compressor failures, efficiency loss, higher energy bills and health risks to occupants — the so-called Sick Building Syndrome.", "normal"],
          ["How Dancold implements the PMOC", "h2"],
          ["Our team prepares the plan, executes the routines with fixed or mobile crews, issues periodic technical reports and air quality certificates, and centralizes all documentation required by health authorities with CREA engineering liability records.", "normal"],
        ],
      },
      es: {
        title: "PMOC: qué es y por qué su empresa lo necesita",
        excerpt:
          "Entienda el Plan de Mantenimiento, Operación y Control, qué dice la legislación vigente y cómo protege la salud de los ocupantes y las finanzas de la empresa.",
        paragraphs: [
          ["El PMOC — Plan de Mantenimiento, Operación y Control — es obligatorio por ley para edificaciones de uso público y colectivo climatizadas en Brasil. Más que una exigencia legal, es la herramienta que garantiza calidad del aire interior, eficiencia energética y vida útil de los equipos.", "normal"],
          ["Qué dice la legislación", "h2"],
          ["La Ley Federal 13.589/2018 determina que todos los edificios de uso público y colectivo con ambientes climatizados tengan PMOC implantado, siguiendo los parámetros de calidad del aire de ANVISA, hoy definidos por la RDC nº 886/2024.", "normal"],
          ["Multas y riesgos de operar sin PMOC", "h2"],
          ["Además de las sanciones en fiscalizaciones, operar sin mantenimiento estructurado significa fallas inesperadas de compresores, pérdida de eficiencia, cuentas de energía más altas y riesgos para la salud de los ocupantes — el llamado Síndrome del Edificio Enfermo.", "normal"],
          ["Cómo Dancold implanta el PMOC", "h2"],
          ["Nuestro equipo elabora el plan, ejecuta las rutinas con equipos fijos o volantes, emite informes técnicos periódicos y certificados de calidad del aire, y centraliza toda la documentación exigida por la vigilancia sanitaria con registro de responsabilidad técnica.", "normal"],
        ],
      },
    },
  },
  {
    slug: "monitoramento-24-7-protege-camaras-frias-e-data-centers",
    coverUrl: "/img/services/automacao-2.webp",
    publishedAt: "2026-06-08T12:00:00.000Z",
    locales: {
      pt: {
        title: "Como o monitoramento 24/7 protege câmaras frias e data centers",
        excerpt:
          "Sensores de temperatura e energia com alarme em tempo real evitam perdas milionárias por falha térmica. Veja como funciona na prática.",
        paragraphs: [
          ["Uma câmara fria que falha de madrugada, um data center sem refrigeração por algumas horas, uma câmara de vacinas fora da faixa segura: cada um desses cenários gera prejuízos que superam em muito o custo de um sistema de monitoramento.", "normal"],
          ["O que é monitorado", "h2"],
          ["Instalamos sensores de temperatura e de energia conectados a um sistema com alarme 24/7, acessível pelo celular. Qualquer desvio de temperatura ou queda de energia dispara notificações imediatas para a equipe responsável.", "normal"],
          ["Quem precisa disso", "h2"],
          ["Indústrias alimentícias, hospitais e clínicas com imunobiológicos, laboratórios, supermercados e operações de TI. Em todos esses casos, o tempo de reação define se o incidente vira um susto ou um prejuízo.", "normal"],
          ["Prevenção que se paga", "h2"],
          ["O investimento em monitoramento é uma fração do valor de um único lote de vacinas, de um estoque de perecíveis ou de horas de servidores parados. É seguro operacional no sentido literal.", "normal"],
        ],
      },
      en: {
        title: "How 24/7 monitoring protects cold rooms and data centers",
        excerpt:
          "Temperature and power sensors with real-time alarms prevent million-dollar losses from thermal failure. See how it works in practice.",
        paragraphs: [
          ["A cold room failing overnight, a data center without cooling for a few hours, a vaccine chamber out of the safe range: each of these scenarios causes losses far greater than the cost of a monitoring system.", "normal"],
          ["What is monitored", "h2"],
          ["We install temperature and power sensors connected to a 24/7 alarm system, accessible from a mobile phone. Any temperature deviation or power outage triggers immediate notifications to the responsible team.", "normal"],
          ["Who needs it", "h2"],
          ["Food industries, hospitals and clinics with immunobiologicals, laboratories, supermarkets and IT operations. In all these cases, reaction time defines whether an incident becomes a scare or a loss.", "normal"],
          ["Prevention that pays for itself", "h2"],
          ["The investment in monitoring is a fraction of the value of a single vaccine batch, a perishables stock or hours of downed servers. It is operational insurance in the literal sense.", "normal"],
        ],
      },
      es: {
        title: "Cómo el monitoreo 24/7 protege cámaras frías y data centers",
        excerpt:
          "Sensores de temperatura y energía con alarma en tiempo real evitan pérdidas millonarias por falla térmica. Vea cómo funciona en la práctica.",
        paragraphs: [
          ["Una cámara fría que falla de madrugada, un data center sin refrigeración por algunas horas, una cámara de vacunas fuera del rango seguro: cada uno de estos escenarios genera pérdidas que superan con creces el costo de un sistema de monitoreo.", "normal"],
          ["Qué se monitorea", "h2"],
          ["Instalamos sensores de temperatura y de energía conectados a un sistema con alarma 24/7, accesible desde el celular. Cualquier desvío de temperatura o corte de energía dispara notificaciones inmediatas al equipo responsable.", "normal"],
          ["Quién lo necesita", "h2"],
          ["Industrias alimentarias, hospitales y clínicas con inmunobiológicos, laboratorios, supermercados y operaciones de TI. En todos estos casos, el tiempo de reacción define si el incidente queda en un susto o en una pérdida.", "normal"],
          ["Prevención que se paga sola", "h2"],
          ["La inversión en monitoreo es una fracción del valor de un solo lote de vacunas, de un stock de perecederos o de horas de servidores detenidos. Es un seguro operacional en el sentido literal.", "normal"],
        ],
      },
    },
  },
  {
    slug: "vrf-ou-chiller-qual-sistema-escolher",
    coverUrl: "/img/services/instalacoes-2.webp",
    publishedAt: "2026-05-18T12:00:00.000Z",
    locales: {
      pt: {
        title: "VRF ou Chiller: qual sistema escolher para seu projeto",
        excerpt:
          "Os dois dominam a climatização de grande porte, mas atendem perfis diferentes de edificação. Compare aplicações, custos e manutenção.",
        paragraphs: [
          ["Na climatização de médio e grande porte, a decisão quase sempre passa por duas tecnologias: sistemas VRF/VRV e centrais de água gelada com chillers. A escolha errada custa caro por décadas — em energia, manutenção e conforto.", "normal"],
          ["Quando o VRF vence", "h2"],
          ["Edifícios corporativos, hotéis e hospitais de médio porte se beneficiam da modularidade do VRF: controle individual por ambiente, instalação mais rápida e ótima eficiência em carga parcial.", "normal"],
          ["Quando o Chiller vence", "h2"],
          ["Shoppings, indústrias e grandes complexos com alta carga térmica contínua tendem ao chiller: capacidade praticamente ilimitada, vida útil longa e custo por TR menor em grandes escalas.", "normal"],
          ["O fator decisivo: o projeto", "h2"],
          ["Não existe resposta universal — existe cálculo de carga térmica, análise do perfil de uso e projeto executivo bem feito. A Dancold projeta, instala e mantém as duas tecnologias, e recomenda a que faz sentido para o seu caso.", "normal"],
        ],
      },
      en: {
        title: "VRF or Chiller: which system to choose for your project",
        excerpt:
          "Both dominate large-scale air conditioning, but they suit different building profiles. Compare applications, costs and maintenance.",
        paragraphs: [
          ["In medium and large-scale air conditioning, the decision almost always comes down to two technologies: VRF/VRV systems and chilled water plants with chillers. The wrong choice is costly for decades — in energy, maintenance and comfort.", "normal"],
          ["When VRF wins", "h2"],
          ["Corporate buildings, hotels and mid-size hospitals benefit from VRF modularity: individual control per room, faster installation and excellent partial-load efficiency.", "normal"],
          ["When the Chiller wins", "h2"],
          ["Shopping malls, industries and large complexes with continuous high thermal loads tend towards chillers: practically unlimited capacity, long lifespan and lower cost per ton at large scales.", "normal"],
          ["The deciding factor: the design", "h2"],
          ["There is no universal answer — there is thermal load calculation, usage profile analysis and a well-executed engineering design. Dancold designs, installs and maintains both technologies, and recommends the one that makes sense for your case.", "normal"],
        ],
      },
      es: {
        title: "VRF o Chiller: qué sistema elegir para su proyecto",
        excerpt:
          "Ambos dominan la climatización de gran porte, pero atienden perfiles diferentes de edificación. Compare aplicaciones, costos y mantenimiento.",
        paragraphs: [
          ["En la climatización de mediano y gran porte, la decisión casi siempre pasa por dos tecnologías: sistemas VRF/VRV y centrales de agua helada con chillers. La elección equivocada cuesta caro por décadas — en energía, mantenimiento y confort.", "normal"],
          ["Cuándo gana el VRF", "h2"],
          ["Edificios corporativos, hoteles y hospitales de porte medio se benefician de la modularidad del VRF: control individual por ambiente, instalación más rápida y excelente eficiencia con carga parcial.", "normal"],
          ["Cuándo gana el Chiller", "h2"],
          ["Centros comerciales, industrias y grandes complejos con alta carga térmica continua tienden al chiller: capacidad prácticamente ilimitada, larga vida útil y menor costo por TR en grandes escalas.", "normal"],
          ["El factor decisivo: el proyecto", "h2"],
          ["No existe una respuesta universal — existe cálculo de carga térmica, análisis del perfil de uso y proyecto ejecutivo bien hecho. Dancold proyecta, instala y mantiene ambas tecnologías, y recomienda la que tiene sentido para su caso.", "normal"],
        ],
      },
    },
  },
];

export function getSamplePosts(lang: Locale): BlogPost[] {
  return POSTS.map((post) => {
    const content = post.locales[lang];
    return {
      slug: post.slug,
      title: content.title,
      excerpt: content.excerpt,
      coverUrl: post.coverUrl,
      coverAlt: content.title,
      publishedAt: post.publishedAt,
      body: content.paragraphs.map(([text, style]) => block(text, style)),
    };
  });
}

export function getSampleSlugs(): string[] {
  return POSTS.map((post) => post.slug);
}
