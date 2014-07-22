require 'bundler'
Bundler.require
#################

set :bind, '0.0.0.0'

I18n.enforce_available_locales = true

Mongoid.load!('./mongoid.yml')
Mongoid.raise_not_found_error = false

module Mongoid
  module Document
    def as_json(options={})
      attrs = super(options)
      attrs['id'] = attrs.delete('_id')
      attrs
    end
  end
end

ActiveSupport::Inflector.inflections do |inflect|
  inflect.irregular 'usuario', 'usuarios'
  inflect.irregular 'gasto', 'gastos'
  inflect.irregular 'aporte', 'aportes'
  inflect.irregular 'participación', 'participaciones'
  inflect.irregular 'cuenta', 'cuentas'
end

use Rack::MethodOverride

use Rack::Session::Cookie,
  :secret => 'change_me'

use Rack::Flash

helpers do
  def usuario
    session[:usuario]
  end

  def protegido!
    unless usuario
      session[:volver_a] = request.fullpath
      redirect to '/entrar'
    end
  end
end

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

  # has_many :aportes, dependent: :restrict
  # has_many :participaciones, dependent: :restrict
  # has_and_belongs_to_many :cuentas

  field :nombre, type: String
  field :correo, type: String
  field :contraseña, type: String
  field :sal, type: String

  def amigos
    Usuario.all
  end

  # def toma prestatario, dinero
  #   cuenta = Cuenta.find_or_initialize_by(usuario_ids: [self.id, prestatario.id].sort)
  #   cuenta.inc(:monto, dinero)
  # end
end

class Contrato
  include Mongoid::Document

  field :partes
  field :límite
  field :estado
end

class Gasto
  include Mongoid::Document

  embeds_many :aportes
  embeds_many :participaciones

  field :concepto, type: String
  field :fecha, type: Time

  def monto
    aportes.sum(:monto)
  end

  def pagadores
    # Los datos del usuario se podrían denormalizar.
    aportes.map{ |aporte| {id: aporte.usuario.id, nombre: aporte.usuario.nombre, monto: aporte.monto} }
  end

  def gastadores
    # Los datos del usuario se podrían denormalizar.
    participaciones.map{ |participación| {id: participación.usuario.id, nombre: participación.usuario.nombre, proporción: participación.proporción} }
  end
end

class Aporte
  include Mongoid::Document

  belongs_to :usuario
  embedded_in :gasto
  #belongs_to :gasto

  field :monto, type: Float

  validates_numericality_of :monto, greater_than: 0
end

class Participación
  include Mongoid::Document

  belongs_to :usuario
  embedded_in :gasto

  field :proporción, type: Float

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

get '/entrar' do
  slim :entrar
end

post '/entrar' do
  if session[:usuario] = Usuario.find_by(correo: params[:correo])
    redirect to '/gastos'
    # redirect back tiene el problema de no redirigir a ninguna parte
    # si la landing page fue '/entrar'.
    # redirect back
  else
    redirect to '/entrar'
  end
end

post '/salir' do
  protegido!

  session[:usuario] = nil
  redirect to '/entrar'
end

get '/perfil' do
  protegido!

  slim :perfil
end

get '/gastos' do
  protegido!

  @gastos = Gasto.or({'aportes.usuario_id' => usuario.id}, {'participaciones.usuario_id' => usuario.id}).desc(:fecha)

  slim :gastos
end

get '/gastos/nuevo' do
  protegido!

  @gasto = Gasto.new
  @gasto.id = nil

  slim :editar_gasto
end

post '/gastos' do
  protegido!

  # flash[:message] = params.to_s

  Gasto.find(params[:id]).destroy unless params[:id].empty?

  gasto = Gasto.create params[:gasto]

  params[:pagadores].each do |pagador|
    aporte = gasto.aportes.new(monto: pagador[:monto].gsub(',', '.'))
    # TODO: El usuario debería estar entre los amigos.
    aporte.usuario = Usuario.find(pagador[:id])
  end

  params[:gastadores].each do |gastador|
    participación = gasto.participaciones.new(proporción: (params[:gasto_desigual] and gastador[:proporción] or 1))

    # TODO: El usuario debería estar entre los amigos.
    participación.usuario = Usuario.find(gastador[:id])
  end

  gasto.save
  puts gasto.errors.messages

  # Usuario.find(params[:gastadores]).each do |gastador|
  #   participación = gasto.participaciones.new(proporción: 1.0 / params[:gastadores].length)
  #   gastador.participaciones << participación

  #   gasto.aportes.each do |aporte|
  #     deuda = aporte.monto * participación.proporción
  #     gastador.toma(aporte.usuario, deuda)
  #   end
  # end

  redirect to '/gastos'
end

get '/gastos/:id' do
  protegido!

  @gasto = Gasto.find params[:id]

  slim :editar_gasto
end

delete '/gastos/:id' do
  protegido!

  Gasto.find(params[:id]).destroy unless params[:id].empty?

  redirect to '/gastos'
end
