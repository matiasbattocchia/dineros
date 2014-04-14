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
  field :fecha, type: Time

  def monto
    aportes.sum(:monto)
  end
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

get '/gastos' do
  slim :gastos
end

post '/gastos' do
  gasto = Gasto.create params[:gasto]
  
  params[:pagadores].pop
  params[:pagadores].each do |pagador|
    aporte = gasto.aportes.new(monto: pagador[:monto])
    Usuario.find(pagador[:id]).aportes << aporte 
  end

  params[:gastadores].each do |gastador|
    participación = gasto.participaciones.new(porcentaje: 100.0 / params[:gastadores].length)
    Usuario.find(gastador).participaciones << participación
  end

  redirect to '/gastos'
end
