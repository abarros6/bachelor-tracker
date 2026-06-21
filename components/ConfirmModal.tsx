'use client';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card rounded-t-3xl sm:rounded-2xl p-6 border border-line card-shadow">
        <h2 className="font-bebas text-2xl text-hi tracking-wide mb-1">{title}</h2>
        <p className="text-mid text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-raised text-mid font-bold text-sm py-3 rounded-xl border border-line hover:text-hi transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white font-bold text-sm py-3 rounded-xl active:scale-95 transition-transform"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
