defmodule Krcli.Table do
    defstruct [:columns, :width, :lines, :headers, :data]

    def create(t) do
      %Krcli.Table{
        columns: t.columns,
        width: t.width,
        lines: t.lines,
        headers: t.headers,
        data: t.data
      }
    end

    def p_spacer(tab) do
      IO.puts("-" <> String.duplicate("-", tab.columns*(tab.width+1)))
      tab
    end
    def p_step(tab, item) do
      :io.format("~-" <> Integer.to_string(tab.width) <> "s|", [item])
      tab
    end

    def p_header(tab) do
      :io.format("|")
      Enum.each(tab.headers, fn(head) ->
        p_step(tab, head)
        end)
      IO.puts("")
      tab
    end

    def p_base_table(tab) do
      tab |> p_spacer |> p_header |> p_spacer |> p_table_body
    end

    def p_table_body(tab) do
      Enum.each(0..(tab.lines-1), fn(lin) ->
        IO.write("|")
        Enum.each(0..(tab.columns-1), fn(col) ->
          p_step(tab, Enum.at(tab.data, lin, []) |> Enum.at(col, ""))
      end) |> Util.no_args(&IO.puts/1, "")
    end) |> Util.no_args(&p_spacer/1, tab) |> Util.good
  end
end
