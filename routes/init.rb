
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

require_relative 'routes'