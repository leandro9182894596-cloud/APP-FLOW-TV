import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, CreditCard, CheckCircle2, Share2, Copy, Loader2 } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface TelaRenovacaoProps {
  paymentInfo: PaymentInfo;
  onPaymentApproved: () => void;
  isOpen: boolean;
}

export function TelaRenovacao({ 
  paymentInfo, 
  onPaymentApproved, 
  isOpen 
}: TelaRenovacaoProps) {
  const [showWebView, setShowWebView] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Verificando pagamento...');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentInfo.linkPagamento);
      toast.success('Link de pagamento copiado!');
    } catch (err) {
      toast.error('Erro ao copiar o link');
    }
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá ${paymentInfo.clienteNome}! Seu acesso ao FlowTV está para vencer em ${formatDate(paymentInfo.dataVencimento)}.\n\nValor: ${formatCurrency(paymentInfo.valorPlano)}\n\nLink de pagamento: ${paymentInfo.linkPagamento}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Verificação em tempo real do pagamento (simulada)
  useEffect(() => {
    if (!isOpen || showWebView) return;

    let checkInterval: NodeJS.Timeout;
    
    const checkPaymentStatus = async () => {
      setIsCheckingStatus(true);
      
      // Aqui você integraria com sua API de pagamento para verificar o status real
      try {
        // Simulação de status
        setStatusMessage('Pagamento pendente. Aguardando confirmação...');
      } catch (error) {
        setStatusMessage('Erro ao verificar status do pagamento');
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // Verifica a cada 3 segundos
    checkInterval = setInterval(checkPaymentStatus, 3000);
    checkPaymentStatus();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isOpen, showWebView, paymentInfo.usuario]);

  const handlePaymentApproved = () => {
    setShowWebView(false);
    toast.success('Pagamento aprovado! Seu acesso foi renovado com sucesso.', {
      duration: 5000,
    });
    setTimeout(onPaymentApproved, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Renovação de Acesso</DialogTitle>
        
        {showWebView ? (
          <div className="flex flex-col h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Finalizar Pagamento</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowWebView(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <iframe
              src={paymentInfo.linkPagamento}
              className="flex-1 w-full border-0"
              title="Pagamento"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            <div className="p-4 border-t bg-muted">
              <p className="text-sm text-muted-foreground mb-3">
                Após finalizar o pagamento, clique abaixo para verificar:
              </p>
              <Button 
                className="w-full" 
                onClick={handlePaymentApproved}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verificar Pagamento
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Renove Seu Acesso</h2>
              <p className="text-muted-foreground">
                Seu acesso está prestes a vencer
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-card rounded-xl p-4 border">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Nome do Cliente</span>
                    <p className="font-medium text-lg">{paymentInfo.clienteNome}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Data de Vencimento</span>
                    <p className="font-medium text-lg">{formatDate(paymentInfo.dataVencimento)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Valor da Renovação</span>
                    <p className="font-bold text-2xl text-primary">{formatCurrency(paymentInfo.valorPlano)}</p>
                  </div>
                </div>
              </div>

              {/* QR Code usando API pública */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentInfo.linkPagamento)}`}
                    alt="QR Code de pagamento"
                    className="w-48 h-48"
                  />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Escaneie o QR Code com o aplicativo do seu banco
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setShowWebView(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar Agora
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={copyPaymentLink}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={shareWhatsApp}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{statusMessage}</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>{statusMessage}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
