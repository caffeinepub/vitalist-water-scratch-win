import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = 'shajan@vitalis.com';
const ADMIN_PASSWORD = 'India@123';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setError('');
      setEmail('');
      setPassword('');
      onSuccess();
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="admin-modal-content">
        <DialogHeader>
          <div className="admin-modal-logo-wrap">
            <img
              src="/assets/generated/vitalis-logo.dim_300x120.png"
              alt="Vitalis Water"
              className="admin-modal-logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <DialogTitle className="admin-modal-title">Admin Access</DialogTitle>
          <DialogDescription className="admin-modal-desc">
            Enter your credentials to access the admin panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-field">
            <Label htmlFor="admin-email" className="admin-modal-label">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@vitalis.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="admin-modal-input"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="admin-modal-field">
            <Label htmlFor="admin-password" className="admin-modal-label">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="admin-modal-input"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="admin-modal-error">
              ⚠️ {error}
            </p>
          )}

          <Button type="submit" className="admin-modal-btn">
            🔐 Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
