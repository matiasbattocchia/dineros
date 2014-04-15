require 'bundler'

Bundler.require

Mongoid.load!('./mongoid.yml')
Mongoid.raise_not_found_error = false

use Rack::Session::Cookie,
  :key => 'rack.session',
  :domain => 'foo.com',
  :path => '/',
  :expire_after => 2592000,
  :secret => 'change_me'

use Rack::Flash

require './app'

run Sinatra::Application
