defmodule Util do

  def wrap(item) do
    {:ok, item}
  end

  def wrap(:ok, item) do
    wrap(item)
  end

  def unwrap(item) do
    case item do
      {:ok, data} -> data
      {:error, err} -> raise err
      unexpected -> unexpected
    end
  end

  def unwrap_fn(item, fun) do
    unwrap(item) |> fun.()
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
      {:error, msg} -> raise inspect(msg)
      unexpected -> raise inspect(unexpected)
    end
  end

  def comply_good(data), do: comply_fn(data, &(&1))

  def ln_cmp(val, fun) do
    &(fun.(&1) == String.downcase(val))
  end

  def cmp(val, fun) do
    &(fun.(&1) == val)
  end

  def num_cmp(val, fun) do
    &(fun.(&1) == val)
  end

  def lift_maybe(inp, fun) do
    case inp do
      {:ok, data} -> fun.(data) |> wrap
      {:error, _} -> inp
     end
  end

  def lift_pr(inp, fun) do
    case inp do
      :ok -> fun.()
      unexpected -> unexpected
    end
  end

  def collect_till(data, from, to) do
    Enum.reduce(data, {0,[]},
      fn(x, {state, acc}) -> cond do
        x == from and state == 0 -> {1, []}
        x == to and state == 1 -> {2, acc}
        state == 1 -> {1, [x | acc]}
        true -> {state, acc}
      end end)
  end

  def split_indent_wrap(str, ind) do
    String.split(str, "\n") |> Enum.map(&(ind <> &1)) |> Enum.join("\n")
  end

  def no_args(_, fun, arg) do
    fun.(arg)
  end

end