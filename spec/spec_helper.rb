require 'bundler'

Bundler.require

set :environment, :test

Mongoid.load!('./mongoid.yml')

RSpec.configure do |config|
  config.before(:each) do
    Mongoid.purge!
  end
end

require_relative '../app'
