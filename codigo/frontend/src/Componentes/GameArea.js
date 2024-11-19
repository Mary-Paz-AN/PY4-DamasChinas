import React from 'react';
import { initialBoard } from '../Data/initialBoard';

const colorMap = {
  0: "#FFFFFF",  // Blanco
  1: "#0000FF",  // Azul
  2: "#FFA500",  // Naranja
  3: "#008000",  // Verde
  4: "#FFFF00",  // Amarillo
  5: "#FF0000",  // Rojo
  6: "#000000",  // Negro
};

const GameArea = () => {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {initialBoard.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            gap: '2px',
          }}
        >
          {row.map((cell, colIndex) => (
            (cell === 8  || cell === 9) ?
            (
              <button
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: cell === 8 ? '21px' : '42px',
                  height: '40px',
                  backgroundColor: 'transparent',
                  backgroundPosition: 'center',
                  borderRadius: '20px',
                  borderColor: 'transparent',
                }}
              ></ button>
            ) : (
              <>{/* Espacios de colores */}
              <button
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: '42px',
                  height: '40px',
                  backgroundColor: colorMap[cell],
                  backgroundPosition: 'center',
                  borderRadius: '20px',
                  borderColor: 'transparent'
                }}
              ></ button></>
            )
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameArea;
