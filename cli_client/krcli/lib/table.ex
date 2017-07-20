defmodule Krcli.Table do
  defstruct [:columns, :width, :lines, :headers, :data, :pad_left, :pmc]

  def create(t) do
    %Krcli.Table{
      columns: t.columns,
      width: t.width,
      lines: t.lines,
      headers: t.headers,
      data: t.data,
      pad_left: t["pad_left"] || 0,
      pmc: PMC.setup(t.width, t["pad_left"] || 0)
    }
  end

  def p_header(tab) do
    with pmc <- PMC.h_bar(tab.pmc, "-")
    |> PMC.enclose_columns(tab.headers, "|")
    |> PMC.h_bar("-"),
    do: %{ tab | pmc: pmc }
  end

  def p_base_table(tab) do
    p_header(tab) |> p_table_body
  end

  def _max_table_depth(cols) do
    Enum.reduce(cols, 0, fn({_, v}, acc) ->
      with l=length(v || []), do: if l > acc, do: l, else: acc
    end)
  end

  def _table_line(lin, tab) do
    with line = tab.data[lin] || %{},
      max_depth <- _max_table_depth(line),
    do:
      %{tab | pmc: Enum.reduce(0..(max_depth-1), tab.pmc, fn(dep, pmc) ->
        PMC.enclose_columns(pmc, Enum.map(0..(tab.columns-1), fn(col) ->
          Enum.at(line[col] || [], dep, "")
        end), "|")
      end) |> PMC.h_bar("-") }
    end

  def p_print_tab(tab), do: PMC.print(tab.pmc)

  def p_table_body(tab) do
    Enum.reduce(0..(tab.lines-1), tab, &_table_line/2) |> p_print_tab
    |> Util.good
  end
end
