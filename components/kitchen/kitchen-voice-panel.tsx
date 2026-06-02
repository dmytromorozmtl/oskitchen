"use client";

import { useState, useTransition } from "react";

import { tryKitchenVoiceQueryAction } from "@/actions/kitchen-voice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EXAMPLES = [
  "OS Kitchen, how much chicken is left?",
  "OS Kitchen, сколько осталось курицы?",
  "How much avocado is remaining?",
];

export function KitchenVoicePanel() {
  const [utterance, setUtterance] = useState(EXAMPLES[0]!);
  const [speech, setSpeech] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runQuery(text: string) {
    setUtterance(text);
    startTransition(async () => {
      const res = await tryKitchenVoiceQueryAction(text);
      if (!res.ok) {
        setSpeech(res.error ?? "Query failed.");
        setDetail(null);
        return;
      }
      setSpeech(res.data.speech);
      if (res.data.ok && res.data.answer) {
        const a = res.data.answer;
        const parts = [
          a.displayWeight,
          a.bowls != null ? `${a.bowls} bowls` : null,
          a.bowlProductTitle ? `via ${a.bowlProductTitle}` : null,
        ].filter(Boolean);
        setDetail(parts.join(" · "));
      } else {
        setDetail(null);
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="kitchen-voice-panel">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Try a kitchen query</CardTitle>
          <CardDescription>
            Same webhook as voice ordering — inventory questions are answered before order intents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="kitchen-voice-utterance">Utterance</Label>
            <Input
              id="kitchen-voice-utterance"
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
              data-testid="kitchen-voice-input"
            />
          </div>
          <Button
            type="button"
            disabled={pending}
            data-testid="kitchen-voice-ask"
            onClick={() => runQuery(utterance)}
          >
            Ask OS Kitchen
          </Button>
          {speech ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm" data-testid="kitchen-voice-response">
              <p className="font-medium">Response</p>
              <p className="mt-1 text-muted-foreground">{speech}</p>
              {detail ? <p className="mt-2 text-xs">{detail}</p> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Example phrases</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <Button key={ex} type="button" size="sm" variant="outline" onClick={() => runQuery(ex)}>
              {ex.length > 42 ? `${ex.slice(0, 40)}…` : ex}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">Inventory</Badge>
        <Badge variant="outline">EN + RU</Badge>
        <Badge variant="outline">Recipe → bowl count</Badge>
      </div>
    </div>
  );
}
