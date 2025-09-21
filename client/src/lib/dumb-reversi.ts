import { TEAMS } from "./constants";

const Cell = Object.freeze({
  EMPTY: 0,
  BLACK: 1,
  WHITE: -1,
});

export function getTeamName(piece: TeamPiece): TeamName {
  if (!Object.values(Cell).includes(piece)) {
    throw new Error(`Invalid piece: ${piece}`);
  }

  if (piece === Cell.BLACK) {
    return "black";
  } else {
    return "white";
  }
}

export function getOpponentTeamName(team: TeamName): TeamName {
  if (!TEAMS.includes(team)) {
    throw new Error(`Invalid team: ${team}`);
  }

  return team === "black" ? "white" : "black";
}

export function getTeamPiece(team: TeamName): TeamPiece {
  if (!TEAMS.includes(team)) {
    throw new Error(`Invalid team: ${team}`);
  }

  if (team === "black") {
    return Cell.BLACK;
  } else {
    return Cell.WHITE;
  }
}

// This class doesn't know anything about the rules and logic of Reversi.
// All it does is render the UI based on client moves and server states pushes.
export class DumbReversi {
  #board: Board = [];

  constructor() {}

  get board() {
    return this.#board;
  }

  loadBoard(board: Board) {
    this.#board = board;
  }

  addPiece(x: Coordinate, y: Coordinate, team: TeamName): boolean {
    if (!x || !y || !team) {
      return false;
    }

    const piece = getTeamPiece(team);
    this.#board[x][y] = piece;
    return true;
  }

  reverseMove(x: Coordinate, y: Coordinate, team: TeamName): boolean {
    if (!x || !y || !team) {
      return false;
    }

    const piece = getTeamPiece(team);
    if (this.#board[x][y] === piece) {
      this.#board[x][y] = Cell.EMPTY;
      return true;
    }
    return false;
  }

  // Flip array of toFlip pieces to previousTeam's colour
  renderFlips(previousTeam: TeamName, toFlip: Coordinates[]): boolean {
    console.log(previousTeam, toFlip);
    const piece = getTeamPiece(previousTeam);
    let toFlipCount = toFlip.length;

    for (const [x, y] of toFlip) {
      if (this.board[x][y] !== piece) {
        this.board[x][y] = piece;
        toFlipCount--;
      }
    }

    console.log({ toFlipCount });
    return toFlipCount === 0;
  }
}
