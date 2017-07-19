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
    IO.puts("Komorebi commandline client v0.0.1-pre-alpha-1. Usage:
      krcli help -> this helpfile
      krcli boards -> list available boards
      krcli board <boardid> new -> create a new board
      krcli board <boardid> destroy -> destory a board
      krcli board <boardid> show -> show a boards contents
      krcli board <boardid> column <columid> new -> new column
      krcli board <boardid> column <columnid> destroy -> destroy column
      krcli board <boardid> story new -> new story
      krcli story <storyid> destroy -> destroy story
      krcli story <storyid> show -> show story
      krcli story <storyid> move <boardid> <columnid> -> move story to board / column
      krcli task new -> new task
      krcli task <taskid> show -> show details of a task
      krcli task <taskid> move <boardid> <columnid> -> move task to board / column")
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