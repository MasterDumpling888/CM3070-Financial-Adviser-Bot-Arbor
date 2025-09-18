"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import financialTerms from "@/lib/financial-terms.json";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import FinancialFlashcards from "@/components/flashcards/financial-flashcards";

type FinancialTerms = {
  [key: string]: {
    definition: string;
  };
};

const LearnPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcardMode, setFlashcardMode] = useState(false);

  const terms = useMemo(() => Object.entries(financialTerms as FinancialTerms), []);

  const filteredTerms = useMemo(() => {
    return terms.filter(([term]) =>
      term.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [terms, searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Learn Financial Terms</h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="flashcard-mode"
            checked={flashcardMode}
            onCheckedChange={setFlashcardMode}
          />
          <Label htmlFor="flashcard-mode">Quiz Mode</Label>
        </div>
      </div>

      {flashcardMode ? (
        <div className="w-full max-w-2xl mx-auto">
            <FinancialFlashcards />
        </div>
      ) : (
        <>
          <Input
            type="text"
            placeholder="Search for a term..."
            className="mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTerms.map(([term, { definition }]) => (
              <Card key={term} className="card">
                <CardHeader className="card-header">
                  <CardTitle className="card-title capitalize" data-testid={`term-title-${term}`}>{term}</CardTitle>
                </CardHeader>
                <CardContent className="card-content">
                  <p className="mx-6 my-2">{definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LearnPage;