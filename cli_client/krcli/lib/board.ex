defmodule Krcli.Board do
  defstruct [:id, :name, :columns]

  defmodule Print do
    def board(board) do
      IO.puts "Board is called: " <> board.name
    end

    def board_columns(cols) do
      Enum.map(cols, fn(x) -> :io.format(" ~-15s|", [x.name]) end )
      IO.puts("")
    end

    def board_inline(board) do
      :io.format("~3B : ~-15s\n", [board["id"], board["name"]]) 
    end
  end

  def parse(input) do
    with {:ok, json} <- input,
      {:ok, brd} <- JSX.decode(json),
      cols = Enum.map(brd["columns"], &Krcli.Column.parse/1) |>
        Krcli.Column.sort,
    do: {:ok, %Krcli.Board{id: brd["id"], name: brd["name"], columns: cols}}
  end

  defp show_board(input) do
    with {:ok, board} <- input,
      :ok <- Print.board(board),
      :ok <- Print.board_columns(board.columns),
    do: Util.wrap([])
  end

  def show_boards(arg) do
    case arg do
      {:ok, boards} ->
        Enum.map(boards, fn(b) -> Print.board_inline(b) end) |> Util.good
      {:error, err} -> raise err  
    end
  end

  def list do
    case SbServer.get_json("/boards") |>
      Util.unwrap |> JSX.decode |> show_boards do
        {:error, err} -> raise err
        {:ok, _} -> :ok
        unexpected -> raise unexpected
      end
  end

  def display(boardname) do
    case SbServer.get_json("/" <> boardname) |> parse |> show_board do
        {:error, err} -> raise err
        {:ok, _} -> :ok
        unexpected -> raise unexpected
    end
  end
end
