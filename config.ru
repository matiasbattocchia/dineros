
require 'bundler'

Bundler.require

I18n.enforce_available_locales = true

Mongoid.load!('./mongoid.yml')
Mongoid.raise_not_found_error = false

ActiveSupport::Inflector.inflections do |inflect|
  inflect.irregular 'usuario', 'usuarios'
  inflect.irregular 'gasto', 'gastos'
  inflect.irregular 'aporte', 'aportes'
  inflect.irregular 'participación', 'participaciones'
  inflect.irregular 'cuenta', 'cuentas'
end

use Rack::Session::Cookie,
 :key => 'rack.session',
 :domain => 'foo.com',
 :path => '/',
 :expire_after => 2592000,
 :secret => 'change_me'

use Rack::Flash

use Rack::MethodOverride

root = ::File.dirname(__FILE__)
require ::File.join( root, 'app' )


run App.new
