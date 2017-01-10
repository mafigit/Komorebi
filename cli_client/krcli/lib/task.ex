defmodule Krcli.Task do
  defstruct [:id, :name, :desc, :story_id, :column_id, :priority]
  use FN, url: "/tasks", name: "Story", json_name: "tasks"
  def get_server_col(col), do: SbServer.get_json("/columns/" <> Integer.to_string(col["id"]) <> "/tasks")
  def tasks_json(board, column) do
    all_json(board)
    |> Util.unwrap
    |> Map.get(Krcli.Column.type_json_name, %{})
    |> Enum.find(:error, Util.ln_cmp(column, &(Map.get(&1,"name"))))
    |> get_server_col
    |> Util.unwrap
    |> JSX.decode
  end
  def all(board, column),
    do: all_fun(fn() -> tasks_json(board, column) end)
  def parse(col) do
    %Krcli.Task{
      id: col["id"],
      name: col["name"],
      desc: col["desc"],
      story_id: col["story_id"],
      column_id: col["column_id"],
      priority: col["priority"]
    }
  end
  def create_task(data) do
    with {:ok, json} <- data,
      {:ok, result} <- SbServer.post_json("/tasks", json),
      do: Util.success?(result)
  end
  def create(nname, board) do
    JSX.encode(%{name: nname, board_id: board})
    |> create_task
    |> Util.comply!("Column " <> nname <> " of board successfully created.")
  end
  def destroy(item, board) do
    Krcli.Board.with_column(board, item, &destroy_item/1)
  end
  def by_column(column) do
    SbServer.get_json("/columns/" <> Integer.to_string(column.id) <> "/tasks")
    |> Util.unwrap
    |> JSX.decode
    |> Util.unwrap
    |> parse_batch
  end
end