extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

mod game;

use game::*;

#[wasm_bindgen]
pub struct City {
    inner: Game
}

#[wasm_bindgen]
impl City {
    pub fn new(width:i32, height:i32) -> City{
        City {
            inner:Game::new(width, height)
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

    pub fn blue_turn(&self) -> bool {
        self.inner.blue_turn
    }

    pub fn make_move(&mut self, mv: Move, safe:bool) -> bool {
        self.inner.make_move(mv, safe)
    }
}