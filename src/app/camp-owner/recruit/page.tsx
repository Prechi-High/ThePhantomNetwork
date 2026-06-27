"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CampRecruitPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/camp-owner/referrals")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Recruit Players</h1>

      <Card className="space-y-4">
        <div>
          <p className="text-sm text-phantom-muted">Referral Code</p>
          <p className="font-mono text-2xl font-bold text-phantom-gold">
            {data?.referralCode as string}
          </p>
        </div>
        <div>
          <p className="text-sm text-phantom-muted">Share Link</p>
          <p className="break-all text-sm">{data?.referralLink as string}</p>
        </div>
        <Button onClick={copyLink} size="sm">
          {copied ? "Copied!" : "Copy Referral Link"}
        </Button>
        <p className="text-sm text-phantom-muted">
          {data?.memberCount as number} players have joined via your camp.
        </p>
      </Card>
    </div>
  );
}
