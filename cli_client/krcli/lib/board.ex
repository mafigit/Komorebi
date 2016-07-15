defmodule Krcli.Board do
  defstruct [:id, :name, :columns]

  use FN, url: "/boards", name: "Board"

  defmodule Print do
    def board(board) do
      IO.puts "Board is called: " <> board.name
    end

    def board_inline(board) do
      :io.format("~3B : ~-15s\n", [board["id"], board["name"]]) 
    end

    def stories_for(stories) do
      Enum.each(stories,
        fn(x) -> :io.format("~-10s (~3B) ", [x.name || "", x.id])
      end)
      IO.puts("")
    end

    def stories_by_column(stories, board) do
      Enum.each(board.columns, fn(col) ->
        :io.format("~-15s:", [col.name])
        |> Util.lift_pr(fn() -> stories_for(stories[col.id]) end)
      end)
    end

  end

  def parse(input) do
    with {:ok, json} <- input, {:ok, brd} <- JSX.decode(json),    
    do: {:ok, from_hash(brd)}
  end

  def from_hash(brd) do
    with cols = Enum.map(brd["columns"] || [], &Krcli.Column.parse/1)
      |> Krcli.Column.sort,
    do: %Krcli.Board{id: brd["id"], name: brd["name"], columns: cols}
  end

  def with_column(board, item, fun) do
    with {:ok, board} <- fetch(board.name),
      val = Enum.find(board.columns, :error, Util.ln_cmp(item, &(&1.name))),
    do:
      if val == :error, do: {:error, "could not find " <> type_name},
      else: fun.(val)
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

  def create_story(column, board) do
    with_item(board, &(Krcli.Story.create_with_column(column, &1)))
  end

  def stories_per_column(board) do
    Enum.reduce(board.columns, %{}, 
      fn(col, acc) ->
        Map.put_new(acc, col.id, Krcli.Story.by_column(col) |> Util.unwrap)
      end)
    |> Print.stories_by_column(board)
  end

  defp show_board(input) do
    with {:ok, board} <- input,
      :ok <- Print.board(board),
      :ok <- stories_per_column(board),
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
