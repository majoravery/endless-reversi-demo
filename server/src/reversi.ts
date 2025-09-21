import type { Coordinates, TeamName, TeamPiece } from "../types";
import { TEAMS } from "./constants";

const Cell = Object.freeze({
  EMPTY: 0,
  BLACK: 1,
  WHITE: -1,
});

// prettier-ignore
const DIRECTIONS = Object.freeze([
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
]);

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

export default class Reversi {
  #board: Int8Array[];
  #dimension: number;
  #moveCount: number = 0;
  #turn: TeamPiece = Cell.BLACK;

  constructor(props: { dimension: number }) {
    const { dimension } = props;
    this.#dimension = dimension;

    this.#board = Array.from({ length: this.#dimension }, () =>
      new Int8Array(this.#dimension).fill(0)
    );
  }

  get board(): Int8Array[] {
    return this.#board;
  }

  get dimension(): number {
    return this.#dimension;
  }

  get opponent(): TeamPiece {
    return -this.#turn as TeamPiece;
  }

  get turn(): TeamPiece {
    return this.#turn as TeamPiece;
  }

  initGame() {
    const mid = (this.dimension / 2) | 0; // Similar to Math.floor
    this.#board[mid - 1][mid - 1] = Cell.WHITE;
    this.#board[mid][mid - 1] = Cell.BLACK;
    this.#board[mid - 1][mid] = Cell.BLACK;
    this.#board[mid][mid] = Cell.WHITE;
  }

  #isWithinBounds(x: number, y: number) {
    return x >= 0 && x <= this.#dimension && y >= 0 && y <= this.#dimension;
  }

  #isMoveValid(x: number, y: number, piece: TeamPiece): boolean {
    if (this.#board[x][y] !== Cell.EMPTY) {
      console.warn(`isMoveValid: Cell is not empty at (${x}, ${y})`);
      return false;
    }

    // Loop through N, NE, E, SE, S, SW, W, NW directions
    for (const [deltaX, deltaY] of DIRECTIONS) {
      // Get adjacent cell in a direction
      let _x = x + deltaX;
      let _y = y + deltaY;

      let foundOpponent = false;

      // Continue checking in the direction while within board bounds
      while (this.#isWithinBounds(_x, _y)) {
        // If empty cell reached, this direction is invalid
        if (this.#board[_x][_y] === Cell.EMPTY) {
          // console.warn(
          //   `isMoveValid: Empty cell at (${_x}, ${_y}) w/o encountering ${this.opponent}`
          // );
          break;
        }

        // If opponent piece found, mark it and continue
        if (this.#board[_x][_y] === this.opponent) {
          foundOpponent = true;
          // Move to next cell in this direction
          _x += deltaX;
          _y += deltaY;
        }

        // If own piece found after finding opponent piece
        else if (this.#board[_x][_y] === piece) {
          if (foundOpponent) {
            // console.log(
            //   `isMoveValid: Valid capture line found, opponent pieces between our pieces at (${_x}, ${_y})`
            // );
            return true;
          } else {
            // console.warn(
            //   `isMoveValid: Adjacent to our own piece at (${_x}, ${_y}), no opponent ${this.opponent} to flip`
            // );
            break;
          }
        } else {
          // console.warn(
          //   `isMoveValid: This branch means the cell was neither empty or filled by either team 🤔`
          // );
          break;
        }
      }
    }

    console.warn(`isMoveValid: No valid capture found in any direction`);
    return false;
  }

  makeMove(
    x: number,
    y: number,
    teamName: TeamName
  ): { success: boolean; message: string } {
    const piece = getTeamPiece(teamName);

    if (this.turn !== piece) {
      const message = `${teamName} is not the current playable team`;
      console.warn(message);
      return {
        success: false,
        message,
      };
    }

    if (!this.#isMoveValid(x, y, piece)) {
      const message = `Invalid move by ${teamName} at (${x}, ${y})`;
      console.warn(message);
      return {
        success: false,
        message,
      };
    }

    this.#board[x][y] = piece;
    this.#moveCount++;
    return { success: true, message: "" };
  }

  getTeamPiecesToFlip(x: number, y: number, teamName: TeamName): Coordinates[] {
    const piece = getTeamPiece(teamName);
    const flipped: Coordinates[] = [];

    // Loop through N, NE, E, SE, S, SW, W, NW directions
    for (const [deltaX, deltaY] of DIRECTIONS) {
      // Get adjacent cell in a direction
      let _x = x + deltaX;
      let _y = y + deltaY;
      const path = [];

      // If opponent exists in this direction while within board bounds
      while (
        this.#isWithinBounds(_x, _y) &&
        this.#board[_x][_y] === this.opponent
      ) {
        path.push([_x, _y]);
        _x += deltaX;
        _y += deltaY;
      }

      // If player piece found at end of sequence, then there is a flippable line
      if (
        path.length &&
        this.#isWithinBounds(_x, _y) &&
        this.#board[_x][_y] === piece
      ) {
        for (const [pathX, pathY] of path) {
          this.#board[pathX][pathY] = piece;
          flipped.push([pathX, pathY]);
        }
      }
    }

    return flipped;
  }

  switchTurn() {
    this.#turn = -this.#turn as TeamPiece;
  }
}
