'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';

function AlertDialog({ ...props }: React.ComponentProps<typeof Dialog>) {
  return <Dialog data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      data-slot="alert-dialog-content"
      className={cn('sm:max-w-sm', className)}
      showCloseButton={false}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <DialogHeader data-slot="alert-dialog-header" className={className} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="alert-dialog-title" className={className} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="alert-dialog-description" className={className} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <DialogFooter data-slot="alert-dialog-footer" className={className} {...props} />;
}

function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="alert-dialog-action" className={className} {...props} />;
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="outline" data-slot="alert-dialog-cancel" className={className} {...props} />;
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};
