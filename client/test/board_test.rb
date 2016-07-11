require 'rubygems'
require 'capybara'
require 'capybara/dsl'
require 'rspec'

Capybara.run_server = false
Capybara.current_driver = :selenium
Capybara.app_host = 'http://www.google.com'

session = Capybara::Session.new :selenium

describe "visit google" do
 it "should go to landing page" do
   session.visit("/")
 end
end
