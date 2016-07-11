defmodule Krcli.Board do
  defstruct [:id, :name, :columns]

  defp parse_board(input) do
    with {:ok, json} <- input,
      {:ok, brd} <- JSX.decode(json),
      cols = Enum.map(brd["columns"], &Krcli.Column.create/1) |>
        Krcli.Column.sort,
    do: {:ok, %Krcli.Board{id: brd["id"], name: brd["name"], columns: cols}}
  end

  defp print_board(board) do
    IO.puts "Board is called: " <> board.name
  end

  defp print_columns(cols) do
    Enum.map(cols, fn(x) -> :io.format(" ~-15s|", [x.name]) end )
    IO.puts("")
  end
  
  defp show_board(input) do
    with {:ok, board} <- input,
      :ok <- print_board(board),
      :ok <- print_columns(board.columns),
    do: []
  end

  def show do
    # XXX[mh] need to actually get data from somewhere.
    # IO.puts("There, a board! seen it?")
    File.read("test_data/board_test.json") |> parse_board |> show_board
  end
end