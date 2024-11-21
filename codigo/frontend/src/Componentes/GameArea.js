import React, { useState, useEffect } from 'react';
import { initialBoard } from '../Data/initialBoard';
import socket from '../Sockets.js';  

const colorMap = {
  0: "#FFFFFF",  // Blanco
  1: "#0000FF",  // Azul
  2: "#FFA500",  // Naranja
  3: "#008000",  // Verde
  4: "#FFFF00",  // Amarillo
  5: "#FF0000",  // Rojo
  6: "#000000",  // Negro
};

// Definir zonas de victoria para cada color
const victoryZones = {
  5: [[16, 0], [15, 0], [14, 0], [16, 1], [15, 1], [16, 2]], // Rojo gana en zona azul
  1: [[0, 16], [1, 16], [2, 16], [0, 15], [1, 15], [0, 14]], // Azul gana en zona roja
  2: [[16, 16], [15, 16], [14, 16], [16, 15], [15, 15], [16, 14]], // Naranja gana en zona verde
  3: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [0, 2]], // Verde gana en zona naranja
  4: [[8, 0], [9, 0], [7, 1], [9, 1], [8, 1]], // Amarillo gana en zona específica
  6: [[8, 16], [9, 16], [7, 15], [9, 15], [8, 15]] // Negro gana en zona específica
};

const GameArea = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(5);  // Comenzamos con el rojo
  const [mustContinueJumping, setMustContinueJumping] = useState(false);
  const [winner, setWinner] = useState(null);

  const isPiece = (cell) => {
    return cell > 0 && cell < 7;
  };

  // Función para verificar victoria
  const checkVictory = (newBoard) => {
    for (const [color, zone] of Object.entries(victoryZones)) {
      const colorNum = parseInt(color);
      const isVictory = zone.every(([x, y]) => 
        newBoard[y][x] === colorNum
      );

      if (isVictory) {
        return colorNum;
      }
    }
    return null;
  };

  const findPossibleMoves = (fromRow, fromCol, previousMoves = []) => {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dRow, dCol]) => {
      // Salto
      const jumpRow = fromRow + dRow * 2;
      const jumpCol = fromCol + dCol * 2;
      
      // Verificar que no hayamos saltado ya esta casilla
      const alreadyJumped = previousMoves.some(
        move => move.row === jumpRow && move.col === jumpCol
      );

      if (!alreadyJumped && 
          isValidJump(fromRow, fromCol, 
            fromRow + dRow, fromCol + dCol, 
            jumpRow, jumpCol)) {
        moves.push({ 
          row: jumpRow, 
          col: jumpCol, 
          isJump: true,
          jumpedRow: fromRow + dRow,
          jumpedCol: fromCol + dCol 
        });
      }
    });

    // Si no hay saltos, permitir movimientos directos solo si no hay saltos previos
    if (moves.length === 0 && previousMoves.length === 0) {
      directions.forEach(([dRow, dCol]) => {
        const newRow = fromRow + dRow;
        const newCol = fromCol + dCol;
        
        if (isValidMove(fromRow, fromCol, newRow, newCol)) {
          moves.push({ row: newRow, col: newCol, isJump: false });
        }
      });
    }

    return moves;
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    // Verificar límites del tablero
    if (toRow < 0 || toRow >= board.length || 
        toCol < 0 || toCol >= board[0].length) {
      return false;
    }

    // La casilla de destino debe estar vacía
    return board[toRow][toCol] === 0;
  };

  const isValidJump = (fromRow, fromCol, middleRow, middleCol, toRow, toCol) => {
    // Verificar límites del tablero
    if (toRow < 0 || toRow >= board.length || 
        toCol < 0 || toCol >= board[0].length) {
      return false;
    }

    // Verificar que hay una ficha de otro color en la casilla intermedia 
    // y que la casilla de destino está vacía
    return isPiece(board[middleRow][middleCol]) && 
           board[middleRow][middleCol] !== currentTurn &&
           board[toRow][toCol] === 0;
  };

  useEffect(() => {
    socket.on('actualizarTablero', (data) => {
      // Actualizar el tablero y el turno del jugador
      setBoard(data.newBoard);
      setCurrentTurn(data.currentTurn);
    });
  
    return () => {
      socket.off('actualizarTablero');
    };
  }, []);

  const handleCellClick = (rowIndex, colIndex) => {
    if (winner) return;
  
    const currentCell = board[rowIndex][colIndex];
  
    if (selectedPiece === null) {
      if (isPiece(currentCell) && currentCell === currentTurn) {
        const moves = findPossibleMoves(rowIndex, colIndex);
        setSelectedPiece({ row: rowIndex, col: colIndex });
        setPossibleMoves(moves);
      }
    } else {
      const moveIndex = possibleMoves.findIndex(
        move => move.row === rowIndex && move.col === colIndex
      );
  
      if (moveIndex !== -1) {
        const newBoard = board.map(row => [...row]);
        const { row: fromRow, col: fromCol } = selectedPiece;
        const move = possibleMoves[moveIndex];
  
        newBoard[rowIndex][colIndex] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = 0;
  
        if (move.isJump) {
          newBoard[move.jumpedRow][move.jumpedCol] = 0;
        }
  
        const victoryColor = checkVictory(newBoard);
        if (victoryColor) {
          setWinner(victoryColor);
          setBoard(newBoard);
          return;
        }
  
        socket.emit('moverFicha', { newBoard, currentTurn }); // Emitir el movimiento
        setBoard(newBoard);
        setCurrentTurn(currentTurn === 5 ? 1 : 5); // Cambiar turno al siguiente jugador
        setSelectedPiece(null);
        setPossibleMoves([]);
      }
    }
  };

  // Reiniciar juego
  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setCurrentTurn(5);
    setMustContinueJumping(false);
    setWinner(null);
  };

  return (
    <div>
      {winner ? (
        <div style={{ 
          marginBottom: '10px', 
          fontWeight: 'bold', 
          color: colorMap[winner] 
        }}>
          ¡Jugador {winner} ha ganado!
          <button 
            onClick={resetGame}
            style={{ 
              marginLeft: '10px', 
              backgroundColor: 'lightgray', 
              border: 'none', 
              padding: '5px 10px' 
            }}
          >
            Reiniciar Juego
          </button>
        </div>
      ) : (
        <div style={{ 
          marginBottom: '10px', 
          fontWeight: 'bold', 
          color: colorMap[currentTurn] 
        }}>
          Turno del jugador: {currentTurn} 
          {mustContinueJumping && " (Debe continuar saltando)"}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {board.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              gap: '2px',
            }}
          >
            {row.map((cell, colIndex) => {
              const isSelected = 
                selectedPiece && 
                selectedPiece.row === rowIndex && 
                selectedPiece.col === colIndex;

              const isPossibleMove = possibleMoves.some(
                move => move.row === rowIndex && move.col === colIndex
              );

              return (cell === 8 || cell === 9) ? (
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
                />
              ) : (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: '42px',
                    height: '40px',
                    backgroundColor: colorMap[cell] || 'transparent',
                    backgroundPosition: 'center',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid white' : 
                            isPossibleMove ? '2px solid green' : 'none',
                    opacity: isPiece(cell) ? 1 : 
                             isPossibleMove ? 0.7 : 0.5,
                    cursor: isPiece(cell) || isPossibleMove ? 'pointer' : 'default'
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameArea;
