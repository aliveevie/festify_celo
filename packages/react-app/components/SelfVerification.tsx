'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface SelfVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
}

export function SelfVerification({ isOpen, onClose, onVerificationSuccess }: SelfVerificationProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [SelfQRcodeWrapper, setSelfQRcodeWrapper] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import('@selfxyz/qrcode').then(mod => {
        setSelfQRcodeWrapper(() => mod.default);
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUserId(uuidv4());
    }
  }, [isOpen]);

  if (!userId) return null;

  const selfApp = {
    appName: "Festify",
    scope: "festify-app-scope",
    endpoint: "https://festify.vercel.app/api/verify",
    userId,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Identity</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Scan this QR code with the Self app to verify your identity and unlock additional benefits.
        </DialogDescription>
        <div className="flex flex-col items-center space-y-4 py-4">
          {!isVerified ? (
            <>
              {SelfQRcodeWrapper ? (
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={() => {
                    setIsVerified(true);
                    onVerificationSuccess();
                  }}
                  size={250}
                />
              ) : (
                <div>Loading QR code...</div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold text-green-600">Verification Successful!</p>
              <p className="text-sm text-gray-500">You now have access to additional benefits</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 