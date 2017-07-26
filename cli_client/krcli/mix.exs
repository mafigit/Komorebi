defmodule Krcli.Mixfile do
  use Mix.Project

  def project do
    [app: :krcli,
     version: "0.0.1",
     elixir: "~> 1.1-dev",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     escript: [main_module: Krcli],
     deps: deps()]
  end

  # Configuration for the OTP application
  #
  # Type `mix help compile.app` for more information
  def application do
    [applications: [:logger, :httpoison, :exjsx],
     mod: {Krcli, []}]
  end

  # Dependencies can be Hex packages:
  #
  #   {:mydep, "~> 0.3.0"}
  #
  # Or git/path repositories:
  #
  #   {:mydep, git: "https://github.com/elixir-lang/mydep.git", tag: "0.1.0"}
  #
  # Type `mix help deps` for more examples and options
  defp deps do
    [{:exjsx, "~> 3.2"}, {:httpoison, "~> 0.9.0"}, {:configparser_ex, "~> 1.0.0"}]
  end
end
