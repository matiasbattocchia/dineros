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

class Usuario
  include Mongoid::Document

  has_many :aportes, dependent: :restrict
  has_many :participaciones, dependent: :restrict
  has_and_belongs_to_many :cuentas

  field :nombre, type: String

  def toma prestatario, dinero
    cuenta = Cuenta.find_or_initialize_by(usuario_ids: [self.id, prestatario.id].sort)
    cuenta.inc(:monto, dinero)
  end
end

class Gasto
  include Mongoid::Document

  has_many :aportes, dependent: :destroy
  has_many :participaciones, dependent: :destroy

  field :concepto, type: String
  field :fecha, type: Time

  def monto
    aportes.sum(:monto).to_f
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

  field :proporción, type: Float

  validates_numericality_of :proporción, less_than_or_equal_to: 1
  validates_numericality_of :proporción, greater_than: 0
end

class Cuenta
  include Mongoid::Document

  has_and_belongs_to_many :usuarios

  field :monto, type: Float
end

get '/' do
  redirect to '/gastos'
end

get '/gastos/nuevo' do
  @gasto = Gasto.new
  @gasto.id = nil
  @usuarios = aportantes(@gasto)
  slim :editar_gasto
end

get '/gastos' do
  @gastos = Gasto.desc(:fecha)
  slim :gastos
end

post '/gastos' do
  Gasto.find(params[:id]).destroy unless params[:id].empty?

  gasto = Gasto.create params[:gasto]
  
  params[:pagadores].delete_if { |i| i[:id].empty? }

  params[:pagadores].each do |prestamista|
    aporte = gasto.aportes.new(monto: pagador[:monto].gsub(',', '.'))
    Usuario.find(pagador[:id]).aportes << aporte
  end

  Usuario.find(params[:gastadores]).each do |gastador|
    participación = gasto.participaciones.new(proporción: 1.0 / params[:gastadores].length)
    gastador.participaciones << participación

    gasto.aportes.each do |aporte|
      deuda = aporte.monto * participación.proporción
      gastador.toma(aporte.usuario, deuda)
    end
  end

  redirect to '/gastos'
end

get '/gastos/:id' do
  @gasto = Gasto.find params[:id]
  @usuarios = aportantes(@gasto)
  slim :editar_gasto
end

def aportantes gasto
  Usuario.all.map{ |u| {id: u.id, nombre: u.nombre, monto: if aporte = u.aportes.find_by(gasto_id: gasto.id) then aporte.monto end} }
end
