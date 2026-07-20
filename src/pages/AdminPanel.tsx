import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck,
  User,
  LogOut,
  Menu,
  X,
  Loader2,
  ShieldCheck,
  ShieldX,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CarrierVerification {
  id: string;
  carrier_id: string;
  document_type: string;
  document_url: string;
  submitted_at: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  profiles: {
    full_name: string | null;
    company_name: string | null;
    email: string;
    legal_company_name: string | null;
    vat_number: string | null;
    registered_address: string | null;
  };
}

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifications, setVerifications] = useState<CarrierVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<CarrierVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, totalUsers: 0 });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch verifications
      const { data: verificationsData, error } = await supabase
        .from('carrier_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each verification
      const verificationWithProfiles: CarrierVerification[] = [];
      for (const v of verificationsData || []) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, company_name, email, legal_company_name, vat_number, registered_address')
          .eq('id', v.carrier_id)
          .maybeSingle();
        
        verificationWithProfiles.push({
          ...v,
          profiles: profileData || {
            full_name: null,
            company_name: null,
            email: '',
            legal_company_name: null,
            vat_number: null,
            registered_address: null
          }
        } as CarrierVerification);
      }

      setVerifications(verificationWithProfiles);

      // Calculate stats
      const pending = verificationWithProfiles.filter(v => v.status === 'pending').length;
      const verified = verificationWithProfiles.filter(v => v.status === 'verified').length;
      const rejected = verificationWithProfiles.filter(v => v.status === 'rejected').length;

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({ pending, verified, rejected, totalUsers: totalUsers || 0 });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verification: CarrierVerification) => {
    setProcessing(true);
    try {
      // Update verification status
      const { error: verificationError } = await supabase
        .from('carrier_verifications')
        .update({ 
          status: 'verified',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', verification.id);

      if (verificationError) throw verificationError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('id', verification.carrier_id);

      if (profileError) throw profileError;

      toast.success('Carrier verified successfully');
      setSelectedVerification(null);
      fetchData();
    } catch (error: any) {
      console.error('Error approving:', error);
      toast.error(error.message || 'Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verification: CarrierVerification) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      // Update verification status
      const { error: verificationError } = await supabase
        .from('carrier_verifications')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', verification.id);

      if (verificationError) throw verificationError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'rejected' })
        .eq('id', verification.carrier_id);

      if (profileError) throw profileError;

      toast.success('Verification rejected');
      setSelectedVerification(null);
      setRejectionReason('');
      fetchData();
    } catch (error: any) {
      console.error('Error rejecting:', error);
      toast.error(error.message || 'Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDocumentUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('verification-documents')
      .createSignedUrl(path, 3600); // 1 hour expiry
    return data?.signedUrl;
  };

  const openDocument = async (path: string) => {
    const url = await getDocumentUrl(path);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Failed to load document');
    }
  };

  const documentTypeLabels: Record<string, string> = {
    insurance: 'Transport Insurance Certificate',
    license: 'Transport License',
    registration: 'Company Registration Extract',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold">FreightShare Admin</span>
        </div>
        <div className="w-6" />
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Truck className="h-8 w-8 text-sidebar-primary" />
                <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
              </div>
              <span className="font-heading font-bold text-lg text-sidebar-foreground">
                Freight<span className="text-accent">Share</span>
              </span>
            </Link>
            <button 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-6 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/20 rounded-full text-destructive-foreground text-sm">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link 
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <ShieldCheck className="h-5 w-5" />
              Verifications
            </Link>
            <Link 
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Users className="h-5 w-5" />
              Users
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  Admin
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                  Carrier Verifications
                </h1>
                <p className="text-muted-foreground mt-1">
                  Review and approve carrier verification requests.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.verified}</div>
                        <div className="text-sm text-muted-foreground">Verified</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-destructive" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.rejected}</div>
                        <div className="text-sm text-muted-foreground">Rejected</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verifications List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Verification Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {verifications.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No verifications yet</h3>
                      <p className="text-muted-foreground">Carrier verification requests will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {verifications.map((verification) => (
                        <div 
                          key={verification.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-carrier/10 flex items-center justify-center shrink-0">
                              <Truck className="h-5 w-5 text-carrier" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {verification.profiles?.legal_company_name || verification.profiles?.company_name || 'Unknown Company'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {verification.profiles?.email} · VAT: {verification.profiles?.vat_number || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {documentTypeLabels[verification.document_type]} · Submitted {format(new Date(verification.submitted_at), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <VerificationBadge status={verification.status} size="sm" showTooltip={false} />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedVerification(verification)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
            <DialogDescription>
              Review the carrier's business details and verification document.
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Legal Company Name</div>
                  <div className="font-medium">{selectedVerification.profiles?.legal_company_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">VAT Number</div>
                  <div className="font-medium">{selectedVerification.profiles?.vat_number || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Registered Address</div>
                  <div className="font-medium">{selectedVerification.profiles?.registered_address || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Document Type</div>
                  <div className="font-medium">{documentTypeLabels[selectedVerification.document_type]}</div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => openDocument(selectedVerification.document_url)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Uploaded Document
              </Button>

              {selectedVerification.status === 'pending' && (
                <>
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Rejection Reason (if rejecting)</div>
                    <Textarea 
                      placeholder="Explain why the verification is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleReject(selectedVerification)}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                      Reject
                    </Button>
                    <Button 
                      variant="default" 
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => handleApprove(selectedVerification)}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      Approve
                    </Button>
                  </div>
                </>
              )}

              {selectedVerification.status === 'rejected' && selectedVerification.rejection_reason && (
                <div className="bg-destructive/10 rounded-lg p-4">
                  <div className="text-sm font-medium text-destructive mb-1">Rejection Reason</div>
                  <div className="text-sm">{selectedVerification.rejection_reason}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}