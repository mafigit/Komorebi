defmodule PMC do
  defstruct [:width, :padding, :canvas, :cursor_l, :cursor_r]

  def setup(width, padding \\ 0) do
    %PMC{width: width, canvas: %{}, cursor_r: 0, cursor_l: 0, padding: padding}
  end

  def _paint_canvas(pmc, line) do
    with {_, new_map} <- Map.get_and_update(pmc, :canvas, fn(val) ->
      {val, Map.put(val || %{}, pmc.cursor_r, _pad(pmc) <> line)}
    end),
    do: Map.put(new_map, :cursor_r, pmc.cursor_r + 1)
  end

  def _pad(pmc) do
    String.duplicate(" ", pmc.padding)
  end

  def h_bar(pmc, char), do: _paint_canvas(pmc,
    String.duplicate(char, round((pmc.width-pmc.padding)/String.length(char))))

  def enclose(pmc, text, border) do
    with str = "#{border} #{text} " <>
      String.duplicate(" ", pmc.width - String.length(text) - 3 - pmc.padding -
        String.length(border)*2) <> " #{border}",
    do: _paint_canvas(pmc, str)
  end

  def _trunc(str, len) do
    if String.length(str) >= len, do: String.slice(str, 0..(len-3)), else: str
  end

  def enclose_columns(pmc, cols, border) do
    with num_cols = length(cols),
      bord_len = String.length(border),
      len_per = round(Float.floor((pmc.width - pmc.padding - bord_len)/num_cols)),
      padded_cols <- Enum.map(cols, fn(col) -> with ncol <- _trunc(col, len_per), do:
        "#{border} #{ncol}" <>
        String.duplicate(" ", len_per - String.length(ncol) - bord_len - 1) end),
      str <- Enum.join(padded_cols, ""),
    do: _paint_canvas(pmc, str <> String.duplicate(" ",pmc.width - (len_per*num_cols + pmc.padding + bord_len)) <> border),
  end

  def enclose_multiline(pmc, str, border) do
    Enum.reduce(Enum.reverse(String.split(str, "\n")), pmc, fn(line, pmc) ->
      enclose(pmc, line, border)
    end)
  end

  def print(pmc) do
    Enum.each(pmc.canvas, fn({_,v}) -> IO.puts(v) end)
  end
end
