import React from 'react';
import { initialBoard } from '../data/initialBoard';

const colorMap = {
  "0": "#FFFFFF",  // Blanco
  "1": "#0000FF",  // Azul
  "2": "#FFA500",  // Naranja
  "3": "#008000",  // Verde
  "4": "#FFFF00",  // Amarillo
  "5": "#FF0000",  // Rojo
  "6": "#000000"   // Negro
};

const GameArea = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${initialBoard[0].length}, 25px)`, gap: '2px' }}>
      {initialBoard.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: '25px',
              height: '25px',
              backgroundColor: cell === -1 ? 'transparent' : colorMap[cell],
              backgroundImage: cell === -1 ? "url('https://upload.wikimedia.org/wikipedia/commons/2/2e/Wood_background.jpg')" : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))
      )}
    </div>
  );
};

export default GameArea;
