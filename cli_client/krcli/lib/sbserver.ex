defmodule SbServer do
  use HTTPoison.Base

  defp process_url(url) do
    Path.join(Conf.current.server, url)
  end

  def get_json(url) do
    # XXX[mh] do true error handling of http
    case get(url, %{Accept: "application/json"}) do
      {:ok, data} -> {:ok, data.body}
      result -> result
    end
  end

  def delete_json(url) do
    case delete(url, %{"Content-Type" => "application/json"}) do
      {:ok, data} -> {:ok, data.body}
      result -> result
    end
  end

  def post_json(url, data) do
    # XXX[mh] do true error handling of http
    case post(url, data, %{"Content-Type" => "application/json"}, []) do
      {:ok, data} -> {:ok, data.body}
      result -> result
    end
  end

end