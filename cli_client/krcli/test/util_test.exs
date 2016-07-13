defmodule UtilTest do
  use ExUnit.Case, async: true
  doctest Util

  test "Wrap should wrap data functionality" do
    assert {:ok, {:ok, "blah"}} == Util.wrap({:ok, "blah"})
  end

  test "Unwrap should not ignore errors" do
    broken = fn() -> {:error, "broken"} end
    consumer = fn(_) -> {:ok, "nope"} end
    assert_raise(RuntimeError, 
      (fn() -> broken.() |> Util.unwrap |> consumer.() end))
  end

  test "The 'good' function should just make all good" do
    broken = fn() -> {:error, "broken"} end
    assert {:ok, []} == broken.() |> Util.good
  end
end
