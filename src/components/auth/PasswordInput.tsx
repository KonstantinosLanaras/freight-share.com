import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Common weak passwords to block
const COMMON_PASSWORDS = [
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  'qwerty', 'qwerty123', 'letmein', 'welcome', 'admin', 'login', 'abc123',
  'monkey', 'master', 'dragon', 'football', 'iloveyou', 'trustno1',
  'sunshine', 'princess', 'password1!', 'Password1!', 'freightshare'
];

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  key: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: 'length', label: '12+ characters', test: (p) => p.length >= 12 },
  { key: 'uppercase', label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'Number', test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showRequirements?: boolean;
  showStrength?: boolean;
  email?: string;
  name?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••••••',
  disabled = false,
  showRequirements = false,
  showStrength = false,
  email = '',
  name = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Check caps lock state
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  // Calculate password strength
  const getPasswordStrength = (): { level: 'weak' | 'medium' | 'strong'; score: number } => {
    if (!value) return { level: 'weak', score: 0 };
    
    let score = 0;
    
    // Length scoring
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (value.length >= 16) score += 1;
    
    // Complexity scoring
    if (/[A-Z]/.test(value)) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    
    // Variety bonus
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) score += 1;
    
    // Penalty for common patterns
    if (/^[a-zA-Z]+$/.test(value)) score -= 1;
    if (/^[0-9]+$/.test(value)) score -= 2;
    if (isCommonPassword(value)) score = 0;
    if (containsPersonalInfo(value)) score -= 2;
    
    score = Math.max(0, Math.min(score, 8));
    
    if (score <= 2) return { level: 'weak', score };
    if (score <= 5) return { level: 'medium', score };
    return { level: 'strong', score };
  };

  const isCommonPassword = (password: string): boolean => {
    return COMMON_PASSWORDS.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    );
  };

  const containsPersonalInfo = (password: string): boolean => {
    const lowerPassword = password.toLowerCase();
    const emailPart = email.split('@')[0]?.toLowerCase() || '';
    const nameParts = name.toLowerCase().split(/\s+/);
    
    if (emailPart && emailPart.length >= 3 && lowerPassword.includes(emailPart)) {
      return true;
    }
    
    for (const part of nameParts) {
      if (part.length >= 3 && lowerPassword.includes(part)) {
        return true;
      }
    }
    
    return false;
  };

  const getRequirementStatus = () => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      passed: req.test(value),
    }));
  };

  const strength = getPasswordStrength();
  const requirements = getRequirementStatus();
  const allRequirementsPassed = requirements.every(r => r.passed);
  const hasCommonPassword = isCommonPassword(value);
  const hasPersonalInfo = containsPersonalInfo(value);

  const strengthColors = {
    weak: 'bg-destructive',
    medium: 'bg-warning',
    strong: 'bg-success',
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className="pl-10 pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          disabled={disabled}
          autoComplete={showRequirements ? 'new-password' : 'current-password'}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Caps Lock Warning */}
      {capsLockOn && isFocused && (
        <div className="flex items-center gap-1.5 text-warning text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Caps Lock is on</span>
        </div>
      )}

      {/* Password Strength Indicator */}
      {showStrength && value.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  index === 0 && value.length > 0 ? strengthColors[strength.level] : '',
                  index === 1 && (strength.level === 'medium' || strength.level === 'strong') ? strengthColors[strength.level] : '',
                  index === 2 && strength.level === 'strong' ? strengthColors[strength.level] : '',
                  !(
                    (index === 0 && value.length > 0) ||
                    (index === 1 && (strength.level === 'medium' || strength.level === 'strong')) ||
                    (index === 2 && strength.level === 'strong')
                  ) && 'bg-muted'
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              'font-medium',
              strength.level === 'weak' && 'text-destructive',
              strength.level === 'medium' && 'text-warning',
              strength.level === 'strong' && 'text-success'
            )}>
              {strengthLabels[strength.level]}
            </span>
            {strength.level === 'weak' && (
              <span className="text-muted-foreground">Add more variety</span>
            )}
            {strength.level === 'medium' && (
              <span className="text-muted-foreground">Getting better</span>
            )}
            {strength.level === 'strong' && (
              <span className="text-muted-foreground">Excellent!</span>
            )}
          </div>
        </div>
      )}

      {/* Password Requirements Checklist */}
      {showRequirements && (isFocused || value.length > 0) && (
        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {requirements.map((req) => (
              <div
                key={req.key}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  req.passed ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {req.passed ? (
                  <Check className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <X className="h-3 w-3 flex-shrink-0" />
                )}
                <span>{req.label}</span>
              </div>
            ))}
          </div>

          {/* Warnings for weak patterns */}
          {hasCommonPassword && value.length > 0 && (
            <div className="flex items-center gap-1.5 text-destructive text-xs mt-2">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>Password is too common</span>
            </div>
          )}
          {hasPersonalInfo && value.length > 0 && (
            <div className="flex items-center gap-1.5 text-destructive text-xs">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>Avoid using your name or email</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Validation function for use in form submission
export function validatePassword(
  password: string, 
  email?: string, 
  name?: string
): { valid: boolean; error?: string } {
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a special character' };
  }
  
  // Check common passwords
  const commonPasswords = [
    'password', 'password1', 'password123', '123456', '12345678', '123456789',
    'qwerty', 'qwerty123', 'letmein', 'welcome', 'admin', 'login', 'abc123'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password.' };
  }
  
  // Check personal info
  if (email) {
    const emailPart = email.split('@')[0]?.toLowerCase() || '';
    if (emailPart.length >= 3 && password.toLowerCase().includes(emailPart)) {
      return { valid: false, error: 'Password should not contain your email' };
    }
  }
  
  if (name) {
    const nameParts = name.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length >= 3 && password.toLowerCase().includes(part)) {
        return { valid: false, error: 'Password should not contain your name' };
      }
    }
  }
  
  return { valid: true };
}
