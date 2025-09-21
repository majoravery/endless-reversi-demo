// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  type Board = Array<Int8Array>;
  type Coordinate = number;
  type Coordinates = [Coordinate, Coordinate];
  type TeamName = "black" | "white";
  type TeamPiece = 1 | -1;

  type ServerState = Record<string, any>;
}

export {};
