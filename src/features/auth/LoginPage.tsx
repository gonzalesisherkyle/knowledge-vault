import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBranding } from './AuthBranding';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const responseCode = (response: any) =>
    typeof response.error === 'object' && response.error ? response.error.code : undefined;
  const responseMessage = (response: any, fallback: string) =>
    typeof response.error === 'string' ? response.error : response.error?.message || fallback;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await login({ email, password });
      if (response.success) {
        navigate('/');
      } else if (responseCode(response) === 'EMAIL_NOT_VERIFIED') {
        setVerificationEmail(email);
        setError(responseMessage(response, 'Please verify your email before signing in.'));
      } else {
        setError(responseMessage(response, 'Invalid email or password'));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await verifyEmail({ email: verificationEmail, code });
      if (response.success) {
        navigate('/');
      } else {
        setError(responseMessage(response, 'Verification failed.'));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await resendVerification(verificationEmail || email);
      if (response.success) {
        setVerificationEmail(verificationEmail || email);
        setNotice('A new verification code has been sent.');
      } else {
        setError(responseMessage(response, 'Could not resend verification code.'));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-background font-sans overflow-hidden">
      <AuthBranding />

      {/* Right Panel: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        {/* Mobile only branding */}
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-sm font-bold tracking-tight">KnowledgeVault</span>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
            <CardHeader className="space-y-1.5 pb-6 pt-8 px-8 text-center md:text-left">
              <CardTitle className="text-2xl font-extrabold tracking-tight">
                {verificationEmail ? 'Verify Email' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground font-medium">
                {verificationEmail ? verificationEmail : 'Access your research workspace.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-4">
              <form onSubmit={verificationEmail ? handleVerify : handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-bold animate-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[13px] font-bold animate-in slide-in-from-top-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    {notice}
                  </div>
                )}
                
                {verificationEmail ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Verification Code</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        inputMode="numeric"
                        className="pl-12 h-11 bg-secondary/30 border-border/50 font-medium rounded-xl transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="pl-12 h-11 bg-secondary/30 border-border/50 font-medium rounded-xl transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                        <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Forgot?</a>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-12 h-11 bg-secondary/30 border-border/50 font-medium rounded-xl transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 font-bold text-[13px] uppercase tracking-widest bg-primary text-primary-foreground shadow-xl shadow-primary/10 hover:translate-y-[-0.5px] active:translate-y-[0.5px] transition-all duration-200"
                  disabled={isSubmitting || (verificationEmail ? code.length !== 6 : false)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-3" />
                      {verificationEmail ? 'Checking...' : 'Verifying...'}
                    </>
                  ) : (
                    verificationEmail ? 'Verify Email' : 'Enter Workspace'
                  )}
                </Button>
                {verificationEmail && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-9 text-[11px] font-bold uppercase tracking-widest"
                    disabled={isSubmitting}
                    onClick={handleResend}
                  >
                    Resend Code
                  </Button>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pb-8 pt-4 px-8">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest">
                  <span className="bg-card px-3 text-muted-foreground/40">New to the platform?</span>
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground font-medium text-center w-full">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
