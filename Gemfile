source 'https://rubygems.org'

gem 'sinatra'
gem 'tilt', '~> 1.4'
gem 'slim'

# Se congela por el uso de strong parameters 
# no disponible en versiones >= 4.0
# https://github.com/mongoid/mongoid/blob/master/CHANGELOG.md#readme
gem 'mongoid', "< 4"
gem 'rack-flash3', require: 'rack-flash'
gem 'puma'
gem 'bcrypt'

group :develoment do
  gem 'pry'
end

group :test do
  gem 'rspec'
end
