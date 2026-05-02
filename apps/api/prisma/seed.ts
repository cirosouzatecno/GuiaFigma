import { AvisoTipo, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.atividadeAdmin.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.aviso.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.expositor.deleteMany();
  await prisma.infoGeral.deleteMany();
  await prisma.adminUser.deleteMany();

  await prisma.evento.createMany({
    data: [
      {
        titulo: "Abertura Oficial",
        subtitulo: "Cerimônia de boas-vindas",
        horario: "09:00",
        local: "Arena Principal",
        dia: new Date("2026-07-10T09:00:00-03:00"),
        categoria: "Institucional",
        iconKey: "ribbon",
        cor: "#14532d",
        descricao:
          "Abertura da Expo Rio Preto 2026 com autoridades, organizadores e convidados."
      },
      {
        titulo: "Julgamento de Gado Nelore",
        subtitulo: "Etapa classificatória",
        horario: "10:30",
        local: "Pista de Julgamento",
        dia: new Date("2026-07-10T10:30:00-03:00"),
        categoria: "Pecuária",
        iconKey: "award",
        cor: "#b45309",
        descricao:
          "Avaliação técnica dos animais participantes da categoria Nelore."
      },
      {
        titulo: "Palestra: Tecnologia no Campo",
        subtitulo: "Inovação para pequenos e médios produtores",
        horario: "14:00",
        local: "Auditório AgroTech",
        dia: new Date("2026-07-10T14:00:00-03:00"),
        categoria: "Conhecimento",
        iconKey: "cpu",
        cor: "#0369a1",
        descricao:
          "Painel sobre sensores, gestão de safra e conectividade rural."
      },
      {
        titulo: "Show Regional",
        subtitulo: "Música ao vivo na praça de alimentação",
        horario: "20:00",
        local: "Palco Cultural",
        dia: new Date("2026-07-10T20:00:00-03:00"),
        categoria: "Entretenimento",
        iconKey: "music",
        cor: "#be123c",
        descricao:
          "Apresentação musical para visitantes e expositores no encerramento do dia."
      }
    ]
  });

  await prisma.expositor.createMany({
    data: [
      {
        nome: "AgroMáquinas Rio Preto",
        estande: "A12",
        categoria: "Máquinas e Implementos",
        emoji: "🚜",
        corPrimaria: "#14532d",
        corFundo: "#dcfce7",
        descricao:
          "Tratores, plantadeiras e soluções de manutenção para propriedades rurais.",
        contato: "(17) 3000-1001",
        site: "https://agromaquinas.example.com"
      },
      {
        nome: "Sementes Noroeste",
        estande: "B08",
        categoria: "Insumos",
        emoji: "🌱",
        corPrimaria: "#166534",
        corFundo: "#ecfccb",
        descricao:
          "Cultivares adaptadas ao clima do noroeste paulista e consultoria técnica.",
        contato: "(17) 3000-1002",
        site: "https://sementesnoroeste.example.com"
      },
      {
        nome: "Laticínios Boa Serra",
        estande: "C03",
        categoria: "Alimentos",
        emoji: "🧀",
        corPrimaria: "#b45309",
        corFundo: "#fef3c7",
        descricao:
          "Queijos artesanais, doces de leite e degustação de produtos regionais.",
        contato: "(17) 3000-1003",
        site: "https://boaserra.example.com"
      },
      {
        nome: "AgroTech Labs",
        estande: "D15",
        categoria: "Tecnologia",
        emoji: "📡",
        corPrimaria: "#0369a1",
        corFundo: "#e0f2fe",
        descricao:
          "Plataforma de monitoramento de lavouras, clima e produtividade em tempo real.",
        contato: "(17) 3000-1004",
        site: "https://agrotechlabs.example.com"
      }
    ]
  });

  await prisma.aviso.createMany({
    data: [
      {
        tipo: AvisoTipo.DESTAQUE,
        titulo: "Portões abertos",
        mensagem:
          "A Expo Rio Preto 2026 já está recebendo visitantes pela entrada principal.",
        tempo: "Agora"
      },
      {
        tipo: AvisoTipo.AVISO,
        titulo: "Estacionamento",
        mensagem:
          "Há vagas disponíveis no setor norte, com acesso sinalizado pela Avenida Expo.",
        tempo: "Há 15 min"
      },
      {
        tipo: AvisoTipo.NOTICIA,
        titulo: "Nova palestra confirmada",
        mensagem:
          "O Auditório AgroTech recebe uma conversa sobre agricultura regenerativa às 16h.",
        tempo: "Há 35 min"
      },
      {
        tipo: AvisoTipo.ALERTA,
        titulo: "Atenção à hidratação",
        mensagem:
          "Bebedouros estão disponíveis próximos à Arena Principal e à praça de alimentação.",
        tempo: "Há 1 h"
      }
    ]
  });

  await prisma.infoGeral.createMany({
    data: [
      {
        chave: "nome_evento",
        valor: "Expo Rio Preto 2026"
      },
      {
        chave: "periodo",
        valor: "10 a 19 de julho de 2026"
      },
      {
        chave: "endereco",
        valor: "Recinto de Exposições Alberto Bertelli Lucatto, São José do Rio Preto - SP"
      },
      {
        chave: "horario_funcionamento",
        valor: "Das 09:00 às 23:00"
      },
      {
        chave: "telefone_atendimento",
        valor: "(17) 3000-2026"
      }
    ]
  });

  const senhaHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.adminUser.create({
    data: {
      usuario: "admin",
      senhaHash,
      nome: "Administrador Expo"
    }
  });

  await prisma.atividadeAdmin.create({
    data: {
      adminUserId: admin.id,
      acao: "SEED",
      entidade: "Sistema",
      descricao: "Dados fictícios iniciais da Expo Rio Preto 2026 foram criados."
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
