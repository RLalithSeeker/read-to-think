"use client";
import { useApp } from "@/lib/store";

export default function Toaster() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;
  return (
    <div className="tst">
      <i className="fas fa-circle-info text-accent mr-2 text-xs" />
      {toastMsg}
    </div>
  );
}
