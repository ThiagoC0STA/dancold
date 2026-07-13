export const site = {
  name: "Dancold",
  url: "https://www.dancold.com.br",
  email: "dancold@dancold.com.br",
  emailCareers: "rh@dancold.com.br",
  phoneFixed: "(41) 3365-4877",
  phoneMobile: "(41) 9 9246-6920",
  whatsapp: "https://wa.me/+5541992466920",
  address: "Av. Prefeito Maurício Fruet, 3060, Cajuru, Curitiba, PR, CEP 82.920-330.",
  cnpj: "05.477.326/0001-28",
  foundedYear: 1998,
  social: {
    facebook: "https://www.facebook.com/DANCOLDCLIMATIZACAO",
    instagram: "https://www.instagram.com/arcondicionadodancold/",
    linkedin: "https://www.linkedin.com/company/dancoldclimatiza%C3%A7%C3%A3o/",
  },
} as const;

export const serviceSlugs = [
  "automacao-e-monitoramento",
  "projetos-personalizados",
  "instalacoes",
  "plano-de-manutencao-pmoc",
  "comissionamento-de-obras",
] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export const serviceImages: Record<ServiceSlug, string> = {
  "automacao-e-monitoramento": "/img/services/automacao-2.webp",
  "projetos-personalizados": "/img/services/projetos-2.webp",
  instalacoes: "/img/services/instalacoes-2.webp",
  "plano-de-manutencao-pmoc": "/img/services/pmoc.webp",
  "comissionamento-de-obras": "/img/services/comissionamento.webp",
};

export const segmentSlugs = [
  "industrias",
  "hospitais",
  "shopping-centers",
  "comercial",
  "predios-corporativos",
  "residencial",
] as const;
export type SegmentSlug = (typeof segmentSlugs)[number];

export const segmentImages: Record<SegmentSlug, string> = {
  industrias: "/img/segments/industrias.webp",
  hospitais: "/img/segments/hospitais.webp",
  "shopping-centers": "/img/segments/shoppings.webp",
  comercial: "/img/segments/comercial.jpg",
  "predios-corporativos": "/img/segments/corporativos.webp",
  residencial: "/img/segments/residencias-v2.webp",
};

// service coverage — order must match dictionaries' whereWeAre.states (localized names)
export const coverage = [
  {
    id: "pr",
    cities: [
      "Curitiba e região",
      "Londrina",
      "Maringá",
      "Santo Antônio da Platina",
    ],
  },
  { id: "sc", cities: ["Joinville", "Brusque", "Itajaí", "Canoinhas", "Florianópolis"] },
  { id: "sp", cities: ["São Paulo e região", "Campinas"] },
  { id: "rj", cities: ["Macaé"] },
  { id: "pi", cities: ["Floriano"] },
] as const;

export const clients = [
  { name: "Ambev", logo: "/clients/ambev.png" },
  { name: "ArcelorMittal", logo: "/clients/arcelor.png" },
  { name: "Brose", logo: "/clients/brose.png" },
  { name: "Champagnat", logo: "/clients/champagnat.png" },
  { name: "Daikin", logo: "/clients/daikin.png" },
  { name: "Hitachi", logo: "/clients/hitachi.png" },
  { name: "Mondelez", logo: "/clients/Mondelez.png" },
  { name: "Unimed", logo: "/clients/unimed.png" },
] as const;

export const suppliers = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  logo: `/suppliers/${n}.webp`,
}));
