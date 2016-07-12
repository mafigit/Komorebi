defmodule SbServer do
  use HTTPoison.Base

  # XXX [mh] Actually make this configurable
  @endpoint "http://localhost:8080"

  defp process_url(url) do
    @endpoint <> url
  end

  def get_json(url) do
    # XXX[mh] do true error handling of http
    case get(url, %{Accept: "application/json"}) do
      {:ok, data} -> {:ok, data.body}
      result -> result
    end
  end

end