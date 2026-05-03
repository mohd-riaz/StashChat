'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

export function ImageLightbox({
  open, src, onClose,
}: { open: boolean; src: string | null; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0">
        {src && <img src={src} alt="" className="w-full h-auto" />}
      </DialogContent>
    </Dialog>
  );
}
