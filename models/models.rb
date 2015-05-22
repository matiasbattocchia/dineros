require 'bcrypt'

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
