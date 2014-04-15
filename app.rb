class Float
  def to_currency currency=''
    currency + ('%.2f' % self).gsub('.', ',')
  end
end

class Time
  def short
    self.strftime('%b %-d')
  end
end

ActiveSupport::Inflector.inflections do |inflect|
  inflect.irregular 'usuario', 'usuarios'
  inflect.irregular 'gasto', 'gastos'
  inflect.irregular 'aporte', 'aportes'
  inflect.irregular 'participación', 'participaciones'
end

class Usuario
  include Mongoid::Document

  has_many :aportes, dependent: :restrict
  has_many :participaciones, dependent: :restrict

  field :nombre, type: String
end

class Gasto
  include Mongoid::Document

  has_many :aportes, dependent: :destroy
  has_many :participaciones, dependent: :destroy

  field :concepto, type: String
  field :fecha, type: Time

  def monto
    aportes.sum(:monto)
  end

  def pagadores
    aportes.map{ |aporte| aporte.usuario.nombre }.join(', ')
  end

  def gastadores
    participaciones.map{ |part| part.usuario.nombre }.join(', ')
  end
end

class Aporte
  include Mongoid::Document

  belongs_to :usuario
  belongs_to :gasto

  field :monto, type: Float

  validates_numericality_of :monto, greater_than: 0
end

class Participación
  include Mongoid::Document

  belongs_to :usuario
  belongs_to :gasto

  field :porcentaje, type: Integer
end

get '/gastos/nuevo' do
  @gasto = Gasto.new
  @gasto.id = nil
  slim :editar_gasto
end

get '/gastos' do
  @gastos = Gasto.desc(:fecha)
  slim :gastos
end

post '/gastos' do
  Gasto.find(params[:gasto_existente]).destroy unless params[:gasto_existente].empty?

  gasto = Gasto.create params[:gasto]
  
  params[:pagadores].delete_if { |i| i[:id].empty? }
  params[:pagadores].each do |pagador|
    aporte = gasto.aportes.new(monto: pagador[:monto].gsub(',', '.'))
    Usuario.find(pagador[:id]).aportes << aporte 
  end

  params[:gastadores].each do |gastador|
    participación = gasto.participaciones.new(porcentaje: 100.0 / params[:gastadores].length)
    Usuario.find(gastador).participaciones << participación
  end

  redirect to '/gastos'
end

get '/gastos/:id' do
  @gasto = Gasto.find params[:id]
  slim :editar_gasto
end
