defmodule KrOpts do
  def dispatch(args) do
    Conf.read_and_store_conf
    if File.exists?("#{Conf.current.home}/krcli.story"),
      do: Krcli.Story.create_from_file() |> Util.comply_good,
    else: if File.exists?("#{Conf.current.home}/krcli.task"),
      do: Krcli.Task.create_from_file() |> Util.comply_good,
      else: dispatch_from_args(args)
  end

  def show_help() do
    IO.puts("Komorebi commandline client v0.0.1-alpha-1. Usage:
[general]
  krcli help -> this helpfile
[boards]
  krcli boards -> list available boards
  krcli board <boardid> new -> create a new board
  krcli board <boardid> destroy -> destory a board
  krcli board <boardid> show -> show a boards contents
[columns]
  krcli board <boardid> column <columid> new -> new column
  krcli board <boardid> column <columnid> destroy -> destroy column
[stories]
  krcli board <boardid> story new -> new story
  krcli story <storyid> destroy -> destroy story
  krcli story <storyid> show -> show story
  krcli story <storyid> move <boardid> <columnid> -> move story to board / column
[tasks]
  krcli task new -> new task
  krcli task <taskid> show -> show details of a task
  krcli task <taskid> move <boardid> <columnid> -> move task to board / column
[only with default board/column in ~/.krclirc]
  krcli board show -> board show with config file default board
  krcli column <column> new -> new column on default board
  krcli column <column> destroy -> destroy column on default board
")
  end

  def dispatch_from_args(args) do
    case args do
      ["help"] -> KrOpts.show_help()
      ["board", board, "show"] -> Krcli.Board.display(board)
      ["boards"] -> Krcli.Board.list
      ["board", board, "new"] -> Krcli.Board.create(board)
      ["board", board, "destroy"] -> Krcli.Board.destroy(board)
      ["board", board, "column", column, "new"] ->
        Krcli.Board.create_column(column, board)
      ["board", board, "column", column, "destroy"] ->
        Krcli.Board.destroy_column(column, board)
      ["story", "new"] -> Krcli.Story.create
      ["story", story_id, "destroy"] -> Krcli.Story.destroy(story_id)
      ["story", story_id, "show"] -> Krcli.Story.show(story_id)
      ["story", story_id, "move", board, column] -> Krcli.Story.move(board, column, story_id)
      ["story", story_id, "tasks"] -> Krcli.Task.display(story_id)
      ["task", "new"] -> Krcli.Task.create
      ["task", task_id, "show"] -> Krcli.Task.show(task_id)
      ["board", "show"] -> Conf.with_config(:board, &Krcli.Board.display/1)
      ["column", column, "new"] -> Conf.with_config(:board,
        &(Krcli.Board.create_column(column, &1)))
      ["column", column, "destroy"] -> Conf.with_config(:board,
        &(Krcli.Board.destroy_column(column, &1)))
      _ -> error(:no_opt)
    end
  end

  def error(cause) do
    case cause do
      :no_opt -> IO.puts("Option is not known. try krcli help.")
      _ -> IO.puts("Generic Error 42 :-(")
    end
  end
end