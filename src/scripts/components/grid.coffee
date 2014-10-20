Marionette = require('backbone.marionette')

class Grid extends Marionette.ItemView
  initialize: ->
    @headers = @