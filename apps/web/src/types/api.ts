export interface Evento {
  id: string;
  titulo: string;
  subtitulo: string | null;
  horario: string;
  local: string;
  dia: string;
  inicio?: string | null;
  fim?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  categoria: string;
  iconKey: string;
  cor: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Expositor {
  id: string;
  nome: string;
  estande: string;
  categoria: string;
  emoji: string;
  corPrimaria: string;
  corFundo: string;
  descricao: string | null;
  contato: string | null;
  site: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Informacao {
  [key: string]: string;
}

export interface BuscaResponse {
  termo: string;
  resultados: {
    eventos: Evento[];
    expositores: Expositor[];
    informacoes: Array<{
      id: string;
      chave: string;
      valor: string;
      atualizadoEm: string;
    }>;
  };
}
