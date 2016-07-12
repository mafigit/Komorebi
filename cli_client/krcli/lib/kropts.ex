defmodule KrOpts do
  def dispatch(args) do
    case args do
      [board, "show"] -> Krcli.Board.display(board)
      ["boards"] -> Krcli.Board.list
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