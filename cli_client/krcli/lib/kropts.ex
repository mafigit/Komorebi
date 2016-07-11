defmodule KrOpts do
  def dispatch(arg) do
    case arg do
      "show" -> Krcli.Board.show
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