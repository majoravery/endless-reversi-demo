import type { Coordinates, TeamName } from "../types";
import Reversi, { getTeamName } from "./reversi";

const initialLastMove = {
  x: null,
  y: null,
  teamName: null,
  playerId: null,
};

interface GameProps {
  dimension: number;
}

// Only one game happening at any time hence keeping it static
export default class Game {
  static lastMove: {
    x: number | null;
    y: number | null;
    teamName: TeamName | null;
    playerId: string | null;
  } = initialLastMove;
  static reversi: Reversi | null = null;
  static toFlip: Coordinates[] = [];

  constructor(props: GameProps) {
    const { dimension } = props;
    Game.reversi = new Reversi({ dimension });
  }

  static get state() {
    if (!Game.reversi) {
      throw new Error("get state(): Reversi not instantiated");
    }

    return {
      board: Game.reversi.board,
      currentTeamName: getTeamName(Game.reversi.turn),
      dimension: Game.reversi.dimension,
    };
  }

  static get newState() {
    if (!Game.reversi) {
      throw new Error("get newState(): Reversi not instantiated");
    }

    return {
      currentTeamName: getTeamName(Game.reversi.turn),
      lastMove: Game.lastMove, // Needed to render move for all other players
      toFlip: Game.toFlip,
    };
  }

  static startGame() {
    if (!Game.reversi) {
      throw new Error("startGame(): Reversi not instantiated");
    }

    Game.reversi.initGame();
  }

  static makeMove(x: number, y: number, teamName: TeamName, playerId: string) {
    if (!Game.reversi) {
      throw new Error("makeMove(): Reversi not instantiated");
    }

    Game.saveLastMove(x, y, teamName, playerId);
    return Game.reversi.makeMove(x, y, teamName);
  }

  static saveLastMove(
    x: number,
    y: number,
    teamName: TeamName,
    playerId: string
  ) {
    Game.lastMove = { x, y, teamName, playerId };
  }

  static update() {
    if (!Game.reversi) {
      throw new Error("update(): Reversi not instantiated");
    }

    const { x, y, teamName } = Game.lastMove;
    if (!x || !y || !teamName) {
      throw new Error("update(): Invalid last move");
    }

    const flipped = Game.reversi.getTeamPiecesToFlip(x, y, teamName);
    Game.toFlip = flipped;

    Game.reversi.switchTurn();
  }
}
