'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types';

import { motion } from 'framer-motion';

interface WriteCardProps {
  card: Card;
  onAnswer: (correct: boolean) => void;
  isActive?: boolean;
}

export default function WriteCard({ 
  card, 
  onAnswer, 
  isActive = true 
}: WriteCardProps) {
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setUserInput('');
      setShowAnswer(false);
      setIsCorrect(false);
      setHasAnswered(false);
    }
  }, [isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || hasAnswered) return;

    const correct = userInput.trim().toLowerCase() === card.romanji.toLowerCase();
    setIsCorrect(correct);
    setShowAnswer(true);
    setHasAnswered(true);
    onAnswer(correct);
  };

  const handleNext = () => {
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(false);
    setHasAnswered(false);
  };

  const getInputPlaceholder = () => {
    return 'Gib die Aussprache ein (z.B. "aka")';
  };

  const getCorrectAnswer = () => {
    return card.romanji;
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {card.german}
          </h3>
          <p className="text-sm text-gray-600">
            Gib die Aussprache ein
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={getInputPlaceholder()}
              className="input-field text-center text-lg"
              disabled={hasAnswered}
              autoFocus={isActive}
            />
          </div>

          {!hasAnswered && (
            <button
              type="submit"
              disabled={!userInput.trim()}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Antwort prüfen
            </button>
          )}

          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className={`rounded-lg p-4 ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="text-center">
                <div className={`text-lg font-semibold mb-2 ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Richtig! 🎉' : 'Falsch 😔'}
                </div>
                
                <div className="japanese-text mb-4">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {card.romanji}
                  </p>
                  <p className="text-lg text-gray-600">
                    Japanische Aussprache
                  </p>
                </div>

                {!isCorrect && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Deine Antwort:</p>
                    <p className="text-lg font-medium text-red-700">
                      {userInput}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Richtige Antwort:</p>
                    <p className="text-lg font-medium text-green-700">
                      {getCorrectAnswer()}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Nächste Karte
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </motion.div>
  );
} 