defmodule Util do
  def wrap(item) do
    {:ok, item}
  end

  def unwrap(item) do
    case item do
      {:ok, data} -> data
      {:error, err} -> raise err
      unexpected -> unexpected
    end
  end

  def good(_), do: {:ok, []}
  def good(), do: {:ok, []}

  def error_check(item) do
    Util.unwrap(item) |> Util.wrap
  end
end