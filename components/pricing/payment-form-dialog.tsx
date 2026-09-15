"use client";

import { type FormEvent, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, LoaderCircle, Phone, Receipt, X } from "lucide-react";
import { toast } from "sonner";
import { submitPayment } from "@/app/actions/submit-payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageType: "Premium" | "Diamond";
};

const packageDetails = {
  Premium: {
    price: "৳499/mo",
    color: "from-violet-600 to-indigo-700",
    iconBg: "bg-gradient-to-br from-violet-500/20 to-indigo-500/10",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/30",
    accentColor: "text-violet-400",
    buttonBg: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500",
  },
  Diamond: {
    price: "৳999/mo",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    accentColor: "text-amber-400",
    buttonBg: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
  },
} as const;

export function PaymentFormDialog({ open, onOpenChange, packageType }: Props) {
  const pkg = packageDetails[packageType];
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  function resetForm() {
    setSenderNumber("");
    setTransactionId("");
    setIsSuccess(false);
  }

  function handleClose(value: boolean) {
    if (!value) resetForm();
    onOpenChange(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("packageType", packageType);

    startTransition(async () => {
      try {
        const result = await submitPayment(formData);
        if (result.success) {
          setIsSuccess(true);
        } else {
          toast.error(result.error, { duration: 10_000 });
        }
      } catch {
        toast.error("Something went wrong. Please try again.", {
          duration: 10_000,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden border-white/10 bg-[#0c0f0d] p-0 text-white dark:bg-[#0c0f0d]">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center px-7 py-10 text-center"
            >
              <div className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/10">
                <CheckCircle2 className="size-10 text-emerald-400" />
              </div>
              <h3 className="mt-5 text-2xl font-black tracking-tight">
                Payment Submitted!
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/55">
                Thanks for your purchase! Your confirmation is pending. Once
                verified by an admin, you will unlock unlimited access.
              </p>
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3">
                <p className="text-xs font-bold text-emerald-400">
                  ✨ {packageType} Plan
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  Verification usually takes less than 24 hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="mt-6 min-h-11 w-full rounded-xl bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Header */}
              <div className={`relative bg-gradient-to-r ${pkg.color} px-7 pb-6 pt-7`}>
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  aria-label="Close"
                  className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
                >
                  <X className="size-4" />
                </button>
                <p className="text-xs font-black uppercase tracking-[.2em] text-white/70">
                  Upgrade to
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight">
                  {packageType} Plan
                </h3>
                <p className="mt-1 text-lg font-bold text-white/80">
                  {pkg.price}
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="px-7 pt-5">
                <div className={`rounded-2xl border ${pkg.borderColor} bg-white/[.03] p-4`}>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-white/50">
                    Payment Instructions
                  </p>
                  <p className="mt-2.5 text-sm leading-6 text-white/70">
                    Please send the exact amount to this number via{" "}
                    <span className="font-bold text-pink-400">bKash</span> or{" "}
                    <span className="font-bold text-orange-400">Nagad</span>:
                  </p>
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[.06] px-4 py-3">
                    <Phone className={`size-5 shrink-0 ${pkg.accentColor}`} />
                    <div>
                      <p className="text-lg font-black tracking-wide text-white">
                        01643362125
                      </p>
                      <p className="text-[11px] font-medium text-white/40">
                        Send {pkg.price} via bKash/Nagad
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 pb-7 pt-5">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="payment-sender"
                      className="mb-1.5 block text-xs font-bold text-white/50"
                    >
                      Your bKash/Nagad Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/25" />
                      <input
                        id="payment-sender"
                        name="senderNumber"
                        type="tel"
                        required
                        minLength={11}
                        maxLength={14}
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="payment-txn"
                      className="mb-1.5 block text-xs font-bold text-white/50"
                    >
                      Transaction ID
                    </label>
                    <div className="relative">
                      <Receipt className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/25" />
                      <input
                        id="payment-txn"
                        name="transactionId"
                        type="text"
                        required
                        minLength={4}
                        maxLength={30}
                        placeholder="e.g. BK4F7X9M2L"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || !senderNumber.trim() || !transactionId.trim()}
                  className={`mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl ${pkg.buttonBg} text-sm font-black text-white shadow-lg transition disabled:opacity-40 disabled:saturate-50`}
                >
                  {isPending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Payment Details"
                  )}
                </button>

                <p className="mt-3 text-center text-[10px] leading-4 text-white/30">
                  Your payment will be manually verified within 24 hours.
                  Contact support if you face any issues.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
