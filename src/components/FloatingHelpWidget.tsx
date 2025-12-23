import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Headphones, 
  X, 
  Phone, 
  MessageSquare, 
  Mail 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FloatingHelpWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-card border border-border rounded-xl shadow-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-foreground text-sm">{t('howItWorks.supportTitle')}</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <a 
              href={`tel:${t('howItWorks.phoneNumber')}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{t('howItWorks.phoneOption')}</div>
                <div className="text-xs text-muted-foreground">{t('howItWorks.phoneNumber')}</div>
              </div>
            </a>
            <button 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{t('howItWorks.chatOption')}</div>
                <div className="text-xs text-muted-foreground">Live chat</div>
              </div>
            </button>
            <a 
              href={`mailto:${t('howItWorks.emailAddress')}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{t('howItWorks.emailOption')}</div>
                <div className="text-xs text-muted-foreground">{t('howItWorks.emailAddress')}</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Headphones className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};
