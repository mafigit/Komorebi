defmodule ColumnTest do
  use ExUnit.Case, async: true
  doctest Krcli.Column

  test "Should create column from hash" do
    col = Krcli.Column.parse(%{"id" => 5, "name" => "blah",
      "position" => 5})
    assert col.name == "blah"
    assert col.id == 5
    assert col.position == 5
  end

  test "Should sort columns correctly" do
    cols = [%Krcli.Column{position: 5},
      %Krcli.Column{position: 3}, %Krcli.Column{position: 7}]
    {:ok, ncols} = Krcli.Column.sort({:ok, cols})
    assert [3, 5, 7] == Enum.map(ncols, fn(x) -> x.position end)
  end
end
