require 'sinatra'


use Rack::Session::Cookie,
 :secret => 'change_me'

use Rack::Flash


require_relative 'models/init'

require_relative 'routes/init'
