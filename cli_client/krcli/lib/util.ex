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

  def success?({:ok, item}),   do: success?(item)
  def success?(item) do
    with {:ok, data} <- JSX.decode(item),
    do: if data["success"], do: {:ok, ""}, else: {:error, data["message"]}
  end

  def comply!(data, success) do
    comply_fn(data, fn(_data) -> IO.puts(success) end)
  end

  def comply_fn(data, fun) do
    case data do
      {:ok, okv} -> fun.(okv) |> good
      {:error, msg} -> raise msg
      unexpected -> raise inspect(unexpected)
    end
  end

  def comply_good(data), do: comply_fn(data, &(&1))

  def ln_cmp(val, fun) do
    &(fun.(&1) == String.downcase(val))
  end
end