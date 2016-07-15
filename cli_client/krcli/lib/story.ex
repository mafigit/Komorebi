defmodule Krcli.Story do
  defstruct [:id, :name, :desc, :points, :requirements, :column_id]

  def create_from_file do
    with {:ok, data} <- File.read("/tmp/krcli.story"),
      lines = String.split(data, ["\n"]),
      #["Board", board_id] <- String.split(Enum.at(lines,0), ":"),
      ["Column", column_id] <- String.split(Enum.at(lines, 1), ":"),
      ["Name", nname] <- String.split(Enum.at(lines, 2), ":"),
      ["Points", points] <- String.split(Enum.at(lines, 3), ":"),
      ["Priority", prio] <- String.split(Enum.at(lines, 4), ":"),
      {2, description} <- Util.collect_till(lines, "Description:", "EOTD"),
      {2, requirements} <- Util.collect_till(lines, "Requirements:", "EOTR"),
      {ncolumn, _} <- Integer.parse(column_id),
      {npoints, _} <- Integer.parse(points),
      {nprio, _} <- Integer.parse(prio),
      ndesc <- Enum.join(description, "\n"),
      nreq <- Enum.join(requirements, "\n"),
      # :ok <- IO.puts(inspect(%{name: nname, desc: ndesc,
      #   points: npoints, requirements: nreq, column_id: ncolumn})),
      {:ok, json} <- JSX.encode(%{name: nname, desc: ndesc,
        points: npoints, requirements: nreq, column_id: ncolumn,
        priority: nprio}),
    do:
      SbServer.post_json("/stories", json)
      |> Util.lift_maybe(fn(_) -> File.rm("/tmp/krcli.story") end)
      |> Util.comply!("Story created successfully!")

  end

  def create_with_column(column, board) do
    Krcli.Board.with_column(board, column, &(create(&1, board)))
  end

  def create(column, board) do
    with {:ok, file} <- File.open("/tmp/krcli.story", [:write]),
      :ok <- IO.write(file, "Board:" <> Integer.to_string(board.id) <> "\n"),
      :ok <- IO.write(file, "Column:" <> Integer.to_string(column.id) <> "\n"),
      :ok <- IO.write(file, "Name:CHANGEME\n"),
      :ok <- IO.write(file, "Points:3\n"),
      :ok <- IO.write(file, "Priority:1\n"),
      :ok <- IO.write(file, "Description:\nSome Description\nEOTD\n"),
      :ok <- IO.write(file, "Requirements:\nSome Requirements\nEOTR\n"),
      :ok <- File.close(file),
    do: IO.puts("The file /tmp/krcli.story has been written to disk. Please " <>
      "Edit it with the data you would like to have, running:\n\n" <> 
      (System.get_env("EDITOR") || "vim") <> " /tmp/krcli.story && krcli\n\n" <>
      "to create the story.")
  end

  def parse(item) do
    %Krcli.Story{id: item["id"], desc: item["desc"],
      points: item["points"], requirements: item["requirements"],
      column_id: item["column_id"], name: item["name"]} |> Util.wrap
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