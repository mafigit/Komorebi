defmodule Krcli.Board do
  defstruct [:id, :name, :columns]

  use FN, url: "/boards", name: "Board"

  defmodule Print do
    def board(board) do
      IO.puts "Board is called: " <> board.name
    end

    def board_columns(cols) do
      with map_fn = fn(x) -> :io.format(" ~-15s|", [x.name]) end,
        {:ok, scols} <- Krcli.Column.sort({:ok, cols}),
        do: Enum.map(scols, map_fn)
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
      {:ok, result} <- SbServer.post_json("/boards", json),
      do: Util.success?(result)
  end

  def create(nname) do
    JSX.encode(%{name: nname})
    |> create_board
    |> Util.comply!("Board " <> nname <> " successfully created.")
  end

  def create_column(nname, board) do
    with_item(board, &(Krcli.Column.create(nname, &1.id)))
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
 
  def destroy_column(column, board) do
    with_item(board, &(Krcli.Column.destroy(column, &1) |> Util.comply_good))
  end

  def list do
    all_json |> show_boards |> Util.comply_good
  end

  def fetch(name) do
    SbServer.get_json("/" <> name) |> parse
  end

  def display(boardname) do
    fetch(boardname) |> show_board |> Util.comply_good
  end
end
