defmodule Krcli.Task do
  defstruct [:id, :name, :desc, :story_id, :column_id, :priority]
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
      priority: col["priority"]
    }
  end

  def by_name(item) do
    SbServer.get_json("/tasks/" <> item)
    |> Util.unwrap_fn(&JSX.decode/1)
    |> Util.unwrap_fn(&parse/1)
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
    with {:ok, data} <- File.read("/tmp/krcli.task"),
      lines = String.split(data, ["\n"]),
      ["Column", column_id] <- String.split(Enum.at(lines, 1), ":"),
      ["Story", story_id] <- String.split(Enum.at(lines, 2), ":"),
      ["Name", nname] <- String.split(Enum.at(lines, 3), ":"),
      ["Points", points] <- String.split(Enum.at(lines, 4), ":"),
      ["Priority", prio] <- String.split(Enum.at(lines, 5), ":"),
      {2, description} <- Util.collect_till(lines, "Description:", "EOTD"),
      {ncolumn, _} <- Integer.parse(column_id),
      {nstory, _} <- Integer.parse(story_id),
      {npoints, _} <- Integer.parse(points),
      {nprio, _} <- Integer.parse(prio),
      ndesc = Enum.join(description, "\n"),
      {:ok, json} <- JSX.encode(%{name: nname, desc: ndesc,
        points: npoints, column_id: ncolumn, priority: nprio,
        story_id: nstory}),
    do:
      SbServer.post_json("/tasks", json)
      |> Util.lift_maybe(fn(_) -> File.rm("/tmp/krcli.task") end)
      |> Util.comply!("Task created successfully!")

  end

 def create(board, column, story) do
    with {:ok, file} <- File.open("/tmp/krcli.task", [:write]),
      :ok <- IO.write(file, "Board:" <> Integer.to_string(board.id) <> "\n"),
      :ok <- IO.write(file, "Column:" <> Integer.to_string(column.id) <> "\n"),
      :ok <- IO.write(file, "Story:" <> Integer.to_string(story.id) <> "\n"),
      :ok <- IO.write(file, "Name:CHANGEME\n"),
      :ok <- IO.write(file, "Points:3\n"),
      :ok <- IO.write(file, "Priority:1\n"),
      :ok <- IO.write(file, "Description:\nSome Description\nEOTD\n"),
      :ok <- File.close(file),
    do: IO.puts("The file /tmp/krcli.task has been written to disk. Please " <>
      "Edit it with the data you would like to have, running:\n\n" <>
      (System.get_env("EDITOR") || "vim") <> " /tmp/krcli.task && krcli\n\n" <>
      "to create the task.")
  end

  def show_task(task) do
    with task_id = Integer.to_string(task.id),
    pad_desc = Util.split_indent_wrap(task.desc, "  "),
    prio = Integer.to_string(task.priority),
    column_name = Krcli.Column.by_id(Integer.to_string(task.column_id)).name,
    do:
      IO.puts("Task: " <> task.name <>
        " ( task:" <> task_id <> ", Column: " <> column_name <> " )" <>
      "\nPriority: " <> prio <>
      "\nDescription:\n" <> pad_desc <> "\n")
  end

  def show(task_id) do
    with_item(task_id, &show_task/1)
  end
end