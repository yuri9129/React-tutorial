import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/**
 * マス目
 */
function Square(props){
  let className = "square";
  if(props.winSquare){
    className += " win";
  }
  return(
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}


/**
 * ボード全体：マス目
 */
class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        winSquare={this.props.winSquares.includes(i)}
        onClick={() => this.props.onClick(i)}
        key={i}
      />
    );
  }

  renderBoardRow(col, row){
    let squares = [];
    for(let i = 0; i < col; i++){
      squares.push(this.renderSquare(row * col + i));
    }
    return (
      <div className="board-row" key={row}>
        {squares}
      </div>
    )
  }

  render() {
    let board = [];
    // 3*3の盤面を生成
    const row = 3;
    const col = 3;

    for(let i = 0; i < row; i++){
      board.push(this.renderBoardRow(col, i));
    }
    return (
      <div>
        {board}
      </div>
    );
  }
}

/**
 * ゲーム管理
 */
class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        cell: null,
      }],
      stepNumber : 0,
      xIsNext: true,
      sortDesc: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if(calculateWinner(squares).winner || squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        cell: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  changeSort(){
    this.setState({
      sortDesc: !this.state.sortDesc
    });
  }


  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const {winner:winner, squares:winSquares} = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const col = step.cell % 3 + 1;
      const row = Math.ceil((step.cell + 1) / 3);
      const desc = move ?
        'Go to move #' + move + ' ( ' + col + ',' + row + ')':
        'Go to game start';
      let className = "";
      if(this.state.stepNumber === move){
        className = "selected";
      }
      return (
        <li key={move}>
          <button className={className} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })
    if(this.state.sortDesc){
      moves.reverse();
    }

    let status;
    if(winner){
      status = 'Winner: ' + winner;
    }else if(this.state.history.length === 9 + 1){
      status = 'Draw! Play again?';
    }else{
      status = 'Next Player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winSquares={winSquares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div><button onClick={() => this.changeSort()}>Sort</button></div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game/>,
  document.getElementById('root')
);


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const result = {
    winner: null,
    squares: [],
  }
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      result.winner = squares[a];
      result.squares = lines[i];
    }
  }
  return result;
}
