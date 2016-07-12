defmodule Util do
  def wrap(item) do
    {:ok, item}
  end

  def unwrap(item) do
    with {:ok, data} <- item,
    do: data
  end
end