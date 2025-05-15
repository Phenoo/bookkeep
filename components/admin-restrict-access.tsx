"use client";

import { AlertCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface AdminContactDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  adminEmail?: string;
  adminPhone?: string;
}

export function AdminContactDialog({
  open,
  onOpenChange,
  adminEmail = "admin@greenvilleapartments.online",
}: AdminContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-xl pt-4">
            Access Restricted
          </DialogTitle>
          <DialogDescription className="text-center">
            You need administrator approval before you can access this
            application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-center text-sm text-muted-foreground">
            Please contact the system administrator using one of the methods
            below to request access.
          </p>
          <div className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {adminEmail}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* <DialogFooter className="sm:justify-center">
          <Button variant="secondary" className="w-full sm:w-auto">
            I&apos;ll Contact Later
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
