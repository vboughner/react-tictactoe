import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let classNames = 'square';
    if (props.winner) {
        classNames += ' winner';
    }

    return (
        <button className={classNames} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                winner={this.props.winners[i]}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    renderRow(r) {
        let columns = [];
        for (let c = 0; c < 3; c++) {
            columns.push(this.renderSquare((r * 3) + c));
        }

        return (
            <div key={r} className="board-row">
                {columns}
            </div>
        );
    }

    render() {
        let rows = [];
        for (let r = 0; r < 3; r++) {
            rows.push(this.renderRow(r));
        }

        return (
            <div>
                {rows}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        // every possible 3 squares a player can have that result in a win,
        // this would normally be a class static field, but these aren't available in ES6
        this.winning_game_lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        const initialSquares = Array(9).fill(null);
        this.state = {
            history: [{
                squares: initialSquares,
                winners: this.calculateSquareWinners(initialSquares),
                lastColumnPicked: null,
                lastRowPicked: null,
            }],
            stepNumber: 0,
            xIsNext: true,
        };
    }

    calculateWinner(squares) {
      for (let i = 0; i < this.winning_game_lines.length; i++) {
        const [a, b, c] = this.winning_game_lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
      }
      return null;
    }

    calculateSquareWinners(squares) {
        let retval = Array(9).fill(false);
        for (let i = 0; i < this.winning_game_lines.length; i++) {
          const [a, b, c] = this.winning_game_lines[i];
          if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
              retval[a] = true;
              retval[b] = true;
              retval[c] = true;
              break;
          }
        }
        return retval;
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (this.calculateWinner(squares) || squares[i]) {
          return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat({
                squares: squares,
                winners: this.calculateSquareWinners(squares),
                lastColumnPicked: (i % 3) + 1,
                lastRowPicked: Math.floor(i / 3) + 1,
            }),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.calculateWinner(current.squares);

        const steps = history.map((value, step, ha) => {
            const desc = step ?
                'Go to move #' + step :
                'Go to game start';

            const descClassName = step === this.state.stepNumber ? 'step-selected' : '';

            const colrow = step ?
                '(' + ha[step].lastColumnPicked + ',' + ha[step].lastRowPicked + ')' :
                '';

            return (
                <li key={step}>
                    <button onClick={() => this.jumpTo(step)}><span className={descClassName}>{desc}</span> {colrow}</button>
                </li>
            );
        });

        let status;
        if (winner) {
          status = 'Winner: ' + winner;
        }
        else if (this.state.stepNumber > 8) {
            status = 'Cat\'s game!';
        }
        else {
          status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winners={current.winners}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ul>{steps}</ul>
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

