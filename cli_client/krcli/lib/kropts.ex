defmodule KrOpts do
  def dispatch(args) do
    if File.exists?("/tmp/krcli.story"),
      do: Krcli.Story.create_from_file() |> Util.comply_good,
    else: dispatch_from_args(args)
  end

  def dispatch_from_args(args) do
    case args do
      ["board", board, "show"] -> Krcli.Board.display(board)
      ["boards"] -> Krcli.Board.list
      ["board", board, "new"] -> Krcli.Board.create(board)
      ["board", board, "destroy"] -> Krcli.Board.destroy(board)
      ["board", board, "column", column, "new"] ->
        Krcli.Board.create_column(column, board)
      ["board", board, "column", column, "destroy"] ->
        Krcli.Board.destroy_column(column, board)
      ["board", board, "column", column, "story", "new"] ->
        Krcli.Board.create_story(column, board)
      _ -> error(:no_opt)
    end
  end

  def error(cause) do
    case cause do
      :no_opt -> IO.puts("Option is not known or currently" <>
        " unknown.")
      _ -> IO.puts("Generic Error 42 :-(")
    end
  end
end