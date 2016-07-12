defmodule BoardTest do
  use ExUnit.Case, async: true
  doctest Krcli.Board

  test "Should create board from json" do
    json = File.read("test_data/board_test.json")
    assert {:ok, board} = Krcli.Board.parse(json)
    assert board.name == "The ultimate board"
    assert length(board.columns) == 3
    assert board.id == 5
  end
end
