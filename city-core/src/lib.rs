extern crate wasm_bindgen;
use serde::Serialize;
use wasm_bindgen::prelude::*;

mod game;

use game::*;

#[derive(Serialize)]
pub struct GameResult {
    winner: Winner,
    score: Score,
}
#[wasm_bindgen]
pub struct City {
    inner: Game,
}

#[wasm_bindgen]
impl City {
    pub fn new(width: i32, height: i32) -> City {
        City {
            inner: Game::new(width, height),
        }
    }

    pub fn get_blue_position(&self) -> Coordinate {
        self.inner.blue_position
    }

    pub fn get_green_position(&self) -> Coordinate {
        self.inner.green_position
    }

    pub fn get_vertical_wall(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.inner.vertical_walls).unwrap()
    }

    pub fn get_horizontal_wall(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.inner.horizontal_walls).unwrap()
    }

    pub fn get_history(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.inner.history).unwrap()
    }

    pub fn blue_turn(&self) -> bool {
        self.inner.blue_turn
    }

    pub fn make_move(&mut self, mv: Move, safe: bool) -> bool {
        self.inner.make_move(mv, safe, true)
    }

    pub fn possible_moves(&mut self) -> JsValue {
        let moves = self.inner.possible_moves();
        serde_wasm_bindgen::to_value(&moves).unwrap()
    }

    pub fn undo_move(&mut self) {
        self.inner.undo_move();
    }

    pub fn game_over(&mut self) -> bool {
        self.inner.game_over()
    }

    pub fn game_result(&mut self) -> JsValue {
        let (winner, score) = self.inner.game_result();
        let result = GameResult {
            winner: winner,
            score: score,
        };
        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    pub fn get_current_move_index(&self) -> usize {
        self.inner.current_move_index
    }

    pub fn previous_move(&mut self) {
        if self.inner.current_move_index > 0 {
            self.inner
                .set_current_move_index(self.inner.current_move_index - 1);
        }
    }

    pub fn next_move(&mut self) {
        if self.inner.current_move_index < self.inner.history.len() {
            self.inner
                .set_current_move_index(self.inner.current_move_index + 1);
        }
    }

    pub fn first_move(&mut self) {
        self.inner.set_current_move_index(0);
    }

    pub fn last_move(&mut self) {
        self.inner.set_current_move_index(self.inner.history.len());
    }

    pub fn jump_to_move(&mut self, index: usize) {
        if index <= self.inner.history.len() {
            self.inner.set_current_move_index(index);
        }
    }

    pub fn is_showing_latest(&self) -> bool {
        self.inner.is_showing_latest()
    }
}
