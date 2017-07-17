defmodule FN do
  defmacro __using__(opts) do

    quote do
      import FN
      def type_url, do: unquote(opts[:url])
      def type_name, do: unquote(opts[:name])
      def type_json_name, do: unquote(opts[:json_name])

      def from_hash(_) do
        raise "unimplemented"
      end

      def by_name(name, data) do
        with {:ok, items} <- data,
        item = Enum.find(items, :error, Util.ln_cmp(name, &(&1.name))),
        do:
          if item == :error, do: {:error, "could not find " <> type_name},
          else: Util.wrap(item)
      end

      def by_name(name), do: by_name(name, all)

      def all_json do
        SbServer.get_json(type_url) |> Util.unwrap |> JSX.decode
      end

      def all_json(board_name) do
        SbServer.get_json("/" <> board_name) |> Util.unwrap |> JSX.decode
      end

      def all_fun(json_fun) do
        with map_parse = fn(x) -> Enum.map(x, &from_hash/1) end,
        do: json_fun.() |> Util.unwrap |> map_parse.() |> Util.wrap
      end

      def all(), do: all_fun(&all_json/0)

      def with_item(item, fun) do
        by_name(item) |> Util.comply_fn(&(fun.(&1)))
      end

      def destroy(item) do
        with_item(item, &destroy_item/1)
      end

      def destroy_item(item) do
        SbServer.delete_json(type_url <> "/" <> Integer.to_string(item.id))
        |> Util.success?
        |> Util.comply!(type_name <> " successfully destroyed.")
      end

      def parse_batch(items) do
        items |> Util.unwrap |> Enum.map(&(parse(&1) |> Util.unwrap)) |> Util.wrap
      end

      defoverridable [from_hash: 1, by_name: 1]
    end
  end

end