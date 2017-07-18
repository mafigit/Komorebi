defmodule Error do
  def display(msg) do
    IO.puts("An error has occurred: " <> msg) |> Util.wrap(msg)
  end
end