defmodule Krcli.Board do
  defstruct [:id, :name, :columns]

  def parse_board(input) do
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
    do: {:ok, []}
  end

  def print_board_list(board) do
    :io.format("~3B : ~-15s\n", [board["id"], board["name"]]) 
  end

  def show_boards(arg) do
    case arg do
      {:ok, boards} ->
        Enum.map(boards, fn(b) -> print_board_list(b) end)
      {:error, err} -> raise err  
    end
  end

  def list do
    SbServer.get_json("/boards") |> Util.unwrap |> JSX.decode |> show_boards
  end

  def show(boardname) do
    case SbServer.get_json("/" <> boardname) |> parse_board |> show_board do
      {:error, err} -> raise err
      {:ok, _} -> IO.puts("all good")
      foo -> raise foo
    end
  end
end
