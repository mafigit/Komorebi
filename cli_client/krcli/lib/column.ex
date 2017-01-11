defmodule Krcli.Column do
  defstruct [:id, :name, :position]
  use FN, url: "/columns", name: "Column", json_name: "columns"
  def parse(col), do: from_hash(col)
  def column_json(board) do
    all_json(board) |> Util.unwrap |> Map.get(type_json_name) |> Util.wrap
  end
  def all(board_name), do: all_fun(fn() -> column_json(board_name) end)
  def with_item(board, item, fun) do
    by_name(item, all(board)) |> Util.comply_fn(&(fun.(&1)))
  end
  def from_hash(col) do
    %Krcli.Column{ id: col["id"],
      name: col["name"], position: col["position"] }
  end
  def sort(input) do
    with {:ok, columns} <- input,
      sort_col = fn (a,b) -> a.position < b.position end,
    do: Util.wrap(Enum.sort(columns, sort_col))
  end
  def by_id(column) do
    SbServer.get_json("/columns/" <> column)
    |> Util.unwrap_fn(&JSX.decode/1)
    |> Util.unwrap_fn(&parse/1)
  end
  def create_column(data) do
    with {:ok, json} <- data,
      {:ok, result} <- SbServer.post_json("/columns", json),
      do: Util.success?(result)
  end
  def create(nname, board) do
    JSX.encode(%{name: nname, board_id: board})
    |> create_column
    |> Util.comply!("Column " <> nname <> " of board successfully created.")
  end
  def destroy(item, board) do
    Krcli.Board.with_column(board, item, &destroy_item/1)
  end
end