defmodule Krcli.Column do
  defstruct [:id, :name, :position]

  use FN, url: "/columns", name: "Column"

  def parse(col) do
    %Krcli.Column{ id: col["id"],
      name: col["name"], position: col["position"] }
  end

  def sort(input) do
    with {:ok, columns} <- input,
      sort_col = fn (a,b) -> a.position < b.position end,
      do: Util.wrap(Enum.sort(columns, sort_col))
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
    with {:ok, board} <- Krcli.Board.fetch(board.name),
      val = Enum.find(board.columns, :error, Util.ln_cmp(item, &(&1.name))),
    do:
      if val == :error, do: {:error, "could not find " <> type_name},
      else: destroy_item(val)
  end
end