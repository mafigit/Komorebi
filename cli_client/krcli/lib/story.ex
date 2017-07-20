defmodule Krcli.Story do
  defstruct [:id, :name, :desc, :points, :requirements, :board_id, :priority, :tasks]
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

  def by_id(story_id) do
     SbServer.get_json("/stories/" <> Integer.to_string(story_id))
    |> Util.unwrap_fn(&JSX.decode/1)
    |> Util.unwrap_fn(&parse/1)
  end

  def create_from_file do
    with story_file <- Path.join(Conf.current.home, "krcli.story"),
      {:ok, data} <- File.read(story_file),
      lines = String.split(data, ["\n"]),
      ["Board", board_name] <- String.split(Enum.at(lines, 0), ":"),
      ["Name", nname] <- String.split(Enum.at(lines, 1), ":"),
      ["Points", points] <- String.split(Enum.at(lines, 2), ":"),
      ["Priority", prio] <- String.split(Enum.at(lines, 3), ":"),
      {2, description} <- Util.collect_till(lines, "Description:", "EOTD"),
      {2, requirements} <- Util.collect_till(lines, "Requirements:", "EOTR"),
      {npoints, _} <- String.trim(points) |> Integer.parse,
      {nprio, _} <- String.trim(prio) |> Integer.parse,
      ndesc = Enum.join(description, "\n"),
      nreq = Enum.join(requirements, "\n"),
      {:ok, board} <- Krcli.Board.get_by_name(String.trim(board_name)),
      {:ok, json} <- JSX.encode(%{name: String.trim(nname), desc: String.trim(ndesc),
        points: npoints, requirements: String.trim(nreq), board_id: board.id,
        priority: nprio}),
    do:
      SbServer.post_json("/stories", json)
      |> Util.lift_maybe(fn(_) -> File.rm(story_file) end)
      |> Util.comply!("Story created successfully!")
  end

  def create do
    with story_file <- Path.join(Conf.current.home, "krcli.story"),
      {:ok, file} <- File.open(story_file, [:write]),
      board_name <- Conf.current.board || "CHANGEME",
      :ok <- IO.write(file, "Board:#{board_name}\n"),
      :ok <- IO.write(file, "Name:CHANGEME\n"),
      :ok <- IO.write(file, "Points:3\n"),
      :ok <- IO.write(file, "Priority:1\n"),
      :ok <- IO.write(file, "Description:\nSome Description\nEOTD\n"),
      :ok <- IO.write(file, "Requirements:\nSome Requirements\nEOTR\n"),
      :ok <- File.close(file),
    do: IO.puts("The file #{story_file} has been written to disk. Please " <>
      "Edit it with the data you would like to have, running:\n\n" <>
      (System.get_env("EDITOR") || "vim") <> " #{story_file} && krcli\n\n" <>
      "to create the story.")
  end

  def parse(item) do
    from_hash(item) |> Util.wrap
  end

  def from_hash(item) do
    with tasks = Enum.map(item["tasks"] || [], &Krcli.Task.from_hash/1),
    do: %Krcli.Story{
       id: item["id"],
      desc: item["desc"],
      points: item["points"],
      requirements: item["requirements"],
      board_id: item["board_id"],
      name: item["name"],
      priority: item["priority"],
      tasks: tasks
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

  def show_story(story) do
    with {:ok, board} <- Krcli.Board.by_id(story.board_id),
      {:ok, tasks} <- Krcli.Task.by_story_id(story.id),
      pmc <- PMC.setup(80, 3) |> PMC.h_bar("=") |> PMC.enclose(story.name, "||")
        |> PMC.h_bar("-")
        |> PMC.enclose_multiline(story.desc, "||")
        |> PMC.h_bar("-")
        |> PMC.enclose_columns(["Board:", board.name], "||")
        |> PMC.enclose_columns(["Points:", Integer.to_string(story.points) ], "||")
        |> PMC.enclose_columns(["Associated Tasks:", Integer.to_string(length(tasks)) ], "||")
        |> PMC.h_bar("-")
        |> PMC.enclose("Requirements:", "||")
        |> PMC.h_bar("-")
        |> PMC.enclose_multiline(story.requirements, "||")
        |> PMC.h_bar("="),
    do: PMC.print(pmc)
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