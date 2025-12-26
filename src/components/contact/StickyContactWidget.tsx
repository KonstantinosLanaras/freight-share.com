import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactInfo {
  name?: string;
  company?: string;
  role?: 'shipper' | 'carrier' | 'support';
  email?: string;
  phone?: string;
  referenceId?: string;
  preferredContact?: 'email' | 'phone' | 'platform';
}

interface StickyContactWidgetProps {
  contact: ContactInfo;
  className?: string;
}

export function StickyContactWidget({ contact, className = '' }: StickyContactWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const roleColors = {
    shipper: 'bg-shipper/20 text-shipper-foreground',
    carrier: 'bg-carrier/20 text-carrier-foreground',
    support: 'bg-primary/20 text-primary',
  };

  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Contact
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {contact.name && (
                <div className="font-medium text-foreground truncate">{contact.name}</div>
              )}
              {contact.company && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span className="truncate">{contact.company}</span>
                </div>
              )}
              {contact.role && (
                <Badge className={`mt-1 text-xs ${roleColors[contact.role]}`}>
                  {contact.role.charAt(0).toUpperCase() + contact.role.slice(1)}
                </Badge>
              )}
            </div>
          </div>

          {/* Reference ID */}
          {contact.referenceId && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Reference ID</div>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-foreground">{contact.referenceId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(contact.referenceId!, 'Reference ID')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Contact Methods */}
          <div className="space-y-2">
            {contact.email && (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground truncate max-w-[140px]">{contact.email}</span>
                  {contact.preferredContact === 'email' && (
                    <Badge variant="outline" className="text-xs">Preferred</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(contact.email!, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a href={`mailto:${contact.email}`}>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{contact.phone}</span>
                  {contact.preferredContact === 'phone' && (
                    <Badge variant="outline" className="text-xs">Preferred</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(contact.phone!, 'Phone')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a href={`tel:${contact.phone}`}>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-border space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Mobile floating button version
interface FloatingContactButtonProps {
  onClick: () => void;
}

export function FloatingContactButton({ onClick }: FloatingContactButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 lg:hidden"
      size="icon"
    >
      <User className="h-6 w-6" />
    </Button>
  );
}
