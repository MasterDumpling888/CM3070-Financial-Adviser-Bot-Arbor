"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import financialTerms from "@/lib/financial-terms.json";

type FinancialTerms = {
  [key: string]: {
    definition: string;
  };
};

type Flashcard = {
  term: string;
  definition: string;
  options: string[];
};

const FinancialFlashcards = () => {
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const terms = useMemo(() => Object.entries(financialTerms as FinancialTerms), []);

  const generateCard = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);

    const mainIndex = Math.floor(Math.random() * terms.length);
    const [term, { definition }] = terms[mainIndex];

    const otherOptions: string[] = [];
    while (otherOptions.length < 3) {
      const optionIndex = Math.floor(Math.random() * terms.length);
      if (optionIndex !== mainIndex && !otherOptions.includes(terms[optionIndex][1].definition)) {
        otherOptions.push(terms[optionIndex][1].definition);
      }
    }

    const options = [definition, ...otherOptions].sort(() => Math.random() - 0.5);

    setCurrentCard({ term, definition, options });
  };

  useEffect(() => {
    generateCard();
  }, [terms]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === currentCard?.definition);
  };

  if (!currentCard) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="card">
      <CardHeader className="card-header">
        <CardTitle className=" card-title capitalize ">{currentCard.term}</CardTitle>
      </CardHeader>
      <CardContent className="card-content">
        <div className="grid grid-cols-1 gap-4">
          {currentCard.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              variant={
                selectedAnswer === null
                  ? "outline"
                  : option === currentCard.definition
                  ? "default"
                  : selectedAnswer === option
                  ? "destructive"
                  : "outline"
              }
              className="btn text--2 h-auto"
            >
              {option}
            </Button>
          ))}
        </div>
        {selectedAnswer !== null && (
          <div className="mt-4 text-center">
            <p className={isCorrect ? "text-green-500" : "text-red-500"}>
              {isCorrect ? "Correct!" : "Incorrect."}
            </p>
            <Button onClick={generateCard} className="mt-2 btn">
              Next Card
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialFlashcards;
