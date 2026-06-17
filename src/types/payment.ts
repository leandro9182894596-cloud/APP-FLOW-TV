// Tipos para integração de pagamento
export interface PaymentInfo {
  clienteNome: string;
  dataVencimento: string;
  valorPlano: number;
  usuario: string;
  linkPagamento: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado';
}

export interface PaymentWebhook {
  usuario: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataAtualizacao?: string;
}
