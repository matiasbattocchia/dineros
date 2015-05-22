module Mongoid
	module Document
		def as_json(options={})
			attrs = super(options)
			attrs['id'] = attrs.delete('_id')
			attrs
		end
	end
end

require_relative 'models'
