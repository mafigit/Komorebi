defmodule Krcli.Board do
  defstruct [:id, :name, :columns, :stories]

  use FN, url: "/boards", name: "Board"

  defmodule Print do
    def board(board) do
      IO.puts "Board is called: " <> board.name
    end

    def _expand_acc_match(task, col, story, acc) do
      with task_column_id = task.column_id,
        col_id = col.id,
        task_story_id = task.story_id,
        story_id = story.id,
      do:
        if task_column_id == col_id and task_story_id == story_id,
          do: (acc ++ [task.name]),
          else: acc
    end

    def _get_story_task_line(board, story, init) do
      Enum.reduce(board.columns, init, fn(col, acc_1) ->
        Enum.reduce(story.tasks, acc_1, fn(task, acc_2) ->
          _expand_acc_match(task, col, story, acc_2)
        end)
      end)
    end

    def story_tasks_by_column(board) do
      Enum.reduce(board.stories, [], fn(story, acc) ->
        with nacc <- [story.name <> " (Id: " <> Integer.to_string(story.id) <> ")"],
          nline <- _get_story_task_line(board, story, nacc),
        do: acc ++ [nline]
      end)
    end

    def stories_by_column(board) do
      with cols <- story_tasks_by_column(board),
      do:
      Krcli.Table.p_base_table(
        Krcli.Table.create(%{columns: length(board.columns)+1, width: 20,
          lines: length(board.stories),
          headers: ["Story" | Enum.map(board.columns, fn(x) -> "Column: " <> x.name end)],
          data: cols })
      )
    end
  end

  def parse(input) do
    with {:ok, json} <- input, {:ok, brd} <- JSX.decode(json),
    do: {:ok, from_hash(brd)}
  end

  def from_hash(brd) do
    with cols = Enum.map(brd["columns"] || [], &Krcli.Column.parse/1)
      |> Krcli.Column.sort,
      stories = Enum.map(brd["stories"] || [], &Krcli.Story.from_hash/1),
    do: %Krcli.Board{id: brd["id"], name: brd["name"], columns: cols,
      stories: stories}
  end

  def with_column(board, item, fun) do
    with {:ok, board} <- fetch(board.name),
      val = Enum.find(board.columns, :error, Util.ln_cmp(item, &(&1.name))),
    do:
      if val == :error, do: {:error, "could not find " <> type_name()},
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

  def with_structure(board, fun) do
    with_item(board, &(fun.(&1)))
  end

  def with_structure(board, column, fun) do
    with_structure(board, fn(b) ->
      Krcli.Column.with_item(b.name, column, &fun.(b, &1))
    end)
  end

  def with_structure(board, column, story, fun) do
    with_structure(board, column, fn(b, c) ->
      Krcli.Story.with_item(story, &fun.(b, c, &1))
    end)
  end

  def create_column(nname, board) do
    with_structure(board, &(Krcli.Column.create(nname, &1.id)))
  end

  defp show_board(input) do
    with {:ok, board} <- input,
      :ok <- Print.board(board),
      :ok <- Print.stories_by_column(board),
    do: Util.wrap([])
  end

  def show_boards(arg) do
    case arg do
      {:ok, boards} ->
        Krcli.Table.p_base_table(
          Krcli.Table.create(%{columns: 2, width: 30,
            lines: length(boards),
            headers: ["Board Id", "Board name"],
            data: Enum.map(boards, fn(x) -> [Integer.to_string(x["id"]), x["name"]] end)
          })
        ) |> Util.good
      {:error, err} -> raise err
    end
  end

  def destroy_column(column, board) do
    with_item(board, &(Krcli.Column.destroy(column, &1) |> Util.comply_good))
  end

  def list do
    all_json() |> show_boards |> Util.comply_good
  end

  def fetch(name) do
    case name do
      %Krcli.Board{} -> fetch(name.name)
      _ -> SbServer.get_json("/" <> name) |> parse
    end
  end

  def display(boardname) do
    fetch(boardname) |> show_board |> Util.comply_good
  end
end
