
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription>
            Seu processo de pagamento foi cancelado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="mb-6 text-center text-gray-600">
            Não se preocupe, nenhum valor foi cobrado. Se precisar de ajuda ou tiver alguma dúvida, entre em contato conosco.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Ir para a Home
            </Button>
            <Button onClick={() => navigate('/pricing')}>
              Ver planos novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;
