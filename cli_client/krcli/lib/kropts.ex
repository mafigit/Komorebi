defmodule KrOpts do
  def dispatch(args) do
    case args do
      ["board", board, "show"] -> Krcli.Board.display(board)
      ["boards"] -> Krcli.Board.list
      ["board", board, "new"] -> Krcli.Board.create(board)
      ["board", board, "column", columnpos, "new"] ->
        with [column,pos|overhead] <- String.split(columnpos, ":"),
          do: if length(overhead) > 0, do: error(:no_colon),
              else: Krcli.Board.create_column(column, board, pos)
      _ -> error(:no_opt)
    end
  end

  def error(cause) do
    case cause do
      :no_opt -> IO.puts("Option is not known or currently" <>
        " unknown.")
      :no_colon -> IO.puts("Can't have colons in the column name.")
      _ -> IO.puts("Generic Error 42 :-(")
    end
  end
end