defmodule Krcli.Board do
  defstruct [:id, :name, :columns]

  def parse_board(json) do
    with {:ok, brd} <- JSX.decode(json),
    {:ok, cols} <- JSX.decode(json),
    do: %Krcli.Board{id: brd.id, name: brd.name, columns: cols}
  end

  def show do
    # XXX[mh] need to actually get data from somewhere.
    IO.puts("There, a board! seen it?")
  end
end