'use client';

import { useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Card } from '@/types';
import { formatJapaneseText } from '@/utils/japanese';
import { motion, PanInfo } from 'framer-motion';

interface SwipeCardProps {
  card: Card;
  onSwipe: (direction: 'left' | 'right', correct: boolean) => void;
  showKanji?: boolean;
  isActive?: boolean;
}

export default function SwipeCard({ card, onSwipe, showKanji = true, isActive = true }: SwipeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    const correct = direction === 'right';
    onSwipe(direction, correct);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
  });

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const { offset } = info;
    
    if (Math.abs(offset.x) > threshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const { offset } = info;
    if (offset.x > 50) {
      setDragDirection('right');
    } else if (offset.x < -50) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    if (!isActive) {
      setIsFlipped(false);
      setDragDirection(null);
    }
  }, [isActive]);

  return (
    <motion.div
      ref={cardRef}
      className="relative w-full max-w-sm mx-auto"
      style={{ touchAction: 'none' }}
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileHover={isActive ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        {...swipeHandlers}
        className={`swipe-card ${isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{
          transform: dragDirection === 'left' 
            ? 'rotate(-5deg)' 
            : dragDirection === 'right' 
            ? 'rotate(5deg)' 
            : 'rotate(0deg)',
          backgroundColor: dragDirection === 'left' 
            ? '#fef2f2' 
            : dragDirection === 'right' 
            ? '#f0fdf4' 
            : 'white',
          borderColor: dragDirection === 'left' 
            ? '#fecaca' 
            : dragDirection === 'right' 
            ? '#bbf7d0' 
            : '#e5e7eb',
        }}
      >
        <div className="relative w-full h-64">
          {/* Front */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-300 ${
              isFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {card.german}
              </h3>
              <p className="text-sm text-gray-600">
                Tippe, um die Antwort zu sehen
              </p>
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-300 ${
              isFlipped ? 'opacity-100' : 'opacity-0 rotate-y-180'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center space-y-4">
              <div className="japanese-text">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatJapaneseText(card.kana, showKanji)}
                </p>
                {showKanji && card.kanji && (
                  <p className="text-2xl font-semibold text-gray-700 mb-2">
                    {card.kanji}
                  </p>
                )}
                <p className="text-lg text-gray-600">
                  {card.romanji}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => handleSwipe('left')}
                  className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <span className="text-sm font-medium">Falsch</span>
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <span className="text-sm font-medium">Richtig</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Indicators */}
        {isActive && (
          <>
            <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium opacity-0 transition-opacity duration-200"
                 style={{ opacity: dragDirection === 'left' ? 1 : 0 }}>
              Falsch
            </div>
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium opacity-0 transition-opacity duration-200"
                 style={{ opacity: dragDirection === 'right' ? 1 : 0 }}>
              Richtig
            </div>
          </>
        )}

        {/* Click to flip indicator */}
        {isActive && !isFlipped && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleClick}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Tippe zum Umdrehen
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
} 