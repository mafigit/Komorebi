defmodule Krcli.Task do
  defstruct [:id, :name, :desc, :story_id, :column_id]
  use FN, url: "/tasks", name: "Story", json_name: "tasks"

  def get_server_col(col),
    do: SbServer.get_json("/columns/" <> Integer.to_string(col["id"]) <> "/tasks")

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
    from_hash(col) |> Util.wrap
  end

  def from_hash(col) do
    %Krcli.Task{
      id: col["id"],
      name: col["name"],
      desc: col["desc"],
      story_id: col["story_id"],
      column_id: col["column_id"],
    }
  end

  def by_name(item) do
    SbServer.get_json("/tasks/" <> item)
    |> Util.unwrap_fn(&JSX.decode/1)
    |> Util.unwrap_fn(&parse/1)
  end

  def by_story_id(story_id) do
    SbServer.get_json("/stories/" <> Integer.to_string(story_id) <> "/tasks")
    |> Util.unwrap_fn(&JSX.decode/1)
    |> Util.unwrap_fn(&parse_batch/1)
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

  def create_from_file do
    with task_file <- Path.join(Conf.current.home, "krcli.task"),
      {:ok, data} <- File.read(task_file),
      lines = String.split(data, ["\n"]),
      ["Board", board_name] <- String.split(Enum.at(lines, 0), ":"),
      ["Column", column_name] <- String.split(Enum.at(lines, 1), ":"),
      ["Story_id", story_str] <- String.split(Enum.at(lines, 2), ":"),
      ["Name", nname] <- String.split(Enum.at(lines, 3), ":"),
      {2, description} <- Util.collect_till(lines, "Description:", "EOTD"),
      {story_id, _} <- String.trim(story_str) |> Integer.parse,
      {:ok, board} <- Krcli.Board.get_by_name(String.trim(board_name))
        |> Util.unwrap |> Krcli.Board.fetch,
      {:ok, column} <- Krcli.Column.get_by_name(String.trim(column_name),
        Util.wrap(board.columns)),
      {:ok, story} <- Krcli.Story.get_by_id(story_id, Util.wrap(board.stories)),
      ndesc = Enum.join(description, "\n"),
      {:ok, json} <- JSX.encode(%{name: String.trim(nname), desc: String.trim(ndesc),
        column_id: column.id, story_id: story.id}),
    do:
      SbServer.post_json("/tasks", json)
      |> Util.lift_maybe(fn(_) -> File.rm(task_file) end)
      |> Util.comply!("Task created successfully!")
  end

 def create do
    with task_file <- Path.join(Conf.current.home, "krcli.task"),
      {:ok, file} <- File.open(task_file, [:write]),
      board_name <- Conf.current.board || "CHANGEME",
      column_name <- Conf.current.column || "CHANGEME",
      :ok <- IO.write(file, "Board:#{board_name}\n"),
      :ok <- IO.write(file, "Column:#{column_name}\n"),
      :ok <- IO.write(file, "Story_id:CHANGEME\n"),
      :ok <- IO.write(file, "Name:CHANGEME\n"),
      :ok <- IO.write(file, "Description:\nSome Description\nEOTD\n"),
      :ok <- File.close(file),
    do: IO.puts("The file #{task_file} has been written to disk. Please " <>
      "Edit it with the data you would like to have, running:\n\n" <>
      (System.get_env("EDITOR") || "vim") <> " #{task_file} && krcli\n\n" <>
      "to create the task.")
  end

  def show_task(task) do
    with story <- Krcli.Story.by_id(task.story_id) |> Util.unwrap,
      column <- Krcli.Column.by_id(task.column_id),
      pmc <- PMC.setup(80, 3) |> PMC.h_bar("=") |> PMC.enclose(task.name, "||")
        |> PMC.h_bar("-")
        |> PMC.enclose_multiline(task.desc, "||")
        |> PMC.h_bar("-")
        |> PMC.enclose_columns(["Story:", story.name <> "(ID: " <>
          Integer.to_string(story.id) <> ")"], "||")
        |> PMC.enclose_columns(["Column:", column.name], "||")
        |> PMC.h_bar("="),
    do: PMC.print(pmc)
  end

  def show(task_id) do
    with_item(task_id, &show_task/1)
  end
end