defmodule Krcli.Story do
  defstruct [:id, :name, :desc, :points, :requirements, :column_id]

  def parse(item) do
    %Krcli.Story{id: item["id"], desc: item["desc"],
      points: item["points"], requirements: item["requirements"],
      column_id: item["column_id"]} |> Util.wrap
  end

  def parse_batch(items) do
    with {:ok, story_json} <- items,
    do: Enum.map(story_json, &(parse(&1) |>   Util.unwrap)) |> Util.wrap
  end

  def by_column(col) do
    SbServer.get_json("/columns/" <> Integer.to_string(col.id) <> "/stories")
    |> Util.unwrap
    |> JSX.decode
    |> parse_batch
  end
end