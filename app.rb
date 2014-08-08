require 'bundler'
Bundler.require
#################

I18n.enforce_available_locales = true

Mongoid.load!('./mongoid.yml')
Mongoid.raise_not_found_error = false

# Este hack convierte los _id de MongoDB a id al
# convertir el objeto a JSON.
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
  include BCrypt

  field :nombre, type: String
  field :correo, type: String
  field :hash_contraseña, type: String
  field :estado, type: String, default: 'no verificado'

  attr_protected :hash_contraseña, :estado

  validates_presence_of :nombre, :correo, :hash_contraseña
  validates_inclusion_of :estado, in: ['no verificado', 'verificado', 'administrador']

  def amigos
    Usuario.all
  end

  def contraseña
    @contraseña ||= Password.new hash_contraseña
  end

  def contraseña= nueva_contraseña
    @contraseña = Password.create nueva_contraseña
    self.hash_contraseña = @contraseña
  end

  # def toma prestatario, dinero
  #   cuenta = Cuenta.find_or_initialize_by(usuario_ids: [self.id, prestatario.id].sort)
  #   cuenta.inc(:monto, dinero)
  # end
end

# class Contrato
#   include Mongoid::Document

#   field :partes
#   field :límite
#   field :estado
# end

class Gasto
  include Mongoid::Document

  embeds_many :aportes
  embeds_many :participaciones

  field :concepto, type: String
  field :fecha, type: Time

  validates_presence_of :aportes, :participaciones, :concepto, :fecha

  def monto
    aportes.sum(:monto)
  end

  def pagadores
    aportes.map{ |aporte| {id: aporte.usuario_id, nombre: aporte.usuario_nombre, monto: aporte.monto} }
  end

  def gastadores
    participaciones.map{ |participación| {id: participación.usuario_id, nombre: participación.usuario_nombre, proporción: participación.proporción} }
  end
end

class Aporte
  include Mongoid::Document

  belongs_to :usuario
  embedded_in :gasto

  field :usuario_nombre, type: String
  field :monto, type: Float

  validates_presence_of :usuario, :usuario_nombre, :gasto
  validates_numericality_of :monto, greater_than: 0
end

class Participación
  include Mongoid::Document

  belongs_to :usuario
  embedded_in :gasto

  field :usuario_nombre, type: String
  field :proporción, type: Float

  validates_presence_of :usuario, :usuario_nombre, :gasto
  validates_numericality_of :proporción, greater_than: 0
end

# class Cuenta
#   include Mongoid::Document

#   has_and_belongs_to_many :usuarios

#   field :monto, type: Float
# end

get '/' do
  if usuario
    redirect to '/gastos'
  else
    redirect to '/registrarse'
  end
end

get '/registrarse' do
  if usuario
    redirect to '/gastos'
  else
    slim :registrarse
  end
end

post '/registrarse' do
  session[:usuario] = Usuario.new params[:usuario]
  usuario.contraseña = params[:contraseña]

  if usuario.save
    redirect to '/gastos'
  else
    session[:usuario] = nil
    flash[:error] = 'Error.'
    redirect to '/registrarse'
  end
end

get '/entrar' do
  if usuario
    redirect to '/gastos'
  else
    slim :entrar
  end
end

post '/entrar' do
  # TODO: ¿Qué pasa si dos usuarios se registran con el mismo correo?
  session[:usuario] = Usuario.find_by correo: params[:correo]
  
  if usuario and usuario.contraseña == params[:contraseña]
    redirect to '/gastos'
    # redirect back tiene el problema de no redirigir a ninguna parte
    # si la landing page fue '/entrar'.
    # redirect back
  else
    session[:usuario] = nil
    flash[:error] = 'Datos inválidos.'
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

  @gasto = Gasto.create params[:gasto]

  params[:pagadores].each do |pagador|
    aporte = @gasto.aportes.new monto: pagador[:monto]
    # aporte = @gasto.aportes.new(monto: pagador[:monto].gsub(',', '.'))
    aporte.usuario = usuario.amigos.find pagador[:id]
    aporte.usuario_nombre = aporte.usuario ? aporte.usuario.nombre : pagador[:nombre]
  end if params[:pagadores]

  params[:gastadores].each do |gastador|
    participación = @gasto.participaciones.new proporción: (params[:gasto_desigual] and gastador[:proporción] or 1)
    participación.usuario = usuario.amigos.find gastador[:id]
    participación.usuario_nombre = participación.usuario ? participación.usuario.nombre : gastador[:nombre]
  end if params[:gastadores]

  if @gasto.save
    Gasto.find(params[:id]).destroy unless params[:id].empty?

    flash[:mensaje] = 'El gasto fue guardado.'
    redirect to '/gastos'
  else
    flash.now[:error] = "Errores: #{@gasto.errors.messages}"
    @gasto.id = nil
    slim :editar_gasto
  end
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
