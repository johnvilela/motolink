import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import { hash } from "@/lib/hash";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({
  connectionString: `${process.env.DATABASE_URL}`,
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "1234567Aa!";
const ALL_PERIODS = ["WEEK_DAY", "WEEK_NIGHT", "WEEKEND_DAY", "WEEKEND_NIGHT"];
const WEEKDAY_PERIODS = ["WEEK_DAY", "WEEK_NIGHT"];

const data = {
  admins: [
    {
      name: "Mariana Costa",
      email: "admin@gmail.com",
      role: "ADMIN",
      status: "ACTIVE",
      phone: "11985000001",
      document: "07435182014",
      birthDate: "1988-04-19",
    },
  ],
  branches: [
    {
      code: "RJ",
      name: "Rio de Janeiro",
      address: "Avenida das Americas, 3434 - Barra da Tijuca, Rio de Janeiro - RJ",
      whatsappUrl: "https://wa.me/5521994003001",
      users: [
        {
          name: "Fernanda Azevedo",
          email: "gerente.rj@gmail.com",
          role: "MANAGER",
          status: "ACTIVE",
          phone: "21998112001",
          document: "19384482056",
          birthDate: "1987-09-12",
        },
        {
          name: "Joao Vitor Lima",
          email: "user.rj.active@gmail.com",
          role: "USER",
          status: "ACTIVE",
          phone: "21998112002",
          document: "45790261008",
          birthDate: "1995-01-24",
        },
        {
          name: "Bianca Rocha",
          email: "user.rj.pending@gmail.com",
          role: "USER",
          status: "PENDING",
          phone: "21998112003",
          document: "96028154040",
          birthDate: "1998-08-04",
        },
        {
          name: "Carlos Eduardo Nunes",
          email: "user.rj.blocked@gmail.com",
          role: "USER",
          status: "BLOCKED",
          phone: "21998112004",
          document: "62357819087",
          birthDate: "1991-11-17",
        },
      ],
      groups: [
        {
          name: "Operacao Premium",
          description: "Clientes com alto volume e SLA reforcado nas regioes mais disputadas do Rio.",
        },
        {
          name: "Dark Kitchens Cariocas",
          description: "Operacoes com picos concentrados em jantar e madrugada.",
        },
        {
          name: "Redes 24h",
          description: "Contas com funcionamento estendido e previsao recorrente aos fins de semana.",
        },
      ],
      regions: [
        {
          name: "Zona Sul",
          description: "Botafogo, Flamengo, Copacabana, Ipanema e Leblon.",
        },
        {
          name: "Barra e Recreio",
          description: "Operacao espalhada por vias de maior raio e condominios.",
        },
        {
          name: "Centro e Tijuca",
          description: "Restaurantes de almoco executivo e alta rotatividade noturna.",
        },
      ],
      clients: [
        {
          name: "Bistro Atlantico Botafogo",
          cnpj: "61486873000140",
          contactName: "Luciana Marins",
          contactPhone: "21996443001",
          cep: "22250040",
          street: "Rua Voluntarios da Patria",
          number: "110",
          complement: "Loja 03",
          neighborhood: "Botafogo",
          city: "Rio de Janeiro",
          uf: "RJ",
          observations: "Pico forte no almoco corporativo e reforco nas sextas a noite.",
          provideMeal: true,
          groupName: "Operacao Premium",
          regionName: "Zona Sul",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 18,
            paymentForm: ["DAILY"],
            dailyPeriods: ALL_PERIODS,
            deliveryAreaKm: 8,
            rainTax: 5.5,
            clientDailyDay: 165,
            clientDailyNight: 188,
            clientDailyDayWknd: 182,
            clientDailyNightWknd: 205,
            deliverymanDailyDay: 118,
            deliverymanDailyNight: 132,
            deliverymanDailyDayWknd: 128,
            deliverymanDailyNightWknd: 142,
            deliverymanAdditionalKm: 1.6,
            clientAdditionalKm: 2.5,
          },
        },
        {
          name: "Poke Wave Ipanema",
          cnpj: "04181594000135",
          contactName: "Rafael Menezes",
          contactPhone: "21996443002",
          cep: "22410002",
          street: "Rua Visconde de Piraja",
          number: "512",
          neighborhood: "Ipanema",
          city: "Rio de Janeiro",
          uf: "RJ",
          observations: "Operacao enxuta durante a semana e reforco fixo no jantar.",
          provideMeal: false,
          groupName: "Dark Kitchens Cariocas",
          regionName: "Zona Sul",
          commercialCondition: {
            bagsStatus: "OWN",
            bagsAllocated: 0,
            paymentForm: ["GUARANTEED"],
            guaranteedPeriods: WEEKDAY_PERIODS,
            deliveryAreaKm: 6,
            isMotolinkCovered: true,
            guaranteedDay: 4,
            guaranteedNight: 6,
            guaranteedDayTax: 22,
            guaranteedNightTax: 27.5,
            guaranteedDayWeekend: 0,
            guaranteedNightWeekend: 0,
            guaranteedDayWeekendTax: 0,
            guaranteedNightWeekendTax: 0,
          },
        },
        {
          name: "Smash Central Lapa",
          cnpj: "20839185000130",
          contactName: "Diego Paes",
          contactPhone: "21996443003",
          cep: "20230013",
          street: "Avenida Mem de Sa",
          number: "88",
          neighborhood: "Lapa",
          city: "Rio de Janeiro",
          uf: "RJ",
          observations: "Maior giro apos 18h com mistura de diaria e per-delivery no fechamento.",
          provideMeal: true,
          groupName: "Redes 24h",
          regionName: "Centro e Tijuca",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 12,
            paymentForm: ["DAILY", "GUARANTEED"],
            dailyPeriods: ["WEEK_DAY", "WEEKEND_DAY"],
            guaranteedPeriods: ["WEEK_NIGHT", "WEEKEND_NIGHT"],
            deliveryAreaKm: 9,
            rainTax: 4,
            guaranteedNight: 5,
            guaranteedNightWeekend: 7,
            guaranteedNightTax: 24,
            guaranteedNightWeekendTax: 29,
            clientDailyDay: 152,
            clientDailyDayWknd: 176,
            deliverymanDailyDay: 108,
            deliverymanDailyDayWknd: 121,
            clientPerDelivery: 7.5,
            deliverymanPerDelivery: 4.2,
            clientAdditionalKm: 2,
            deliverymanAdditionalKm: 1.3,
            isMotolinkCovered: true,
          },
        },
        {
          name: "Brasa da Praia Recreio",
          cnpj: "54036571000103",
          contactName: "Priscila Andrade",
          contactPhone: "21996443004",
          cep: "22790110",
          street: "Avenida Gilka Machado",
          number: "920",
          complement: "Terreo",
          neighborhood: "Recreio dos Bandeirantes",
          city: "Rio de Janeiro",
          uf: "RJ",
          observations: "Raio mais longo, atendimento concentrado em condominio e almoco de domingo.",
          provideMeal: true,
          groupName: "Operacao Premium",
          regionName: "Barra e Recreio",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 10,
            paymentForm: ["DAILY"],
            dailyPeriods: ["WEEK_DAY", "WEEKEND_DAY"],
            deliveryAreaKm: 12,
            rainTax: 6,
            clientDailyDay: 172,
            clientDailyDayWknd: 194,
            deliverymanDailyDay: 122,
            deliverymanDailyDayWknd: 136,
            clientAdditionalKm: 3.2,
            deliverymanAdditionalKm: 1.8,
          },
        },
      ],
      deliverymen: [
        {
          name: "Matheus Silva",
          document: "69131932037",
          phone: "21999990001",
          contractType: "FREELANCER",
          mainPixKey: "21999990001",
          secondPixKey: "matheus.silva@pix.com",
          agency: "0001",
          account: "239871-0",
          vehicleModel: "Honda CG 160",
          vehiclePlate: "RJQ2A41",
          vehicleColor: "Preta",
          regionName: "Zona Sul",
          isBlocked: false,
        },
        {
          name: "Leonardo Gomes",
          document: "77503908041",
          phone: "21999990002",
          contractType: "INDEPENDENT_COLLABORATOR",
          mainPixKey: "leonardo.gomes@pix.com",
          secondPixKey: "21999990002",
          agency: "0132",
          account: "541209-8",
          vehicleModel: "Yamaha Factor 150",
          vehiclePlate: "RJP8C66",
          vehicleColor: "Branca",
          regionName: "Barra e Recreio",
          isBlocked: false,
        },
        {
          name: "Bruno Telles",
          document: "41375377043",
          phone: "21999990003",
          contractType: "FREELANCER",
          mainPixKey: "bruno.telles@pix.com",
          agency: "2901",
          account: "108774-5",
          vehicleModel: "Honda Biz 125",
          vehiclePlate: "RJK6H92",
          vehicleColor: "Vermelha",
          regionName: "Centro e Tijuca",
          isBlocked: false,
        },
        {
          name: "Ramon Oliveira",
          document: "83277488020",
          phone: "21999990004",
          contractType: "FREELANCER",
          mainPixKey: "21999990004",
          agency: "1120",
          account: "440981-2",
          vehicleModel: "Honda CG 160",
          vehiclePlate: "RJL3M18",
          vehicleColor: "Cinza",
          regionName: "Centro e Tijuca",
          isBlocked: true,
        },
      ],
    },
    {
      code: "SP",
      name: "Sao Paulo",
      address: "Avenida Paulista, 1374 - Bela Vista, Sao Paulo - SP",
      whatsappUrl: "https://wa.me/5511994003002",
      users: [
        {
          name: "Tiago Moreira",
          email: "gerente.sp@gmail.com",
          role: "MANAGER",
          status: "ACTIVE",
          phone: "11998112001",
          document: "56922137010",
          birthDate: "1985-06-22",
        },
        {
          name: "Juliana Duarte",
          email: "user.sp.active@gmail.com",
          role: "USER",
          status: "ACTIVE",
          phone: "11998112002",
          document: "31740826074",
          birthDate: "1994-03-03",
        },
        {
          name: "Vitoria Campos",
          email: "user.sp.pending@gmail.com",
          role: "USER",
          status: "PENDING",
          phone: "11998112003",
          document: "28604067031",
          birthDate: "1999-07-27",
        },
        {
          name: "Andre Sa",
          email: "user.sp.blocked@gmail.com",
          role: "USER",
          status: "BLOCKED",
          phone: "11998112004",
          document: "95478258072",
          birthDate: "1989-10-15",
        },
      ],
      groups: [
        {
          name: "Hubs Corporativos",
          description: "Clientes de escritorio e almoco executivo em zonas de alta densidade.",
        },
        {
          name: "Casual Dining",
          description: "Operacoes de ticket medio com demanda mais equilibrada ao longo do dia.",
        },
        {
          name: "Operacoes Madrugada",
          description: "Marcas com reforco no jantar tardio e virada de madrugada.",
        },
      ],
      regions: [
        {
          name: "Paulista e Jardins",
          description: "Restaurantes premium, hoteis e polos corporativos.",
        },
        {
          name: "Pinheiros e Itaim",
          description: "Dark kitchens, bares e operacoes com alta densidade residencial.",
        },
        {
          name: "Mooca e Tatuape",
          description: "Bairros de entrega recorrente e raio medio mais previsivel.",
        },
      ],
      clients: [
        {
          name: "Cantina Jardins",
          cnpj: "78241836000172",
          contactName: "Renata Siqueira",
          contactPhone: "11996443011",
          cep: "01414000",
          street: "Alameda Lorena",
          number: "1680",
          neighborhood: "Jardins",
          city: "Sao Paulo",
          uf: "SP",
          observations: "Fluxo forte no almoco executivo e boa previsibilidade de segunda a quinta.",
          provideMeal: true,
          groupName: "Hubs Corporativos",
          regionName: "Paulista e Jardins",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 16,
            paymentForm: ["DAILY"],
            dailyPeriods: WEEKDAY_PERIODS,
            deliveryAreaKm: 7,
            rainTax: 5,
            clientDailyDay: 178,
            clientDailyNight: 0,
            deliverymanDailyDay: 128,
            deliverymanDailyNight: 0,
            clientAdditionalKm: 2.4,
            deliverymanAdditionalKm: 1.2,
          },
        },
        {
          name: "Nori Station Pinheiros",
          cnpj: "39517264000109",
          contactName: "Paulo Higa",
          contactPhone: "11996443012",
          cep: "05422001",
          street: "Rua dos Pinheiros",
          number: "738",
          complement: "Salao 2",
          neighborhood: "Pinheiros",
          city: "Sao Paulo",
          uf: "SP",
          observations: "Jantar muito intenso com necessidade garantida tambem em fim de semana.",
          provideMeal: false,
          groupName: "Casual Dining",
          regionName: "Pinheiros e Itaim",
          commercialCondition: {
            bagsStatus: "OWN",
            bagsAllocated: 0,
            paymentForm: ["GUARANTEED"],
            guaranteedPeriods: ["WEEK_NIGHT", "WEEKEND_NIGHT"],
            deliveryAreaKm: 8.5,
            isMotolinkCovered: true,
            guaranteedNight: 7,
            guaranteedNightWeekend: 9,
            guaranteedNightTax: 28,
            guaranteedNightWeekendTax: 32,
          },
        },
        {
          name: "Forno Paulista Bela Vista",
          cnpj: "91635874000152",
          contactName: "Eduardo Salles",
          contactPhone: "11996443013",
          cep: "01311000",
          street: "Rua Treze de Maio",
          number: "1002",
          neighborhood: "Bela Vista",
          city: "Sao Paulo",
          uf: "SP",
          observations: "Combina diaria diurna com garantia noturna para absorver picos em shows e eventos.",
          provideMeal: true,
          groupName: "Operacoes Madrugada",
          regionName: "Paulista e Jardins",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 14,
            paymentForm: ["DAILY", "GUARANTEED"],
            dailyPeriods: ["WEEK_DAY", "WEEKEND_DAY"],
            guaranteedPeriods: ["WEEK_NIGHT", "WEEKEND_NIGHT"],
            deliveryAreaKm: 9,
            rainTax: 4.8,
            clientDailyDay: 169,
            clientDailyDayWknd: 189,
            deliverymanDailyDay: 121,
            deliverymanDailyDayWknd: 133,
            guaranteedNight: 6,
            guaranteedNightWeekend: 8,
            guaranteedNightTax: 25.5,
            guaranteedNightWeekendTax: 30,
            clientPerDelivery: 8,
            deliverymanPerDelivery: 4.6,
            clientAdditionalKm: 2.7,
            deliverymanAdditionalKm: 1.5,
            isMotolinkCovered: true,
          },
        },
        {
          name: "Burger da Mooca",
          cnpj: "12285479000166",
          contactName: "Gabriela Marino",
          contactPhone: "11996443014",
          cep: "03104000",
          street: "Rua da Mooca",
          number: "2465",
          neighborhood: "Mooca",
          city: "Sao Paulo",
          uf: "SP",
          observations: "Entrega concentrada em bairro e condominios; sem necessidade de bags da Motolink.",
          provideMeal: false,
          groupName: "Casual Dining",
          regionName: "Mooca e Tatuape",
          commercialCondition: {
            bagsStatus: "NONE",
            bagsAllocated: 0,
            paymentForm: ["DAILY"],
            dailyPeriods: ["WEEK_NIGHT", "WEEKEND_DAY", "WEEKEND_NIGHT"],
            deliveryAreaKm: 5.5,
            rainTax: 3.5,
            clientDailyNight: 174,
            clientDailyDayWknd: 164,
            clientDailyNightWknd: 186,
            deliverymanDailyNight: 125,
            deliverymanDailyDayWknd: 118,
            deliverymanDailyNightWknd: 135,
            clientAdditionalKm: 1.5,
            deliverymanAdditionalKm: 1,
          },
        },
      ],
      deliverymen: [
        {
          name: "Diego Araujo",
          document: "26001231010",
          phone: "11999990011",
          contractType: "INDEPENDENT_COLLABORATOR",
          mainPixKey: "diego.araujo@pix.com",
          secondPixKey: "11999990011",
          agency: "3412",
          account: "883201-4",
          vehicleModel: "Honda CG 160",
          vehiclePlate: "SPX5B74",
          vehicleColor: "Azul",
          regionName: "Paulista e Jardins",
          isBlocked: false,
        },
        {
          name: "Ruan Ferreira",
          document: "63825751002",
          phone: "11999990012",
          contractType: "FREELANCER",
          mainPixKey: "11999990012",
          secondPixKey: "ruan.ferreira@pix.com",
          agency: "1010",
          account: "557193-0",
          vehicleModel: "Yamaha Fazer 250",
          vehiclePlate: "SPM1K28",
          vehicleColor: "Preta",
          regionName: "Pinheiros e Itaim",
          isBlocked: false,
        },
        {
          name: "Felipe Nogueira",
          document: "58014578099",
          phone: "11999990013",
          contractType: "FREELANCER",
          mainPixKey: "felipe.nogueira@pix.com",
          agency: "5004",
          account: "120884-1",
          vehicleModel: "Honda Biz 125",
          vehiclePlate: "SPT7P36",
          vehicleColor: "Branca",
          regionName: "Mooca e Tatuape",
          isBlocked: false,
        },
        {
          name: "Mauricio Neves",
          document: "79135406073",
          phone: "11999990014",
          contractType: "INDEPENDENT_COLLABORATOR",
          mainPixKey: "mauricio.neves@pix.com",
          agency: "3320",
          account: "771265-9",
          vehicleModel: "Honda CG 160",
          vehiclePlate: "SPO2E41",
          vehicleColor: "Cinza",
          regionName: "Pinheiros e Itaim",
          isBlocked: true,
        },
      ],
    },
    {
      code: "CAM",
      name: "Campinas",
      address: "Avenida Jose de Souza Campos, 1073 - Cambui, Campinas - SP",
      whatsappUrl: "https://wa.me/5519994003003",
      users: [
        {
          name: "Patricia Faria",
          email: "gerente.cam@gmail.com",
          role: "MANAGER",
          status: "ACTIVE",
          phone: "19998112001",
          document: "10589354007",
          birthDate: "1986-02-14",
        },
        {
          name: "Lucas Ferreira",
          email: "user.cam.active@gmail.com",
          role: "USER",
          status: "ACTIVE",
          phone: "19998112002",
          document: "50914747070",
          birthDate: "1996-12-08",
        },
        {
          name: "Ana Clara Torres",
          email: "user.cam.pending@gmail.com",
          role: "USER",
          status: "PENDING",
          phone: "19998112003",
          document: "74295652003",
          birthDate: "2000-05-20",
        },
        {
          name: "Sergio Mendes",
          email: "user.cam.blocked@gmail.com",
          role: "USER",
          status: "BLOCKED",
          phone: "19998112004",
          document: "83615215096",
          birthDate: "1990-09-30",
        },
      ],
      groups: [
        {
          name: "Restaurantes de Bairro",
          description: "Operacoes com recorrencia alta em bairros residenciais e tickets medios.",
        },
        {
          name: "Operacoes Universitarias",
          description: "Clientes impactados por fluxo academico e picos noturnos concentrados.",
        },
        {
          name: "Redes Expansao Interior",
          description: "Marcas padronizadas com uso frequente de bags e cobertura por raio.",
        },
      ],
      regions: [
        {
          name: "Centro",
          description: "Lojas tradicionais, almoco executivo e radios curtos.",
        },
        {
          name: "Cambui e Taquaral",
          description: "Restaurantes premium, condominios e maior ticket medio.",
        },
        {
          name: "Barao Geraldo",
          description: "Demanda noturna universitaria e operacao espalhada.",
        },
      ],
      clients: [
        {
          name: "Emporio Cambui",
          cnpj: "30748156000141",
          contactName: "Helena Peixoto",
          contactPhone: "19996443021",
          cep: "13024001",
          street: "Rua Coronel Quirino",
          number: "1420",
          neighborhood: "Cambui",
          city: "Campinas",
          uf: "SP",
          observations: "Atendimento premium em horario comercial e reforco leve em sabado no almoco.",
          provideMeal: true,
          groupName: "Redes Expansao Interior",
          regionName: "Cambui e Taquaral",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 8,
            paymentForm: ["DAILY"],
            dailyPeriods: ["WEEK_DAY", "WEEKEND_DAY"],
            deliveryAreaKm: 6.5,
            rainTax: 4.2,
            clientDailyDay: 154,
            clientDailyDayWknd: 171,
            deliverymanDailyDay: 111,
            deliverymanDailyDayWknd: 123,
            clientAdditionalKm: 2.2,
            deliverymanAdditionalKm: 1.1,
          },
        },
        {
          name: "Grill Taquaral",
          cnpj: "88574162000158",
          contactName: "Marcelo Cunha",
          contactPhone: "19996443022",
          cep: "13076212",
          street: "Avenida Heitor Penteado",
          number: "1400",
          neighborhood: "Taquaral",
          city: "Campinas",
          uf: "SP",
          observations: "Demanda estavel durante a semana e agenda maior aos domingos.",
          provideMeal: false,
          groupName: "Restaurantes de Bairro",
          regionName: "Cambui e Taquaral",
          commercialCondition: {
            bagsStatus: "OWN",
            bagsAllocated: 0,
            paymentForm: ["GUARANTEED"],
            guaranteedPeriods: ["WEEK_DAY", "WEEKEND_DAY"],
            deliveryAreaKm: 7,
            guaranteedDay: 3,
            guaranteedDayWeekend: 5,
            guaranteedDayTax: 19.5,
            guaranteedDayWeekendTax: 23,
            isMotolinkCovered: false,
          },
        },
        {
          name: "Asian Box Barao",
          cnpj: "55493018000197",
          contactName: "Camila Yamada",
          contactPhone: "19996443023",
          cep: "13084000",
          street: "Avenida Santa Isabel",
          number: "275",
          complement: "Galeria A",
          neighborhood: "Barao Geraldo",
          city: "Campinas",
          uf: "SP",
          observations:
            "Pico noturno puxado por campus e condominios proximos; mistura diaria com entrega por corrida.",
          provideMeal: false,
          groupName: "Operacoes Universitarias",
          regionName: "Barao Geraldo",
          commercialCondition: {
            bagsStatus: "NONE",
            bagsAllocated: 0,
            paymentForm: ["DAILY", "GUARANTEED"],
            dailyPeriods: ["WEEK_DAY"],
            guaranteedPeriods: ["WEEK_NIGHT", "WEEKEND_NIGHT"],
            deliveryAreaKm: 10,
            rainTax: 3.8,
            clientDailyDay: 146,
            deliverymanDailyDay: 104,
            guaranteedNight: 4,
            guaranteedNightWeekend: 6,
            guaranteedNightTax: 21.5,
            guaranteedNightWeekendTax: 26,
            clientPerDelivery: 7,
            deliverymanPerDelivery: 4,
            clientAdditionalKm: 2.8,
            deliverymanAdditionalKm: 1.4,
            isMotolinkCovered: true,
          },
        },
        {
          name: "Patio Centro Campinas",
          cnpj: "63015429000164",
          contactName: "Fabio Leal",
          contactPhone: "19996443024",
          cep: "13010001",
          street: "Rua Conceicao",
          number: "620",
          neighborhood: "Centro",
          city: "Campinas",
          uf: "SP",
          observations: "Carteira tradicional de almoco, com demanda curta em raio central.",
          provideMeal: true,
          groupName: "Restaurantes de Bairro",
          regionName: "Centro",
          commercialCondition: {
            bagsStatus: "COMPANY",
            bagsAllocated: 6,
            paymentForm: ["DAILY"],
            dailyPeriods: WEEKDAY_PERIODS,
            deliveryAreaKm: 4.5,
            clientDailyDay: 149,
            clientDailyNight: 158,
            deliverymanDailyDay: 107,
            deliverymanDailyNight: 114,
            clientAdditionalKm: 1.4,
            deliverymanAdditionalKm: 0.9,
          },
        },
      ],
      deliverymen: [
        {
          name: "Caio Brito",
          document: "41672662011",
          phone: "19999990021",
          contractType: "FREELANCER",
          mainPixKey: "19999990021",
          secondPixKey: "caio.brito@pix.com",
          agency: "2100",
          account: "660192-0",
          vehicleModel: "Honda CG 160",
          vehiclePlate: "CAM4D29",
          vehicleColor: "Preta",
          regionName: "Centro",
          isBlocked: false,
        },
        {
          name: "Henrique Lopes",
          document: "51763945061",
          phone: "19999990022",
          contractType: "INDEPENDENT_COLLABORATOR",
          mainPixKey: "henrique.lopes@pix.com",
          secondPixKey: "19999990022",
          agency: "0874",
          account: "985004-3",
          vehicleModel: "Yamaha Factor 150",
          vehiclePlate: "CAM8F41",
          vehicleColor: "Azul",
          regionName: "Cambui e Taquaral",
          isBlocked: false,
        },
        {
          name: "Yuri Almeida",
          document: "29034716084",
          phone: "19999990023",
          contractType: "FREELANCER",
          mainPixKey: "yuri.almeida@pix.com",
          agency: "4110",
          account: "332145-8",
          vehicleModel: "Honda Biz 125",
          vehiclePlate: "CAM1J83",
          vehicleColor: "Branca",
          regionName: "Barao Geraldo",
          isBlocked: false,
        },
        {
          name: "Rodrigo Xavier",
          document: "64315897031",
          phone: "19999990024",
          contractType: "FREELANCER",
          mainPixKey: "19999990024",
          agency: "1198",
          account: "441903-7",
          vehicleModel: "Honda CG 160",
          vehiclePlate: "CAM9L52",
          vehicleColor: "Vermelha",
          regionName: "Cambui e Taquaral",
          isBlocked: true,
        },
      ],
    },
  ],
};

async function upsertUser(params: {
  name: string;
  email: string;
  role: string;
  status: string;
  branches: string[];
  passwordHash: string;
  phone?: string;
  document?: string;
  birthDate?: string;
}) {
  const permissions = ROLE_PERMISSIONS.find((rp) => rp.role === params.role)?.permissions ?? [];

  const user = await db.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name,
      password: params.passwordHash,
      role: params.role,
      status: params.status,
      branches: params.branches,
      permissions,
      phone: params.phone ?? null,
      document: params.document ?? null,
      birthDate: params.birthDate ? new Date(params.birthDate) : null,
    },
    create: {
      name: params.name,
      email: params.email,
      password: params.passwordHash,
      role: params.role,
      status: params.status,
      branches: params.branches,
      permissions,
      phone: params.phone ?? null,
      document: params.document ?? null,
      birthDate: params.birthDate ? new Date(params.birthDate) : null,
    },
  });

  console.log(`USER ensured: ${user.email}`);
}

async function main() {
  const defaultPasswordHash = await hash().create(DEFAULT_PASSWORD);

  const branchRecords = new Map<string, { id: string; code: string; name: string }>();

  for (const branchData of data.branches) {
    const branch = await db.branch.upsert({
      where: { code: branchData.code },
      update: {
        name: branchData.name,
        address: branchData.address,
        whatsappUrl: branchData.whatsappUrl,
      },
      create: {
        code: branchData.code,
        name: branchData.name,
        address: branchData.address,
        whatsappUrl: branchData.whatsappUrl,
      },
    });

    branchRecords.set(branch.code, { id: branch.id, code: branch.code, name: branch.name });
    console.log(`BRANCH ensured: ${branch.code} - ${branch.name}`);
  }

  const allBranchIds = [...branchRecords.values()].map((branch) => branch.id);

  for (const admin of data.admins) {
    await upsertUser({
      ...admin,
      branches: allBranchIds,
      passwordHash: defaultPasswordHash,
    });
  }

  for (const branchData of data.branches) {
    const branch = branchRecords.get(branchData.code);
    if (!branch) {
      throw new Error(`Branch not found for code: ${branchData.code}`);
    }

    for (const userData of branchData.users) {
      await upsertUser({
        ...userData,
        branches: [branch.id],
        passwordHash: defaultPasswordHash,
      });
    }
  }

  for (const branchData of data.branches) {
    const branch = branchRecords.get(branchData.code);
    if (!branch) {
      throw new Error(`Branch not found for code: ${branchData.code}`);
    }

    await db.client.deleteMany({ where: { branchId: branch.id } });
    await db.deliveryman.deleteMany({ where: { branchId: branch.id } });
    await db.group.deleteMany({ where: { branchId: branch.id } });
    await db.region.deleteMany({ where: { branchId: branch.id } });

    const groupsByName = new Map<string, string>();
    for (const groupData of branchData.groups) {
      const group = await db.group.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          branchId: branch.id,
        },
      });

      groupsByName.set(group.name, group.id);
      console.log(`GROUP created: ${group.name}`);
    }

    const regionsByName = new Map<string, string>();
    for (const regionData of branchData.regions) {
      const region = await db.region.create({
        data: {
          name: regionData.name,
          description: regionData.description,
          branchId: branch.id,
        },
      });

      regionsByName.set(region.name, region.id);
      console.log(`REGION created: ${region.name}`);
    }

    for (const clientData of branchData.clients) {
      const client = await db.client.create({
        data: {
          name: clientData.name,
          cnpj: clientData.cnpj,
          contactName: clientData.contactName,
          contactPhone: clientData.contactPhone,
          cep: clientData.cep,
          street: clientData.street,
          number: clientData.number,
          complement: clientData.complement ?? null,
          neighborhood: clientData.neighborhood,
          city: clientData.city,
          uf: clientData.uf,
          observations: clientData.observations,
          provideMeal: clientData.provideMeal,
          branchId: branch.id,
          groupId: clientData.groupName ? (groupsByName.get(clientData.groupName) ?? null) : null,
          regionId: clientData.regionName ? (regionsByName.get(clientData.regionName) ?? null) : null,
          commercialCondition: {
            create: clientData.commercialCondition,
          },
        },
      });

      console.log(`CLIENT created: ${client.name}`);
    }

    for (const deliverymanData of branchData.deliverymen) {
      const deliveryman = await db.deliveryman.create({
        data: {
          name: deliverymanData.name,
          document: deliverymanData.document,
          phone: deliverymanData.phone,
          contractType: deliverymanData.contractType,
          mainPixKey: deliverymanData.mainPixKey,
          secondPixKey: deliverymanData.secondPixKey ?? null,
          agency: deliverymanData.agency ?? null,
          account: deliverymanData.account ?? null,
          vehicleModel: deliverymanData.vehicleModel ?? null,
          vehiclePlate: deliverymanData.vehiclePlate ?? null,
          vehicleColor: deliverymanData.vehicleColor ?? null,
          branchId: branch.id,
          regionId: deliverymanData.regionName ? (regionsByName.get(deliverymanData.regionName) ?? null) : null,
          isBlocked: deliverymanData.isBlocked,
        },
      });

      console.log(`DELIVERYMAN created: ${deliveryman.name}${deliveryman.isBlocked ? " (BLOCKED)" : ""}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await db.$disconnect();
      await pool.end();
      process.exit();
    } catch (_) {
      // ignore
    }
  });
