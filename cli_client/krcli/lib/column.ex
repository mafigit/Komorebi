defmodule Krcli.Column do
  defstruct [:id, :name, :position]

  def create(col) do
    %Krcli.Column{ id: col["id"],
      name: col["name"], position: col["position"] }
  end

  def sort(input) do
    with {:ok, columns} <- input,
      sort_col = fn (a,b) -> a.position > b.position end,
      do: Util.wrap(Enum.sort(columns, sort_col))
  end
end