defmodule Krcli.Board do
  defstruct [:id, :name, :columns, :stories]

  use FN, url: "/boards", name: "Board"

  defmodule Print do
    def board(board) do
      IO.puts "Board is called: " <> board.name
    end

    def _expand_acc_match(task, linenum, colnum, col, story, acc) do
      with task_column_id = task.column_id,
        col_id = col.id,
        task_story_id = task.story_id,
        story_id = story.id,
        line_map = Map.get(acc, linenum, %{}),
        col_map = Map.get(line_map, colnum, []),
      do:
        if task_column_id == col_id and task_story_id == story_id,
          do: Map.put(acc, linenum, Map.put(line_map, colnum, col_map ++
            [Integer.to_string(task.id) <> ": "<>task.name])),
          else: acc
    end

    def _get_story_task_line(board, linenum, story, init, prepend) do
      with {acc, _} <- Enum.reduce(board.columns, {init, 1}, fn(col, {acc_1,colnum}) ->
          {Enum.reduce(story.tasks, acc_1, fn(task, acc_2) ->
            _expand_acc_match(task, linenum, colnum, col, story, acc_2)
          end), colnum+1}
        end),
      do: Map.put(acc, linenum, Map.put(Map.get(acc, linenum) || %{}, 0, prepend))
    end

    def story_tasks_by_column(board) do
      with {result, _} <- Enum.reduce(board.stories, {%{}, 0}, fn(story, {acc, line}) ->
          with prepend <- [Integer.to_string(story.id) <> ": "<> story.name],
          do: {_get_story_task_line(board, line, story, acc, prepend), line + 1}
        end),
      do: result
    end

    def stories_by_column(board) do
      with cols <- story_tasks_by_column(board),
      do:
      Krcli.Table.p_base_table(
        Krcli.Table.create(%{columns: length(board.columns)+1, width: 30,
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

  def create_column(nname, board) do
    with_item(board, &(Krcli.Column.create(nname, &1.id)))
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
            data: Enum.at(Enum.reduce(boards, [%{}, 0],
              fn(x, [acc, ln]) -> [Map.put(acc, ln,
                %{0 => [Integer.to_string(x["id"])],
                  1 => [x["name"]] }),
                ln + 1]
              end), 0, %{})
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
