"use client";

import { Suspense } from "react";
import ShopContent from "./ShopContent";

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="text-phantom-muted">Loading shop...</p>}>
      <ShopContent />
    </Suspense>
  );
}
