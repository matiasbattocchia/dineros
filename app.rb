ActiveSupport::Inflector.inflections do |inflect|
  inflect.irregular 'usuario', 'usuarios'
  inflect.irregular 'gasto', 'gastos'
  inflect.irregular 'aporte', 'aportes'
  inflect.irregular 'participación', 'participaciones'
end

class Usuario
  include Mongoid::Document

  has_many :aportes
  has_many :participaciones

  field :nombre, type: String
end

class Gasto
  include Mongoid::Document

  has_many :aportes
  has_many :participaciones

  field :concepto, type: String
  field :monto, type: Float
  field :fecha, type: Time
end

class Aporte
  include Mongoid::Document

  belongs_to :usuario
  belongs_to :gasto

  field :monto, type: Float
end

class Participación
  include Mongoid::Document

  belongs_to :usuario
  belongs_to :gasto

  field :porcentaje, type: Integer
end

get '/gastos/nuevo' do
  slim :nuevo
end
