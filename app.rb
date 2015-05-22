require 'sinatra'


use Rack::Session::Cookie,
 :secret => 'change_me'

use Rack::Flash

class App < Sinatra::Application

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
#    @gastos = Gasto.or({'aportes.usuario_id' => usuario.id}, {'participaciones.usuario_id' => usuario.id}).desc(:fecha)
    @gastos = Gasto.all.desc(:fechan)    
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



end


require_relative 'models/init'

#require_relative 'routes/init'
