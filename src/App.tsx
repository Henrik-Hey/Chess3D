import React from 'react';
import './App.css';
import Board from './GameObjects/Board';
import GUI from './screens/GUI';
import { BoardStateProvider } from './providers/BoardStateProvider';

function App() {
  return (
    <BoardStateProvider>
      <Board/>
      <GUI/>
    </BoardStateProvider>
  );
}

export default App;
