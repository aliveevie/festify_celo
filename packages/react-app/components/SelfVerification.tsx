'use client';

import React, { useState, useEffect } from 'react';
import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface SelfVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
}

export function SelfVerification({ isOpen, onClose, onVerificationSuccess }: SelfVerificationProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserId(uuidv4());
    }
  }, [isOpen]);

  if (!userId) return null;

  const selfApp = new SelfAppBuilder({
    appName: "Festify",
    scope: "festify-app-scope",
    endpoint: "https://3f48-197-210-156-242.ngrok-free.app/api/verify",
    userId,
  }).build();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Identity</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          {!isVerified ? (
            <>
              <p className="text-sm text-gray-500 text-center">
                Scan this QR code with the Self app to verify your identity and unlock additional benefits
              </p>
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                  setIsVerified(true);
                  onVerificationSuccess();
                }}
                size={250}
              />
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