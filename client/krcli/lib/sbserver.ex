defmodule SbServer do
  use HTTPoison.Base

  # @endpoint "http://localhost:3000"
  @endpoint "http://httpbin.org"

  defp process_url(url) do
    @endpoint <> url
  end
end