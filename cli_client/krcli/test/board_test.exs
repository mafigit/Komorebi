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

  test "should find all boards by name" do
    match_test = (fn(x) -> x.name == "bcd" end)
    not_match_test = (fn({:error, message}) ->
      message == "could not find Board" end)
    boards = [%Krcli.Board{name: "abc"}, %Krcli.Board{name: "bcd"}]
    
    assert Krcli.Board.by_name("bcd", {:ok, boards}) |>
      Util.unwrap |> match_test.() 
    assert Krcli.Board.by_name("def", {:ok, boards}) |> not_match_test.()
  end
end
