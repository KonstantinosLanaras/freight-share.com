import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ShipperVerificationForm } from '@/components/verification/ShipperVerificationForm';

export default function ShipperVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const handleSuccess = () => {
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate('/dashboard/shipper');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Business Verification</h1>
              <p className="text-sm text-muted-foreground">
                Complete your business details to proceed with payments
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <ShipperVerificationForm onSuccess={handleSuccess} />
      </main>
    </div>
  );
}
