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
    do: {:ok, from_hash(brd)}
  end

  def from_hash(brd) do
    with cols = Enum.map(brd["columns"] || [], &Krcli.Column.parse/1)
      |> Krcli.Column.sort,
    do: %Krcli.Board{id: brd["id"], name: brd["name"], columns: cols}
  end

  def create_board(data) do
    with {:ok, json} <- data,
      {:ok, json_result} <- SbServer.post_json("/boards", json),
      {:ok, result} <- JSX.decode(json_result),
      do:
        if result["success"], do: {:ok, ""},
          else: {:error, result["message"]}
  end

  def create(nname) do
    case JSX.encode(%{name: nname}) |> create_board do
      {:ok, _} ->
        IO.puts("Board " <> nname <> " successfully created.") |> Util.good
      {:error, err} -> raise inspect(err)
      unexpected -> raise unexpected
    end
  end

  def create_column(nname, board, pos) do
    case  by_name(board) do
      {:ok, board} -> Krcli.Column.create(nname, board.id, pos)
        |> Util.error_check
      {:error, msg} -> raise msg
    end
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

  def all do
    SbServer.get_json("/boards") |> Util.unwrap |> JSX.decode
  end

  def all_boards do
    with map_parse = fn(x) -> Enum.map(x, &from_hash/1) end,
    do: all |> Util.unwrap |> map_parse.() |> Util.wrap
  end

  def list do
    case  all |> show_boards do
        {:error, err} -> raise err
        {:ok, _} -> Util.good()
        unexpected -> raise unexpected
      end
  end

  def by_name(name, board_data) do
    with lname = String.downcase(name),
      grep_by_name = fn(x) -> String.downcase(x.name) == lname end,
      {:ok, boards} <- board_data,
      board = Enum.find(boards, :error, grep_by_name),
    do: if board == :error, do: {:error, "could not find board"},
      else: Util.wrap(board)
  end

  def by_name(name), do: by_name(name, all_boards)

  def display(boardname) do
    case SbServer.get_json("/" <> boardname) |> parse |> show_board do
        {:error, err} -> raise err
        {:ok, _} -> :ok
        unexpected -> raise unexpected
    end
  end
end
