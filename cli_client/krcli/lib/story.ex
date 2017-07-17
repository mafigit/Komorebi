defmodule Krcli.Story do
  defstruct [:id, :name, :desc, :points, :requirements, :board_id, :priority]
  use FN, url: "/stories", name: "Story", json_name: "stories"

  def stories_json(board, column) do
   # XXX [mh] fix this
    all_json(board)
    |> Util.unwrap
    |> Map.get(Krcli.Column.type_json_name())
    |> Enum.find(:error, Util.ln_cmp(column, &(Map.get(&1,"name"))))
    |> Map.get(type_json_name())
  end

  def all(board), do: all_fun(fn() -> stories_json(board, 1) end)

  def by_name(item) do
    SbServer.get_json("/stories/" <> item)
    |> Util.unwrap_fn(&JSX.decode/1)
    |> Util.unwrap_fn(&parse/1)
  end

  def create_from_file do
    with {:ok, data} <- File.read("/tmp/krcli.story"),
      lines = String.split(data, ["\n"]),
      ["Board", board_id] <- String.split(Enum.at(lines, 0), ":"),
      ["Name", nname] <- String.split(Enum.at(lines, 2), ":"),
      ["Points", points] <- String.split(Enum.at(lines, 3), ":"),
      ["Priority", prio] <- String.split(Enum.at(lines, 4), ":"),
      {2, description} <- Util.collect_till(lines, "Description:", "EOTD"),
      {2, requirements} <- Util.collect_till(lines, "Requirements:", "EOTR"),
      {nboard, _} <- Integer.parse(board_id),
      {npoints, _} <- Integer.parse(points),
      {nprio, _} <- Integer.parse(prio),
      ndesc = Enum.join(description, "\n"),
      nreq = Enum.join(requirements, "\n"),
      {:ok, json} <- JSX.encode(%{name: nname, desc: ndesc,
        points: npoints, requirements: nreq, board_id: nboard,
        priority: nprio}),
    do:
      SbServer.post_json("/stories", json)
      |> Util.lift_maybe(fn(_) -> File.rm("/tmp/krcli.story") end)
      |> Util.comply!("Story created successfully!")
  end

  def create(board) do
    with {:ok, file} <- File.open("/tmp/krcli.story", [:write]),
      :ok <- IO.write(file, "Board:" <> Integer.to_string(board.id) <> "\n"),
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
    from_hash(item) |> Util.wrap
  end

  def from_hash(item) do
    %Krcli.Story{
       id: item["id"],
      desc: item["desc"],
      points: item["points"],
      requirements: item["requirements"],
      board_id: item["board_id"],
      name: item["name"],
      priority: item["priority"]
    }
  end

  def unparse(story) do
    %{
      board_id: story.board_id,
      name: story.name,
      desc: story.desc,
      points: story.points,
      requirements: story.requirements,
      priority: story.priority,
      id: story.id
    }
  end

  # XXX [mh] FIXME (broken by no longer having columns in stories)
  # def by_column(col) do
  #   SbServer.get_json("/columns/" <> Integer.to_string(col.id) <> "/stories")
  #   |> Util.unwrap_fn(&JSX.decode/1)
  #   |> parse_batch
  # end

  def show_story(story) do
    with story_id = Integer.to_string(story.id),
    pad_desc = Util.split_indent_wrap(story.desc, "  "),
    pad_req = Util.split_indent_wrap(story.requirements, "  "),
    points = Integer.to_string(story.points),
    prio = Integer.to_string(story.priority),
    board_name = Krcli.Board.by_id(Integer.to_string(story.board_id)).name,
    do:
      IO.puts("Story: " <> story.name <> " ( story:" <> story_id <>
        ", Board: " <> board_name <> " )\n" <>
      "Points: "<> points <> "\nPriority: " <> prio <>
      "\nDescription:\n" <> pad_desc <> "\nRequirements:\n" <> pad_req <>
      "\n")
  end

  def show(story_id) do
    with_item(story_id, &show_story/1)
  end

  def move_story(board, column, story) do
    Krcli.Board.with_column(board, column, fn(col) ->
      SbServer.post_json("/stories/" <> Integer.to_string(story.id),
        unparse(%{story | column_id: col.id}) |> JSX.encode |> Util.unwrap )
        |> Util.comply!("Story successfully updated!") end)
  end

  def move(board, column, story_id) do
    move_story(%{name: board}, column, by_name(story_id) |> Util.unwrap)
  end
end